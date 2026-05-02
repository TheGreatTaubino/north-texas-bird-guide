# North Texas Bird Guide — Claude Context

## Project Purpose
Mobile-friendly React field guide for birds in Plano / DFW / Collin County. Designed for offline use. Deployed as a single self-contained HTML file (~16MB with embedded images).

## Commands
```bash
npm run dev          # dev server at localhost:5173
npm run build        # production build → dist/index.html
npm run embed-images # regenerate src/imageData.js from src/images/
npm run build:full   # embed-images + build (use this when photos changed)
npm run preview      # preview production build locally
```

## Critical Build Constraints
- **Output is a single HTML file** via `vite-plugin-singlefile`. All assets must be inlineable.
- Do not introduce lazy imports (`React.lazy`, dynamic `import()`), async chunk splitting, or any pattern that produces multiple output chunks.
- Vite 8 / Rolldown: config uses `rolldownOptions` (not `rollupOptions`). `inlineDynamicImports: true` emits a deprecation warning — this is harmless; `vite-plugin-singlefile` controls code splitting via `codeSplitting: false` internally.
- `assetsInlineLimit` is set to 100MB so large images inline without being written to disk.

## Key Files
| File | Role |
|------|------|
| `src/data/birds.js` | Species data — 109 species, exported as `BIRDS` array |
| `src/imageData.js` | **Generated** — do not edit by hand; run `embed-images` |
| `src/images/` | Source bird photos; filename must match `imageKey` in species record |
| `src/App.jsx` | App shell — filters, grouping, layout, sighting state |
| `src/components/BirdCard.jsx` | Species card UI with seen-today toggle |
| `src/components/FilterBar.jsx` | Search input, filter chips, quick-ID toggle |
| `src/components/SightingCalendar.jsx` | Monthly tracker, backup/restore, GitHub Gist sync UI |
| `src/components/SpotsSection.jsx` | Local birding spots |
| `src/components/TriviaSection.jsx` | Trivia cards |
| `src/hooks/useGitHubSync.js` | GitHub Gist sync — push/pull via GitHub API |
| `vite.config.js` | Vite + singlefile plugin config |
| `scripts/embed-images.js` | Generates `src/imageData.js` from `src/images/` |

## Species Data Model (`src/data/birds.js`)
Each record in `BIRDS`:
```js
{
  id,          // unique string, no spaces (e.g. "americancrow")
  name,        // common name
  latin,       // scientific name
  type,        // group label (e.g. "Songbirds", "Raptors")
  subtype,     // optional finer grouping
  season,      // "year-round" | "summer" | "winter" | "migrant"
  color,       // Tailwind color class used for card accent
  imageKey,    // must match a key in src/imageData.js and filename in src/images/
  size,        // optional
  weight,      // optional
  wingspan,    // optional
  id_marks,    // field identification notes
  flight_id,   // in-flight ID notes
  northTexas,  // local DFW/Plano/Collin County context
  funFact,     // trivia blurb
  badges,      // array of badge strings shown on card
}
```
To add a species: add record to `BIRDS`, add photo to `src/images/`, then run `npm run embed-images`.

When adding new species, always provide a table of birds with missing images, the expected file name, and a link to the bird on https://merlin.allaboutbirds.org/

## Storage
| Key | Storage | Contents |
|-----|---------|----------|
| `northTexasBirdGuide.sightings.v1` | `localStorage` | Sighting history (date → species array) |
| `northTexasBirdGuide.lastExport.v1` | `localStorage` | Timestamp of last backup export |
| `northTexasBirdGuide.syncConfig.v1` | `sessionStorage` | GitHub token + Gist ID — **clears on tab close** |

The GitHub PAT lives in `sessionStorage` intentionally — it clears when the tab or browser closes to limit token exposure. Users re-enter their token each session. Do not move this to `localStorage`.

## GitHub Sync
`useGitHubSync.js` pushes/pulls sighting data to a private GitHub Gist. Token requires only `gist` scope. Sync config is stored in `sessionStorage` — not `localStorage` — by design.

## Ignored Files
- `dist/` — build output
- `node_modules/`
- `*:Zone.Identifier` — Windows metadata sidecars (WSL artifact)

## Remote
`https://github.com/TheGreatTaubino/north-texas-bird-guide.git` (master branch)
