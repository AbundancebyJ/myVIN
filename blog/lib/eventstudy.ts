// Market-adjusted event study: abnormal return = stock return - index return.
// Prices are daily closes, aligned on trading dates; day 0 is the announcement date
// (or the next trading day if it fell on a non-trading day / after the close).

export interface PricePoint {
  date: string; // YYYY-MM-DD
  close: number;
}

export interface EventStudyRow {
  day: number; // trading days relative to the event
  date: string;
  stockReturn: number; // daily return, decimal
  indexReturn: number;
  abnormal: number;
  car: number; // cumulative abnormal return from the window start
}

export interface EventStudyResult {
  eventDate: string; // trading date used as day 0
  rows: EventStudyRow[];
  car: number; // over the whole window
  dayZeroAbnormal: number;
}

function returns(series: PricePoint[]): Map<string, number> {
  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));
  const out = new Map<string, number>();
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].close;
    if (prev > 0) out.set(sorted[i].date, sorted[i].close / prev - 1);
  }
  return out;
}

export function eventStudy(
  stock: PricePoint[],
  index: PricePoint[],
  eventDate: string,
  window: [number, number] = [-5, 20],
): EventStudyResult {
  const rs = returns(stock);
  const ri = returns(index);
  // trading days where both series have a return
  const days = [...rs.keys()].filter((d) => ri.has(d)).sort();
  const zero = days.findIndex((d) => d >= eventDate);
  if (zero < 0) throw new Error(`No trading day on or after ${eventDate}`);
  const [from, to] = window;
  if (zero + from < 0 || zero + to >= days.length) {
    throw new Error(`Not enough price history around ${eventDate} for window [${from}, ${to}]`);
  }
  const rows: EventStudyRow[] = [];
  let car = 0;
  for (let k = from; k <= to; k++) {
    const date = days[zero + k];
    const stockReturn = rs.get(date)!;
    const indexReturn = ri.get(date)!;
    const abnormal = stockReturn - indexReturn;
    car += abnormal;
    rows.push({ day: k, date, stockReturn, indexReturn, abnormal, car });
  }
  return { eventDate: days[zero], rows, car, dayZeroAbnormal: rows.find((r) => r.day === 0)!.abnormal };
}

export const pct = (x: number, digits = 1) => `${x >= 0 ? "+" : ""}${(x * 100).toFixed(digits)}%`;
