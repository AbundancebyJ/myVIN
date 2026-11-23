import type { VehicleData } from "@/lib/nhtsa";
import { vehicleName } from "@/lib/report";
import { RecallTable } from "./RecallTable";
import { ComplaintChart } from "./ComplaintChart";
import { Ratings } from "./Ratings";
import { SellerChecklist } from "./SellerChecklist";
import { Disclaimer } from "./Disclaimer";
import { AdSlot } from "../AdSlot";

/** The recall / complaint / rating / checklist body shared by the VIN tool and static pages. */
export function VehicleReport({ data, headingLevel = 2 }: { data: VehicleData; headingLevel?: 2 | 3 }) {
  const name = vehicleName(data);
  const H = `h${headingLevel}` as "h2" | "h3";
  const recallCount = data.recalls.status === "ok" ? ` (${data.recalls.items.length})` : "";
  return (
    <>
      <section className="card" aria-labelledby="recalls-h">
        <H id="recalls-h">Recalls{recallCount}</H>
        <RecallTable status={data.recalls.status} items={data.recalls.items} name={name} />
        <Disclaimer fetchedAt={data.fetchedAt} />
      </section>

      <AdSlot id="report-1" />

      <section className="card" aria-labelledby="complaints-h">
        <H id="complaints-h">Top owner complaints</H>
        <ComplaintChart data={data.complaints} name={name} />
      </section>

      <section className="card" aria-labelledby="ratings-h">
        <H id="ratings-h">NHTSA crash-test ratings</H>
        <Ratings status={data.ratings.status} variants={data.ratings.variants} name={name} />
      </section>

      <section className="card checklist-card" aria-labelledby="questions-h">
        <H id="questions-h">Questions to ask the seller</H>
        <p className="muted small">Built from this vehicle&rsquo;s recall list. Tick them off as you go, or print this page.</p>
        <SellerChecklist recalls={data.recalls.items} />
      </section>
    </>
  );
}
