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
    <ol className="recall-list" aria-label={`Recall campaigns for the ${name}, newest first`}>
      {items.map((r) => (
        <li key={r.campaign} className="recall">
          <div className="recall-meta">
            <span className="recall-date">{formatDate(r.date)}</span>
            <span className="recall-id mono">
              <span className="sr-only">Campaign </span>
              {r.campaign}
            </span>
            {(r.parkIt || r.parkOutside) && (
              <span className="badge badge-danger">{r.parkIt ? "Do not drive" : "Park outside"}</span>
            )}
            {r.overTheAir && <span className="badge">Over-the-air fix</span>}
          </div>
          <div className="recall-body">
            <p className="recall-component">{prettyComponent(r.component)}</p>
            <p className="recall-summary">{r.summary}</p>
            {(r.consequence || r.remedy) && (
              <details className="recall-more">
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
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
