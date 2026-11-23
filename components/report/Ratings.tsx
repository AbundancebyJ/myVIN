import type { RatingVariant, DataStatus } from "@/lib/nhtsa";

export function Stars({ value }: { value: number | null }) {
  if (value === null) return <span className="muted small">Not rated</span>;
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      <span aria-hidden="true">{"★".repeat(value)}</span>
      <span aria-hidden="true" className="stars-off">
        {"★".repeat(5 - value)}
      </span>
    </span>
  );
}

export function Ratings({ status, variants, name }: { status: DataStatus; variants: RatingVariant[]; name: string }) {
  if (status === "nodata" || variants.length === 0) {
    return (
      <p className="notice">
        NHTSA hasn&rsquo;t published 5-Star Safety Ratings for the {name}. Not every model and year is crash-tested.
      </p>
    );
  }
  return (
    <div className="ratings">
      {variants.map((v) => (
        <div className="rating-card" key={v.vehicleId}>
          <h3 className="rating-title">{v.description}</h3>
          <dl className="rating-grid">
            <dt>Overall</dt>
            <dd>
              <Stars value={v.overall} />
            </dd>
            <dt>Frontal crash</dt>
            <dd>
              <Stars value={v.frontal} />
            </dd>
            <dt>Side crash</dt>
            <dd>
              <Stars value={v.side} />
            </dd>
            <dt>Rollover</dt>
            <dd>
              <Stars value={v.rollover} />
              {v.rolloverRiskPct !== null && <span className="muted small"> ({v.rolloverRiskPct}% risk)</span>}
            </dd>
          </dl>
        </div>
      ))}
    </div>
  );
}
