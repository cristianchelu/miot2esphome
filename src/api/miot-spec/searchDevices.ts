import { loadGroupedInstances } from "./instances";

export interface MiotDeviceSummary {
  /** Device model string (`brand.type.model`) */
  model: string;
  /** MiOT specification revisions */
  specs: Array<{
    /** Revision version */
    version: number;
    /** Revision URN */
    type: string;
  }>;
}

const MAX_RESULTS = 50;

function matchesQuery(model: string, query: string): boolean {
  const tokens = query
    .toLowerCase()
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (!tokens.length) {
    return false;
  }

  const haystack = model.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function relevance(model: string, query: string): number {
  const q = query.toLowerCase();
  const m = model.toLowerCase();
  if (m === q) return 0;
  if (m.startsWith(q)) return 1;
  if (m.includes(q)) return 2;
  return 3;
}

export default async function searchDevices(
  queryText: string
): Promise<MiotDeviceSummary[]> {
  const query = queryText.trim();
  if (!query) {
    return [];
  }

  const catalog = await loadGroupedInstances();
  const matches: MiotDeviceSummary[] = [];

  for (const [model, revisions] of catalog) {
    if (!matchesQuery(model, query)) {
      continue;
    }
    matches.push({
      model,
      specs: revisions.map((revision) => ({
        version: revision.version,
        type: revision.type,
      })),
    });
  }

  matches.sort(
    (a, b) =>
      relevance(a.model, query) - relevance(b.model, query) ||
      a.model.localeCompare(b.model)
  );

  return matches.slice(0, MAX_RESULTS);
}
