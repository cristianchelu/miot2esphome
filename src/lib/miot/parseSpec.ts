/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MiotAction,
  MiotDevice,
  MiotEvent,
  MiotProperty,
  MiotService,
} from "../../api/miot-spec/getSpec";
import { MiotDeviceSummary } from "../../api/miot-spec/searchDevices";
import { AUTHOR, REPOSITORY } from "../../const";
import CommentKeyGenerator from "../CommentKeyGenerator";
import { EspModule } from "../esp/modules";
import { isUnavailableId } from "../esphome/reservedIds";
import pipe from "../pipe";
import idFromType from "./idFromType";
import { parseUnit } from "./units";
import { Scalar, stringify } from "yaml";

/**
 * A YAML value with an ESPHome tag, e.g. `!lambda` or `!secret`.
 *
 * Multi-line values become `|-` blocks. Tagging `lambda:` values too, though
 * ESPHome doesn't need it there, lets the dashboard editor highlight them as C++.
 */
function tagged(tag: string, value: string) {
  const scalar = new Scalar(value);
  scalar.tag = tag;
  if (value.includes("\n")) {
    scalar.type = Scalar.BLOCK_LITERAL;
  }
  return scalar;
}

const lambda = (code: string) => tagged("!lambda", code);

export type ParseSpecOptions = {
  module?: EspModule | null;
  rxPin?: number | null;
  txPin?: number | null;
};

/**
 * Resolves the ESPHome ID of every property, action and event in a spec.
 *
 * IDs come from the URN, so they can collide with each other (same type in
 * two services) or with names ESPHome reserves (e.g. `pause`). Those get the
 * service name as a prefix, then the instance IDs if that is still not unique.
 */
class IdResolver {
  private ids = new Map<string, string>();

  constructor(spec: MiotDevice) {
    const candidates: [key: string, service: MiotService, base: string][] = [];
    for (const service of spec.services) {
      for (const p of service.properties ?? []) {
        candidates.push([
          `p${service.iid}.${p.iid}`,
          service,
          idFromType(p.type),
        ]);
      }
      for (const a of service.actions ?? []) {
        candidates.push([
          `a${service.iid}.${a.iid}`,
          service,
          idFromType(a.type),
        ]);
      }
      for (const e of service.events ?? []) {
        candidates.push([
          `e${service.iid}.${e.iid}`,
          service,
          `${idFromType(e.type)}_event`,
        ]);
      }
    }

    const counts = new Map<string, number>();
    for (const [, , base] of candidates) {
      counts.set(base, (counts.get(base) ?? 0) + 1);
    }

    const used = new Set<string>();
    const isFree = (id: string) =>
      !!id && !/^[0-9]/.test(id) && !isUnavailableId(id) && !used.has(id);

    for (const [key, service, base] of candidates) {
      const prefixed = `${idFromType(service.type)}_${base}`;
      const options = [
        counts.get(base) === 1 ? base : null,
        prefixed,
        `${prefixed}_${key.slice(1).replace(".", "_")}`,
        `${key[0]}${key.slice(1).replace(".", "_")}_${base}`,
      ];
      const id = options.find((option) => option !== null && isFree(option))!;
      used.add(id);
      this.ids.set(key, id);
    }
  }

  property(service: MiotService, property: MiotProperty) {
    return this.ids.get(`p${service.iid}.${property.iid}`)!;
  }

  action(service: MiotService, action: MiotAction) {
    return this.ids.get(`a${service.iid}.${action.iid}`)!;
  }

  event(service: MiotService, event: MiotEvent) {
    return this.ids.get(`e${service.iid}.${event.iid}`)!;
  }
}

/**
 * Turns spec descriptions that are just the URN slug (`recipe-id`)
 * into readable names (`Recipe Id`). Other descriptions are only trimmed.
 */
function humanize(description: string | undefined, type: string) {
  const text = (description ?? "").trim() || idFromType(type);
  if (/[A-Z\s]/.test(text)) {
    return text;
  }
  return text
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

const INTEGER_FORMATS = ["int8", "int16", "int32", "uint8", "uint16", "uint32"];

/** ESPHome script/API parameter type for a MIoT property format. */
function getParameterType(property: MiotProperty) {
  if (property.format === "bool") return "bool";
  if (property.format === "float") return "float";
  if (property.format === "string") return "string";
  if (INTEGER_FORMATS.includes(property.format)) return "int";
  return "string";
}

/** Action arguments beyond this are split one per row. */
const MAX_INLINE_ARGS = 2;

/**
 * Builds the lambda for an action with inputs.
 *
 * Arguments are `piid value` pairs. Per the MIoT serial protocol, string
 * values are sent in double quotes, numbers and booleans as-is.
 */
function getActionLambda(
  siid: number,
  aiid: number,
  inputs: { property: MiotProperty; name: string }[]
) {
  const formats: string[] = [];
  const args: string[] = [];
  for (const { property, name } of inputs) {
    switch (getParameterType(property)) {
      case "int":
        formats.push(`${property.iid} %d`);
        args.push(name);
        break;
      case "float":
        formats.push(`${property.iid} %f`);
        args.push(name);
        break;
      case "bool":
        formats.push(`${property.iid} %s`);
        args.push(`${name} ? "true" : "false"`);
        break;
      default:
        formats.push(`${property.iid} \\"%s\\"`);
        args.push(`${name}.c_str()`);
    }
  }

  // Up to MAX_INLINE_ARGS arguments stay on one line, more get one per row,
  // aligned with the format string.
  const open = "auto args = str_sprintf(";
  const separator =
    args.length > MAX_INLINE_ARGS ? `,\n${" ".repeat(open.length)}` : ", ";
  const format = `"${formats.join(" ")}"`;
  return [
    `${open}${[format, ...args].join(separator)});`,
    `id(miot_main).execute_action(${siid}, ${aiid}, args);`,
  ].join("\n");
}

function parseProperty(
  service: MiotService,
  property: MiotProperty,
  comment: CommentKeyGenerator,
  ids: IdResolver
) {
  const {
    access,
    "value-range": valueRange,
    "value-list": rawValueList,
    format,
  } = property;

  const valueList = rawValueList?.map((v) => ({
    ...v,
    description: v.description.trim(),
  }));

  const isWriteable = access.includes("write");
  const isReadable = access.includes("read");
  // const isNotifiable = access.includes("notify");

  const hasValueRange = !!valueRange;
  const hasValueList = !!valueList;
  const isRangeBoolean =
    hasValueRange &&
    valueRange[0] === 0 &&
    valueRange[1] === 1 &&
    valueRange[2] === 1;
  const isFakeBoolean = isReadable && isRangeBoolean;
  const isActionOutput = service.actions?.some((action) =>
    action.out.includes(property.iid)
  );
  const isActionInput = service.actions?.some((action) =>
    action.in.includes(property.iid)
  );
  const isEventOutput = service.events?.some((event) =>
    event.arguments.includes(property.iid)
  );

  const component: Record<string, any> = {};

  component.platform = "miot";
  component.id = ids.property(service, property);
  component.name = humanize(property.description, property.type);
  component.miot_siid = service.iid;
  component.miot_piid = property.iid;

  if (isWriteable && isReadable && hasValueList) {
    component["$domain"] = "select";
    component.options = valueList.reduce(
      (acc, v) => ({
        ...acc,
        [v.value]: v.description,
      }),
      {}
    );
  } else if (isReadable && format === "string") {
    component["$domain"] = "text_sensor";
  } else if (format === "bool" || isFakeBoolean) {
    if (isFakeBoolean) {
      component.miot_true = 1;
      component.miot_false = 0;
    }
    if (isWriteable) {
      component["$domain"] = "switch";
    } else {
      component["$domain"] = "binary_sensor";
    }
  } else if (isReadable && hasValueRange) {
    if (isWriteable) {
      component["$domain"] = "number";
      component.min_value = valueRange[0];
      component.max_value = valueRange[1];
      component.step = valueRange[2];
    } else {
      component["$domain"] = "sensor";
    }
  } else if (isReadable && hasValueList) {
    component["$domain"] = "text_sensor";
    component.filters = [
      { map: valueList.map((v) => `${v.value} -> ${v.description}`) },
    ];
  } else if (isReadable) {
    component["$domain"] = "sensor";
  } else {
    if (!isActionInput) {
      console.error(`Unsupported property: ${property.description}`, property);
    }
    return null;
  }

  if (isActionOutput) {
    component.miot_poll = false;
    const actionList = service
      .actions!.filter((action) => action.out.includes(property.iid))
      .map((action) => ids.action(service, action))
      .join(", ");
    component[comment.above] = `# action output for ${actionList}`;
  }

  if (isEventOutput) {
    component.miot_poll = false;
    const eventList = service
      .events!.filter((event) => event.arguments.includes(property.iid))
      .map((event) => ids.event(service, event))
      .join(", ");
    component[comment.above] = `# event output for ${eventList}`;
  }

  if (component["$domain"] === "sensor" || component["$domain"] === "number") {
    const [unit, deviceClass] = parseUnit(property.unit);
    if (unit) {
      component.unit_of_measurement = unit;
    }
    if (deviceClass) {
      component.device_class = deviceClass;
    }
  }

  return component;
}

function parseEvent(
  service: MiotService,
  event: MiotEvent,
  comment: CommentKeyGenerator,
  ids: IdResolver
) {
  const outputs =
    service.properties?.filter((property) =>
      event.arguments.includes(property.iid)
    ) ?? [];

  const component: Record<string, unknown> = {
    ["$domain"]: "event",
    platform: "miot",
    id: ids.event(service, event),
    name: humanize(event.description, event.type),
    event_type: idFromType(event.type),
    miot_siid: service.iid,
    miot_eiid: event.iid,
  };

  if (outputs.length) {
    component[comment.above] =
      `# outputs: ${outputs.map((property) => ids.property(service, property)).join(", ")}`;
  }

  return component;
}

function parseAction(
  service: MiotService,
  action: MiotAction,
  comment: CommentKeyGenerator,
  ids: IdResolver
) {
  const hasInputs = action.in.length > 0;
  if (hasInputs) {
    const properties = new Map(
      (service.properties ?? []).map((property) => [property.iid, property])
    );
    // Keep the order of `in`, which is the order the device expects.
    const inputs = action.in
      .map((iid) => properties.get(iid))
      .filter((property) => property !== undefined)
      .map((property) => ({
        property,
        name: ids.property(service, property),
        type: getParameterType(property),
      }));
    return {
      ["$domain"]: "script",
      id: ids.action(service, action),
      parameters: Object.fromEntries(
        inputs.map(({ name, type }) => [name, type])
      ),
      then: {
        lambda: lambda(getActionLambda(service.iid, action.iid, inputs)),
      },
    };
  }

  const component: Record<string, unknown> = {
    ["$domain"]: "button",
    platform: "miot",
    id: ids.action(service, action),
    name: humanize(action.description, action.type),
    miot_siid: service.iid,
    miot_aiid: action.iid,
  };

  const hasOutputs = action.out.length > 0;
  if (hasOutputs) {
    const outputs =
      service.properties?.filter((property) =>
        action.out.includes(property.iid)
      ) ?? [];

    if (outputs.length) {
      component[comment.above] =
        `# outputs: ${outputs.map((property) => humanize(property.description, property.type)).join(", ")}`;
    }
  }

  return component;
}

function getESPHomeSection(device: MiotDeviceSummary) {
  return {
    name: "",
    friendly_name: device.model,
    comment: device.model,
    project: {
      name: `${AUTHOR}.${REPOSITORY}`,
      version: device.model,
    },
  };
}

function getPlatformSection(module: EspModule) {
  const section: Record<string, unknown> = {
    board: module.board,
  };

  if (module.framework) {
    section.framework = {
      type: module.framework,
    };
  }

  return section;
}

function getLoggerSection(
  module: EspModule,
  comment: string & { above: string }
) {
  if (module.platform === "esp8266") {
    return {
      level: "DEBUG",
      [comment]:
        "# Important: Disable UART1 logging to avoid hardware errors on main UART0",
      baud_rate: 0,
    };
  }

  return {
    level: "DEBUG",
  };
}

function getApiSection(scripts: any[]) {
  const debugAction = {
    action: "mcu_command",
    variables: {
      command: "string",
    },
    then: [
      {
        lambda: lambda("id(miot_main).queue_command(command);"),
      },
    ],
  };
  const scriptActions = scripts.map((script) => ({
    action: script.id,
    variables: { ...script.parameters },
    then: {
      "script.execute": {
        id: script.id,
        ...Object.fromEntries(
          Object.keys(script.parameters).map((name) => [
            name,
            lambda(`return ${name};`),
          ])
        ),
      },
    },
  }));

  return {
    encryption: {
      key: tagged("!secret", "api_key"),
    },
    reboot_timeout: "0s",
    actions: [debugAction, ...scriptActions],
  };
}

/** ESPHome's limit for entity names. */
const MAX_NAME_BYTES = 120;

function truncateName(name: string, maxBytes = MAX_NAME_BYTES) {
  const encoder = new TextEncoder();
  let result = name;
  while (encoder.encode(result).length > maxBytes) {
    result = result.slice(0, -1);
  }
  return result.trimEnd();
}

/**
 * ESPHome needs entity names to be unique within a platform, compared by
 * their object ID (lowercase, punctuation collapsed). Multi-service devices
 * repeat names (a 3-gang switch has three "Switch Status"), so those get the
 * service name as a prefix, then the instance IDs if that is still not unique.
 */
function dedupeNames(components: Record<string, any>[]) {
  const key = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const duplicates = () => {
    const counts = new Map<string, number>();
    for (const c of components) {
      counts.set(key(c.name), (counts.get(key(c.name)) ?? 0) + 1);
    }
    return components.filter((c) => counts.get(key(c.name))! > 1);
  };

  for (const c of duplicates()) {
    if (!key(c.name).startsWith(key(c.$service))) {
      c.name = `${c.$service} ${c.name}`;
    }
  }
  for (const c of components) {
    c.name = truncateName(c.name);
  }
  for (const c of duplicates()) {
    const iid = c.miot_piid ?? c.miot_aiid ?? c.miot_eiid;
    const suffix = ` ${c.miot_siid}.${iid}`;
    c.name = truncateName(c.name, MAX_NAME_BYTES - suffix.length) + suffix;
  }
}

function cleanObject(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => key.indexOf("$") !== 0)
  );
}

export default function parseSpec(
  device: MiotDeviceSummary,
  spec: MiotDevice,
  options: ParseSpecOptions = {}
): string {
  const commentGenerator = new CommentKeyGenerator();
  const ids = new IdResolver(spec);
  const comment = commentGenerator as unknown as string & {
    above: string;
  };

  const espModule = options.module ?? null;
  const rxPin = options.rxPin ?? null;
  const txPin = options.txPin ?? null;

  const properties = spec.services
    .map((service) => {
      const serviceName = humanize(service.description, service.type);
      return [
        ...(service.properties?.map((property) =>
          parseProperty(service, property, commentGenerator, ids)
        ) ?? []),
        ...(service.actions?.map((action) =>
          parseAction(service, action, commentGenerator, ids)
        ) ?? []),
        ...(service.events?.map((event) =>
          parseEvent(service, event, commentGenerator, ids)
        ) ?? []),
      ].map(
        (component): Record<string, any> | null =>
          component && { ...component, $service: serviceName }
      );
    })
    .flat()
    .filter(Boolean);

  const componentsByDomain = Object.groupBy(
    properties,
    (property) => property?.["$domain"]
  );

  for (const components of Object.values(componentsByDomain)) {
    dedupeNames(
      (components ?? []).filter(
        (c): c is Record<string, any> => c?.name !== undefined
      )
    );
  }

  const uartSection =
    rxPin != null && txPin != null
      ? {
          baud_rate: 115200,
          rx_pin: `GPIO${rxPin}`,
          tx_pin: `GPIO${txPin}`,
        }
      : {
          baud_rate: 115200,
          rx_pin: "XX",
          [comment.above]: "# TODO: Replace with actual pins",
          tx_pin: "XX",
          [comment.above]: "# TODO: Replace with actual pins",
        };

  const output: Record<string, unknown> = {
    [comment]: `# https://miot-spec.org/miot-spec-v2/instance?type=${spec.type}`,
    [comment]: "",
    external_components: {
      source: `github://${AUTHOR}/${REPOSITORY}@main`,
    },
    [comment]: "",
    esphome: getESPHomeSection(device),
    [comment]: "",
  };

  if (espModule) {
    output[espModule.platform] = getPlatformSection(espModule);
    output[comment] = "";
    output.logger = getLoggerSection(espModule, comment);
  } else {
    output[comment] =
      "# TODO: include esp32: or esp8266: section based on chip";
    output[comment] = "";
    output.logger = { level: "DEBUG" };
  }

  output[comment] = "";
  output.uart = uartSection;
  output[comment] = "";
  output.miot = {
    id: "miot_main",
  };
  output[comment] = "";
  output.api = getApiSection(componentsByDomain["script"] ?? []);

  for (const [domain, components] of Object.entries(componentsByDomain)) {
    if (!components?.length) {
      continue;
    }

    const cleaned = components.filter((o) => o !== null).map(cleanObject);

    if (Array.isArray(output[domain])) {
      output[domain].push(...cleaned);
    } else {
      output[comment] = "";
      output[domain] = cleaned;
    }
  }

  return pipe(
    (str: string) =>
      stringify(str, {
        lineWidth: 0,
        // ESPHome reads YAML 1.1, where e.g. `On`/`Off` are booleans
        version: "1.1",
      }),
    CommentKeyGenerator.render
  )(output) as string;
}
