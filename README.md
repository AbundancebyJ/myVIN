# VIN Safety Report

A free, mobile-first site for US used-car buyers. Enter a VIN and get one page with specs, recalls, top owner complaints, NHTSA crash-test ratings and a printable "questions to ask the seller" checklist. It's a Next.js static export with two Cloudflare Pages Functions, and every piece of data comes from NHTSA's free public APIs.

## How it fits together

| Piece | Where | Notes |
|---|---|---|
| VIN validation | `lib/vin.ts` | Length, no I/O/Q, check digit. Runs in the browser before any request. |
| NHTSA client + normalization | `lib/nhtsa.ts` | Shared by the Pages Functions and the build script. Handles DD/MM vs MM/DD dates, 400 means "no data", model-name fallbacks. |
| Report text, checklist, FAQ, noindex rule | `lib/report.ts` | |
| `POST /api/decode` | `functions/api/decode.ts` | Takes the VIN in the request body, so it never appears in a URL or access log. Edge cache is keyed by SHA-256 of the VIN, 24h. |
| `GET /api/vehicle?make&model&year[&series]` | `functions/api/vehicle.ts` | Recalls + aggregated complaints + ratings, edge-cached 24h. |
| Static model pages | `app/recalls/[make]/[model]/[year]` | Built from `data/generated/*.json`. |
| Build-time fetch | `scripts/fetch-data.ts` | Reads `data/vehicles.json` and verifies names with vPIC `GetModelsForMakeYear`. |

### NHTSA quirks handled

- vPIC returns HTTP 200 for bad VINs. `ErrorCode` and missing Make/Model/Year are turned into a friendly error.
- A recall API `400` means "not in NHTSA's tables". It is shown as "no data available", never "no recalls". An empty `200` for a vehicle with no complaints or ratings is treated the same way.
- Recall dates are `DD/MM/YYYY` and complaint dates are `MM/DD/YYYY`. Both are normalized to ISO.
- Complaint `components` joins entries with a bare comma, but a single name can contain ", " (e.g. "FUEL SYSTEM, GASOLINE").
- vPIC and the recall tables disagree on some names. vPIC says `Silverado` + Series `1500`, while recalls want `Silverado 1500`. The proxy tries `Model`, then `Model + Series`.
- Ratings for some trucks live under body-style names (`F-150 SUPER CREW`, …). If the exact model has no ratings, every model name starting with it is used.

## Commands

```bash
npm install
npm run data        # fetch NHTSA data for data/vehicles.json -> data/generated/
npm run build       # static export -> out/
npm run preview     # wrangler pages dev out (serves pages + /api functions)
npm test            # unit tests
npm run typecheck
```

`npm run dev` serves the pages, but the `/api/*` functions only run under `npm run preview` or on Cloudflare.

## Deploy to Cloudflare Pages

1. Create a Pages project connected to this repo.
2. Build command: `npm run build:full` (refreshes NHTSA data, then builds). If NHTSA is down, the previously committed JSON is kept, so the deploy still succeeds.
3. Build output directory: `out`. The `functions/` directory is picked up automatically.
4. Environment variables:
   - `NEXT_PUBLIC_SITE_URL`: your domain, e.g. `https://example.com`. It drives canonical URLs, the sitemap and robots.txt. **Set it before submitting to Search Console.**
   - `NEXT_PUBLIC_CONTACT_EMAIL`: the address shown on Contact, Privacy and Terms (default: `hello@<domain>`).
5. To keep the static pages fresh, add a Cloudflare deploy hook and call it weekly (cron, GitHub Action, etc.).

## Adding vehicles

Add entries to `data/vehicles.json`:

```json
{ "year": 2020, "make": "Honda", "model": "CR-V" }
```

Use NHTSA's recall name in `model`. If vPIC spells it differently, add `"vpicModel"`, as the Silverado entry does. Then run `npm run data` and commit `data/generated/`. Adjacent-year links and hub pages appear automatically.

### SEO rules

- A vehicle page is `noindex` when it has 0 recalls and fewer than 10 complaints, and it is left out of `sitemap.xml`.
- Make and model hub pages are `noindex` until they link to at least 2 children. With the seed list, each model has only one year, so model hubs are noindex for now.
- Each vehicle page carries a unique title, description and canonical URL, plus `BreadcrumbList` and `FAQPage` JSON-LD. The FAQ is also visible on the page.

## Design

- **Themes:** all colors are tokens at the top of `app/globals.css`. Light lives on `:root` and dark on `:root[data-theme="dark"]`; a copy under `prefers-color-scheme` covers visitors without JS. When you add a color, define it in both blocks.
- **Theme toggle:** `components/ThemeToggle.tsx`. An inline script in `<head>` sets `data-theme` before first paint, so the page never flashes the wrong theme. The site follows the OS until the visitor picks a theme; picking the one that matches the OS clears the saved choice.
- **Fonts:** IBM Plex Sans for all UI text and Plex Mono for data only (VINs, campaign numbers). Both are self-hosted from npm packages via `app/fonts.ts`, so there are no third-party font requests.
- **Breakpoints:** mobile-first at 640 / 768 / 1024px. At 1024px and up, report pages switch to a sticky sidebar beside the main column.
- **VIN readout:** `components/VinReadout.tsx` shows the VIN as 17 cells grouped into maker / vehicle / check digit / year-plant-serial, and flags bad characters and a failed check digit while the visitor types.
- **Print:** `@media print` in `globals.css` hides navigation and ads, expands every "Risk & fix" section, and switches to black and white.

## Ads

`components/AdSlot.tsx` renders empty, zero-height slots. When AdSense is approved, give `.ad-slot` a fixed `min-height` per unit so layout doesn't shift, add the AdSense script, and update the Advertising section of the privacy policy (a consent banner is needed for EEA/UK visitors).
