"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { DecodeResult, DecodedVehicle, VehicleData } from "@/lib/nhtsa";
import { normalizeVin, validateVin } from "@/lib/vin";
import { slugify, vehiclePath } from "@/lib/slug";
import { plainSummary } from "@/lib/report";
import { SpecsCard } from "./report/SpecsCard";
import { VehicleReport } from "./report/VehicleReport";
import { PrintButton } from "./PrintButton";
import { VinReadout } from "./VinReadout";

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

function Skeleton() {
  return (
    <div className="skeleton" aria-hidden="true">
      <span className="sk sk-title" />
      <span className="sk sk-line" />
      <span className="sk sk-line short" />
      <div className="sk-grid">
        <span className="sk sk-block" />
        <span className="sk sk-block tall" />
      </div>
    </div>
  );
}

export function VinTool({
  catalog = [],
  compact = false,
  intro,
}: {
  catalog?: CatalogEntry[];
  compact?: boolean;
  /** Shown beside the form on wide screens (home page hero). */
  intro?: ReactNode;
}) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const resultRef = useRef<HTMLHeadingElement>(null);
  const len = normalizeVin(value).length;
  const inputId = compact ? "vin-compact" : "vin";

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
    setState({
      kind: "loading",
      step: `Fetching recalls, complaints and ratings for the ${vehicle.year} ${vehicle.make} ${vehicle.model}…`,
    });
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

  const loading = state.kind === "loading";
  const form = (
    <form className="vin-form no-print" onSubmit={onSubmit} noValidate aria-busy={loading}>
      <label htmlFor={inputId} className="vin-label">
        Vehicle Identification Number (VIN)
      </label>
      <div className="vin-row">
        <input
          id={inputId}
          name="vin"
          className="vin-input"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (state.kind === "error") setState({ kind: "idle" });
          }}
          placeholder="17 characters"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={24}
          aria-invalid={state.kind === "error"}
          aria-describedby={`${inputId}-hint${state.kind === "error" ? ` ${inputId}-error` : ""}`}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Checking
            </>
          ) : (
            "Get free report"
          )}
        </button>
      </div>
      <VinReadout value={value} />
      <p id={`${inputId}-hint`} className="vin-hint small muted">
        <span className={len === 17 ? "count-ok" : undefined}>{len}/17</span> · On the dashboard by the windshield, the
        driver&rsquo;s door jamb, or the title. We don&rsquo;t store VINs.
      </p>
      {state.kind === "error" && (
        <p id={`${inputId}-error`} className="notice notice-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );

  return (
    <div className={compact ? "vin-tool compact" : "vin-tool"}>
      {intro ? (
        <div className="tool-top">
          <div className="tool-intro">{intro}</div>
          {form}
        </div>
      ) : (
        form
      )}

      <div aria-live="polite" className="sr-only">
        {loading ? state.step : state.kind === "done" ? "Report ready." : ""}
      </div>

      {loading && (
        <div className="report">
          <p className="small muted loading-step">{state.step}</p>
          <Skeleton />
        </div>
      )}

      {state.kind === "done" && (
        <div className="report">
          <header className="report-head">
            <h2 ref={resultRef} tabIndex={-1}>
              {state.vehicle.year} {state.vehicle.make} {state.vehicle.model}
              {state.vehicle.trim ? ` ${state.vehicle.trim}` : ""}
            </h2>
            <p className="vin-line">
              <span className="muted small">VIN</span> <span className="mono">{state.vin}</span>
            </p>
            {state.data && <p className="lede">{plainSummary(state.data)}</p>}
            <div className="actions no-print">
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

          <div className="report-layout">
            <aside className="report-aside">
              <section className="aside-panel" aria-labelledby="specs-h">
                <h3 id="specs-h" className="panel-title">
                  Vehicle specs
                </h3>
                <SpecsCard v={state.vehicle} />
              </section>
            </aside>
            <div className="report-main">
              {state.data ? (
                <VehicleReport data={state.data} headingLevel={3} />
              ) : (
                <p className="notice notice-error" role="alert">
                  {state.dataError} The specs are still accurate. Try again shortly for recalls and ratings, or check{" "}
                  <a href="https://www.nhtsa.gov/recalls" rel="noopener" target="_blank">
                    nhtsa.gov/recalls
                  </a>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
