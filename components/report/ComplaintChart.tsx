import type { ComplaintSummary } from "@/lib/nhtsa";
import { prettyComponent } from "@/lib/nhtsa";
import { fmt, formatDate } from "@/lib/report";

function counts(s: { crashes: number; fires: number; injuries: number; deaths: number }) {
  if (!s.crashes && !s.fires && !s.injuries && !s.deaths) return "";
  const parts = [
    `${fmt(s.crashes)} ${s.crashes === 1 ? "crash" : "crashes"}`,
    `${fmt(s.fires)} ${s.fires === 1 ? "fire" : "fires"}`,
    `${fmt(s.injuries)} ${s.injuries === 1 ? "injury" : "injuries"}`,
  ];
  if (s.deaths) parts.push(`${fmt(s.deaths)} ${s.deaths === 1 ? "death" : "deaths"}`);
  return parts.join(" · ");
}

/** Single-series horizontal bar chart of the top complaint components. */
export function ComplaintChart({ data, name }: { data: ComplaintSummary; name: string }) {
  if (data.status === "nodata") {
    return <p className="notice">NHTSA has no complaint records filed under the {name}.</p>;
  }
  if (data.total === 0) {
    return (
      <p className="notice">
        NHTSA&rsquo;s complaint search returns no owner complaints for the {name}. For a widely sold model this usually
        means complaints were filed under a different model name, not that there are none. Search{" "}
        <a href="https://www.nhtsa.gov/recalls" rel="noopener" target="_blank">
          nhtsa.gov
        </a>{" "}
        to be sure.
      </p>
    );
  }
  const max = Math.max(1, ...data.top.map((t) => t.count));
  return (
    <>
      <p className="muted small">
        {fmt(data.total)} complaints filed with NHTSA
        {counts(data) ? ` (${counts(data)})` : ", none reporting a crash, fire or injury"}
        {data.latestFiled ? `. Latest filed ${formatDate(data.latestFiled)}.` : "."} A complaint can list more than one
        component.
      </p>
      <table className="bar-chart">
        <caption className="sr-only">Top {data.top.length} complaint components for the {name}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Complaints</th>
          </tr>
        </thead>
        <tbody>
          {data.top.map((t) => (
            <tr key={t.component}>
              <th scope="row">
                {prettyComponent(t.component)}
                {counts(t) && <span className="bar-meta">{counts(t)}</span>}
              </th>
              <td>
                <span className="bar-track" title={`${prettyComponent(t.component)}: ${fmt(t.count)} complaints`}>
                  <span className="bar" style={{ width: `${Math.max(2, (t.count / max) * 100)}%` }} />
                </span>
                <span className="bar-value">{fmt(t.count)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
