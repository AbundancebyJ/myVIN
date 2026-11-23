"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { DecodeResult, DecodedVehicle, VehicleData } from "@/lib/nhtsa";
import { normalizeVin, validateVin } from "@/lib/vin";
import { slugify, vehiclePath } from "@/lib/slug";
import { plainSummary } from "@/lib/report";
import { SpecsCard } from "./report/SpecsCard";
import { VehicleReport } from "./report/VehicleReport";
import { PrintButton } from "./PrintButton";

type CatalogEntry = { year: number; make: string; model: string };

type State =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "loading"; step: string }
  | { kind: "done"; vin: string; vehicle: DecodedVehicle; data: VehicleData | null; dataError: string | null };

async function postDecode(vin: string): Promise<DecodeResult> {
  const res = await fetch("/api/decode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vin }),
  });
  try {
    return (await res.json()) as DecodeResult;
  } catch {
    return { ok: false, error: "We couldn't reach NHTSA's VIN decoder. Please try again in a minute." };
  }
}

async function getVehicle(v: DecodedVehicle): Promise<VehicleData> {
  const q = new URLSearchParams({ make: v.make, model: v.model, year: String(v.year) });
  if (v.series) q.set("series", v.series);
  const res = await fetch(`/api/vehicle?${q}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "NHTSA's data service is unavailable right now.");
  return body as VehicleData;
}

export function VinTool({ catalog = [], compact = false }: { catalog?: CatalogEntry[]; compact?: boolean }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const resultRef = useRef<HTMLHeadingElement>(null);
  const len = normalizeVin(value).length;

  useEffect(() => {
    if (state.kind === "done") resultRef.current?.focus();
  }, [state.kind]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const check = validateVin(value);
    if (!check.ok) {
      setState({ kind: "error", message: check.error });
      return;
    }
    setState({ kind: "loading", step: "Decoding VIN…" });
    let decoded: DecodeResult;
    try {
      decoded = await postDecode(check.vin);
    } catch {
      decoded = { ok: false, error: "Network error. Check your connection and try again." };
    }
    if (!decoded.ok) {
      setState({ kind: "error", message: decoded.error });
      return;
    }
    const vehicle = decoded.vehicle;
    setState({ kind: "loading", step: `Fetching recalls, complaints and ratings for the ${vehicle.year} ${vehicle.make} ${vehicle.model}…` });
    try {
      const data = await getVehicle(vehicle);
      setState({ kind: "done", vin: check.vin, vehicle, data, dataError: null });
    } catch (err) {
      setState({ kind: "done", vin: check.vin, vehicle, data: null, dataError: (err as Error).message });
    }
  }

  const staticLink =
    state.kind === "done" && state.data
      ? catalog.find(
          (c) =>
            c.year === state.vehicle.year &&
            slugify(c.make) === slugify(state.vehicle.make) &&
            [slugify(state.data!.nhtsaModel), slugify(state.vehicle.model)].includes(slugify(c.model)),
        )
      : undefined;

  const errorId = "vin-error";
  return (
    <div className={compact ? "vin-tool compact" : "vin-tool"}>
      <form className="vin-form no-print" onSubmit={onSubmit} noValidate>
        <label htmlFor={compact ? "vin-compact" : "vin"} className="vin-label">
          Vehicle Identification Number (VIN)
        </label>
        <div className="vin-row">
          <input
            id={compact ? "vin-compact" : "vin"}
            name="vin"
            className="vin-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 1HGCM82633A004352"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={24}
            aria-invalid={state.kind === "error"}
            aria-describedby={`vin-hint ${state.kind === "error" ? errorId : ""}`}
          />
          <button type="submit" className="btn btn-primary" disabled={state.kind === "loading"}>
            {state.kind === "loading" ? "Checking…" : "Get free report"}
          </button>
        </div>
        <p id="vin-hint" className="vin-hint small muted">
          <span className={len === 17 ? "ok" : undefined}>{len}/17 characters</span> · Find it at the base of the
          windshield, on the driver&rsquo;s door jamb, or on the title. We don&rsquo;t store VINs.
        </p>
      </form>

      <div aria-live="polite" className="vin-status">
        {state.kind === "error" && (
          <p id={errorId} className="notice notice-error" role="alert">
            {state.message}
          </p>
        )}
        {state.kind === "loading" && (
          <p className="notice loading">
            <span className="spinner" aria-hidden="true" />
            {state.step}
          </p>
        )}
      </div>

      {state.kind === "done" && (
        <div className="report">
          <header className="report-head">
            <p className="eyebrow">Safety report</p>
            <h2 ref={resultRef} tabIndex={-1}>
              {state.vehicle.year} {state.vehicle.make} {state.vehicle.model}
              {state.vehicle.trim ? ` ${state.vehicle.trim}` : ""}
            </h2>
            <p className="mono small muted">VIN {state.vin}</p>
            {state.data && <p className="lede">{plainSummary(state.data)}</p>}
            <div className="report-actions no-print">
              <PrintButton />
              {staticLink && (
                <a className="btn btn-secondary" href={vehiclePath(staticLink.make, staticLink.model, staticLink.year)}>
                  Full {staticLink.year} {staticLink.model} page
                </a>
              )}
            </div>
          </header>

          {state.vehicle.warning && (
            <p className="notice notice-warn">NHTSA decoder note: {state.vehicle.warning}</p>
          )}

          <section className="card" aria-labelledby="specs-h">
            <h3 id="specs-h">Vehicle specs</h3>
            <SpecsCard v={state.vehicle} />
          </section>

          {state.data ? (
            <VehicleReport data={state.data} headingLevel={3} />
          ) : (
            <p className="notice notice-error" role="alert">
              {state.dataError} The specs above are still accurate. Try again shortly for recalls and ratings, or check{" "}
              <a href="https://www.nhtsa.gov/recalls" rel="noopener" target="_blank">
                nhtsa.gov/recalls
              </a>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
