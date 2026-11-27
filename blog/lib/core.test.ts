import { test } from "node:test";
import assert from "node:assert/strict";
import { eventStudy, pct } from "./eventstudy";
import { dartUrl, secUrl } from "./filings";
import { alternates, href } from "./site";

// Synthetic prices: index flat at +0%, stock +10% on the event day, otherwise flat.
const dates = Array.from({ length: 40 }, (_, i) => {
  const d = new Date(Date.UTC(2024, 0, 2 + i));
  return d.toISOString().slice(0, 10);
});
const index = dates.map((date) => ({ date, close: 100 }));
const stock = dates.map((date, i) => ({ date, close: i < 15 ? 50 : 55 }));

test("event study: market-adjusted CAR", () => {
  const r = eventStudy(stock, index, dates[15], [-5, 10]);
  assert.equal(r.eventDate, dates[15]);
  assert.equal(r.rows.length, 16);
  assert.ok(Math.abs(r.dayZeroAbnormal - 0.1) < 1e-12);
  assert.ok(Math.abs(r.car - 0.1) < 1e-12);
  assert.equal(pct(r.car), "+10.0%");
});

test("event study: snaps to the next trading day and checks the window", () => {
  const gappy = stock.filter((p) => p.date !== dates[15]);
  const r = eventStudy(gappy, index, dates[15], [-2, 2]);
  assert.equal(r.eventDate, dates[16]);
  assert.throws(() => eventStudy(stock, index, dates[1], [-5, 5]), /Not enough price history/);
});

test("filing links", () => {
  assert.equal(dartUrl("20221004800123"), "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20221004800123");
  assert.equal(
    secUrl("0001825480", "0001193125-22-256754"),
    "https://www.sec.gov/Archives/edgar/data/1825480/000119312522256754/0001193125-22-256754-index.htm",
  );
  assert.throws(() => dartUrl("123"));
});

test("locale paths and hreflang alternates", () => {
  assert.equal(href("ko", "/posts/a/"), "/posts/a/");
  assert.equal(href("en", "/posts/a/"), "/en/posts/a/");
  assert.equal(href("en", "/"), "/en/");
  const a = alternates("/posts/a/", "en");
  assert.equal(a.canonical, "/en/posts/a/");
  assert.deepEqual(a.languages, { ko: "/posts/a/", en: "/en/posts/a/", "x-default": "/posts/a/" });
});
