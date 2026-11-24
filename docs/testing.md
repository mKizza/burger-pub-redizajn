# Testing and checks

Three automated suites, the build and the lint, and a short list of manual checks for what automation can't see. There's no CI: run the checks yourself before handing work over.

## At a glance

| Suite | What it runs against | Command | Tests (2026-11-24) |
|---|---|---|---|
| Site, unit | the `src/lib/` modules, in Node | `npm run test:unit` | 92 |
| Site, browser | the real routes and components in headless Chromium, `fetch` mocked | `npm run test:browser` | 57 |
| API | `backend/app.js` with Supertest, MongoDB in memory, fake mail and ImageKit | `npm run test:api` | 132, in 7 files |
| End to end | a production build of the site, the real API, MongoDB in memory, in Chromium as a desktop and as a phone | `npm run test:e2e` | 66 passing, 2 skipped by design |

| Command (repo root) | Runs |
|---|---|
| `npm test` | both site projects (unit and browser) |
| `npm run test:watch` | the site's tests in watch mode |
| `npm run test:all` | `npm run lint`, `npm test`, `npm run test:api`, `npm run test:e2e`, stopping at the first failure |

## Before the first run

- **Playwright's Chromium**, once per machine: `npx playwright install chromium`. It downloads a browser into your user's Playwright cache, outside the repo (`~/Library/Caches/ms-playwright` on macOS, `~/.cache/ms-playwright` on Linux). The browser tests and the end-to-end tests both use it. Playwright is pinned (`@playwright/test` 1.64.1); after it's upgraded, run the command again.
- **A MongoDB binary** for the API tests and the end-to-end API, about 150 MB, in `backend/node_modules/.cache/mongodb-memory-server`. `npm ci` run inside `backend/` downloads it; if it's missing, the first test run does (the setup allows 5 minutes for that). `MONGOMS_DOWNLOAD_DIR` overrides the place.
- **Ports 5660, 5661 and 5662 free** for the end-to-end suite. It starts its own servers there and refuses to reuse anything already listening.

## The site: unit tests

- Files: `src/lib/*.test.js`, Vitest project `unit`, Node environment (`vitest.config.js`, which extends `vite.config.js`).
- They cover the logic in `src/lib/`: `apiFetch`'s errors (a network error is status 0) and the menu cache; the price format and the image address rule; building, filtering and the favourites of the menu; the reservation and contact validation, Munich's time zone included; the token's expiry; the admin's slugs, orders, prices, image checks, category moves and error texts.
- Run one file: `npx vitest run src/lib/menu.test.js`.

## The site: browser tests

- Files: `src/**/*.browser.test.jsx`, Vitest project `browser`: **Vitest Browser Mode** in headless Chromium (`@vitest/browser-playwright`), rendering with `vitest-browser-react`, at 1280×800 unless a test resizes it.
- They render the **real route table** in a memory router, so layouts, lazy admin pages and the guard all run. Files: `components/layout/Header.browser.test.jsx` (header and mobile menu), `pages/Home.browser.test.jsx` (home and the 404 page), `pages/Menu.browser.test.jsx`, `pages/Contact.browser.test.jsx` (details, map, reservation, contact form), `pages/admin/Admin.browser.test.jsx` (login, dashboard, dish dialog, categories).
- The helpers in `src/test/`:
  - `renderApp(path, {state})` (`renderApp.jsx`) renders the app at a path and returns the screen and the router;
  - `mockApi(routes)` (`mockApi.js`) replaces `fetch` for `/api/…` paths only. Keys are `"METHOD /path/:param"`; a value is `{status, json}`, a function of the call returning one, or an `Error` for a network failure. Unmatched calls get a 404. It returns `calls` and `callsTo(method, path)` to check what was sent; `deferred()` holds an answer back to test loading states;
  - `fixtures.js`: four categories (one empty), dishes with and without photos, `menuRoutes(overrides)` for the two menu endpoints, `fakeToken(expiresInSeconds)` for the admin;
  - `browserSetup.js` imports `App.css` (so visibility and layout are real), and before each test empties the menu cache and `localStorage` and scrolls to the top.
- Run one file: `npx vitest run --project browser src/pages/Menu.browser.test.jsx`.

## The API tests

- Files: `backend/test/*.test.mjs` (`auth`, `categories`, `contact`, `food`, `public`, `reservations`, `seed`), config `backend/vitest.config.mjs`. Run from the repo root with `npm run test:api`, or `npm test` in `backend/`. Files run one after another.
- `helpers.mjs` sets test values for the env keys (a test `JWT_SECRET`, a placeholder ImageKit key, no Gmail password), installs the fakes, and gives each file its own in-memory MongoDB (`useMemoryDb()`), plus `loginAsAdmin()` and a tiny PNG.
- `fakes.js`: **fake mail** (replaces nodemailer's transport, records every message, can be told to fail) and **fake ImageKit** (keeps uploads in memory, deletes them).
- The suite never reads `backend/.env`, and never touches a real database, Gmail or ImageKit.
- It covers every endpoint: answers, messages, auth, CORS, static files, unknown paths, the mails' content, photo upload and replace, and the seed scripts. Tests named "(current behaviour)" pin known issues ([known-issues.md](known-issues.md)); fixing one changes its test.
- Run one file: `cd backend && npx vitest run test/food.test.mjs`.

## The end-to-end tests

- Config `playwright.config.js`, specs in `e2e/`: `home.spec.js`, `menu.spec.js`, `contact.spec.js`, `admin.spec.js`, sharing `e2e/support.js`.
- **Two projects**, both Chromium: `desktop` (1440×900) and `mobile` (Pixel 7); German locale, `Europe/Berlin`. Two tests are skipped by design: the desktop navigation on the phone and the phone menu on the desktop. One worker, so tests run one at a time.
- **What runs** (Playwright's `webServer`, started and stopped with the run):

  | Port | What | Started by |
  |---|---|---|
  | 5660 | the site: a **production build** (`e2e/vite.config.js`: output `dist-e2e/`, `VITE_API_URL=""` so it calls its own origin), served by `vite preview`, which proxies `/api` and `/uploads` to 5661 | `vite build` + `vite preview` |
  | 5661 | the API: the real `backend/app.js` with fake mail and fake ImageKit (photos served back from `/__e2e/images/<id>`), seeded with the 7 categories, 44 dishes and the admin `e2e-admin` / `e2e-password-123` | `node backend/test/e2e-server.js` |
  | 5662 | its MongoDB, in memory | the same |

  `E2E_API_PORT` and `E2E_MONGO_PORT` move the API's ports, but `playwright.config.js`, `e2e/vite.config.js`, `e2e/support.js` and the e2e API's list of site origins hard-code 5660 and 5661: change them together. The e2e API drops the `Origin` header of requests from 5660, which isn't in the CORS list.
- **Test-only routes** under `/__e2e` on the API: `GET health`, `GET` and `DELETE mails`, `POST mail-fail` (`{fail: true}` makes sending fail), `POST reset`, `GET images`.
- **`e2e/support.js`** exports `test` with an automatic `backend` fixture that **resets the database, the mails and the photos before every test**, and gives `mails()`, `failMail()`, `images()`, `token()`. Also `loginWithToken(page, backend)`, `expectNoA11yViolations(page)` (axe with the WCAG 2.1 A and AA rules, with reduced motion, failing on serious or critical violations), and the date helpers.
- **It covers:** the home page (the favourites from the seeded menu, links, skip link, footer, header and phone menu, scroll restoration on a new page and on Back, the 404 page); the menu (7 categories in order, 44 dishes, 5 with photos, the chips, opening at a category, search, the error and retry, the cache across pages); the contact page (a reservation and a message reaching the fake inbox with the right content, validation, the API's refusals, mail failing and recovering, the map loading only on a click, no request to Google Fonts); the admin (the guard, login, an expired session, adding, editing and deleting a dish, uploading and replacing a photo, adding, renaming, moving and deleting a category, each change visible on `/menu`); and an axe scan of every page.
- **Results:** `playwright-report/` (open with `npx playwright show-report`) and, for failures, traces and screenshots in `test-results/`.
- Run a part: `npx playwright test e2e/menu.spec.js --project desktop`, or `-g "<test name>"`, `--headed` to watch.

Test outputs are gitignored: `dist-e2e`, `test-results`, `playwright-report`, `blob-report`, `.vitest`.

## Adding a test

| You changed | Add |
|---|---|
| logic without React | a function in `src/lib/` and a case in its `*.test.js` |
| what a page or component does | a `*.browser.test.jsx` next to it, with `renderApp`, `mockApi` and the fixtures |
| an endpoint | a case in `backend/test/<area>.test.mjs`, with `app`, `request` and `loginAsAdmin` from `helpers.mjs` |
| a flow through the real API, or anything that needs a real build (fonts, scrolling, accessibility) | an e2e spec; import `test` and `expect` from `./support.js`, not from `@playwright/test`, so the reset runs |

When a suite or a way of running it changes, update this page and the commands in `CLAUDE.md`.

## The build

```bash
npm run build        # vite build → dist/, what Vercel runs
```

It must pass. On 2026-11-24: about 371 kB of JavaScript in the main chunk (115 kB gzipped), 71 kB of CSS (12 kB gzipped), the admin in its own chunks (`Admin` 25 kB, `AdminLogin` 6 kB), the fonts as separate files. There's no build for the API.

## The lint

```bash
npm run lint         # eslint . : the whole repo; must pass
```

`eslint.config.js` has blocks for the site (browser, React), its tests, `e2e/` and the config files (Node), and `backend/` (Node, CommonJS for `.js`, modules for `.mjs`). There's no formatter config; the code follows Prettier's defaults (double quotes, semicolons, trailing commas). Match it.

## Manual checks

Against a local API and database with the seed loaded ([onboarding.md](onboarding.md)). Run the ones for what you touched; the suites cover the rest.

- [ ] **The look on real devices:** a phone (iOS Safari, Android Chrome) and a desktop. The hero, the favourites' marquee, the header turning solid, the phone menu, the menu's chips and cards, the contact forms; nothing overflows sideways at 375 px.
- [ ] **Safari and Firefox**, since every suite runs Chromium only: the native `<dialog>`s (phone menu, admin dialogs), the reservation form's date and time inputs, the marquee.
- [ ] **Photos with a real ImageKit account of your own** (a dev account, never production's key; the suites use a fake): add a photo, replace it (the old file is gone from the ImageKit dashboard), delete the dish.
- [ ] **Real mail through Gmail** with a test account, never production's credentials. The recipient is hard-coded to the pub's inbox, so point it at your own address in your working tree first and don't commit that ([local-development.md](local-development.md#the-contact-form)). The contact and reservation mails arrive, readable, and replying goes to the visitor.
- [ ] **A production build against an API:** `VITE_API_URL=http://localhost:5000 npm run build`, then `npm run preview -- --port 5173 --strictPort` (the only local origin in the CORS list), with a local API. After a deploy, the live site against the real API: `/menu` loads, the favourites show, `/admin-login` lets you in. Sending the forms in production reaches the pub: only by agreement.
