// GET /api/vehicle?make=HONDA&model=CR-V&year=2019[&series=1500]
// Fetches recalls + complaints (aggregated) + safety ratings and caches the combined
// result at the edge for 24h. Contains no VIN.
import { fetchVehicleData, UpstreamError } from "../../lib/nhtsa";
import { cached, DAY, json, upstreamFetch } from "../_lib/cache";

const NAME = /^[A-Za-z0-9 .&'\/-]{1,40}$/;

export const onRequestGet: PagesFunction = async ({ request, waitUntil }) => {
  const q = new URL(request.url).searchParams;
  const make = (q.get("make") ?? "").trim();
  const model = (q.get("model") ?? "").trim();
  const series = (q.get("series") ?? "").trim();
  const year = Number(q.get("year"));
  const maxYear = new Date().getUTCFullYear() + 2;

  if (!NAME.test(make) || !NAME.test(model) || (series && !NAME.test(series)) || !Number.isInteger(year) || year < 1950 || year > maxYear) {
    return json({ error: "Invalid make, model or year." }, 400);
  }

  const norm = (s: string) => encodeURIComponent(s.toUpperCase());
  const key = `https://cache.internal/vehicle/v1/${year}/${norm(make)}/${norm(model)}/${norm(series)}`;
  try {
    const { body, hit } = await cached({ waitUntil }, key, async () => ({
      body: await fetchVehicleData(upstreamFetch, { make, model, year, series }),
    }));
    return json(body, 200, {
      "Cache-Control": `public, max-age=3600, s-maxage=${DAY}`,
      "X-Cache": hit ? "HIT" : "MISS",
    });
  } catch (e) {
    const msg =
      e instanceof UpstreamError
        ? "NHTSA's data service returned an error. Please try again in a few minutes."
        : "We couldn't reach NHTSA's data service. Please try again in a few minutes.";
    return json({ error: msg }, 502, { "Cache-Control": "no-store" });
  }
};
