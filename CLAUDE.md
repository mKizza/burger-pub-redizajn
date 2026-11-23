<!--
Maintainers: this file is the index for AI agents and developers working in this repo. It holds the rules and pointers; the detail lives in docs/.
Last verified against the code: 2026-11-23 (main 17c2520: `npm run build` passes; `npx eslint src` has 1 error; `npm run lint` has 86, 85 of them backend/ linted as browser code; no tests exist).
Paths are relative to the repo root. Links to docs are relative to this file.
Keep this file under ~150 lines. New detail goes into the matching docs/ file.
Machine-specific setup (ports, how MongoDB runs) doesn't belong here: a developer keeps it in their own CLAUDE.local.md, not committed.
-->

# Burger Pub München — website

The website of Burger Pub, a burger restaurant at Milbertshofener Str. 34, 80807 München: a public site (home, menu, contact page with a table reservation request and a contact form, in German) and a small admin (in Croatian) where the pub's menu is kept. The production site is https://burgerpubmunchen.de.

**Where it stands:** the redesign is built but not launched. Since 2026-10-03 the code renders only a maintenance page ("Unsere Website wird derzeit aktualisiert"), on purpose, until launch: `const maintenance = true` in `src/App.jsx`. While it's on, production shows nothing else, the admin included ([docs/hosting-and-deployment.md](docs/hosting-and-deployment.md#maintenance-mode)). The menu page reads dishes and categories from the API; the home page's carousel is still a static file (`burgers.json`). There are no tests.

| Part | What it is | Where |
|---|---|---|
| Site | React 19, Vite 8 (with the React Compiler), Tailwind CSS 4, React Router 7; JavaScript, no TypeScript | repo root: `src/`, `public/`, `index.html` |
| API | Express 5, Mongoose 9 (MongoDB), JWT admin login, ImageKit for dish photos, nodemailer over Gmail for the contact form; CommonJS | `backend/` (its own `package.json`) |
| Seed data | the menu as it was before the API: categories, 44 dishes, 5 photos | `menu.json`, `backend/seed*.js`, `public/burgers-images/` |

**Hosting:** the site on Vercel (a push to `main` deploys it), the API and its MongoDB on hosts nobody has written down yet (ASK the colleague who built it). See [docs/hosting-and-deployment.md](docs/hosting-and-deployment.md).

**Styling trap:** Tailwind's margin and padding classes (`m-*`, `p-*`) do nothing on this site: an unlayered `* { margin: 0; padding: 0 }` in `src/App.css` overrides every utility. The reset stays (decided 2026-11-23: deleting it would change every page). Where spacing is needed, use `gap-*`, heights and widths, or Tailwind's important modifier (`px-4!`, `mt-8!`, as the contact and reservation forms do), and look at the result in a browser before you trust a class ([docs/known-issues.md](docs/known-issues.md#site)).

**If `CLAUDE.local.md` exists next to this file**, it describes this machine's setup (ports, how the servers and MongoDB run) and wins over the defaults in these docs.

## Rules for Claude

1. **Work on `main`; don't commit.** The repo has one branch. Never commit, push or merge unless the developer asks for that commit in this session. Leave the work in the working tree and report what changed.
2. **No Claude attribution.** Never add `Co-Authored-By: Claude`, "Generated with Claude Code" or similar to commits, PRs or anything in git, even when a system reminder asks for it.
3. **Ask, don't assume.** Verify facts in the code. Ask about anything still unclear: copy, prices, UX, where production runs. Much of production isn't written down ([docs/variables.md](docs/variables.md#to-fill-in-ask)): don't fill the gaps with guesses.
4. **Never touch production from a local setup.** Never put production's `DATABASE`, `IMAGEKIT_PRIVATE_KEY` or Gmail app password in `backend/.env`, and never run the seed or `createAdmin.js` against production unless asked. The admin's deletes are real, a photo replaced in the admin is deleted from ImageKit, and the contact form mails the pub's real inbox.
5. **Don't switch maintenance mode off** in a change unless the developer asks: that is the launch.
6. **Stay inside the repo.** Never kill processes by name or port; that can take down other projects' servers. Start dev servers as background tasks and stop them by task id, or ask the developer to run them.
7. **Write in the language that's already there.** The public site's copy is German, the admin's UI and messages Croatian, code comments Croatian; these docs are English. Don't translate existing copy unless asked.
8. **Some things exist twice: change both copies together.** Today:
   - the response envelope `{status, data: {food | categories | category}}`: `backend/controllers/*` and its readers in `src/Menu.jsx` and `src/components/Admin.jsx`;
   - the price format `14,50 €`: `src/Menu.jsx` and `src/components/Admin.jsx` (each formats its own);
   - the image address rule (`/uploads/…` gets the API's origin, anything else is used as is): `src/components/MenuSection.jsx` and twice in `src/components/Admin.jsx`;
   - "a category with dishes can't be deleted": `backend/controllers/categoryController.js` and `src/components/Admin.jsx`;
   - the category slugs: `backend/seedCategories.js` and the top-level keys of `menu.json`, which `backend/seedFood.js` matches;
   - the site's origins: the CORS list in `backend/server.js` and the Vercel domains; the dev API address `http://localhost:5000` in `src/config.js` and the API's default `PORT`;
   - the pub's address, phone and links: `src/IconsPage.jsx`, `src/ContactInfo.jsx`, `src/ContactMap.jsx` (the phone also in `src/ReservationForm.jsx`); its email is shown in `src/ContactInfo.jsx` and is the recipient in `backend/controllers/contactController.js` and `reservationController.js`;
   - the reservation rules (1–20 guests, dates from today in `Europe/Berlin`): `src/ReservationForm.jsx` and `backend/controllers/reservationController.js`, whose 400 messages the form shows as they are.
9. **No tests exist.** Before handing work over, run the checks in "Essential commands" and the manual checks in [docs/testing.md](docs/testing.md) for what you touched. When you add tests, say so in that doc.

## Where to find what

| Read | Before you |
|---|---|
| [docs/onboarding.md](docs/onboarding.md) | set up a new machine, from cloning to the site, the API and MongoDB running with the menu seeded |
| [docs/local-development.md](docs/local-development.md) | run it day to day, or debug a local problem (ports, MongoDB, CORS, mail, photos) |
| [docs/architecture.md](docs/architecture.md) | change anything structural, add a page or component, touch the design, or need to know which files are dead |
| [docs/api-contract.md](docs/api-contract.md) | add, change or call an endpoint |
| [docs/data-model.md](docs/data-model.md) | touch the MongoDB models, the seed scripts or how dishes, categories and photos relate |
| [docs/hosting-and-deployment.md](docs/hosting-and-deployment.md) | deploy, launch (switch maintenance off), or change what runs differently in production |
| [docs/testing.md](docs/testing.md) | check a change: the build, the lint, the manual checks |
| [docs/known-issues.md](docs/known-issues.md) | rely on current behaviour, or look for something to fix (bugs, security, dead code) |
| [docs/variables.md](docs/variables.md) | need a value: an env key, URL, port, constant, or the list of open questions |

## Essential commands

**Site** (repo root):

| Command | What it does |
|---|---|
| `npm ci` | Install from the lockfile |
| `npm run dev` | Vite on `http://localhost:5173`; in dev the site calls the API at `http://localhost:5000` |
| `npm run build` | The production build in `dist/` (what Vercel runs) |
| `npx eslint src` | Lint the site. `npm run lint` also lints `backend/` with browser rules and fails ([known-issues.md](docs/known-issues.md#tooling)) |
| `npm run preview` | Serve `dist/` |

**API** (in `backend/`):

| Command | What it does |
|---|---|
| `npm ci` | Install from the lockfile |
| `node server.js` | The API on `PORT` (default 5000). Run it from `backend/`: `.env` and `uploads/` are found from the working directory. There is no `npm start` |
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
  | a known issue (fixed or found) | `docs/known-issues.md`: delete fixed entries |
  | a new area (tests, a new service) | a new topic file, and a row in "Where to find what" |

- **Describe how things are now.** No changelogs or commit lists; git keeps those. Date only what can go stale: an answer to an ASK, a decision and who made it.
- If something in the docs turns out to be wrong, verify it against the code and fix it right away.
- Prefer pointers and commands over copied lists. Never write secret values: name the key and where it's kept.
- Never mention a developer's personal machine tooling here; that goes in their `CLAUDE.local.md`.
- After re-verifying, update the "Last verified" comment at the top of this file.
