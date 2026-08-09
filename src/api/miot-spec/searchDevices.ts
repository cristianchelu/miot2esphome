import { parseInertiaPage, proxy } from "./utils";

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
  /** Protocol label from miot-spec.com (e.g. `Wi‑Fi`, `MiIO`) */
  protocolLabel: string;
  /** Relative path to the product spec page, when available */
  specHref?: string;
  /** MiOT specification revisions (populated on selection) */
  specs: Array<{
    /** Revision version */
    version: number;
    /** Revision URN */
    type: string;
  }>;
}

interface SearchResultItem {
  name: string;
  model: string;
  icon?: string;
  protocolLabel?: string;
  specHref?: string;
  attrs?: {
    icon_real?: string;
  };
}

interface SearchPageProps {
  results?: {
    data?: SearchResultItem[];
  };
}

function mapSearchResult(item: SearchResultItem): MiotDeviceSummary {
  return {
    name: item.name,
    model: item.model,
    icon_real: item.icon || item.attrs?.icon_real || "",
    protocolLabel: item.protocolLabel || "",
    specHref: item.specHref,
    specs: [],
  };
}

export default async function searchDevices(
  name: string
): Promise<MiotDeviceSummary[]> {
  const response = await proxy(
    `https://home.miot-spec.com/s/${encodeURIComponent(name)}`
  );
  const html = await response.text();
  const json = parseInertiaPage(html);
  const props = json.props as SearchPageProps | undefined;
  const list = props?.results?.data;

  if (!list) {
    throw new Error("Could not find list in response");
  }

  return list.map(mapSearchResult);
}
