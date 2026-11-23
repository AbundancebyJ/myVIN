import type { DecodedVehicle } from "@/lib/nhtsa";

export function SpecsCard({ v }: { v: DecodedVehicle }) {
  const rows: [string, string][] = (
    [
      ["Year", String(v.year)],
      ["Make", v.make],
      ["Model", v.model],
      ["Series", v.series],
      ["Trim", v.trim],
      ["Body", v.bodyClass],
      ["Drive", v.driveType],
      ["Engine", v.engine],
      ["Fuel", v.fuel],
      ["Electrification", v.electrification],
      ["Transmission", v.transmission],
      ["Doors", v.doors],
      ["Built in", v.plantCountry],
      ["Manufacturer", v.manufacturer],
    ] as [string, string][]
  ).filter(([, val]) => val);
  return (
    <dl className="specs">
      {rows.map(([k, val]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{val}</dd>
        </div>
      ))}
    </dl>
  );
}
