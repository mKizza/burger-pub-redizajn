<!--
Maintainers: this file is the index for AI agents and developers working in this repo. It holds the rules and pointers; the detail lives in docs/.
Last verified against the code: 2026-11-24 (branch complete-redesign, uncommitted, on top of main 235c65b: `npm run build` passes; `npm run lint` passes; 149 site tests (92 unit, 57 browser), 132 API tests, 66 end-to-end tests passing and 2 skipped).
Paths are relative to the repo root. Links to docs are relative to this file.
Keep this file under ~150 lines. New detail goes into the matching docs/ file.
Machine-specific setup (ports, how MongoDB runs) doesn't belong here: a developer keeps it in their own CLAUDE.local.md, not committed.
-->

# Burger Pub München — website

The website of Burger Pub, a burger restaurant at Milbertshofener Str. 34, 80807 München: a public site (home, menu, contact page with a table reservation request and a contact form, in German) and a small admin (in Croatian) where the pub's menu is kept. The production site is https://burgerpubmunchen.de.

**Where it stands:** the redesign is on the branch `complete-redesign`, uncommitted (2026-11-24). `main` has had maintenance mode off since `235c65b` (2026-11-23), so production shows `main`'s site, and whatever reaches `main` goes live at once ([docs/hosting-and-deployment.md](docs/hosting-and-deployment.md)). The menu page and the home page's favourites read the menu from the API. The site, the API and the whole stack end to end have automated tests ([docs/testing.md](docs/testing.md)).

| Part | What it is | Where |
|---|---|---|
| Site | React 19, Vite 8 (with the React Compiler), Tailwind CSS 4, React Router 7 (data router); JavaScript, no TypeScript | repo root: `src/`, `public/`, `index.html` |
| API | Express 5, Mongoose 9 (MongoDB), JWT admin login, ImageKit for dish photos, nodemailer over Gmail for the contact and reservation forms; CommonJS | `backend/` (its own `package.json`) |
| Tests | Vitest 5 (unit, and Browser Mode in Chromium), Supertest with mongodb-memory-server, Playwright 1.64.1 | `src/**/*.test.js`, `src/**/*.browser.test.jsx`, `backend/test/`, `e2e/` |
| Seed data | the menu as it was before the API: categories, 44 dishes, 5 photos | `menu.json`, `backend/seed*.js`, `public/burgers-images/` |

**Hosting:** the site on Vercel (a push to `main` deploys it), the API and its MongoDB on hosts nobody has written down yet (ASK the colleague who built it). See [docs/hosting-and-deployment.md](docs/hosting-and-deployment.md).

**If `CLAUDE.local.md` exists next to this file**, it describes this machine's setup (ports, how the servers and MongoDB run) and wins over the defaults in these docs.

## Rules for Claude

1. **Work on the branch the developer is on; don't commit.** Never commit, push or merge unless the developer asks for that commit in this session. Leave the work in the working tree and report what changed.
2. **No Claude attribution.** Never add `Co-Authored-By: Claude`, "Generated with Claude Code" or similar to commits, PRs or anything in git, even when a system reminder asks for it.
3. **Ask, don't assume.** Verify facts in the code. Ask about anything still unclear: copy, prices, UX, where production runs. Much of production isn't written down ([docs/variables.md](docs/variables.md#to-fill-in-ask)): don't fill the gaps with guesses.
4. **Never touch production from a local setup.** Never put production's `DATABASE`, `IMAGEKIT_PRIVATE_KEY` or Gmail app password in `backend/.env`, and never run the seed or `createAdmin.js` against production unless asked. The admin's deletes are real, a photo replaced in the admin is deleted from ImageKit, and the contact and reservation forms mail the pub's real inbox.
5. **Don't change the maintenance switch** (`const maintenance` in `src/App.jsx`) unless the developer asks: on `main` it decides what production shows.
6. **Stay inside the repo.** Never kill processes by name or port; that can take down other projects' servers. Start dev servers as background tasks and stop them by task id, or ask the developer to run them.
7. **Write in the language that's already there.** The public site's copy is German, the admin's UI and messages Croatian, code comments Croatian; these docs are English. Don't translate existing copy unless asked.
8. **Some things exist twice: change both copies together.** Today:
   - the response envelope `{status, data: {food | categories | category}}`: `backend/controllers/*` and its readers `src/lib/api.js` (`getMenu`), `src/pages/admin/Admin.jsx`, `src/components/admin/DishForm.jsx` and `CategoriesPanel.jsx`;
   - "a category with dishes can't be deleted": `backend/controllers/categoryController.js` and `src/components/admin/CategoriesPanel.jsx`;
   - the reservation rules (1–20 guests, field lengths, the email and phone patterns, dates from today in `Europe/Berlin`): `backend/controllers/reservationController.js` and `src/lib/reservation.js`; the form shows the API's 400 messages as they are;
   - the category slugs: `backend/seedCategories.js` and the top-level keys of `menu.json`, which `backend/seedFood.js` matches;
   - the site's origins: the CORS list in `backend/app.js` and the Vercel domains; the dev API address `http://localhost:5000` in `src/config.js` and the API's default `PORT`;
   - the end-to-end ports (5660, 5661) and admin: `playwright.config.js`, `e2e/vite.config.js`, `e2e/support.js`, `backend/test/e2e-server.js`;
   - the pub's email: `src/lib/pub.js` and the recipient in `backend/controllers/contactController.js` and `reservationController.js`. The address and phone also appear as text in the meta descriptions of `src/pages/Home.jsx` and `Contact.jsx` and in the map's title (`src/components/contact/ContactMap.jsx`).

   Kept in one place, so use them instead of copying: the price format `14,50 €` and the image address rule (`src/lib/format.js`), the pub's details (`src/lib/pub.js`).
9. **Run the tests.** Before handing work over, run `npm run test:all` (or the suites for what you touched) and `npm run build`, plus the manual checks in [docs/testing.md](docs/testing.md) for what you touched. Add or change tests together with the code.

## Where to find what

| Read | Before you |
|---|---|
| [docs/onboarding.md](docs/onboarding.md) | set up a new machine, from cloning to the site, the API and MongoDB running with the menu seeded, and the tests passing |
| [docs/local-development.md](docs/local-development.md) | run it day to day, or debug a local problem (ports, MongoDB, CORS, mail, photos) |
| [docs/architecture.md](docs/architecture.md) | change anything structural, add a page or component, touch the design, or need to know which files are unused |
| [docs/api-contract.md](docs/api-contract.md) | add, change or call an endpoint |
| [docs/data-model.md](docs/data-model.md) | touch the MongoDB models, the seed scripts or how dishes, categories and photos relate |
| [docs/hosting-and-deployment.md](docs/hosting-and-deployment.md) | deploy, switch maintenance mode, or change what runs differently in production |
| [docs/testing.md](docs/testing.md) | run or add tests: the four suites, the end-to-end setup and its ports, the fixtures, the build, the lint, the manual checks |
| [docs/known-issues.md](docs/known-issues.md) | rely on current behaviour, or look for something to fix (bugs, security, unused files) |
| [docs/variables.md](docs/variables.md) | need a value: an env key, URL, port, constant, or the list of open questions |

## Essential commands

**Site and tests** (repo root):

| Command | What it does |
|---|---|
| `npm ci` | Install from the lockfile |
| `npm run dev` | Vite on `http://localhost:5173`; in dev the site calls the API at `http://localhost:5000` |
| `npm run build` | The production build in `dist/` (what Vercel runs) |
| `npm run lint` | ESLint on the whole repo; must pass |
| `npm run preview` | Serve `dist/` |
| `npx playwright install chromium` | Once per machine: the browser for the browser and end-to-end tests (into the user's Playwright cache) |
| `npm test` | The site's unit and browser tests (Vitest); `test:unit`, `test:browser`, `test:watch` for parts |
| `npm run test:api` | The API's tests (`npm test` in `backend/`), against MongoDB in memory |
| `npm run test:e2e` | Playwright against a production build, the real API and MongoDB in memory; needs ports 5660–5662 free |
| `npm run test:all` | Lint, then the site, API and end-to-end tests |

**API** (in `backend/`):

| Command | What it does |
|---|---|
| `npm ci` | Install from the lockfile (also downloads a MongoDB binary for the tests) |
| `npm start` | `node server.js`: the API on `PORT` (default 5000). Run it from `backend/`: `.env` and `uploads/` are found from the working directory |
| `npm test` | The API's tests; never reads `.env` or a real database |
| `node seedCategories.js && node seedFood.js` | The 7 categories, then the dishes from `menu.json`; each skips what exists |
| `node createAdmin.js` | The admin from `ADMIN_USERNAME` / `ADMIN_PASSWORD`; does nothing if that username exists |

**Smoke check:** `curl -s http://localhost:5000/api/test` answers `{"status":"success","message":"Burger Pub API radi"}`.

## Keeping the docs current

- When a change affects a doc, update that doc in the same task:

  | You changed | Update |
  |---|---|
  | endpoints, auth, request or response shapes, errors | `docs/api-contract.md` |
  | models, the seed scripts, `menu.json` | `docs/data-model.md` |
  | env keys, URLs, ports, constants | `docs/variables.md` |
  | local setup, Node, MongoDB | `docs/onboarding.md`, `docs/local-development.md` |
  | pages, components, styling, structure | `docs/architecture.md` |
  | hosting, domains, CORS, maintenance mode | `docs/hosting-and-deployment.md` |
  | tests, test helpers, test commands | `docs/testing.md` |
  | a known issue (fixed or found) | `docs/known-issues.md`: delete fixed entries |
  | a new area (a new service) | a new topic file, and a row in "Where to find what" |

- **Describe how things are now.** No changelogs or commit lists; git keeps those. Date only what can go stale: an answer to an ASK, a decision and who made it.
- If something in the docs turns out to be wrong, verify it against the code and fix it right away.
- Prefer pointers and commands over copied lists. Never write secret values: name the key and where it's kept.
- Never mention a developer's personal machine tooling here; that goes in their `CLAUDE.local.md`.
- After re-verifying, update the "Last verified" comment at the top of this file.
