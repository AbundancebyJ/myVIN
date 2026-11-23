// POST /api/decode  { "vin": "..." }
// POST (not GET) so the VIN never appears in a URL, access log, or analytics path.
// The edge cache is keyed on a SHA-256 hash of the VIN, not the VIN itself.
import { normalizeDecode, urls } from "../../lib/nhtsa";
import { validateVin } from "../../lib/vin";
import { cached, json, sha256, upstreamFetch } from "../_lib/cache";

export const onRequestPost: PagesFunction = async ({ request, waitUntil }) => {
  let vinInput = "";
  try {
    const body = (await request.json()) as { vin?: unknown };
    vinInput = typeof body.vin === "string" ? body.vin.slice(0, 40) : "";
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const check = validateVin(vinInput);
  if (!check.ok) return json({ ok: false, error: check.error }, 400);

  const key = `https://cache.internal/decode/v1/${await sha256(check.vin)}`;
  try {
    const { body, status } = await cached({ waitUntil }, key, async () => {
      const res = await upstreamFetch(urls.decode(check.vin));
      if (!res.ok) return { body: { ok: false, error: "NHTSA's VIN decoder is unavailable right now. Please try again in a minute." }, status: 502 };
      // vPIC returns HTTP 200 even for undecodable VINs; normalizeDecode reads ErrorCode.
      return { body: normalizeDecode(await res.json()) };
    });
    return json(body, status, { "Cache-Control": "private, no-store" });
  } catch {
    return json({ ok: false, error: "We couldn't reach NHTSA's VIN decoder. Please try again in a minute." }, 504, {
      "Cache-Control": "no-store",
    });
  }
};

export const onRequest: PagesFunction = async () =>
  json({ ok: false, error: "Use POST." }, 405, { Allow: "POST" });
