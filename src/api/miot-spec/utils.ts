/**
 * Fetch JSON from a CORS-enabled URL, throwing on non-2xx responses.
 */
export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json() as Promise<T>;
}
