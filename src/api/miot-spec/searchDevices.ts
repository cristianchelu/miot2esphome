import { proxy } from "./utils";

/**
 * Summary information about a device not available in the spec itself.
 *
 * More properties are available in this object, but are not yet useful.
 */
export interface MiotDeviceSummary {
  /** Device human-friendly name */
  name: string;
  /** Device model string (`brand.type.model`) */
  model: string;
  /** Device thumbnail URL */
  icon_real: string;
  /** MiOT specification revisions */
  specs: Array<{
    /** Revision version */
    version: number;
    /** Revision URN */
    type: string;
  }>;
  /** Compatibility with the `hass-xiaomi-miot` HA integration
   *
   * https://github.com/al-one/hass-xiaomi-miot
   *
   * `miio2miot`-tagged devices are **not** compatible with `esphome-miot` */
  hass_tags: Array<"miio2miot" | "miot-local" | string>;
}

export default async function searchDevices(
  name: string
): Promise<MiotDeviceSummary[]> {
  const response = await proxy(`https://home.miot-spec.com/s/${encodeURIComponent(name)}`);
  const html = await response.text();

  const dataPage = html.match(/data-page="([^"]+)"/);
  if (!dataPage) {
    throw new Error("Could not find data-page attribute");
  }

  const page = dataPage[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const json = JSON.parse(page);

  if (!json.props || !json.props.list) {
    throw new Error("Could not find list in response");
  }

  return json.props.list;
}
