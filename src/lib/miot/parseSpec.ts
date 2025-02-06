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
import pipe from "../pipe";
import idFromType from "./idFromType";
import { parseUnit } from "./units";
import { stringify } from "yaml";

function getActionLambda(siid: number, aiid: number, inputs: MiotProperty[]) {
  const joinStr = inputs.length > 1 ? ",\n    " : ", ";
  const strings = inputs.map((input) => `${input.iid} %s`).join(" ");
  const params = inputs.map((input) => idFromType(input.type)).join(joinStr);
  return `id(miot_main).execute_action("${siid} ${aiid} ${strings}"${joinStr}${params});`;
}

function parseProperty(
  service: MiotService,
  property: MiotProperty,
  comment: CommentKeyGenerator
) {
  const {
    access,
    "value-range": valueRange,
    "value-list": valueList,
    format,
  } = property;

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

  const component: Record<string, unknown> = {};

  component.platform = "miot";
  component.id = idFromType(property.type);
  component.name = property.description;
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
  } else if (isReadable) {
    component["$domain"] = "sensor";
    if (hasValueList) {
      component.filter = {
        map: valueList.map((v) => `${v.value} -> ${v.description}`),
      };
    }
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
      .map((action) => idFromType(action.type))
      .join(", ");
    component[comment.above] = `# action output for ${actionList}`;
  }

  if (isEventOutput) {
    component.miot_poll = false;
    const eventList = service
      .events!.filter((event) => event.arguments.includes(property.iid))
      .map((event) => idFromType(event.type))
      .join(", ");
    component[comment.above] = `# event output for ${eventList}`;
  }

  const [unit, deviceClass] = parseUnit(property.unit);
  if (unit) {
    component.unit_of_measurement = unit;
  }
  if (deviceClass) {
    component.device_class = deviceClass;
  }

  return component;
}

function parseEvent(
  service: MiotService,
  event: MiotEvent,
  comment: CommentKeyGenerator
) {
  const outputs =
    service.properties?.filter((property) =>
      event.arguments.includes(property.iid)
    ) ?? [];

  const id = idFromType(event.type);
  const component: Record<string, unknown> = {
    ["$domain"]: "event",
    platform: "miot",
    id: `${id}_event`,
    name: event.description,
    event_type: id,
    miot_siid: service.iid,
    miot_eiid: event.iid,
  };

  if (outputs.length) {
    component[comment.above] =
      `# outputs: ${outputs.map((property) => idFromType(property.type)).join(", ")}`;
  }

  return component;
}

function parseAction(
  service: MiotService,
  action: MiotAction,
  comment: CommentKeyGenerator
) {
  const hasInputs = action.in.length > 0;
  if (hasInputs) {
    const inputs =
      service.properties?.filter((property) =>
        action.in.includes(property.iid)
      ) ?? [];
    return {
      ["$domain"]: "script",
      id: idFromType(action.type),
      parameters: inputs.map((input) => ({
        name: idFromType(input.type),
        type: "string",
      })),
      then: {
        lambda: getActionLambda(service.iid, action.iid, inputs),
      },
    };
  }

  const component: Record<string, unknown> = {
    ["$domain"]: "button",
    platform: "miot",
    id: idFromType(action.type),
    name: action.description,
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
        `# outputs: ${outputs.map((property) => property.description).join(", ")}`;
    }
  }

  return component;
}

function getESPHomeSection(device: MiotDeviceSummary) {
  return {
    name: "",
    friendly_name: device.name,
    comment: `${device.name} (${device.model})`,
    project: {
      name: `${AUTHOR}.${REPOSITORY}`,
      version: device.model,
    },
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
        lambda: "id(miot_main).queue_command(command);",
      },
    ],
  };
  const scriptActions = scripts.map((script) => ({
    action: script.id,
    variables: script.parameters.reduce(
      (acc, param) => ({
        ...acc,
        [param.name]: "string",
      }),
      {}
    ),
    then: {
      "script.execute": {
        id: script.id,
        ...Object.fromEntries(
          script.parameters.map((param) => [
            param.name,
            `!lambda return ${param.name};`,
          ])
        ),
      },
    },
  }));

  return {
    encryption: {
      key: "!secret api_key",
    },
    reboot_timeout: "0s",
    actions: [debugAction, ...scriptActions],
  };
}

function cleanObject(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => key.indexOf("$") !== 0)
  );
}

export default function parseSpec(device: MiotDeviceSummary, spec: MiotDevice) {
  const commentGenerator = new CommentKeyGenerator();
  const comment = commentGenerator as unknown as string & {
    above: string;
  };

  const properties = spec.services
    .map((service) => {
      return [
        ...(service.properties?.map((property) =>
          parseProperty(service, property, commentGenerator)
        ) ?? []),
        ...(service.actions?.map((action) =>
          parseAction(service, action, commentGenerator)
        ) ?? []),
        ...(service.events?.map((event) =>
          parseEvent(service, event, commentGenerator)
        ) ?? []),
      ];
    })
    .flat()
    .filter(Boolean);

  const componentsByDomain = Object.groupBy(
    properties,
    (property) => property["$domain"]
  );

  const output: Record<string, unknown> = {
    [comment]: `# https://home.miot-spec.com/spec/${device.model}`,
    [comment]: `# https://miot-spec.org/miot-spec-v2/instance?type=${spec.type}`,
    [comment]: "",
    external_components: {
      source: `github://${AUTHOR}/${REPOSITORY}@main`,
    },
    [comment]: "",
    esphome: getESPHomeSection(device),
    [comment]: "",
    [comment]: "# TODO: include esp32: or esp8266: section based on chip",
    [comment]: "",
    logger: {
      level: "DEBUG",
    },
    [comment]: "",
    uart: {
      baud_rate: 115200,
      rx_pin: "XX",
      [comment.above]: "# TODO: Replace with actual pins",
      tx_pin: "XX",
      [comment.above]: "# TODO: Replace with actual pins",
    },
    [comment]: "",
    miot: {
      id: "miot_main",
    },
    [comment]: "",
    api: getApiSection(componentsByDomain["script"] ?? []),
  };

  for (const [domain, components] of Object.entries(componentsByDomain)) {
    if (!components.length) {
      continue;
    }

    const cleaned = components.map(cleanObject);

    if (Array.isArray(output[domain])) {
      output[domain].push(...cleaned);
    } else {
      output[comment] = "";
      output[domain] = cleaned;
    }
  }

  function unquoteLamba(value: string) {
    return value.replace(/: "(!\w+ .*)"/g, ": $1");
  }

  return pipe(
    (str: string) => stringify(str, { lineWidth: 0 }),
    CommentKeyGenerator.render,
    unquoteLamba
  )(output);
}
