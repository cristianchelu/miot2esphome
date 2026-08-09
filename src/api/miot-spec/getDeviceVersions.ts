import { parseInertiaPage, proxy } from "./utils";

export interface MiotDeviceVersion {
  /** Revision version */
  version: number;
  /** Revision URN */
  type: string;
}

interface SpecPageVersion {
  urn: string;
  version: number;
}

interface SpecPageProps {
  versions?: SpecPageVersion[];
  spec?: {
    urn?: string;
    version?: number;
  };
}

/**
 * Fetch MiOT spec revisions for a device model from home.miot-spec.com.
 */
export default async function getDeviceVersions(
  model: string,
  specHref?: string
): Promise<MiotDeviceVersion[]> {
  const path = specHref || `/spec/${encodeURIComponent(model)}`;
  const url = path.startsWith("http")
    ? path
    : `https://home.miot-spec.com${path.startsWith("/") ? path : `/${path}`}`;

  const response = await proxy(url);
  const html = await response.text();
  const json = parseInertiaPage(html);
  const props = json.props as SpecPageProps | undefined;

  const versions = props?.versions;
  if (versions?.length) {
    return versions.map((v) => ({
      version: v.version,
      type: v.urn,
    }));
  }

  if (props?.spec?.urn) {
    return [
      {
        version: props.spec.version ?? 1,
        type: props.spec.urn,
      },
    ];
  }

  throw new Error(`Could not find spec versions for ${model}`);
}
