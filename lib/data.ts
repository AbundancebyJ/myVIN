// Build-time access to data/generated (server components only).
import { readFileSync } from "node:fs";
import path from "node:path";
import type { VehicleData } from "./nhtsa";
import { slugify } from "./slug";

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

const DIR = path.join(process.cwd(), "data", "generated");

let indexCache: IndexEntry[] | null = null;
export function getIndex(): IndexEntry[] {
  if (!indexCache) {
    try {
      indexCache = JSON.parse(readFileSync(path.join(DIR, "index.json"), "utf8")) as IndexEntry[];
    } catch {
      indexCache = [];
    }
  }
  return indexCache;
}

export function getVehicle(entry: IndexEntry): VehicleData {
  return JSON.parse(readFileSync(path.join(DIR, entry.file), "utf8")) as VehicleData;
}

export function findEntry(make: string, model: string, year?: number) {
  return getIndex().filter(
    (e) => slugify(e.make) === make && slugify(e.model) === model && (year === undefined || e.year === year),
  );
}

export function makesIn(index = getIndex()) {
  const m = new Map<string, string>();
  for (const e of index) m.set(slugify(e.make), e.make);
  return [...m].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
}

export function modelsIn(makeSlug: string, index = getIndex()) {
  const m = new Map<string, { slug: string; name: string; make: string; years: IndexEntry[] }>();
  for (const e of index) {
    if (slugify(e.make) !== makeSlug) continue;
    const slug = slugify(e.model);
    const row = m.get(slug) ?? { slug, name: e.model, make: e.make, years: [] };
    row.years.push(e);
    m.set(slug, row);
  }
  return [...m.values()]
    .map((r) => ({ ...r, years: r.years.sort((a, b) => b.year - a.year) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Small, client-safe list used by the VIN tool to link a decoded vehicle to its static page. */
export function clientCatalog() {
  return getIndex().map((e) => ({ year: e.year, make: e.make, model: e.model }));
}

/** A hub that links to a single child adds nothing for searchers: keep it out of the index until it has two. */
export const hubIndexable = (children: number) => children >= 2;
