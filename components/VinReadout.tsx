import { normalizeVin, vinIssues } from "@/lib/vin";

const GROUPS = [
  { from: 0, to: 3, label: "Maker", key: "wmi" },
  { from: 3, to: 8, label: "Vehicle", key: "vds" },
  { from: 8, to: 9, label: "Check", key: "chk" },
  { from: 9, to: 17, label: "Year · plant · serial", key: "vis" },
] as const;

/**
 * The VIN as a 17-cell readout, split into its ISO 3779 sections. Mirrors the input
 * (so it's hidden from assistive tech) and marks invalid characters and the check digit.
 */
export function VinReadout({ value, compact = false }: { value: string; compact?: boolean }) {
  const vin = normalizeVin(value).slice(0, 17);
  const { bad, check } = vinIssues(vin);
  return (
    <div className={compact ? "vin-readout compact" : "vin-readout"} aria-hidden="true">
      {GROUPS.map((g) => (
        <div className={`vr-group vr-${g.key}`} key={g.key}>
          <div className="vr-cells">
            {Array.from({ length: g.to - g.from }, (_, j) => {
              const i = g.from + j;
              const ch = vin[i] ?? "";
              const state = bad.includes(i)
                ? "bad"
                : i === 8 && check === "fail"
                  ? "bad"
                  : i === 8 && check === "ok"
                    ? "ok"
                    : ch
                      ? "filled"
                      : "empty";
              return (
                <span className={`vr-cell is-${state}`} key={i}>
                  {ch}
                </span>
              );
            })}
          </div>
          <span className="vr-label">{g.label}</span>
        </div>
      ))}
    </div>
  );
}
