import type { RatingVariant, DataStatus } from "@/lib/nhtsa";

const STAR = "M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z";

export function Stars({ value }: { value: number | null }) {
  if (value === null) return <span className="muted small">Not rated</span>;
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className={n <= value ? "on" : "off"}>
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}

const COLS: [keyof RatingVariant, string][] = [
  ["overall", "Overall"],
  ["frontal", "Frontal crash"],
  ["side", "Side crash"],
  ["rollover", "Rollover"],
];

export function Ratings({ status, variants, name }: { status: DataStatus; variants: RatingVariant[]; name: string }) {
  if (status === "nodata" || variants.length === 0) {
    return (
      <p className="notice">
        NHTSA hasn&rsquo;t published 5-Star Safety Ratings for the {name}. Not every model and year is crash-tested.
      </p>
    );
  }
  return (
    <table className="ratings-table">
      <caption className="sr-only">NHTSA 5-Star Safety Ratings for the {name}, by version</caption>
      <thead>
        <tr>
          <th scope="col">Version</th>
          {COLS.map(([, label]) => (
            <th scope="col" key={label}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {variants.map((v) => (
          <tr key={v.vehicleId}>
            <th scope="row">{v.description.replace(/^\d{4}\s+/, "")}</th>
            {COLS.map(([key, label]) => (
              <td data-label={label} key={label}>
                <Stars value={v[key] as number | null} />
                {key === "rollover" && v.rolloverRiskPct !== null && (
                  <span className="risk">{v.rolloverRiskPct}% rollover risk</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
