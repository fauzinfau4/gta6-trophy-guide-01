# Leonida Ledger

[![make.fun competition](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Leonida Ledger rank](https://make.fun/badge/gta6-trophy-guide-01/fauzinfau4/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Leonida Ledger reward](https://make.fun/badge/gta6-trophy-guide-01/fauzinfau4/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline, fan-made GTA VI trophy guide and progress tracker built around the 55-entry list supplied with the make.fun competition. It is not affiliated with or verified by Rockstar Games or PlayStation.

The guide keeps your checklist in local storage, supports JSON export and import, and organizes the route into story, side activities, collectibles, and cleanup. Trophy records preserve the list's names, descriptions, and grades. Specific guide claims link to the source consulted; where a route could not be verified, the app says so.

## Run locally

Use Node.js 22.18 or later:

```sh
node serve.ts
```

Then open <http://localhost:8080>. The app loads only files in `app/` and works offline after those files are available locally.

## Sources

The in-app source notes identify the consulted PowerPyx trophy roadmap, meditation locations, and challenge guide, plus GTABase trophy-list context. The competition starter list is the source for the displayed trophy fields. Retrieved November 19, 2026. The guide text is original and flags uncertain steps instead of presenting them as verified.

## License

MIT. See [LICENSE](LICENSE).
