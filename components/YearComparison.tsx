import Link from "next/link";
import { FLAG_LABEL, type Comparison } from "@/lib/compare";
import { fmt } from "@/lib/report";
import { vehiclePath } from "@/lib/slug";
import { Stars } from "./report/Ratings";

/** Year-by-year table for one model. `current` highlights the year being viewed. */
export function YearComparison({ c, current }: { c: Comparison; current?: number }) {
  const maxComplaints = Math.max(1, ...c.rows.filter((r) => !r.complaintsMissing).map((r) => r.complaints));
  return (
    <div className="compare-wrap">
      <table className="compare-table">
        <caption className="sr-only">
          {c.make} {c.model} recalls, owner complaints and crash ratings by model year, {c.first}–{c.last}
        </caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col" className="num">
              Recalls
            </th>
            <th scope="col">Owner complaints</th>
            <th scope="col" className="num">
              Crash reports
            </th>
            <th scope="col">Overall rating</th>
          </tr>
        </thead>
        <tbody>
          {c.rows.map((r) => {
            const isCurrent = r.year === current;
            const recallFlags = r.flags.filter((f) => f.endsWith("Recalls"));
            const complaintFlags = r.flags.filter((f) => f.endsWith("Complaints"));
            return (
              <tr key={r.year} className={isCurrent ? "is-current" : undefined}>
                <th scope="row">
                  {isCurrent ? (
                    <span aria-current="page">{r.year}</span>
                  ) : (
                    <Link href={vehiclePath(r.make, r.model, r.year)}>
                      {r.year}
                      <span className="sr-only">
                        {" "}
                        {r.make} {r.model}
                      </span>
                    </Link>
                  )}
                </th>
                <td className="num" data-label="Recalls">
                  {r.recallStatus === "ok" ? fmt(r.recalls) : <span className="muted">No data</span>}
                  {recallFlags.map((f) => (
                    <span key={f} className={`flag ${f.startsWith("most") ? "flag-high" : "flag-low"}`}>
                      {FLAG_LABEL[f]}
                    </span>
                  ))}
                  {r.urgentRecalls > 0 && (
                    <span className="flag flag-high">{fmt(r.urgentRecalls)} do-not-drive</span>
                  )}
                </td>
                <td data-label="Owner complaints">
                  {r.complaintsMissing ? (
                    <span className="muted small">No complaint data from NHTSA</span>
                  ) : (
                    <span className="cmp-bar">
                      <span className="bar-track" aria-hidden="true">
                        <span className="bar" style={{ width: `${Math.max(2, (r.complaints / maxComplaints) * 100)}%` }} />
                      </span>
                      <span className="bar-value">{fmt(r.complaints)}</span>
                    </span>
                  )}
                  {complaintFlags.map((f) => (
                    <span key={f} className={`flag ${f.startsWith("most") ? "flag-high" : "flag-low"}`}>
                      {FLAG_LABEL[f]}
                    </span>
                  ))}
                </td>
                <td className="num" data-label="Crash reports">
                  {r.complaintsMissing ? <span className="muted">–</span> : fmt(r.crashes)}
                </td>
                <td data-label="Overall rating">
                  <Stars value={r.overall} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
