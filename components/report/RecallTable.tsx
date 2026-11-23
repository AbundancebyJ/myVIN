import type { Recall, DataStatus } from "@/lib/nhtsa";
import { prettyComponent } from "@/lib/nhtsa";
import { formatDate, NHTSA_RECALLS_URL } from "@/lib/report";

export function RecallTable({ status, items, name }: { status: DataStatus; items: Recall[]; name: string }) {
  if (status === "nodata") {
    return (
      <div className="notice notice-warn" role="note">
        <strong>No recall data available.</strong> NHTSA&rsquo;s recall database has no records filed under the{" "}
        {name}. That is <em>not</em> the same as &ldquo;no recalls&rdquo;. The vehicle may be listed under a different
        model name. Check{" "}
        <a href={NHTSA_RECALLS_URL} rel="noopener" target="_blank">
          nhtsa.gov/recalls
        </a>{" "}
        with the VIN.
      </div>
    );
  }
  if (items.length === 0) {
    return <p className="notice notice-ok">NHTSA lists no recall campaigns for the {name}.</p>;
  }
  return (
    <table className="recall-table">
      <caption className="sr-only">Recall campaigns for the {name}, newest first</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Component</th>
          <th scope="col">What&rsquo;s wrong</th>
          <th scope="col">Risk &amp; fix</th>
        </tr>
      </thead>
      <tbody>
        {items.map((r) => (
          <tr key={r.campaign}>
            <td data-label="Date">
              <span className="nowrap">{formatDate(r.date)}</span>
              <span className="campaign">#{r.campaign}</span>
              {(r.parkIt || r.parkOutside) && (
                <span className="badge badge-danger">{r.parkIt ? "Do not drive" : "Park outside"}</span>
              )}
              {r.overTheAir && <span className="badge">Over-the-air fix</span>}
            </td>
            <td data-label="Component" className="component">
              {prettyComponent(r.component)}
            </td>
            <td data-label="What's wrong">{r.summary}</td>
            <td className="recall-more">
              <details>
                <summary>Risk &amp; fix</summary>
                {r.consequence && (
                  <p>
                    <strong>Risk:</strong> {r.consequence}
                  </p>
                )}
                {r.remedy && (
                  <p>
                    <strong>Fix:</strong> {r.remedy}
                  </p>
                )}
              </details>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
