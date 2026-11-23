import type { Recall } from "@/lib/nhtsa";
import { sellerQuestions } from "@/lib/report";

export function SellerChecklist({ recalls }: { recalls: Recall[] }) {
  const items = sellerQuestions(recalls);
  return (
    <ul className="checklist">
      {items.map((it, i) => (
        <li key={i}>
          <label>
            <input type="checkbox" />
            <span>
              {it.text}
              {it.detail && <span className="check-detail">{it.detail}</span>}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
