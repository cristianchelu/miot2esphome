import { fetchJson } from "./utils";

export interface SpecInstance {
  model: string;
  version: number;
  type: string;
  ts: number;
  status?: string;
}

interface InstancesResponse {
  instances: SpecInstance[];
}

const INSTANCES_URL =
  "https://miot-spec.org/miot-spec-v2/instances?status=released";

let catalogPromise: Promise<Map<string, SpecInstance[]>> | null = null;

function groupByModel(instances: SpecInstance[]): Map<string, SpecInstance[]> {
  const grouped = new Map<string, SpecInstance[]>();

  for (const instance of instances) {
    const list = grouped.get(instance.model);
    if (list) {
      list.push(instance);
    } else {
      grouped.set(instance.model, [instance]);
    }
  }

  for (const list of grouped.values()) {
    list.sort((a, b) => a.version - b.version);
  }

  return grouped;
}

/**
 * Load the released MIoT instance catalog from miot-spec.org (CORS-enabled)
 * and group revisions by model. Cached for the lifetime of the page.
 */
export function loadGroupedInstances(): Promise<Map<string, SpecInstance[]>> {
  if (!catalogPromise) {
    catalogPromise = fetchJson<InstancesResponse>(INSTANCES_URL)
      .then((data) => {
        if (!Array.isArray(data.instances)) {
          throw new Error("Could not load MIoT instance catalog");
        }
        return groupByModel(data.instances);
      })
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }

  return catalogPromise;
}
