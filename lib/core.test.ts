import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCheckDigit, validateVin } from "./vin";
import {
  fetchVehicleData,
  modelCandidates,
  normalizeDecode,
  normalizeRecalls,
  parseComplaintDate,
  parseRecallDate,
  splitComponents,
  summarizeComplaints,
} from "./nhtsa";
import { isIndexable, plainSummary, sellerQuestions } from "./report";

test("VIN validation", () => {
  assert.equal(validateVin("1HGCM82633A004352").ok, true); // classic valid sample
  assert.equal(computeCheckDigit("1M8GDM9AXKP042788"), "X");
  assert.equal(validateVin("1m8gdm9a xkp-042788").ok, true); // normalizes case/space/dash
  assert.match((validateVin("1HGCM82633A00435") as any).error, /17 characters/);
  assert.match((validateVin("1HGCM82633AO04352") as any).error, /I, O, or Q/);
  assert.match((validateVin("1HGCM82634A004352") as any).error, /check-digit/);
});

test("date formats differ between recalls and complaints", () => {
  assert.equal(parseRecallDate("05/12/2019"), "2019-12-05"); // DD/MM/YYYY
  assert.equal(parseComplaintDate("05/12/2019"), "2019-05-12"); // MM/DD/YYYY
  assert.equal(parseRecallDate("25/03/2021"), "2021-03-25");
  assert.equal(parseComplaintDate("25/03/2021"), null);
  assert.equal(parseRecallDate("31/02/2021"), null);
  assert.equal(parseRecallDate(undefined), null);
});

test("complaint components split on bare commas only", () => {
  assert.deepEqual(splitComponents("FUEL SYSTEM, GASOLINE,ENGINE"), ["FUEL SYSTEM, GASOLINE", "ENGINE"]);
  const s = summarizeComplaints([
    { components: "STEERING,ENGINE", crash: true, fire: false, numberOfInjuries: 2, numberOfDeaths: 0, dateComplaintFiled: "01/02/2020" },
    { components: "STEERING", crash: false, fire: true, numberOfInjuries: 0, numberOfDeaths: 0, dateComplaintFiled: "12/31/2021" },
  ]);
  assert.equal(s.total, 2);
  assert.equal(s.crashes, 1);
  assert.equal(s.latestFiled, "2021-12-31");
  assert.deepEqual(s.top[0], { component: "STEERING", count: 2, crashes: 1, fires: 1, injuries: 2, deaths: 0 });
});

test("recalls are deduped and sorted newest first", () => {
  const r = normalizeRecalls([
    { NHTSACampaignNumber: "A", ReportReceivedDate: "01/01/2019", Component: "X" },
    { NHTSACampaignNumber: "B", ReportReceivedDate: "01/06/2020", Component: "Y", parkIt: true },
    { NHTSACampaignNumber: "A", ReportReceivedDate: "01/01/2019", Component: "X" },
  ]);
  assert.deepEqual(r.map((x) => x.campaign), ["B", "A"]);
  assert.match(sellerQuestions(r)[0].text, /do not drive/);
});

test("decode surfaces ErrorCode failures as friendly errors", () => {
  const bad = normalizeDecode({ Results: [{ Make: "", Model: "", ModelYear: "", ErrorCode: "7,11", ErrorText: "..." }] });
  assert.equal(bad.ok, false);
  const ok = normalizeDecode({ Results: [{ Make: "CHEVROLET", Model: "Silverado", ModelYear: "2019", Series: "1500", ErrorCode: "0" }] });
  assert.ok(ok.ok && ok.vehicle.make === "Chevrolet" && ok.vehicle.warning === null);
  assert.deepEqual(modelCandidates("Silverado", "1500"), ["Silverado", "Silverado 1500"]);
  assert.deepEqual(modelCandidates("CR-V", ""), ["CR-V"]);
});

function fakeFetcher(routes: Record<string, [number, unknown]>) {
  return async (url: string) => {
    for (const [frag, [status, body]] of Object.entries(routes)) {
      if (url.includes(frag)) return new Response(JSON.stringify(body), { status });
    }
    return new Response(JSON.stringify({ Results: [], results: [] }), { status: 200 });
  };
}

test("a 400 from recalls means no data, never 'no recalls'", async () => {
  const d = await fetchVehicleData(
    fakeFetcher({ "recalls/": [400, { results: [] }], "complaints/": [400, { results: [] }] }),
    { make: "FOO", model: "BAR", year: 2019 },
  );
  assert.equal(d.recalls.status, "nodata");
  assert.match(plainSummary(d), /not the same as having no recalls/);
  assert.equal(isIndexable(d), false);
});

test("falls back to Model + Series when the plain model has no data", async () => {
  const d = await fetchVehicleData(
    fakeFetcher({
      "model=Silverado%201500&modelYear": [200, { results: [{ NHTSACampaignNumber: "19V1", Component: "X" }] }],
      "complaints/complaintsByVehicle?make=CHEVROLET&model=Silverado%201500": [200, { results: [{ components: "ENGINE" }] }],
    }),
    { make: "CHEVROLET", model: "Silverado", year: 2019, series: "1500" },
  );
  assert.equal(d.nhtsaModel, "Silverado 1500");
  assert.equal(d.recalls.items.length, 1);
  assert.equal(d.recalls.status, "ok");
});

import { compareYears, yearRankSentence } from "./compare";

function entry(year: number, recalls: number, complaints: number): any {
  return {
    year, make: "Ford", model: "F-150", file: "", recalls, urgentRecalls: 0, latestRecall: null,
    complaints, crashes: 0, fires: 0, injuries: 0, deaths: 0, topComponent: null, overall: null,
    recallStatus: "ok", indexable: true, fetchedAt: "",
  };
}

test("year comparison flags extremes and ignores missing complaint data", () => {
  const c = compareYears([entry(2019, 9, 78), entry(2020, 11, 63), entry(2021, 29, 0)])!;
  const flags = Object.fromEntries(c.rows.map((r) => [r.year, r.flags]));
  assert.deepEqual(flags[2021], ["mostRecalls"]); // 0 complaints with recalls = missing, not "fewest"
  assert.ok(flags[2020].includes("fewestComplaints"));
  assert.ok(flags[2019].includes("mostComplaints") && flags[2019].includes("fewestRecalls"));
  assert.equal(c.rows.find((r) => r.year === 2021)!.complaintsMissing, true);
  assert.match(yearRankSentence(c, 2020)!, /2nd-most recalls \(11\) and the 2nd-most owner complaints \(63\)/);
  assert.equal(compareYears([entry(2019, 1, 1)]), null);
});
