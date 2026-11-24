# Hosting and deployment

Where Burger Pub runs, what each part needs there, and how a change goes live. The values are in [variables.md](variables.md); local development is in [local-development.md](local-development.md).

## Where it stands

- **The site is on Vercel**, at https://burgerpubmunchen.de, https://www.burgerpubmunchen.de and https://burger-pub-redizajn.vercel.app.
- **Maintenance mode is off on `main`** since `235c65b` (2026-11-23), so production shows `main`'s site, not the maintenance page ([Maintenance mode](#maintenance-mode)). Anything that reaches `main` is live right away.
- **The redesign** (the work on the branch `complete-redesign`, uncommitted on 2026-11-24) isn't deployed; it goes live when it reaches `main`.
- **The API and its MongoDB run somewhere nobody has written down:** ASK ([variables.md](variables.md#to-fill-in-ask)). Everything below about the API is what the code needs from any host.
- There's no staging environment and no CI; the tests run locally ([testing.md](testing.md)).

## The site (Vercel)

- **Build:** Vercel's Vite preset: `npm install`, `vite build` (`npm run build`), output `dist/`. Nothing in the repo overrides it.
- **Deploy:** a push to `main`; the commit "Trigger production deployment with API URL" (2026-09-25) was pushed for that reason. Other branches get preview deployments, whose calls to the API fail: their addresses aren't in its CORS list.
- **Routing:** `vercel.json` rewrites every path to `/index.html`, so `/menu` or `/admin` opened directly (or reloaded) loads the app. A path that doesn't exist shows the app's 404 page, with HTTP status 200.
- **Environment variable:** `VITE_API_URL`, the API's origin without `/api`. Vite bakes it into the build: after changing it, redeploy.
- **Static files:** everything in `public/` is deployed as is, at `/`: the logo, the backgrounds and the seeded dishes' photos (`/burgers-images/…`), which the API's data points at. Renaming or deleting one breaks the dishes that use it.
- **Fonts** are bundled with the site (`@fontsource`); the site loads nothing from Google Fonts.

## The API

What any host needs:

- **Node 20.19 or newer** (Mongoose 9).
- **Install:** `npm ci --omit=dev` in `backend/` (the dev dependencies are only for the tests; a plain `npm ci` also downloads a ~150 MB MongoDB binary for them).
- **Start:** `npm start` (`node server.js`), from `backend/`. `"main"` in `backend/package.json` names a file that doesn't exist (`index.js`), so a host that runs the `main` file needs the command set by hand.
- **Port:** `PORT` from the environment (most hosts set it), else 5000.
- **Working directory:** `backend/`, because `/uploads` is served from `./uploads` and `dotenv` reads `./.env` (a host's own environment variables work without the file).
- **Environment variables:** `DATABASE`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `IMAGEKIT_PRIVATE_KEY`, `EMAIL_USER`, `EMAIL_PASSWORD`, and `NODE_ENV=production` (it hides stack traces in error pages). What each does: [variables.md](variables.md#api-env-keys-backendenv).
- **CORS:** the site's origins are hardcoded in `backend/app.js`. A new domain, or the API called from anywhere else, needs a code change and a redeploy of the API.
- **The admin:** run `node createAdmin.js` once on the host (or anywhere with production's `DATABASE`), with `ADMIN_USERNAME` and `ADMIN_PASSWORD` set.
- **The menu:** production's database is edited in the admin. Don't run `seedFood.js` against it: it re-adds every `menu.json` dish the pub has deleted.
- **Files:** nothing the API writes needs the disk; photos go to ImageKit. `backend/uploads/` must be deployed with the code for the five old photos.
- **Logs:** `console.log` only. Every login attempt logs the admin document, password hash included ([known-issues.md](known-issues.md#security)).

## Other services

| Service | Used for | Notes |
|---|---|---|
| MongoDB | the menu and the admins | host ASK; `DATABASE` |
| ImageKit | dish photos, folder `/burger-pub/food` | `IMAGEKIT_PRIVATE_KEY`; account owner ASK. Photos are deleted from it when replaced or when their dish is deleted |
| Gmail | the contact form and the reservation requests | `EMAIL_USER` and an app password in `EMAIL_PASSWORD`; Gmail limits how much one account sends a day |
| Google Maps | the map on the contact page, and the directions links | an embed URL, no API key. The map loads only after the visitor clicks "Karte laden" |

## Maintenance mode

`src/App.jsx` has `const maintenance = false;`. Set to `true`, the app renders only `src/pages/Maintenance.jsx` (the logo, "BURGER PUB MÜNCHEN", "Unsere Website wird derzeit aktualisiert.", "Wir sind bald wieder für euch da! 🍔"), **before the router**, so every path shows it: `/menu`, `/contact`, and **`/admin-login` and `/admin` too**.

- **History:** on from 2026-10-03 (`17c2520`) and switched off on `main` on 2026-11-23 (`235c65b`, by the colleague who built the app). On `main` the check is commented out rather than set to `false`.
- **Switching it on:** set `true` and push to `main`; Vercel deploys it. While it's on, the production admin can't be opened either.
- **Rolling back a bad deploy:** promote the previous deployment in Vercel, or revert the commit and push.

## Putting a change live

1. `npm run test:all` passes locally ([testing.md](testing.md)).
2. The API answers at `VITE_API_URL` (`/api/test`), and production's menu is what the pub expects (`/api/food`).
3. Push to `main` (ask first: see the rules in `CLAUDE.md`); Vercel deploys it.
4. Check `/`, `/menu`, `/contact`, `/admin-login`, and a path that doesn't exist. Sending the contact or reservation form reaches the pub: only by agreement.

## Domains

`burgerpubmunchen.de` and `www.burgerpubmunchen.de` point at Vercel (they're in the API's CORS list). Registrar and DNS: ASK. The API's own domain: ASK.
