import parseUrn from "./parseUrn";

/**
 *
 * @param type URN string of Property/Action/Event
 * @returns ESPHome compatible ID
 */
export default function idFromType(type: string): string {
  return parseUrn(type).id.replace(/[^A-Za-z0-9_]/g, "_");
}
