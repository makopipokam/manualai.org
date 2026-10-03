# MyCat

Standalone cat-profile discovery app in the manualAI.org family. The interface and test flow intentionally follow the separate MyDog app; MyCat itself is **not a dating app**.

## Product behaviour

- German 30-question, five-point Big Five questionnaire, with the same questions and answer scale as MyDog.
- Browser-local ranking of 18 cat profiles. The score is a playful heuristic, not a validated psychological, veterinary, or animal-behaviour assessment.
- Profile photos, galleries, favorites, profile links (`?cat=<id>`), and locally generated/shareable PNGs.
- Breed-level source links and welfare/health caveats. Breed tendencies never predict the personality or health of an individual cat; medical concerns belong with a veterinary practice.
- No MyCat account or external scoring/AI request. Answers and favorites are kept in browser `localStorage`; consult the [privacy notice](legal/privacy.html) for hosting, storage, and sharing details.

## Catalogue and image sources

`breed-research.json` is the readable profile-source catalogue. `data.js` is the browser catalogue and is generated from that file plus MyDog's shared questionnaire definitions:

```bash
python3 mycat/tools/build-data.py
```

Each of the 18 profiles has six locally served WebP photos under `images/v1/` (108 files, about 8.06 MiB in total). The photos are resized to a maximum 960-pixel long edge without cropping. `photo-sources.json` records the original Commons URLs, authors and licenses; rebuild the corresponding legal credit page with:

```bash
python3 mycat/tools/build-attribution.py
```

If changing the images in the future, use a new versioned directory (such as `images/v2/`) and update the browser data, service-worker strategy and immutable Vercel cache rule together.

## Local preview

From the repository root:

```bash
python3 -m http.server 3000
```

Then open <http://localhost:3000/mycat/>. `index.html` loads the MyCat CSS, data and script with one shared release token; `sw.js` uses a separately versioned offline shell. Keep these versions coordinated when shipping app changes.

## Regression tests

```bash
npm run test:mycat:beta    # questionnaire, persistence, results, share/favorites, desktop + mobile
npm run test:mycat:images  # all 18 profiles, all 108 local photos, chat, switching, fallback, PNG export
npm run test:mycat:legal   # legal links, narrow layouts, service-worker/offline pages
```

The browser suites use Python Playwright and Chromium. They start and stop their own local HTTP server. `npm test` runs the repository's existing lightweight app-engine and deployment smoke tests.
