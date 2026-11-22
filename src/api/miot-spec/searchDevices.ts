import { fetchJson } from "./utils";

export const CATALOG_URL = "https://home.miot-spec.com";
const API_BASE = `${CATALOG_URL}/api`;
const PER_PAGE = 50;

/**
 * Summary information about a device not available in the spec itself.
 */
export interface MiotDeviceSummary {
  /** Device human-friendly name */
  name: string;
  /** Device model string (`brand.type.model`) */
  model: string;
  /** Device thumbnail URL */
  image: string;
  /** Stable protocol slug (e.g. `wifi`, `miio`, `bluetooth`), if known */
  protocol: string | null;
  /** English protocol label (e.g. `Wi‑Fi`, `MiIO`), if known */
  protocolLabel: string | null;
  /** MiOT specification revisions (latest last) */
  specs: Array<{
    /** Revision version */
    version: number;
    /** Revision URN */
    type: string;
  }>;
}

interface ApiListItem {
  model: string;
  name: string | null;
  image: string | null;
  protocol: string | null;
  protocolLabel: string | null;
  urn: string | null;
  version: number | null;
}

interface ApiListResponse {
  total: number;
  results: ApiListItem[];
}

function mapListItem(item: ApiListItem): MiotDeviceSummary {
  return {
    name: item.name || item.model,
    model: item.model,
    image: item.image || "",
    protocol: item.protocol,
    protocolLabel: item.protocolLabel,
    specs: item.urn ? [{ version: item.version ?? 1, type: item.urn }] : [],
  };
}

/** Per-session cache, so repeated searches don't hit the API again. */
const cache = new Map<string, Promise<MiotDeviceSummary[]>>();

/**
 * Search the home.miot-spec.com community catalogue.
 *
 * @see https://home.miot-spec.com/api
 */
export default function searchDevices(
  queryText: string
): Promise<MiotDeviceSummary[]> {
  const query = queryText.trim();
  if (!query) {
    return Promise.resolve([]);
  }

  const key = query.toLowerCase();
  let request = cache.get(key);
  if (!request) {
    request = fetchJson<ApiListResponse>(
      `${API_BASE}/list/${encodeURIComponent(query)}?perPage=${PER_PAGE}`
    ).then((data) => data.results.map(mapListItem));
    request.catch(() => cache.delete(key));
    cache.set(key, request);
  }

  return request;
}
