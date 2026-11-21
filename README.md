# Leonida Ledger

[![make.fun competition](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/competitions/gta6-trophy-guide-01)
[![Leonida Ledger rank](https://make.fun/badge/gta6-trophy-guide-01/fauzinfau4/gta6-trophy-guide-01/rank.svg)](https://make.fun/competitions/gta6-trophy-guide-01)
[![Leonida Ledger reward](https://make.fun/badge/gta6-trophy-guide-01/fauzinfau4/gta6-trophy-guide-01/reward.svg)](https://make.fun/competitions/gta6-trophy-guide-01)

An offline, fan-made GTA VI trophy tracker and field guide. All 55 trophy records are organized into a checklist, a four-phase platinum roadmap, and individual notes with cited steps and uncertainty called out plainly.

The trophy names, descriptions, and grades come from the data supplied with this competition. This project is independent and is not endorsed or verified by Rockstar Games or PlayStation.

## Use it

Open `app/index.html` in a browser, or run `node serve.ts` and visit `http://localhost:8080`. The app has no runtime dependency on a network connection. Checkmarks stay in local storage; use **Export save** to back them up or import a previous JSON save.

## What’s inside

- Searchable trophy checklist with grade badges, activity filters, and spoiler control.
- Individual trophy notes with source references, missable status, and roadmap phase.
- Earned progress toward platinum, per-phase counters, and a four-step cleanup plan.
- Local progress export and import.

The research notes cite PowerPyx, Push Square, and GTA.guide where their walkthroughs provide a concrete step. Description-only hints are labeled when a source does not establish the exact trigger. Source retrieval dates are recorded in `app/data/trophies.json`.

## Build dossier

`node main.ts` copies the static app and screenshots to `MAKEFUN_OUTPUT_DIR` (default `/output`) and writes a deterministic `dossier.json` using the vendored make.fun frontend library. Node 22 or newer is required.

MIT licensed.
