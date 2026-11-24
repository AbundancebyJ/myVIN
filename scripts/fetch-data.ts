/**
 * Build-time data fetch. Reads data/vehicles.json, verifies each model name against
 * vPIC GetModelsForMakeYear, fetches recalls + complaints + ratings once, and writes
 * data/generated/*.json so the /recalls pages are fully static.
 *
 * If NHTSA is unreachable for a vehicle, the previously generated JSON is kept so a
 * deploy never fails (or loses pages) because of an upstream outage. NHTSA's outages
 * are often slow (requests hang, then 504), so the fetch also fails fast: a health
 * probe before starting, a breaker after 3 vehicles fail in a row, and an overall time
 * budget (FETCH_BUDGET_MS, default 4 min) keep the build well inside Cloudflare's limit.
 *
 *   npm run data              # fetch everything
 *   npm run data -- --strict  # exit 1 on any verification/fetch failure
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fetchVehicleData, urls, type Fetcher, type VehicleData } from "../lib/nhtsa";
import { indexStats } from "../lib/report";
import type { IndexEntry } from "../lib/data";
import { slugify } from "../lib/slug";

interface Seed {
  year: number;
  make: string;
  /** Model name as used by NHTSA's recall/complaint/ratings APIs. */
  model: string;
  /** Model name in vPIC, when it differs (e.g. vPIC "Silverado" vs recalls "Silverado 1500"). */
  vpicModel?: string;
}

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "data", "generated");
const CONCURRENCY = 3;
const REQUEST_TIMEOUT_MS = 20_000;
const BUDGET_MS = Number(process.env.FETCH_BUDGET_MS) || 240_000;
const BREAKER_AFTER = 3; // consecutive failed vehicles
const deadline = Date.now() + BUDGET_MS;
let upstreamDown: string | null = null;
let consecutiveFailures = 0;
const strict = process.argv.includes("--strict");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fetcher: Fetcher = async (url) => {
  for (let attempt = 0; ; attempt++) {
    if (upstreamDown) throw new Error(`skipped: ${upstreamDown}`);
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      if (res.status >= 500 || res.status === 429) throw new Error(`HTTP ${res.status}`);
      await sleep(100); // be polite to NHTSA
      return res;
    } catch (e) {
      if (attempt >= 1 || Date.now() > deadline) throw e; // one retry only
      await sleep(1500);
    }
  }
};

const fileFor = (s: Seed) => `${s.year}-${slugify(s.make)}-${slugify(s.model)}.json`;

// One GetModelsForMakeYear call per make/year, shared by every seed that needs it.
const modelLists = new Map<string, Promise<string[]>>();
function modelsFor(make: string, year: number): Promise<string[]> {
  const key = `${make.toLowerCase()}|${year}`;
  if (!modelLists.has(key)) {
    modelLists.set(
      key,
      fetcher(urls.modelsForMakeYear(make, year))
        .then((r) => r.json())
        .then((j: any) => (j.Results ?? []).map((r: any) => String(r.Model_Name))),
    );
  }
  return modelLists.get(key)!;
}

async function verifyModel(seed: Seed): Promise<string | null> {
  const want = (seed.vpicModel ?? seed.model).toLowerCase();
  const names = await modelsFor(seed.make, seed.year);
  if (names.some((n) => n.toLowerCase() === want)) return null;
  const near = names.filter((n) => n.toLowerCase().includes(want.split(" ")[0])).slice(0, 5);
  return `vPIC has no model "${seed.vpicModel ?? seed.model}" for ${seed.year} ${seed.make}${
    near.length ? ` (did you mean: ${near.join(", ")}?)` : ""
  }`;
}

async function processSeed(seed: Seed, problems: string[]): Promise<IndexEntry | null> {
  const label = `${seed.year} ${seed.make} ${seed.model}`;
  const file = fileFor(seed);
  const target = path.join(OUT, file);
  let data: VehicleData | null = null;
  try {
    if (upstreamDown) throw new Error(`skipped: ${upstreamDown}`);
    if (Date.now() > deadline) throw new Error(`skipped: time budget of ${BUDGET_MS / 1000}s used up`);
    const verifyError = await verifyModel(seed);
    if (verifyError) throw new Error(verifyError);
    data = await fetchVehicleData(fetcher, {
      make: seed.make,
      model: seed.model,
      year: seed.year,
      displayMake: seed.make,
      displayModel: seed.model,
    });
    await writeFile(target, JSON.stringify(data, null, 1) + "\n");
    consecutiveFailures = 0;
    const s = indexStats(data);
    console.log(
      `✓ ${label}: ${s.recalls} recalls (${data.recalls.status}), ${s.complaints} complaints, ${data.ratings.variants.length} rated variants${
        s.indexable ? "" : "  [noindex]"
      }`,
    );
  } catch (e) {
    const msg = `${label}: ${(e as Error).message}`;
    problems.push(msg);
    if (!upstreamDown && ++consecutiveFailures >= BREAKER_AFTER) {
      upstreamDown = `NHTSA failed for ${BREAKER_AFTER} vehicles in a row`;
      console.warn(`! ${upstreamDown}; keeping previous data for the rest`);
    }
    if (existsSync(target)) {
      data = JSON.parse(await readFile(target, "utf8"));
      console.warn(`! ${msg} — keeping previous data from ${data!.fetchedAt}`);
    } else {
      console.warn(`✗ ${msg} — skipped (no previous data)`);
    }
  }
  return data ? { year: seed.year, make: seed.make, model: seed.model, file, ...indexStats(data) } : null;
}

async function main() {
  const seeds: Seed[] = JSON.parse(await readFile(path.join(ROOT, "data", "vehicles.json"), "utf8"));
  await mkdir(OUT, { recursive: true });
  const problems: string[] = [];

  // Probe the recalls API once (no retries). If it's down, don't spend the build waiting on it.
  try {
    const res = await fetch(urls.recalls("honda", "CR-V", 2019), { signal: AbortSignal.timeout(15_000) });
    if (res.status >= 500) upstreamDown = `NHTSA recalls API returned HTTP ${res.status}`;
  } catch (e) {
    upstreamDown = `NHTSA recalls API unreachable (${(e as Error).message})`;
  }
  if (upstreamDown) console.warn(`! ${upstreamDown}; building with the previously fetched data`);
  const results: (IndexEntry | null)[] = new Array(seeds.length).fill(null);

  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < seeds.length) {
        const i = next++;
        results[i] = await processSeed(seeds[i], problems);
      }
    }),
  );

  const index = results.filter((e): e is IndexEntry => e !== null);
  await writeFile(path.join(OUT, "index.json"), JSON.stringify(index, null, 1) + "\n");
  console.log(`\nWrote ${index.length}/${seeds.length} vehicles to data/generated/`);
  if (problems.length) console.log(`${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
  if (problems.length && strict) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
