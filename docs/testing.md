# Testing and checks

**There are no automated tests.** Neither `package.json` has a test runner (the API's `npm test` only prints "Error: no test specified"), and there's no CI. Until there are tests, a change is checked by the build, the lint, and the manual checks below.

## The build

```bash
npm run build        # repo root: vite build → dist/
```

It must pass: it's what Vercel runs. It only compiles files reachable from `src/main.jsx`, so a broken file nothing imports (such as `src/HamburgerMenu.jsx`, [architecture.md](architecture.md#dead-code)) doesn't fail it. On 2026-11-23 it passed: 49 modules, about 192 kB of JavaScript (61 kB gzipped) and 32 kB of CSS.

There's no build for the API; `node server.js` starting and `GET /api/test` answering is its check.

## The lint

```bash
npx eslint src       # the site only: 1 error today
npm run lint         # eslint . : 86 errors today
```

- `eslint.config.js` applies React's and the browser's rules to every `.js` / `.jsx` file, `backend/` included. The API is CommonJS for Node, so 85 of `npm run lint`'s errors are `'require' is not defined`, `'process' is not defined` and the like: a config problem, not code problems ([known-issues.md](known-issues.md#tooling)).
- The one real error: `src/components/AdminLogin.jsx`, `'err' is defined but never used`.
- Don't add new lint errors in `src/`. When the backend gets its own lint config, `npm run lint` becomes the check.
- There's no formatter config (no Prettier file); the code is formatted like Prettier's defaults (double quotes, semicolons, trailing commas). Match it.

## Manual checks

Against a local API and database with the seed loaded ([onboarding.md](onboarding.md)), and maintenance mode off **locally only**. Run the ones for what you touched.

**Public site**

- [ ] `/`: the hero, the address link, the scrolling "Unsere Favoriten" carousel, the wall image; HOME / MENU / KONTAKT | RESERVIEREN in the top bar, the active one underlined.
- [ ] `/` on short screens (320×568, 375×667, a phone turned sideways 667×375, a window of 800×600 and 1440×500): the yellow swoosh under "Mitten in Milbertshofen." stays above the address, and "DEIN BURGER." stays below the logo.
- [ ] `/menu`: "MENÜ WIRD GELADEN..." briefly, then 7 sections in order (BEEF BURGER first, DIPS last), prices as `14,50 €`, the five beef burgers with photos, the others with the placeholder. On a wide screen (1440 px and up) the column is centered with equal space left and right; on a phone the cards keep a margin from the screen edges.
- [ ] `/menu` with the API stopped: the page stays empty below the title (today's behaviour: [known-issues.md](known-issues.md#site)).
- [ ] `/contact`: the details, the map, "In Google Maps öffnen →"; the form shows "Nachricht erfolgreich gesendet!" (with a local mail catcher) or "Nachricht konnte nicht gesendet werden." (without credentials), and the API logs accordingly. Never with production's Gmail credentials.
- [ ] The top bar's "KONTAKT | RESERVIEREN" button fits next to HOME and MENU at 360 px and 375 px, and leads to `/contact`.
- [ ] `/contact` → "Tisch reservieren.": the date picker starts at today; 1–20 guests; a request for tomorrow sends, shows the thank-you line and clears the form; the email (in a local mail catcher) has the date with its weekday, the time, the guests and `Reply-To` the guest. Today with a time already past shows "Die Uhrzeit liegt in der Vergangenheit."
- [ ] Each page at a phone width (375 px) and a desktop width: nothing overflows sideways.
- [ ] A reload on `/menu` works (Vercel's rewrite; locally Vite does the same).

**Admin**

- [ ] `/admin` without a token redirects to `/admin-login`.
- [ ] A wrong password shows "Pogrešno korisničko ime ili lozinka"; the right one shows the alert, then `/admin` with every category and dish.
- [ ] Add a dish without a photo: it appears at the end of its category; after a reload, at the start (`order` 0) on `/admin` and `/menu`.
- [ ] Edit its name and price: both change on `/menu`.
- [ ] Add a photo (only with a working ImageKit key of a **dev** account): it shows; replace it: the old file is gone from ImageKit.
- [ ] Delete the dish: the confirm, then it's gone.
- [ ] Categories: add one (it appears last, empty, on `/menu` too); delete it; the delete button is disabled for a category with dishes.
- [ ] ODJAVA: back to `/admin-login`, and `/admin` redirects again.

**API by hand** ([api-contract.md](api-contract.md#calling-it-by-hand))

- [ ] `GET /api/test`, `GET /api/categories`, `GET /api/food` answer 200.
- [ ] A write without a token answers 401 `Niste prijavljeni`.
- [ ] `POST /api/reservations`: a valid request answers 200; a missing field, a bad email or phone, 0 or 21 guests, yesterday, today a minute ago, `2026-02-30` and `25:00` each answer 400 with their message ([api-contract.md](api-contract.md#post-apireservations)).

## Adding tests

Nothing is set up. If tests are added, a natural split: Vitest (it shares Vite's config) with React Testing Library for the site, and Vitest or Jest with Supertest and an in-memory MongoDB (`mongodb-memory-server`) for the API, so tests never touch a real database. Record the choice and the commands here and in `CLAUDE.md`.
