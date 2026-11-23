// Edge cache helpers for the NHTSA proxy. Nothing here logs request data.

export const DAY = 86_400;

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

/** Look up `key` in the colo cache; on a miss run `compute` and store successes for 24h. */
export async function cached(
  ctx: { waitUntil(p: Promise<unknown>): void },
  key: string,
  compute: () => Promise<{ body: unknown; status?: number }>,
): Promise<{ body: unknown; status: number; hit: boolean }> {
  const cache = (caches as unknown as { default: Cache }).default;
  const req = new Request(key);
  const hit = await cache.match(req);
  if (hit) return { body: await hit.json(), status: hit.status, hit: true };

  const { body, status = 200 } = await compute();
  if (status === 200) {
    ctx.waitUntil(cache.put(req, json(body, 200, { "Cache-Control": `public, max-age=${DAY}` })));
  }
  return { body, status, hit: false };
}

export async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Abort upstream calls that hang; Pages Functions have a wall-clock budget. */
export const upstreamFetch = (url: string) =>
  fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12_000) });
