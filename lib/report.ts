import { prettyComponent, type Recall, type VehicleData } from "./nhtsa";

export const NHTSA_RECALLS_URL = "https://www.nhtsa.gov/recalls";

export function formatDate(iso: string | null): string {
  if (!iso) return "Date not listed";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const fmt = (n: number) => n.toLocaleString("en-US");
const plural = (n: number, one: string, many = one + "s") => `${fmt(n)} ${n === 1 ? one : many}`;

/** "FUEL SYSTEM, GASOLINE:DELIVERY:FUEL PUMP" -> "fuel pump" */
export function shortComponent(c: string): string {
  const parts = c.split(":").map((p) => p.trim()).filter(Boolean);
  const last = parts[parts.length - 1] ?? c;
  // Keep acronyms in parentheses readable: "control module (TCM/PCM/TECM)".
  return last.toLowerCase().replace(/\(([^)]*)\)/g, (m) => m.toUpperCase());
}

export function vehicleName(d: Pick<VehicleData, "year" | "make" | "model">): string {
  return `${d.year} ${d.make} ${d.model}`;
}

export function bestOverallRating(d: VehicleData): number | null {
  const r = d.ratings.variants.map((v) => v.overall).filter((v): v is number => v !== null);
  return r.length ? Math.max(...r) : null;
}

function overallRatingText(d: VehicleData): string {
  const r = d.ratings.variants.map((v) => v.overall).filter((v): v is number => v !== null);
  if (!r.length) return "NHTSA hasn't published an overall crash-test rating for it.";
  const lo = Math.min(...r);
  const hi = Math.max(...r);
  return lo === hi
    ? `NHTSA rates it ${hi} out of 5 stars overall in crash testing.`
    : `NHTSA rates its versions between ${lo} and ${hi} stars overall in crash testing.`;
}

/** 2–3 sentence plain-English summary computed from the data. */
export function plainSummary(d: VehicleData): string {
  const name = vehicleName(d);
  const s: string[] = [];
  const recalls = d.recalls.items;
  if (d.recalls.status === "nodata") {
    s.push(`NHTSA's recall database has no records listed under the ${name}, which is not the same as having no recalls.`);
  } else if (recalls.length === 0) {
    s.push(`NHTSA lists no recall campaigns for the ${name}.`);
  } else {
    const latest = recalls.find((r) => r.date) ?? recalls[0];
    const parkIt = recalls.filter((r) => r.parkIt || r.parkOutside).length;
    s.push(
      `NHTSA lists ${plural(recalls.length, "recall campaign")} for the ${name}; the most recent (${formatDate(latest.date)}) involves the ${shortComponent(latest.component)}.` +
        (parkIt ? ` ${plural(parkIt, "of them carries", "of them carry")} a "park it" or "park outside" warning.` : ""),
    );
  }
  const c = d.complaints;
  if (c.total > 0) {
    const top = c.top[0];
    s.push(
      `Owners have filed ${plural(c.total, "complaint")} with NHTSA` +
        (top ? `, most often about the ${prettyComponent(top.component).toLowerCase()} (${fmt(top.count)})` : "") +
        (c.crashes ? `, and ${plural(c.crashes, "complaint")} mention a crash.` : "."),
    );
  } else if (c.status === "ok") {
    s.push("NHTSA has no owner complaints on file for it.");
  }
  s.push(overallRatingText(d));
  return s.join(" ");
}

// ---------- seller checklist ----------

const COMPONENT_QUESTIONS: [RegExp, string][] = [
  [/AIR ?BAG/, "Have the airbags ever deployed or been replaced? Does the airbag warning light go out a few seconds after startup?"],
  [/SEAT BELT/, "Do all seat belts latch, release and retract smoothly?"],
  [/FUEL SYSTEM|FUEL\/PROPULSION/, "Has the car ever stalled, hesitated, or lost power while driving? Any fuel smell?"],
  [/ENGINE/, "Any check-engine light, oil consumption, or engine repairs?"],
  [/POWER TRAIN|TRANSMISSION/, "Any rough or delayed shifting, or transmission repairs?"],
  [/ELECTRICAL SYSTEM:PROPULSION|HYBRID PROPULSION|HIGH VOLTAGE/, "Has the high-voltage battery or charging system been serviced? Any range or charging warnings?"],
  [/ELECTRICAL/, "Any warning lights, dead-battery problems, or electrical glitches?"],
  [/STEERING/, "Does the steering feel normal, with no warning light, heaviness, or play?"],
  [/SERVICE BRAKES|PARKING BRAKE/, "Have the brakes been serviced recently? Any grinding, pulling, or a soft pedal?"],
  [/FORWARD COLLISION|LANE DEPARTURE|AUTOMATIC EMERGENCY/, "Has the car ever braked hard on its own for no reason (phantom braking)?"],
  [/BACK OVER|REARVIEW|CAMERA/, "Does the backup camera display reliably every time you shift into reverse?"],
  [/SUSPENSION|STRUCTURE|FRAME/, "Any clunks or noises over bumps? Has the frame or subframe been inspected or repaired?"],
  [/TIRES|WHEELS/, "How old are the tires, and have the wheels or lug nuts been replaced?"],
  [/LATCHES|LOCKS|LINKAGES|DOORS|HOOD/, "Do all doors, the hood and the tailgate latch securely?"],
  [/VISIBILITY|WIPER|EXTERIOR LIGHTING|LIGHTS/, "Do all lights, wipers and defrosters work?"],
  [/SEATS/, "Do the seats and seat adjusters lock firmly in place?"],
  [/EQUIPMENT|ELECTRONIC STABILITY/, "Do all dashboard warning lights turn off after startup?"],
];

const GENERAL_QUESTIONS = [
  "Can I see the title and the full service records?",
  "Has the car ever been in an accident, flood, or fire?",
  "Will you allow a pre-purchase inspection by an independent mechanic?",
];

export interface ChecklistItem {
  text: string;
  detail?: string;
}

export function sellerQuestions(recalls: Recall[]): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const urgent = recalls.filter((r) => r.parkIt || r.parkOutside);
  for (const r of urgent) {
    items.push({
      text: `Recall ${r.campaign} carries a "${r.parkIt ? "do not drive" : "park outside"}" warning. Has it been repaired? Ask for the dealer repair order.`,
      detail: shortComponent(r.component),
    });
  }
  const others = recalls.filter((r) => !r.parkIt && !r.parkOutside);
  if (others.length === 1) {
    items.push({
      text: `Has recall ${others[0].campaign} (${shortComponent(others[0].component)}) been completed? Ask for the dealer repair order.`,
    });
  } else if (others.length > 1) {
    items.push({
      text: `Have ${urgent.length ? "the other" : "all"} ${others.length} recalls been completed? Ask for dealer repair orders, or check the VIN at nhtsa.gov/recalls.`,
      detail: others.map((r) => `${r.campaign} (${shortComponent(r.component)})`).join(" · "),
    });
  }
  const added = new Set<string>();
  for (const r of recalls) {
    const c = r.component.toUpperCase();
    for (const [re, q] of COMPONENT_QUESTIONS) {
      if (re.test(c) && !added.has(q)) {
        added.add(q);
        items.push({ text: q });
        break;
      }
    }
  }
  return [...items, ...GENERAL_QUESTIONS.map((text) => ({ text }))];
}

// ---------- SEO ----------

export function isIndexable(d: VehicleData): boolean {
  return !(d.recalls.items.length === 0 && d.complaints.total < 10);
}

export interface Faq {
  q: string;
  a: string;
}

export function vehicleFaq(d: VehicleData): Faq[] {
  const name = vehicleName(d);
  const recalls = d.recalls.items;
  const faqs: Faq[] = [];
  faqs.push({
    q: `How many recalls does the ${name} have?`,
    a:
      d.recalls.status === "nodata"
        ? `NHTSA's recall database has no records listed under this name. Check nhtsa.gov/recalls with the vehicle's VIN.`
        : recalls.length === 0
          ? `NHTSA lists no recall campaigns for the ${name} as of our last data update.`
          : `NHTSA lists ${plural(recalls.length, "recall campaign")} for the ${name}, covering: ${[
              ...new Set(recalls.map((r) => shortComponent(r.component))),
            ]
              .slice(0, 6)
              .join(", ")}.`,
  });
  if (d.complaints.total > 0) {
    faqs.push({
      q: `What are the most common complaints about the ${name}?`,
      a: `Of ${plural(d.complaints.total, "owner complaint")} filed with NHTSA, the most-reported areas are ${d.complaints.top
        .slice(0, 3)
        .map((t) => `${prettyComponent(t.component).toLowerCase()} (${fmt(t.count)})`)
        .join(", ")}.`,
    });
  }
  faqs.push({ q: `What is the ${name}'s NHTSA safety rating?`, a: overallRatingText(d) });
  faqs.push({
    q: `How do I know if a specific ${name} had its recalls fixed?`,
    a: `Recalls apply to every ${name} in the affected range, but this list can't show whether a particular vehicle was repaired. Enter its 17-character VIN at nhtsa.gov/recalls or ask a ${d.make} dealer for the repair history. Recall repairs are free.`,
  });
  return faqs;
}
