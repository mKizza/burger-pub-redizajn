# Hosting and deployment

Where Burger Pub runs, what each part needs there, and how to launch. The values are in [variables.md](variables.md); local development is in [local-development.md](local-development.md).

## Where it stands

- **The site is on Vercel**, at https://burgerpubmunchen.de, https://www.burgerpubmunchen.de and https://burger-pub-redizajn.vercel.app.
- **It shows only the maintenance page**, on purpose, until launch ([Maintenance mode](#maintenance-mode)).
- **The API and its MongoDB run somewhere nobody has written down:** ASK ([variables.md](variables.md#to-fill-in-ask)). Everything below about the API is what the code needs from any host.
- There's no staging environment, no CI, and no tests.

## The site (Vercel)

- **Build:** Vercel's Vite preset: `npm install`, `vite build` (`npm run build`), output `dist/`. Nothing in the repo overrides it.
- **Deploy:** a push to `main`; the commit "Trigger production deployment with API URL" (2026-09-25) was pushed for that reason. Other branches get preview deployments, whose calls to the API fail: their addresses aren't in its CORS list.
- **Routing:** `vercel.json` rewrites every path to `/index.html`, so `/menu` or `/admin` opened directly (or reloaded) loads the app instead of a 404.
- **Environment variable:** `VITE_API_URL`, the API's origin without `/api`. Vite bakes it into the build: after changing it, redeploy.
- **Static files:** everything in `public/` is deployed as is, at `/`: the logo, the backgrounds and the seeded dishes' photos (`/burgers-images/…`), which the API's data points at. Renaming or deleting one breaks the dishes that use it.

## The API

What any host needs:

- **Node 20.19 or newer** (Mongoose 9).
- **Install:** `npm ci` in `backend/`.
- **Start:** `node server.js`, from `backend/`. There's no `start` script and `"main"` names a file that doesn't exist (`index.js`), so a host that runs `npm start` or the `main` file needs the command set by hand.
- **Port:** `PORT` from the environment (most hosts set it), else 5000.
- **Working directory:** `backend/`, because `/uploads` is served from `./uploads` and `dotenv` reads `./.env` (a host's own environment variables work without the file).
- **Environment variables:** `DATABASE`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `IMAGEKIT_PRIVATE_KEY`, `EMAIL_USER`, `EMAIL_PASSWORD`, and `NODE_ENV=production` (it hides stack traces in error pages). What each does: [variables.md](variables.md#api-env-keys-backendenv).
- **CORS:** the site's origins are hardcoded in `backend/server.js`. A new domain, or the API called from anywhere else, needs a code change and a redeploy of the API.
- **The admin:** run `node createAdmin.js` once on the host (or anywhere with production's `DATABASE`), with `ADMIN_USERNAME` and `ADMIN_PASSWORD` set.
- **The menu:** production's database is edited in the admin. Don't run `seedFood.js` against it: it re-adds every `menu.json` dish the pub has deleted.
- **Files:** nothing the API writes needs the disk; photos go to ImageKit. `backend/uploads/` must be deployed with the code for the five old photos.
- **Logs:** `console.log` only. Every login attempt logs the admin document, password hash included ([known-issues.md](known-issues.md#security)).

## Other services

| Service | Used for | Notes |
|---|---|---|
| MongoDB | the menu and the admins | host ASK; `DATABASE` |
| ImageKit | dish photos, folder `/burger-pub/food` | `IMAGEKIT_PRIVATE_KEY`; account owner ASK. Photos are deleted from it when replaced or when their dish is deleted |
| Gmail | the contact form | `EMAIL_USER` and an app password in `EMAIL_PASSWORD`; Gmail limits how much one account sends a day |
| Google Maps | the map and directions links on the contact page | an embed URL, no API key |
| Google Fonts | Anton, Oswald, Caveat, Montserrat | `@import` in `src/App.css` |

## Maintenance mode

`src/App.jsx` starts with `const maintenance = true;`. While it's `true` the app renders only a black page ("Burger Pub Munich", "Unsere Website wird derzeit aktualisiert.", "Wir sind bald wieder für euch da! 🍔"), **before the router**, so every path shows it: `/menu`, `/contact`, and **`/admin-login` and `/admin` too**. It has been on since 2026-10-03 (`17c2520`), intended until launch (the developer, 2026-11-23).

- **Preparing the menu before launch:** the production admin can't be opened while maintenance is on. The menu can only be changed through the API directly (`curl` with a token, [api-contract.md](api-contract.md#calling-it-by-hand)), or by switching the admin out of the maintenance check first.
- **Launch:**
  1. Check the API answers at `VITE_API_URL` (`/api/test`) and production's menu is right (`/api/food`).
  2. Set `const maintenance = false;` in `src/App.jsx` and push to `main`; Vercel deploys it.
  3. Check `/`, `/menu`, `/contact` (send a test message: it reaches the pub), and `/admin-login`.
- **Rolling back:** set it to `true` again and push, or promote the previous deployment in Vercel.

## Domains

`burgerpubmunchen.de` and `www.burgerpubmunchen.de` point at Vercel (they're in the API's CORS list). Registrar and DNS: ASK. The API's own domain: ASK.
