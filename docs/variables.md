<!--
Every value a developer or an AI agent needs: URLs, ports, env keys, constants, the pub's details.
Secrets are listed by name and location only. Never write a secret value into this file.
Last verified against the code: 2026-11-23 (main 17c2520).
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
| When the site launches (maintenance mode off) | ASK. Maintenance mode is intended until then (the developer, 2026-11-23) |
| Logs, backups and monitoring for the API and the database | ASK. Nothing in the repo sets any up |

## Repo

| Item | Value |
|---|---|
| Repo | GitHub `mKizza/burger-pub-redizajn` (`git@github.com:mKizza/burger-pub-redizajn.git`) |
| Branches | `main` only; a push to `main` deploys the site on Vercel |
| Package managers | npm, two lockfiles: `package-lock.json` (site) and `backend/package-lock.json` (API) |

## Environments

| | Site | API | Database |
|---|---|---|---|
| production | https://burgerpubmunchen.de, https://www.burgerpubmunchen.de, https://burger-pub-redizajn.vercel.app (Vercel) | ASK | ASK |
| local | http://localhost:5173 | http://localhost:5000 | your MongoDB |

There is no staging environment. Vercel's preview deployments (other branches) aren't in the API's CORS list, so their calls to the API fail.

## Ports

| Port | What | Set in |
|---|---|---|
| 5173 | Vite's dev server | Vite's default; the only dev origin in the CORS list (`backend/server.js`) |
| 5000 | the API | `PORT` in `backend/.env`, default 5000 in `backend/server.js`; the site's dev API address in `src/config.js`. On macOS it's the AirPlay Receiver's ([local-development.md](local-development.md#ports)) |
| 27017 | MongoDB's default | your `DATABASE` URL |

## API env keys (`backend/.env`)

Read with `dotenv` from the **working directory** (so run from `backend/`). `.env` and `backend/.env` are gitignored. There's no `.env.example`; [onboarding.md](onboarding.md#3-the-apis-env) has a local template.

| Key | Required | What | Without it |
|---|---|---|---|
| `PORT` | no | the port to listen on | 5000 |
| `DATABASE` | yes | the MongoDB connection string, database included (`mongodb://127.0.0.1:27017/burgerpub`, or a `mongodb+srv://…` URL) | the API runs, but every database call fails after 10 s |
| `JWT_SECRET` | yes | signs and verifies the admin's tokens. Changing it logs every admin out | login answers 500 |
| `JWT_EXPIRES_IN` | yes | how long a token lasts: a timespan (`7d`, `12h`) or seconds | login answers 500 (`"expiresIn" should be a number of seconds or string representing a timespan`) |
| `IMAGEKIT_PRIVATE_KEY` | yes | ImageKit's private API key, for uploading and deleting dish photos | **the API doesn't start** |
| `EMAIL_USER` | for the contact form | the Gmail address nodemailer logs in as; also the From address | the contact form answers 500 |
| `EMAIL_PASSWORD` | for the contact form | that account's Gmail **app password** (Gmail refuses the normal password over SMTP) | the contact form answers 500 |
| `ADMIN_USERNAME` | for `createAdmin.js` | the admin's login name | the script fails |
| `ADMIN_PASSWORD` | for `createAdmin.js` | the admin's password, at least 8 characters | the script fails |

## Site env keys

| Key | Where | What |
|---|---|---|
| `VITE_API_URL` | the Vercel project's environment variables (a local `.env.production` for a local production build) | The API's origin, with no trailing slash and no `/api` (the code appends `/api/…`). **Only read by a production build** (`import.meta.env.PROD`); `npm run dev` always uses `http://localhost:5000`. Vite bakes it in at build time: changing it needs a rebuild. Unset in a build, every call goes to `undefined/api/…` and fails |

## Constants in code

| What | Value | Where |
|---|---|---|
| Maintenance mode | `const maintenance = true` | `src/App.jsx` |
| Dev API address | `http://localhost:5000` | `src/config.js` |
| CORS origins | `http://localhost:5173`, `https://burgerpubmunchen.de`, `https://www.burgerpubmunchen.de`, `https://burger-pub-redizajn.vercel.app` | `backend/server.js` |
| JSON body limit | 100 kB (Express's default) | `backend/server.js` |
| Upload field, types, size | `image`; `image/*` on the API (the admin's picker offers JPEG, PNG, WebP); no size limit | `backend/controllers/foodController.js`, `src/components/Admin.jsx` |
| ImageKit folder and names | `/burger-pub/food`, `food-<ms timestamp>-<original name>` | `backend/controllers/foodController.js` |
| Contact and reservation recipient | `burgerpubmunchen@gmail.com` | `backend/controllers/contactController.js`, `reservationController.js` |
| Reservation limits | 1–20 guests (`MAX_GUESTS`); dates from today and, for today, times after now, both in `Europe/Berlin`; name ≤ 100, email ≤ 200, phone ≤ 40, message ≤ 2000 characters | `backend/controllers/reservationController.js`, `src/ReservationForm.jsx` |
| Reservation mail | subject `Reservierungsanfrage: <Wt., TT.MM.JJJJ>, <HH:MM> Uhr, <n> Personen – <name>`, `Reply-To` the guest | `backend/controllers/reservationController.js` |
| Contact mail | from `"Burger Pub Website" <EMAIL_USER>`, subject `Neue Nachricht von <name>`, `Reply-To` the visitor | `backend/controllers/contactController.js` |
| Password hashing | bcrypt, cost 12; minimum length 8 | `backend/models/adminModel.js` |
| Token storage in the browser | `localStorage`, key `token` | `src/components/AdminLogin.jsx`, `Admin.jsx`, `ProtectedRoute.jsx` |
| Price format | `14,50 €` (two decimals, comma) | `src/Menu.jsx`, `src/components/Admin.jsx` |
| Mongoose query buffering | 10 s (Mongoose's default) before a query fails when not connected | |
| Carousel animation | −15% over 10 s, looping | `src/App.css` (`@keyframes marquee`) |
| Accent colours | `#ffaf01`, `#f58220` | inline Tailwind classes ([architecture.md](architecture.md#design)) |

## The pub's details (as shown on the site)

| | Value | Where |
|---|---|---|
| Name | Burger Pub München ("Burger Pub Munich" on the maintenance page) | `index.html`, `src/App.jsx` |
| Address | Milbertshofener Str. 34, 80807 München | `src/IconsPage.jsx`, `src/ContactInfo.jsx`, `src/ContactMap.jsx` |
| Phone | +49 89 32795957 (`tel:+498932795957`) | `src/ContactInfo.jsx` |
| Email | burgerpubmunchen@gmail.com | `src/ContactInfo.jsx`, `backend/controllers/contactController.js` |
| Instagram | @burgerpubmunchen_ (https://www.instagram.com/burgerpubmunchen_/) | `src/ContactInfo.jsx` |
| Opening hours | not on the site | |

## Secrets: where they live

| Secret | Production | Locally |
|---|---|---|
| `DATABASE` (with its credentials) | the API host's environment: ASK | `backend/.env`, a local URL |
| `JWT_SECRET` | the API host's environment: ASK | `backend/.env`, any random string |
| `IMAGEKIT_PRIVATE_KEY` | the API host's environment; the ImageKit dashboard | `backend/.env`, a placeholder or a dev account's key |
| `EMAIL_PASSWORD` (Gmail app password) | the API host's environment; the Google account's security settings | leave empty |
| `ADMIN_PASSWORD` | only needed when running `createAdmin.js`; the admin's password: ASK | `backend/.env` |
| `VITE_API_URL` (not secret) | the Vercel project | not needed in dev |
