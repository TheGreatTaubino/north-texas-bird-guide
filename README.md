# North Texas Bird Field Guide

A mobile-friendly React field guide for birds commonly seen around Plano, DFW, Collin County, and the broader North Texas region.

The app is designed for quick field identification and offline use. It includes species cards, photos, field marks, flight ID notes, North Texas context, seasonal presence, trivia, and recommended local birding spots.

## Features

- Search by common name, scientific name, or bird type
- Filter by group, season, waterfowl, gulls, raptors, and other categories
- Quick ID mode for condensed field-mark cards
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

## Project Structure

```text
src/
  App.jsx                    Main application shell, filters, grouping, layout
  main.jsx                   React entry point
  index.css                  Tailwind/global styles
  data/birds.js              Species and trivia data
  imageData.js               Generated embedded image data
  components/
    BirdCard.jsx             Species card UI
    FilterBar.jsx            Search, filters, quick ID toggle
    SpotsSection.jsx         Local birding spots
    TriviaSection.jsx        Trivia cards
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

