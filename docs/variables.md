<!--
Every value a developer or an AI agent needs: URLs, ports, env keys, constants, the pub's details.
Secrets are listed by name and location only. Never write a secret value into this file.
Last verified against the code: 2026-11-24 (branch complete-redesign, uncommitted, on top of main 235c65b).
Values marked ASK aren't in the code: ask the colleague who built the app, and fill them in with the date.
-->

# Variables and settings

## To fill in (ASK)

| What | Status |
|---|---|
| Where the API runs in production | ASK. A `backend-production.zip` (code and `node_modules`, no `.env`) was committed and removed on 2026-09-24, which suggests a host you upload a zip to |
| Where production's MongoDB runs | ASK |
| The API's production address (`VITE_API_URL` in Vercel) | ASK. It's set in the Vercel project, not in the repo |
| Who owns the Vercel project, the domain `burgerpubmunchen.de` and its DNS | ASK |
| Who owns the ImageKit account | ASK |
| The Gmail account that sends the contact form (`EMAIL_USER`) | ASK. The recipient is `burgerpubmunchen@gmail.com`; the sender may be the same account |
| Production's `JWT_EXPIRES_IN` | ASK |
| Production's admin username(s) | ASK |
| `NODE_ENV` on the API host | ASK. If it isn't `production`, error pages show stack traces |
| Whether `menu.json` matches the pub's real menu and prices | ASK |
| When the redesign goes live | ASK. Maintenance mode was switched off on `main` in `235c65b` (2026-11-23), so `main`'s site is live; the redesign goes live when it reaches `main` |
| The pub's opening hours | ASK. Left off the site until they're known (the developer, 2026-11-24) |
| The details for an Impressum and a Datenschutz page (owner, legal form, contact, register entry, VAT id, who handles data) | ASK. Neither page exists ([known-issues.md](known-issues.md#site)) |
| Logs, backups and monitoring for the API and the database | ASK. Nothing in the repo sets any up |

## Repo

| Item | Value |
|---|---|
| Repo | GitHub `mKizza/burger-pub-redizajn` (`git@github.com:mKizza/burger-pub-redizajn.git`) |
| Branches | `main` deploys the site on Vercel when pushed. Others exist (`git branch -a`); they get Vercel preview deployments |
| Package managers | npm, two lockfiles: `package-lock.json` (site) and `backend/package-lock.json` (API) |

## Environments

| | Site | API | Database |
|---|---|---|---|
| production | https://burgerpubmunchen.de, https://www.burgerpubmunchen.de, https://burger-pub-redizajn.vercel.app (Vercel) | ASK | ASK |
| local | http://localhost:5173 | http://localhost:5000 | your MongoDB |
| end-to-end tests | http://127.0.0.1:5660 (a production build) | http://127.0.0.1:5661 | MongoDB in memory on 5662 |

There is no staging environment. Vercel's preview deployments (other branches) aren't in the API's CORS list, so their calls to the API fail.

## Ports

| Port | What | Set in |
|---|---|---|
| 5173 | Vite's dev server | Vite's default; the only dev origin in the CORS list (`backend/app.js`) |
| 5000 | the API | `PORT` in `backend/.env`, default 5000 in `backend/server.js`; the site's dev API address in `src/config.js`. On macOS it's the AirPlay Receiver's ([local-development.md](local-development.md#ports)) |
| 27017 | MongoDB's default | your `DATABASE` URL |
| 5660 | the e2e site (`vite preview` of the e2e build) | `e2e/vite.config.js`, `playwright.config.js`, the site origins in `backend/test/e2e-server.js` |
| 5661 | the e2e API | `E2E_API_PORT` (default 5661) in `backend/test/e2e-server.js`; also `playwright.config.js`, `e2e/vite.config.js`, `e2e/support.js` |
| 5662 | the e2e API's in-memory MongoDB | `E2E_MONGO_PORT` (default 5662) in `backend/test/e2e-server.js` |

The API tests' in-memory MongoDB takes a random free port.

## API env keys (`backend/.env`)

Read with `dotenv` from the **working directory** (so run from `backend/`), only by `server.js` and by the scripts when run directly; the tests never read it. `.env` and `backend/.env` are gitignored. There's no `.env.example`; [onboarding.md](onboarding.md#3-the-apis-env) has a local template.

| Key | Required | What | Without it |
|---|---|---|---|
| `PORT` | no | the port to listen on | 5000 |
| `DATABASE` | yes | the MongoDB connection string, database included (`mongodb://127.0.0.1:27017/burgerpub`, or a `mongodb+srv://…` URL) | the API runs, but every database call fails after 10 s |
| `JWT_SECRET` | yes | signs and verifies the admin's tokens. Changing it logs every admin out | login answers 500 |
| `JWT_EXPIRES_IN` | yes | how long a token lasts: a timespan (`7d`, `12h`) or seconds | login answers 500 (`"expiresIn" should be a number of seconds or string representing a timespan`) |
| `IMAGEKIT_PRIVATE_KEY` | yes | ImageKit's private API key, for uploading and deleting dish photos | **the API doesn't start** |
| `EMAIL_USER` | for the forms | the Gmail address nodemailer logs in as; also the From address | the contact and reservation forms answer 500 |
| `EMAIL_PASSWORD` | for the forms | that account's Gmail **app password** (Gmail refuses the normal password over SMTP) | the contact and reservation forms answer 500 |
| `ADMIN_USERNAME` | for `createAdmin.js` | the admin's login name | the script fails |
| `ADMIN_PASSWORD` | for `createAdmin.js` | the admin's password, at least 8 characters | the script fails |

## Site env keys

| Key | Where | What |
|---|---|---|
| `VITE_API_URL` | the Vercel project's environment variables (a local `.env.production` for a local production build) | The API's origin, with no trailing slash and no `/api` (the code appends `/api/…`). **Only read by a production build** (`import.meta.env.PROD`); `npm run dev` always uses `http://localhost:5000`. Vite bakes it in at build time: changing it needs a rebuild. Empty, the site calls its own origin (the e2e build does that). Unset in a build, every call goes to `undefined/api/…` and fails |

## Test env keys

| Key | Read by | What |
|---|---|---|
| `E2E_API_PORT` | `backend/test/e2e-server.js` | the e2e API's port, default 5661 |
| `E2E_MONGO_PORT` | `backend/test/e2e-server.js` | the e2e MongoDB's port, default 5662 |
| `MONGOMS_DOWNLOAD_DIR` | `backend/test/memoryMongo.js`, mongodb-memory-server | where the MongoDB binary is kept; defaults to `backend/node_modules/.cache/mongodb-memory-server` |
| `CI` | `playwright.config.js` | when set: `test.only` fails the run, and a failed test is retried once |

The test setups give the API its own values for `JWT_SECRET`, `JWT_EXPIRES_IN`, `IMAGEKIT_PRIVATE_KEY` and `EMAIL_USER` (`backend/test/helpers.mjs`, `backend/test/e2e-server.js`); nothing needs setting.

## Test accounts

| What | Value | Where |
|---|---|---|
| The e2e admin | `e2e-admin` / `e2e-password-123` (exists only in the e2e run's in-memory database) | `backend/test/e2e-server.js`, `e2e/support.js` |
| The API tests' admin | `test-admin` / `test-password-123` (in-memory too) | `backend/test/helpers.mjs` |

## Constants in code

| What | Value | Where |
|---|---|---|
| Maintenance mode | `const maintenance = false` | `src/App.jsx` |
| Dev API address | `http://localhost:5000` | `src/config.js` |
| CORS origins | `http://localhost:5173`, `https://burgerpubmunchen.de`, `https://www.burgerpubmunchen.de`, `https://burger-pub-redizajn.vercel.app` | `backend/app.js` |
| JSON body limit | 100 kB (Express's default) | `backend/app.js` |
| Menu cache in the browser | 5 minutes, in memory | `src/lib/api.js` (`MENU_CACHE_MS`) |
| Favourites on the home page | at most 8 dishes with a photo; the marquee track repeats them to at least 10 cards | `src/lib/menu.js` (`pickFavorites`), `src/components/home/Favorites.jsx` |
| Dish anchor | `gericht-<_id>` (`/menu#gericht-<_id>`); a category's section is `#<slug>` | `src/lib/menu.js` (`dishAnchor`), `src/components/menu/MenuSection.jsx` |
| Upload field, types, size | `image`; `image/*` on the API with no size limit; JPEG, PNG or WebP, at most 10 MB in the admin | `backend/controllers/foodController.js`, `src/lib/admin.js` (`IMAGE_TYPES`, `MAX_IMAGE_BYTES`) |
| ImageKit folder and names | `/burger-pub/food`, `food-<ms timestamp>-<original name>` | `backend/controllers/foodController.js` |
| Contact and reservation recipient | `burgerpubmunchen@gmail.com` | `backend/controllers/contactController.js`, `reservationController.js` |
| Reservation limits | 1–20 guests (`MAX_GUESTS`); dates from today and, for today, times after now, both in `Europe/Berlin`; name ≤ 100, email ≤ 200, phone ≤ 40, message ≤ 2000 characters | `backend/controllers/reservationController.js`, `src/lib/reservation.js` |
| Reservation mail | subject `Reservierungsanfrage: <Wt., TT.MM.JJJJ>, <HH:MM> Uhr, <n> Personen – <name>`, `Reply-To` the guest | `backend/controllers/reservationController.js` |
| Contact mail | from `"Burger Pub Website" <EMAIL_USER>`, subject `Neue Nachricht von <name>`, `Reply-To` the visitor | `backend/controllers/contactController.js` |
| Password hashing | bcrypt, cost 12; minimum length 8 | `backend/models/adminModel.js` |
| Token storage in the browser | `localStorage`, key `token` | `src/lib/auth.js` |
| Price format | `14,50 €` (two decimals, comma) | `src/lib/format.js` (`formatPrice`) |
| Toasts in the admin | 4.5 s, at most 4 at once | `src/components/ui/ToastProvider.jsx` |
| Header turns solid | after 12 px of scrolling | `src/hooks/useScrolled.js` |
| Mongoose query buffering | 10 s (Mongoose's default) before a query fails when not connected | |
| Favourites' marquee | the track moves −50% in 45 s, looping | `src/App.css` (`--animate-marquee`) |
| Colours, fonts, animations | the design tokens | `src/App.css` (`@theme`, [architecture.md](architecture.md#design)) |

## The pub's details (as shown on the site)

All in `src/lib/pub.js`, which every component reads; the address and phone also appear as plain text in the meta descriptions of `src/pages/Home.jsx` and `Contact.jsx` and in the map's title (`src/components/contact/ContactMap.jsx`).

| | Value |
|---|---|
| Name | Burger Pub München |
| Address | Milbertshofener Str. 34, 80807 München |
| Phone | +49 89 32795957 (`tel:+498932795957`) |
| Email | burgerpubmunchen@gmail.com (also the forms' recipient in the API) |
| Instagram | @burgerpubmunchen_ (https://www.instagram.com/burgerpubmunchen_/) |
| Opening hours | not on the site (ASK) |

## Secrets: where they live

| Secret | Production | Locally |
|---|---|---|
| `DATABASE` (with its credentials) | the API host's environment: ASK | `backend/.env`, a local URL |
| `JWT_SECRET` | the API host's environment: ASK | `backend/.env`, any random string |
| `IMAGEKIT_PRIVATE_KEY` | the API host's environment; the ImageKit dashboard | `backend/.env`, a placeholder or a dev account's key |
| `EMAIL_PASSWORD` (Gmail app password) | the API host's environment; the Google account's security settings | leave empty |
| `ADMIN_PASSWORD` | only needed when running `createAdmin.js`; the admin's password: ASK | `backend/.env` |
| `VITE_API_URL` (not secret) | the Vercel project | not needed in dev |
