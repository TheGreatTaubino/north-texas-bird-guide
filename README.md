# North Texas Bird Field Guide

A mobile-friendly React field guide for birds commonly seen around Plano, DFW, Collin County, and the broader North Texas region.

The app is designed for quick field identification and offline use. It includes species cards, photos, field marks, flight ID notes, North Texas context, seasonal presence, trivia, and recommended local birding spots.

## Features

- Search by common name, scientific name, or bird type
- Filter by group, season, waterfowl, gulls, raptors, and other categories
- Quick ID mode for condensed field-mark cards
- One-tap "seen today" sighting checkboxes on each species card
- Local calendar tracker with daily sighting counts and species history
- Export and restore sighting history as JSON (file download or clipboard)
- Optional GitHub Gist sync — automatically backs up and merges sightings across devices
- Collapsible bird-type sections with species counts
- Embedded bird photos for offline builds
- Seasonal "Here Now" badges based on each species' season field
- Local context for Plano, DFW, Collin County, and the Central Flyway
- Trivia and local birding spot sections

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- `vite-plugin-singlefile` for a portable offline HTML build

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Run unit tests:

```bash
npm test
```

Preview the production build:

```bash
npm run preview
```

## Offline Image Build

Bird photos live in `src/images/`. The app imports embedded image data from `src/imageData.js`.

After adding or replacing photos, regenerate embedded image data:

```bash
npm run embed-images
```

To regenerate images and build in one step:

```bash
npm run build:full
```

The production build writes a single-file app to `dist/index.html`.

## Sighting History

Sightings are stored locally in the browser with `localStorage` under the key `northTexasBirdGuide.sightings.v1`.

The tracker records one sighting per species per local calendar day. It does not require a login, backend, or network connection.

### Backup and Restore

The calendar section includes **Back Up** and **Restore** buttons to export and import sighting history as a JSON file. The app warns when a backup is more than 14 days old. Clipboard paste is supported as an alternative to file import on mobile.

### GitHub Gist Sync

The calendar section includes an optional **GitHub Sync** panel. When configured with a GitHub personal access token (requires `gist` scope only), the app automatically syncs sightings to a private GitHub Gist on a debounced push and pulls on startup. This allows sighting history to survive app updates and work across multiple devices.

- Leave the Gist ID blank on first connect to create a new private Gist automatically.
- The token and Gist ID are stored in `sessionStorage` — they are cleared when the tab or browser closes. You will need to re-enter your token each session.
- The token is never sent anywhere except the GitHub API.
- Sightings are merged on import — no data is overwritten.

Clearing browser site data will clear local sighting history. Closing the tab clears sync configuration (token and Gist ID).

## Project Structure

```text
src/
  App.jsx                    Main application shell, grouping, layout, sighting state
  main.jsx                   React entry point
  index.css                  Tailwind/global styles
  data/birds.js              Species and trivia data (109 species)
  imageData.js               Generated embedded image data
  components/
    BirdCard.jsx             Species card UI with seen-today toggle
    FilterBar.jsx            Search, filters, quick ID toggle
    SightingCalendar.jsx     Monthly calendar tracker, backup/restore, GitHub Gist sync UI
    SpotsSection.jsx         Local birding spots
    TriviaSection.jsx        Trivia cards
  hooks/
    useGitHubSync.js         GitHub Gist sync — push/pull sighting data via GitHub API
  utils/
    dates.js                 getLocalDateKey shared utility
    filter.js                matchesFilter logic and RAPTOR_TYPES
    sightings.js             mergeSightings — validates and merges imported sighting data
    __tests__/               Unit tests (vitest) for all utils
  images/                    Source bird photos
scripts/
  embed-images.js            Generates embedded image data
```

## Data Model

Each species record in `src/data/birds.js` generally includes:

- `id`
- `name`
- `latin`
- `type`
- `season`
- `color`
- `imageKey`
- optional `subtype`
- optional `size`, `weight`, and `wingspan`
- `id_marks`
- `flight_id`
- `northTexas`
- `funFact`
- `badges`

`imageKey` should match a photo filename in `src/images/` and an exported key in `src/imageData.js`.

## Notes

- `dist/` and `node_modules/` are intentionally ignored.
- Windows metadata sidecar files such as `*:Zone.Identifier` are ignored and should not be committed.
- Photo and species data attribution is shown in the app footer.
