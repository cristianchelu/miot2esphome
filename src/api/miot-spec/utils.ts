/**
 * Fetch the given URL through a CORS proxy.
 *
 * This is necessary because the `miot-spec.org` API does not return
 * a CORS `Access-Control-Allow-Origin` header.
 */
export function proxy(url: string) {
  return fetch("https://corsproxy.io/?url=" + encodeURIComponent(url));
}

/**
 * Parse the Inertia.js page JSON embedded in home.miot-spec.com HTML.
 *
 * The site ships props as:
 *   <script data-page="app" type="application/json">{...}</script>
 */
export function parseInertiaPage(html: string): Record<string, unknown> {
  const match = html.match(
    /<script[^>]*data-page="app"[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/i
  ) ?? html.match(
    /<script[^>]*type="application\/json"[^>]*data-page="app"[^>]*>([\s\S]*?)<\/script>/i
  );

  if (!match?.[1]) {
    throw new Error("Could not find Inertia data-page JSON in response");
  }

  try {
    return JSON.parse(match[1]);
  } catch {
    throw new Error("Could not parse Inertia data-page JSON");
  }
}
