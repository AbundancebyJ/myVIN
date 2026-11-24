// Year-over-year comparison for one make/model, computed from data/generated/index.json.
import type { IndexEntry } from "./data";
import { fmt, type Faq } from "./report";
import { prettyComponent } from "./nhtsa";

export type Flag = "mostRecalls" | "fewestRecalls" | "mostComplaints" | "fewestComplaints";

export const FLAG_LABEL: Record<Flag, string> = {
  mostRecalls: "Most recalls",
  fewestRecalls: "Fewest recalls",
  mostComplaints: "Most complaints",
  fewestComplaints: "Fewest complaints",
};

export interface CompareRow extends IndexEntry {
  /** Complaint data counted as missing: NHTSA returned none for a model that clearly sells (it has recalls). */
  complaintsMissing: boolean;
  flags: Flag[];
}

export interface Comparison {
  make: string;
  model: string;
  rows: CompareRow[]; // oldest first
  first: number;
  last: number;
}

const ord = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export function compareYears(entries: IndexEntry[]): Comparison | null {
  if (entries.length < 2) return null;
  const rows: CompareRow[] = [...entries]
    .sort((a, b) => a.year - b.year)
    .map((e) => ({ ...e, complaintsMissing: e.complaints === 0 && e.recalls > 0, flags: [] }));

  const withRecalls = rows.filter((r) => r.recallStatus === "ok");
  const withComplaints = rows.filter((r) => !r.complaintsMissing);
  const mark = (set: CompareRow[], key: "recalls" | "complaints", most: Flag, fewest: Flag) => {
    if (set.length < 2) return;
    const vals = set.map((r) => r[key]);
    const hi = Math.max(...vals);
    const lo = Math.min(...vals);
    if (hi === lo) return;
    for (const r of set) {
      if (r[key] === hi) r.flags.push(most);
      if (r[key] === lo) r.flags.push(fewest);
    }
  };
  mark(withRecalls, "recalls", "mostRecalls", "fewestRecalls");
  mark(withComplaints, "complaints", "mostComplaints", "fewestComplaints");

  return { make: rows[0].make, model: rows[0].model, rows, first: rows[0].year, last: rows[rows.length - 1].year };
}

const yearsWith = (c: Comparison, f: Flag) => c.rows.filter((r) => r.flags.includes(f));
const list = (rows: CompareRow[]) => rows.map((r) => r.year).join(" and ");

/** 2–3 sentence plain-English comparison for the model hub. */
export function comparisonSummary(c: Comparison): string {
  const name = `${c.make} ${c.model}`;
  const s: string[] = [];
  const most = yearsWith(c, "mostRecalls");
  const fewest = yearsWith(c, "fewestRecalls");
  if (most.length) {
    s.push(
      `Across the ${c.first}–${c.last} ${name}, the ${list(most)} model year${most.length > 1 ? "s have" : " has"} the most recall campaigns (${fmt(most[0].recalls)})` +
        (fewest.length ? `, and ${list(fewest)} the fewest (${fmt(fewest[0].recalls)}).` : "."),
    );
  }
  const mc = yearsWith(c, "mostComplaints");
  const fc = yearsWith(c, "fewestComplaints");
  if (mc.length) {
    const top = mc[0].topComponent ? `, most often about the ${prettyComponent(mc[0].topComponent).toLowerCase()}` : "";
    s.push(
      `Owners filed the most NHTSA complaints about the ${list(mc)} (${fmt(mc[0].complaints)}${top})` +
        (fc.length ? `; the ${list(fc)} has the fewest (${fmt(fc[0].complaints)}).` : "."),
    );
  }
  s.push("Older model years have had more time to collect recalls and complaints, so compare years of similar age.");
  return s.join(" ");
}

/** "2nd-most recalls of 6" style ranking for one year within the model. */
export function yearRankSentence(c: Comparison, year: number): string | null {
  const row = c.rows.find((r) => r.year === year);
  if (!row) return null;
  const parts: string[] = [];
  const rankOf = (set: CompareRow[], key: "recalls" | "complaints") =>
    1 + set.filter((r) => r[key] > row[key]).length;
  const rset = c.rows.filter((r) => r.recallStatus === "ok");
  if (row.recallStatus === "ok" && rset.length > 1) {
    const rk = rankOf(rset, "recalls");
    parts.push(rk === 1 ? `the most recalls (${fmt(row.recalls)})` : `the ${ord(rk)}-most recalls (${fmt(row.recalls)})`);
  }
  const cset = c.rows.filter((r) => !r.complaintsMissing);
  if (!row.complaintsMissing && cset.length > 1) {
    const rk = rankOf(cset, "complaints");
    parts.push(
      rk === 1 ? `the most owner complaints (${fmt(row.complaints)})` : `the ${ord(rk)}-most owner complaints (${fmt(row.complaints)})`,
    );
  }
  if (!parts.length) return null;
  return `Of the ${c.rows.length} ${c.make} ${c.model} model years we cover (${c.first}–${c.last}), the ${year} has ${parts.join(" and ")}.`;
}

export function comparisonFaq(c: Comparison): Faq[] {
  const name = `${c.make} ${c.model}`;
  const faqs: Faq[] = [];
  const most = yearsWith(c, "mostRecalls");
  if (most.length) {
    faqs.push({
      q: `Which ${name} year has the most recalls?`,
      a: `Of the ${c.first}–${c.last} model years, the ${list(most)} ${name} has the most NHTSA recall campaigns (${fmt(most[0].recalls)}).`,
    });
  }
  const fc = yearsWith(c, "fewestComplaints");
  if (fc.length) {
    faqs.push({
      q: `Which ${name} year has the fewest owner complaints?`,
      a: `Of the ${c.first}–${c.last} model years with complaint data, the ${list(fc)} ${name} has the fewest complaints filed with NHTSA (${fmt(fc[0].complaints)}). Newer years have had less time to collect complaints.`,
    });
  }
  faqs.push({
    q: `Is a newer ${name} always the safer choice?`,
    a: `Not necessarily. Newer model years have had less time to collect recalls and complaints, and recall repairs are free on any year. Check the specific vehicle's open recalls with its VIN at nhtsa.gov/recalls and get a pre-purchase inspection.`,
  });
  return faqs;
}
