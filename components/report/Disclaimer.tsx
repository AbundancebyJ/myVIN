import { NHTSA_RECALLS_URL } from "@/lib/report";

export function Disclaimer({ fetchedAt }: { fetchedAt?: string }) {
  return (
    <aside className="disclaimer" aria-label="Disclaimer">
      <svg className="disclaimer-icon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        <path d="M12 9.5v4.2M12 17h.01" />
      </svg>
      <div>
        <p className="disclaimer-lead">
          Recalls apply to this make/model/year and don&rsquo;t show whether this vehicle was repaired. Check repair
          status with your VIN at{" "}
          <a href={NHTSA_RECALLS_URL} rel="noopener" target="_blank">
            nhtsa.gov/recalls
          </a>
          .
        </p>
        <p className="small muted">
          Data comes from the National Highway Traffic Safety Administration (NHTSA) public APIs
          {fetchedAt
            ? `, retrieved ${new Date(fetchedAt).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}`
            : ""}
          . Complaints are unverified owner reports. Not affiliated with NHTSA.
        </p>
      </div>
    </aside>
  );
}
