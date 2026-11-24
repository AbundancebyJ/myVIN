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
  const recallCount = data.recalls.status === "ok" ? data.recalls.items.length : null;
  return (
    <div className="report-sections">
      <section className="report-section" aria-labelledby="recalls-h">
        <H id="recalls-h" className="section-title">
          Recalls
          {recallCount !== null && <span className="count">{recallCount}</span>}
        </H>
        <Disclaimer fetchedAt={data.fetchedAt} />
        <RecallTable status={data.recalls.status} items={data.recalls.items} name={name} />
      </section>

      <AdSlot id="report-1" />

      <section className="report-section" aria-labelledby="complaints-h">
        <H id="complaints-h" className="section-title">
          Top owner complaints
        </H>
        <ComplaintChart data={data.complaints} name={name} />
      </section>

      <section className="report-section" aria-labelledby="ratings-h">
        <H id="ratings-h" className="section-title">
          NHTSA crash-test ratings
        </H>
        <Ratings status={data.ratings.status} variants={data.ratings.variants} name={name} />
      </section>

      <section className="report-section checklist-section" id="seller-questions" aria-labelledby="questions-h">
        <H id="questions-h" className="section-title">
          Questions to ask the seller
        </H>
        <p className="muted small">Built from this vehicle&rsquo;s recall list. Tick them off as you go, or print this page.</p>
        <SellerChecklist recalls={data.recalls.items} />
      </section>
    </div>
  );
}
