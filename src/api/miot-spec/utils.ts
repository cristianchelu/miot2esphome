/**
 * Fetch the given URL through a CORS proxy.
 *
 * This is necessary because the `miot-spec.org` API does not return
 * a CORS `Access-Control-Allow-Origin` header.
 */
export function proxy(url: string) {
  return fetch("https://corsproxy.io/?url=" + encodeURIComponent(url));
}
