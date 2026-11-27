// Components available inside post MDX files.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { dartUrl, secUrl } from "@/lib/filings";
import { eventStudy, pct, type PricePoint } from "@/lib/eventstudy";

type Filing = { dart: string; label: string } | { sec: [string, string]; label: string };

function filingHref(f: Filing) {
  return "dart" in f ? dartUrl(f.dart) : secUrl(f.sec[0], f.sec[1]);
}

/** Key deal terms in a box. items: [label, value][] */
export function DealBox({ title, items, filings = [] }: { title: string; items: [string, string][]; filings?: Filing[] }) {
  return (
    <aside className="deal-box">
      <p className="deal-title">{title}</p>
      <dl>
        {items.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {filings.length > 0 && (
        <ul className="deal-filings">
          {filings.map((f) => (
            <li key={f.label}>
              <a href={filingHref(f)} rel="noopener" target="_blank">
                {"dart" in f ? "DART" : "SEC"} · {f.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export function Dart({ rcp, children }: { rcp: string; children: React.ReactNode }) {
  return (
    <a href={dartUrl(rcp)} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

export function Sec({ cik, acc, children }: { cik: string; acc: string; children: React.ReactNode }) {
  return (
    <a href={secUrl(cik, acc)} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return <div className="callout">{children}</div>;
}

interface PriceFile {
  eventDate: string;
  window?: [number, number];
  stock: { name: string; ticker: string; prices: PricePoint[] };
  index: { name: string; prices: PricePoint[] };
  source: string;
}

/**
 * Market-adjusted event study chart from content/data/<id>.json (fetched and committed by a
 * data script, never fetched at build time). Single series: cumulative abnormal return.
 */
export function EventStudy({ id, lang = "ko" }: { id: string; lang?: "ko" | "en" }) {
  const file = path.join(process.cwd(), "content", "data", `${id}.json`);
  if (!existsSync(file)) throw new Error(`EventStudy: missing data file content/data/${id}.json`);
  const d = JSON.parse(readFileSync(file, "utf8")) as PriceFile;
  const r = eventStudy(d.stock.prices, d.index.prices, d.eventDate, d.window ?? [-5, 20]);

  const W = 640, H = 260, L = 48, R = 16, T = 16, B = 34;
  const xs = r.rows.map((x) => x.day);
  const ys = r.rows.map((x) => x.car);
  const yMax = Math.max(0.02, ...ys) * 1.15;
  const yMin = Math.min(-0.02, ...ys) * 1.15;
  const x = (day: number) => L + ((day - xs[0]) / (xs[xs.length - 1] - xs[0])) * (W - L - R);
  const y = (v: number) => T + ((yMax - v) / (yMax - yMin)) * (H - T - B);
  const line = r.rows.map((p, i) => `${i ? "L" : "M"}${x(p.day).toFixed(1)} ${y(p.car).toFixed(1)}`).join(" ");
  const ticks = [yMin, 0, yMax].map((v) => Math.round(v * 100) / 100);
  const ko = lang === "ko";
  const car = (a: number, b: number) => r.rows.filter((p) => p.day >= a && p.day <= b).reduce((s, p) => s + p.abnormal, 0);

  return (
    <figure className="event-study">
      <figcaption>
        {ko
          ? `${d.stock.name} 누적초과수익률(CAR), ${d.index.name} 대비 · 공시일(0일) ${r.eventDate}`
          : `${d.stock.name} cumulative abnormal return vs ${d.index.name} · day 0 = ${r.eventDate}`}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ko ? `0일 초과수익률 ${pct(r.dayZeroAbnormal)}, 구간 전체 CAR ${pct(r.car)}` : `Day-0 abnormal return ${pct(r.dayZeroAbnormal)}, window CAR ${pct(r.car)}`}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className={v === 0 ? "es-zero" : "es-grid"} />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" className="es-tick">
              {pct(v, 0)}
            </text>
          </g>
        ))}
        <line x1={x(0)} x2={x(0)} y1={T} y2={H - B} className="es-event" />
        <text x={x(0) + 4} y={T + 12} className="es-tick">
          {ko ? "공시" : "Announcement"}
        </text>
        {[xs[0], 0, xs[xs.length - 1]].map((dday) => (
          <text key={dday} x={x(dday)} y={H - 12} textAnchor="middle" className="es-tick">
            {dday > 0 ? `+${dday}` : dday}
          </text>
        ))}
        <path d={line} className="es-line" />
        <circle cx={x(xs[xs.length - 1])} cy={y(ys[ys.length - 1])} r="4" className="es-dot" />
      </svg>
      <table className="es-table">
        <thead>
          <tr>
            <th scope="col">{ko ? "구간(거래일)" : "Window (trading days)"}</th>
            <th scope="col">CAR</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>[0]</td><td>{pct(r.dayZeroAbnormal)}</td></tr>
          <tr><td>[-1, +1]</td><td>{pct(car(-1, 1))}</td></tr>
          <tr><td>[{xs[0]}, +{xs[xs.length - 1]}]</td><td>{pct(r.car)}</td></tr>
        </tbody>
      </table>
      <p className="es-source small muted">
        {ko ? "시장조정 모형(종목 수익률 − 지수 수익률). 자료: " : "Market-adjusted model (stock return − index return). Data: "}
        {d.source}
      </p>
    </figure>
  );
}

export const mdxComponents = { DealBox, Dart, Sec, Callout, EventStudy };
