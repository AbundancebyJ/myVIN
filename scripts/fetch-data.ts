/**
 * Build-time data fetch. Reads data/vehicles.json, verifies each model name against
 * vPIC GetModelsForMakeYear, fetches recalls + complaints + ratings once, and writes
 * data/generated/*.json so the /recalls pages are fully static.
 *
 * If NHTSA is unreachable for a vehicle, the previously generated JSON is kept so a
 * deploy never fails (or loses pages) because of an upstream outage.
 *
 *   npm run data            # fetch everything
 *   npm run data -- --strict  # exit 1 on any verification/fetch failure
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fetchVehicleData, urls, type Fetcher, type VehicleData } from "../lib/nhtsa";
import { isIndexable } from "../lib/report";
import { slugify } from "../lib/slug";

interface Seed {
  year: number;
  make: string;
  /** Model name as used by NHTSA's recall/complaint/ratings APIs. */
  model: string;
  /** Model name in vPIC, when it differs (e.g. vPIC "Silverado" vs recalls "Silverado 1500"). */
  vpicModel?: string;
}

export interface IndexEntry {
  year: number;
  make: string;
  model: string;
  file: string;
  recalls: number;
  complaints: number;
  overall: number | null;
  indexable: boolean;
  fetchedAt: string;
}

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "data", "generated");
const strict = process.argv.includes("--strict");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fetcher: Fetcher = async (url) => {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.status >= 500 || res.status === 429) throw new Error(`HTTP ${res.status}`);
      await sleep(150); // be polite to NHTSA
      return res;
    } catch (e) {
      if (attempt >= 3) throw e;
      await sleep(1000 * 2 ** attempt);
    }
  }
};

const fileFor = (s: Seed) => `${s.year}-${slugify(s.make)}-${slugify(s.model)}.json`;

async function verifyModel(seed: Seed): Promise<string | null> {
  const want = (seed.vpicModel ?? seed.model).toLowerCase();
  const res = await fetcher(urls.modelsForMakeYear(seed.make, seed.year));
  const json: any = await res.json();
  const names: string[] = (json.Results ?? []).map((r: any) => String(r.Model_Name));
  if (names.some((n) => n.toLowerCase() === want)) return null;
  const near = names.filter((n) => n.toLowerCase().includes(want.split(" ")[0])).slice(0, 5);
  return `vPIC has no model "${seed.vpicModel ?? seed.model}" for ${seed.year} ${seed.make}${
    near.length ? ` (did you mean: ${near.join(", ")}?)` : ""
  }`;
}

async function main() {
  const seeds: Seed[] = JSON.parse(await readFile(path.join(ROOT, "data", "vehicles.json"), "utf8"));
  await mkdir(OUT, { recursive: true });
  const index: IndexEntry[] = [];
  const problems: string[] = [];

  for (const seed of seeds) {
    const label = `${seed.year} ${seed.make} ${seed.model}`;
    const file = fileFor(seed);
    const target = path.join(OUT, file);
    let data: VehicleData | null = null;
    try {
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
      console.log(
        `✓ ${label}: ${data.recalls.items.length} recalls (${data.recalls.status}), ${data.complaints.total} complaints, ${data.ratings.variants.length} rated variants${
          isIndexable(data) ? "" : "  [noindex]"
        }`,
      );
    } catch (e) {
      const msg = `${label}: ${(e as Error).message}`;
      problems.push(msg);
      if (existsSync(target)) {
        data = JSON.parse(await readFile(target, "utf8"));
        console.warn(`! ${msg} — keeping previous data from ${data!.fetchedAt}`);
      } else {
        console.warn(`✗ ${msg} — skipped (no previous data)`);
      }
    }
    if (data) {
      index.push({
        year: seed.year,
        make: seed.make,
        model: seed.model,
        file,
        recalls: data.recalls.items.length,
        complaints: data.complaints.total,
        overall: Math.max(0, ...data.ratings.variants.map((v) => v.overall ?? 0)) || null,
        indexable: isIndexable(data),
        fetchedAt: data.fetchedAt,
      });
    }
  }

  await writeFile(path.join(OUT, "index.json"), JSON.stringify(index, null, 1) + "\n");
  console.log(`\nWrote ${index.length} vehicles to data/generated/`);
  if (problems.length && strict) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
