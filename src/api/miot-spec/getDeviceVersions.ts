import { loadGroupedInstances } from "./instances";

export interface MiotDeviceVersion {
  /** Revision version */
  version: number;
  /** Revision URN */
  type: string;
}

/**
 * Fetch MiOT spec revisions for a device model from the instance catalog.
 */
export default async function getDeviceVersions(
  model: string
): Promise<MiotDeviceVersion[]> {
  const catalog = await loadGroupedInstances();
  const revisions = catalog.get(model);

  if (!revisions?.length) {
    throw new Error(`Could not find spec versions for ${model}`);
  }

  return revisions.map((revision) => ({
    version: revision.version,
    type: revision.type,
  }));
}
