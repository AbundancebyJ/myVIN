// NHTSA data access + normalization. Shared by the Cloudflare Pages Function (runtime)
// and scripts/fetch-data.ts (build time). Must stay free of Node- or browser-only APIs.

export type DataStatus = "ok" | "nodata";

export interface Recall {
  campaign: string;
  /** ISO yyyy-mm-dd. Source format is DD/MM/YYYY. */
  date: string | null;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  parkIt: boolean;
  parkOutside: boolean;
  overTheAir: boolean;
}

export interface ComponentStat {
  component: string;
  count: number;
  crashes: number;
  fires: number;
  injuries: number;
  deaths: number;
}

export interface ComplaintSummary {
  status: DataStatus;
  total: number;
  crashes: number;
  fires: number;
  injuries: number;
  deaths: number;
  /** ISO date of the most recent complaint filed. Source format is MM/DD/YYYY. */
  latestFiled: string | null;
  top: ComponentStat[];
}

export interface RatingVariant {
  vehicleId: number;
  description: string;
  overall: number | null;
  frontal: number | null;
  side: number | null;
  rollover: number | null;
  rolloverRiskPct: number | null;
}

export interface VehicleData {
  make: string;
  model: string;
  year: number;
  /** The model name NHTSA's recall/complaint data was actually found under. */
  nhtsaModel: string;
  recalls: { status: DataStatus; items: Recall[] };
  complaints: ComplaintSummary;
  ratings: { status: DataStatus; variants: RatingVariant[] };
  fetchedAt: string;
}

export interface DecodedVehicle {
  make: string;
  model: string;
  year: number;
  series: string;
  trim: string;
  bodyClass: string;
  driveType: string;
  engine: string;
  fuel: string;
  transmission: string;
  doors: string;
  manufacturer: string;
  plantCountry: string;
  vehicleType: string;
  electrification: string;
  warning: string | null;
}

export type DecodeResult =
  | { ok: true; vehicle: DecodedVehicle }
  | { ok: false; error: string };

export type Fetcher = (url: string) => Promise<Response>;

const API = "https://api.nhtsa.gov";
const VPIC = "https://vpic.nhtsa.dot.gov/api/vehicles";

const enc = encodeURIComponent;

// ---------- dates ----------

function toIso(y: number, m: number, d: number): string | null {
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function splitDate(s: unknown): [number, number, number] | null {
  if (typeof s !== "string") return null;
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/** Recall ReportReceivedDate is DD/MM/YYYY. */
export function parseRecallDate(s: unknown): string | null {
  const p = splitDate(s);
  return p ? toIso(p[2], p[1], p[0]) : null;
}

/** Complaint dates are MM/DD/YYYY. */
export function parseComplaintDate(s: unknown): string | null {
  const p = splitDate(s);
  return p ? toIso(p[2], p[0], p[1]) : null;
}

// ---------- text ----------

const ACRONYMS = new Set(["BMW", "GMC", "RAM", "MINI", "FIAT", "AMC", "SRT", "AWD", "FWD", "RWD", "4WD", "2WD", "SUV", "EV"]);

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/(\s+|-|\/)/)
    .map((w) => (ACRONYMS.has(w.toUpperCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

function clean(s: unknown): string {
  return typeof s === "string" ? s.replace(/\s+/g, " ").trim().replace(/^[,;.\s]+/, "") : "";
}

/** "FUEL SYSTEM, GASOLINE:DELIVERY:FUEL PUMP" -> "Fuel System, Gasoline: Delivery: Fuel Pump" */
export function prettyComponent(c: string): string {
  return c
    .split(":")
    .map((p) => titleCase(p.trim()).replace(/\(([^)]*)\)/g, (m) => m.toUpperCase()))
    .join(": ");
}

/**
 * Complaint `components` joins multiple components with a bare comma, while a single
 * component name may itself contain ", " (e.g. "FUEL SYSTEM, GASOLINE").
 */
export function splitComponents(s: string): string[] {
  return s
    .split(/,(?! )/)
    .map((c) => c.trim())
    .filter(Boolean);
}

// ---------- normalization ----------

export function normalizeRecalls(results: any[]): Recall[] {
  const seen = new Set<string>();
  const out: Recall[] = [];
  for (const r of results ?? []) {
    const campaign = clean(r.NHTSACampaignNumber);
    if (!campaign || seen.has(campaign)) continue;
    seen.add(campaign);
    out.push({
      campaign,
      date: parseRecallDate(r.ReportReceivedDate),
      component: clean(r.Component),
      summary: clean(r.Summary),
      consequence: clean(r.Consequence),
      remedy: clean(r.Remedy),
      parkIt: r.parkIt === true,
      parkOutside: r.parkOutSide === true,
      overTheAir: r.overTheAirUpdate === true,
    });
  }
  // newest first; undated last
  return out.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function summarizeComplaints(results: any[], status: DataStatus = "ok", topN = 5): ComplaintSummary {
  const by = new Map<string, ComponentStat>();
  const sum = { total: 0, crashes: 0, fires: 0, injuries: 0, deaths: 0 };
  let latest: string | null = null;
  for (const c of results ?? []) {
    const crash = c.crash === true ? 1 : 0;
    const fire = c.fire === true ? 1 : 0;
    const inj = Number(c.numberOfInjuries) || 0;
    const dth = Number(c.numberOfDeaths) || 0;
    sum.total++;
    sum.crashes += crash;
    sum.fires += fire;
    sum.injuries += inj;
    sum.deaths += dth;
    const filed = parseComplaintDate(c.dateComplaintFiled);
    if (filed && (!latest || filed > latest)) latest = filed;
    const comps = splitComponents(clean(c.components) || "UNKNOWN OR OTHER");
    for (const comp of new Set(comps)) {
      const s = by.get(comp) ?? { component: comp, count: 0, crashes: 0, fires: 0, injuries: 0, deaths: 0 };
      s.count++;
      s.crashes += crash;
      s.fires += fire;
      s.injuries += inj;
      s.deaths += dth;
      by.set(comp, s);
    }
  }
  const top = [...by.values()]
    .filter((s) => s.component !== "UNKNOWN OR OTHER")
    .sort((a, b) => b.count - a.count || a.component.localeCompare(b.component))
    .slice(0, topN);
  return { status, ...sum, latestFiled: latest, top };
}

function star(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

export function normalizeRating(r: any): RatingVariant {
  const risk = Number(r.RolloverPossibility);
  return {
    vehicleId: Number(r.VehicleId),
    description: clean(r.VehicleDescription),
    overall: star(r.OverallRating),
    frontal: star(r.OverallFrontCrashRating),
    side: star(r.OverallSideCrashRating),
    rollover: star(r.RolloverRating),
    rolloverRiskPct: Number.isFinite(risk) && risk > 0 ? Math.round(risk * 1000) / 10 : null,
  };
}

export function normalizeDecode(json: any): DecodeResult {
  const r = json?.Results?.[0];
  if (!r) return { ok: false, error: "NHTSA's decoder returned no data for this VIN. Please try again later." };
  const make = clean(r.Make);
  const model = clean(r.Model);
  const year = Number(r.ModelYear);
  const codes = clean(r.ErrorCode)
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c && c !== "0");
  if (!make || !model || !year) {
    return {
      ok: false,
      error:
        "NHTSA couldn't identify a make, model and year for this VIN. It may be mistyped, very new, or from a vehicle not sold in the US.",
    };
  }
  const cyl = clean(r.EngineCylinders);
  const disp = Number(r.DisplacementL);
  const engineParts = [
    Number.isFinite(disp) && disp > 0 ? `${disp.toFixed(1)}L` : "",
    cyl ? `${cyl}-cylinder` : "",
    clean(r.EngineModel),
  ].filter(Boolean);
  return {
    ok: true,
    vehicle: {
      make: titleCase(make),
      model,
      year,
      series: clean(r.Series),
      trim: clean(r.Trim),
      bodyClass: clean(r.BodyClass),
      driveType: clean(r.DriveType),
      engine: engineParts.join(" "),
      fuel: clean(r.FuelTypePrimary),
      transmission: [clean(r.TransmissionStyle), clean(r.TransmissionSpeeds) && `${clean(r.TransmissionSpeeds)}-speed`]
        .filter(Boolean)
        .join(", "),
      doors: clean(r.Doors),
      manufacturer: clean(r.Manufacturer),
      plantCountry: titleCase(clean(r.PlantCountry).replace(/\s*\(.*\)$/, "")),
      vehicleType: clean(r.VehicleType),
      electrification: clean(r.ElectrificationLevel),
      warning: codes.length
        ? clean(r.ErrorText).replace(/^\d+\s*-\s*/, "").split(";")[0] || null
        : null,
    },
  };
}

// ---------- fetching ----------

export const urls = {
  decode: (vin: string) => `${VPIC}/decodevinvalues/${enc(vin)}?format=json`,
  modelsForMakeYear: (make: string, year: number) =>
    `${VPIC}/GetModelsForMakeYear/make/${enc(make)}/modelyear/${year}?format=json`,
  recalls: (make: string, model: string, year: number) =>
    `${API}/recalls/recallsByVehicle?make=${enc(make)}&model=${enc(model)}&modelYear=${year}`,
  complaints: (make: string, model: string, year: number) =>
    `${API}/complaints/complaintsByVehicle?make=${enc(make)}&model=${enc(model)}&modelYear=${year}`,
  ratingsModels: (year: number, make: string) => `${API}/SafetyRatings/modelyear/${year}/make/${enc(make)}`,
  ratingsVariants: (year: number, make: string, model: string) =>
    `${API}/SafetyRatings/modelyear/${year}/make/${enc(make)}/model/${enc(model)}`,
  ratingsById: (id: number) => `${API}/SafetyRatings/VehicleId/${id}`,
};

export class UpstreamError extends Error {}

/** Returns parsed JSON, or null for a 400 (NHTSA's "vehicle not in our tables"). */
async function getJson(fetcher: Fetcher, url: string): Promise<any | null> {
  const res = await fetcher(url);
  if (res.status === 400 || res.status === 404) return null;
  if (!res.ok) throw new UpstreamError(`NHTSA returned HTTP ${res.status}`);
  return res.json();
}

/**
 * Candidate model names to try against the recall/complaint APIs. vPIC and the recall
 * tables don't always agree: vPIC says "Silverado" + Series "1500", recalls want
 * "Silverado 1500".
 */
export function modelCandidates(model: string, series = ""): string[] {
  const c = [model];
  const s = series.trim();
  if (s && s.length <= 12 && !model.toLowerCase().includes(s.toLowerCase())) c.push(`${model} ${s}`);
  return c;
}

async function fetchRatings(fetcher: Fetcher, make: string, models: string[], year: number) {
  let variants: { VehicleId: number }[] = [];
  for (const m of models) {
    const j = await getJson(fetcher, urls.ratingsVariants(year, make, m));
    variants = j?.Results ?? [];
    if (variants.length) break;
  }
  if (!variants.length) {
    // e.g. F-150 is rated as "F-150 SUPER CREW", "F-150 SUPERCAB", ...
    const list = await getJson(fetcher, urls.ratingsModels(year, make));
    const prefixes = models.map((m) => m.toUpperCase());
    const names: string[] = (list?.Results ?? [])
      .map((r: any) => String(r.Model ?? ""))
      .filter((n: string) => prefixes.some((p) => n.toUpperCase().startsWith(p + " ")))
      .slice(0, 3);
    for (const n of names) {
      const j = await getJson(fetcher, urls.ratingsVariants(year, make, n));
      variants.push(...(j?.Results ?? []));
    }
  }
  const ids = [...new Set(variants.map((v) => Number(v.VehicleId)).filter(Boolean))].slice(0, 6);
  const rated = await Promise.all(
    ids.map(async (id) => {
      const j = await getJson(fetcher, urls.ratingsById(id));
      return j?.Results?.[0] ? normalizeRating(j.Results[0]) : null;
    }),
  );
  const out = rated.filter((r): r is RatingVariant => r !== null);
  return { status: (out.length ? "ok" : "nodata") as DataStatus, variants: out };
}

export async function fetchVehicleData(
  fetcher: Fetcher,
  input: { make: string; model: string; year: number; series?: string; displayMake?: string; displayModel?: string },
): Promise<VehicleData> {
  const { make, year } = input;
  const candidates = modelCandidates(input.model, input.series);

  let chosen = candidates[0];
  let recallsJson: any = null;
  let complaintsJson: any = null;
  for (const m of candidates) {
    const [r, c] = await Promise.all([
      getJson(fetcher, urls.recalls(make, m, year)),
      getJson(fetcher, urls.complaints(make, m, year)),
    ]);
    const hits = (r?.results?.length ?? 0) + (c?.results?.length ?? 0);
    if (m === candidates[0] || hits > 0) {
      chosen = m;
      recallsJson = r;
      complaintsJson = c;
    }
    if (hits > 0) break;
  }

  const ratings = await fetchRatings(fetcher, make, [...new Set([chosen, ...candidates])], year);
  const recallItems = normalizeRecalls(recallsJson?.results ?? []);
  const complaintResults = complaintsJson?.results ?? [];

  // A 400 means "not in NHTSA's tables", never "no recalls". An empty 200 for a model
  // NHTSA has no complaints or ratings for is equally uninformative.
  const known = recallItems.length > 0 || complaintResults.length > 0 || ratings.status === "ok";
  const recallStatus: DataStatus = recallsJson && known ? "ok" : "nodata";
  const complaintStatus: DataStatus = complaintsJson && known ? "ok" : "nodata";

  return {
    make: input.displayMake ?? titleCase(make),
    model: input.displayModel ?? input.model,
    year,
    nhtsaModel: chosen,
    recalls: { status: recallStatus, items: recallItems },
    complaints: summarizeComplaints(complaintResults, complaintStatus),
    ratings,
    fetchedAt: new Date().toISOString(),
  };
}
