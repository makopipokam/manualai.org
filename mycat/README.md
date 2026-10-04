# MyCat

Standalone cat-profile discovery app in the manualAI.org family. The interface and test flow intentionally follow the separate MyDog app; MyCat itself is **not a dating app**.

## Product behaviour

- German 30-question, five-point Big Five questionnaire, with the same questions and answer scale as MyDog.
- Browser-local ranking of 18 cat profiles. The score is a playful heuristic, not a validated psychological, veterinary, or animal-behaviour assessment.
- Profile photos, galleries, favorites, profile links (`?cat=<id>`), forward browsing through the catalogue from shared profiles, and locally generated/shareable PNGs.
- Breed-level source links and welfare/health caveats. Breed tendencies never predict the personality or health of an individual cat; medical concerns belong with a veterinary practice.
- No MyCat account or external scoring/AI request. Answers and favorites are kept in browser `localStorage`; consult the [privacy notice](legal/privacy.html) for hosting, storage, and sharing details.
- After all ranked profiles, the completion screen links to MyDog and the separate private profile app at `/mycat/cats&dogs/`.

## MyCat × MyDog dating-profile MVP

The separate route [`cats&dogs/`](cats&dogs/) provides passwordless email sign-in and private profile onboarding. The genotype (`XX`, `XY`, `X0`, `XXY`, `XYY`, or `XXX`) is stored server-side in Supabase only after explicit consent. It is not used to infer gender, assign a matching role, rank people, or select matches. The six genotype options are profile data only until matching rules are specified separately.

Users can separately consent to transferring a minimal MyCat result summary (recommended profile IDs, scores, and Big Five summary). Raw questionnaire answers, favorites, and other arbitrary browser-storage values are not uploaded. The app has no active search, ranking, or matching feature yet. Users can delete their dating profile independently of the email account.

- Schema migration: [`../supabase/migrations/20261004165352_create_mycat_dating_profiles.sql`](../supabase/migrations/20261004165352_create_mycat_dating_profiles.sql)
- Route-specific [privacy notice](cats&dogs/privacy.html)
- Regression command: `npm run test:mycat:dating` (uses a local mock; does not access live user data)

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
npm run test:mycat:dating  # mocked auth, genotype consent, MyCat import and mobile width
```

The browser suites use Python Playwright and Chromium. They start and stop their own local HTTP server. `npm test` runs the repository's existing lightweight app-engine and deployment smoke tests.
