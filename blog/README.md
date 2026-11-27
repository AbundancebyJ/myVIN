# tipmonk blog

Strategic-investment study notes by 인옥킴 (Inog Kim): concepts, DART/SEC filing walk-throughs, deal analysis and
event studies. Korean at the site root, English under `/en/`. Next.js static export, deployed as its own Cloudflare
Pages project from this folder.

## Writing a post

Create `content/posts/<slug>/ko.mdx` and, when translated, `content/posts/<slug>/en.mdx` (same slug, so the two are
linked with hreflang and a "Read in English / 한국어로 읽기" link).

```mdx
---
title: "제목"
description: 검색 결과와 목록에 보일 한두 문장 요약
date: 2026-12-01
updated: 2026-12-05        # optional
category: deals            # concepts | filings | deals | event-studies
tags: [M&A, 공시]
draft: true                # optional: hidden from production builds until removed
---

본문 (Markdown + the components below)
```

Components you can use inside a post:

| Component | Use |
|---|---|
| `<DealBox title="딜 요약" items={[["인수자", "NAVER"], ["대상", "Poshmark"]]} filings={[{ dart: "20221004000000", label: "타법인주식및출자증권취득결정" }, { sec: ["0001825480", "0001193125-22-000000"], label: "8-K" }]} />` | Key deal terms with links to the filings |
| `<Dart rcp="20221004000000">공시 원문</Dart>` / `<Sec cik="..." acc="...">8-K</Sec>` | Inline links to a DART or SEC filing |
| `<EventStudy id="naver-poshmark-2022" />` | Cumulative abnormal return chart + table from `content/data/<id>.json` |
| `<Callout>...</Callout>` | A highlighted note |

Event-study data files (`content/data/<id>.json`) are committed, never fetched at build time:

```json
{
  "eventDate": "2022-10-04",
  "window": [-5, 20],
  "stock": { "name": "NAVER", "ticker": "035420", "prices": [{ "date": "2022-09-26", "close": 190000 }] },
  "index": { "name": "KOSPI", "prices": [{ "date": "2022-09-26", "close": 2220.94 }] },
  "source": "Data source name and terms"
}
```

The model is market-adjusted (stock return − index return); day 0 is the first trading day on or after `eventDate`.

## Commands

```bash
npm install
npm run dev        # local preview
npm run build      # static export -> out/
npm test           # unit tests (event-study math, links, locale paths)
```

## Deploy (Cloudflare Pages)

Separate Pages project from the VIN tool, same repository:

- Root directory: `blog`
- Build command: `npm run build`, output directory: `out`
- Environment variables: `NODE_VERSION=22`, `NEXT_PUBLIC_SITE_URL=https://tipmonk.net`
- Custom domains: `tipmonk.net` and `www.tipmonk.net`

`public/_redirects` sends the old `tipmonk.net/recalls/...` URLs to `https://vin.tipmonk.net/recalls/...`.

## Content rules

Public information only, no buy/sell recommendations or price targets, and no deals or companies the author has
worked on. Every post ends with the disclaimer automatically.
