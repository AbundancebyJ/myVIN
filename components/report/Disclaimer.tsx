import { NHTSA_RECALLS_URL } from "@/lib/report";

export function Disclaimer({ fetchedAt }: { fetchedAt?: string }) {
  return (
    <aside className="disclaimer" aria-label="Disclaimer">
      <p>
        <strong>
          Recalls apply to this make/model/year and don&rsquo;t show whether this vehicle was repaired. Check repair
          status with your VIN at{" "}
          <a href={NHTSA_RECALLS_URL} rel="noopener" target="_blank">
            nhtsa.gov/recalls
          </a>
          .
        </strong>
      </p>
      <p className="small">
        Data comes from the National Highway Traffic Safety Administration (NHTSA) public APIs
        {fetchedAt ? `, retrieved ${new Date(fetchedAt).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}` : ""}.
        Complaints are unverified owner reports. Not affiliated with NHTSA.
      </p>
    </aside>
  );
}
