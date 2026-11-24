# Local development

How the app runs day to day, and what goes wrong. First-time setup is in [onboarding.md](onboarding.md); values are in [variables.md](variables.md); the tests are in [testing.md](testing.md).

## What runs where

| Piece | How it runs | Address |
|---|---|---|
| Site | `npm run dev` in the repo root | `http://localhost:5173` |
| API | `npm start` (`node server.js`) in `backend/`; no watch mode in the repo (`node --watch server.js` restarts on changes) | `http://localhost:5000` (`PORT`) |
| MongoDB | your server | `DATABASE` in `backend/.env` |
| Dish photos | ImageKit (needs a real key), or the files in `public/` for the seeded dishes | |
| Contact and reservation mail | Gmail, to the pub's real inbox (don't, locally) | |
| Tests | their own servers and databases ([testing.md](testing.md)) | the end-to-end suite on 5660–5662 |

In dev the site calls the API at `http://localhost:5000`, hardcoded in `src/config.js`; a production build calls `VITE_API_URL` instead. Nothing else connects the two.

## Ports

- **5000 on macOS** belongs to the AirPlay Receiver. The API then dies at startup with `EADDRINUSE`. Turn it off (System Settings → General → AirDrop & Handoff → AirPlay Receiver), or run the API on another `PORT`; but the site still calls 5000 in dev, so another port also needs `src/config.js` changed locally (don't commit it) or a dev proxy.
- **5173** is the only dev origin in the API's CORS list (`backend/app.js`). If Vite moves to 5174 because 5173 is taken, every call from the site fails with a CORS error. Free 5173, or start Vite with `--port 5173 --strictPort` to get an error instead of a silent move.
- CORS is checked on the `Origin` header only: `curl` and anything else without one is always allowed. A refused origin gets a **500** with an HTML error page, not a 403 ([known-issues.md](known-issues.md#api)).
- **5660, 5661 and 5662** must be free for `npm run test:e2e`: it starts a production build, an API and an in-memory MongoDB there, and doesn't reuse anything already listening. The dev servers on 5173 and 5000 don't get in its way.

## The site

- **Maintenance mode is off** (`const maintenance = false;` in `src/App.jsx`). Set it to `true` to see the maintenance page; every path then shows it, `/admin-login` included ([hosting-and-deployment.md](hosting-and-deployment.md#maintenance-mode)).
- **The menu page and the home page's favourites need the API and MongoDB.** Both read `/api/food` and `/api/categories` through one cache. If the API fails, `/menu` says "Das Menü konnte nicht geladen werden." with "Erneut versuchen", the favourites fall back to `burgers.json`, and the console logs `MENU ERROR`.
- **The menu is cached in the tab for 5 minutes** (`src/lib/api.js`). Changes made in the admin clear it; after changing data any other way (`mongosh`, `curl`, the seed), reload the page.
- **Unknown paths show the 404 page.**
- **The map on `/contact` loads only after "Karte laden"**; until then nothing is requested from Google.
- **The React Compiler is on** (`babel-plugin-react-compiler` through `@rolldown/plugin-babel` in `vite.config.js`): components are memoized automatically, so hand-written `useMemo` / `useCallback` aren't needed. It also makes dev builds slower.
- **Tailwind 4** is configured in CSS (`src/App.css`, the `@theme` block with the design tokens), not in a `tailwind.config.js`. The fonts come from `@fontsource` packages, not from Google.

## The admin

- `http://localhost:5173/admin-login`, with your `ADMIN_USERNAME` / `ADMIN_PASSWORD` (`node createAdmin.js` in `backend/` makes it).
- The token is kept in `localStorage` under `token`. `/admin` opens only while the token's expiry (`JWT_EXPIRES_IN`) hasn't passed. When the API refuses the token anyway (the admin was deleted, `JWT_SECRET` changed), the admin logs out and the login says "Sesija je istekla. Prijavite se ponovno.".
- Changes in the admin show on `/menu` right away (the admin also clears the menu cache after each write); "Pogledaj stranicu" opens it in a new tab.

## The API

- **Run it from `backend/`.** `dotenv` reads `.env` from the working directory, and `/uploads` is served from `./uploads`.
- **It doesn't start without `IMAGEKIT_PRIVATE_KEY`** ("The IMAGEKIT_PRIVATE_KEY environment variable is missing or empty"). A placeholder is enough to start.
- **It connects to MongoDB once, at startup, and never retries.** If MongoDB wasn't up, the API keeps running and logs "Greška pri spajanju na MongoDB"; every request that needs the database then waits 10 seconds and fails. Start MongoDB first, then restart the API.
- **Login needs `JWT_SECRET` and `JWT_EXPIRES_IN`.** Without either, `POST /api/auth/login` answers 500 with jsonwebtoken's message.
- **Every login attempt is logged** with the username and the admin document, password hash included ([known-issues.md](known-issues.md#security)).
- **Logs** go to the terminal only (`console.log`).

## Photos

- The admin uploads a photo to ImageKit (folder `/burger-pub/food`) and stores its URL and file id on the dish. Replacing a photo deletes the old one from ImageKit; deleting a dish deletes its photo.
- With a placeholder key, adding or replacing a photo fails (the dish dialog shows ImageKit's error); dishes without a photo, and every other field, work.
- The seeded dishes point at files in `public/burgers-images/` (`/burgers-images/food-2.JPG`), served by the site, not the API. Deleting such a dish touches nothing on ImageKit.
- `backend/uploads/` holds five photos from before ImageKit, served at `/uploads/…`; the site prefixes such paths with the API's address ([data-model.md](data-model.md#photos)).

## The contact form

`POST /api/contact` and `POST /api/reservations` each build a Gmail transport (`EMAIL_USER`, `EMAIL_PASSWORD`) on every message and send it to `burgerpubmunchen@gmail.com`, the pub's inbox; the recipient is fixed in `backend/controllers/contactController.js` and `reservationController.js`. Everything below holds for both. Locally:

- **Without credentials** the contact form shows "Nachricht konnte nicht gesendet werden.", the reservation form "Anfrage konnte nicht gesendet werden.", both with the pub's phone number, and the API logs `EMAIL ERROR` or `RESERVATION ERROR`. That's the safe default.
- **With real Gmail credentials** every test message reaches the pub. Don't.
- To see the mail, point nodemailer at a local mail catcher **in your working tree only**, for example a transport of `{ host: "127.0.0.1", port: 1025 }`, and don't commit it.
- The tests don't need any of this: they replace the mail transport with a fake and check what would have been sent ([testing.md](testing.md)).

## MongoDB

- Database name: whatever `DATABASE` names (the docs use `burgerpub`). Collections: `admins`, `categories`, `foods` ([data-model.md](data-model.md)).
- `mongosh "$DATABASE"` (or your URL) to look: `db.foods.find({}, {name: 1, price: 1, order: 1})`.
- Starting over: drop the database, then run the seed scripts and `createAdmin.js` again.
- The tests never use it: they run their own MongoDB in memory.

## Working with Claude locally

- **Don't let Claude manage long-running servers** unless it starts them as background tasks: a server it starts dies with that task.
- **Claude must never kill processes by name or port**: that can hit other projects on the machine.
- **The rules Claude follows** are at the top of [CLAUDE.md](../CLAUDE.md).

## Common problems

| Symptom | Cause | Fix |
|---|---|---|
| `Error: listen EADDRINUSE: address already in use :::5000` | macOS's AirPlay Receiver has 5000 | Turn it off, or another `PORT` (then see [Ports](#ports)) |
| API exits at once: "The IMAGEKIT_PRIVATE_KEY environment variable is missing or empty" | No key in `backend/.env`, or the API isn't run from `backend/` | Set a placeholder; `cd backend` first |
| Every page is "Unsere Website wird derzeit aktualisiert" | `const maintenance = true;` in `src/App.jsx` | Set it to `false` |
| `/menu` says "Das Menü konnte nicht geladen werden." | The API or MongoDB isn't answering; the console says `MENU ERROR` | Check `curl http://localhost:5000/api/categories` |
| A change made in `mongosh` doesn't show on `/menu` | The menu is cached in the tab for 5 minutes | Reload the page |
| Requests hang ~10 s, then 500 "buffering timed out" | The API started before MongoDB | Start MongoDB, restart the API |
| The browser console says CORS, the API answers 500 | The site isn't on `http://localhost:5173` | Run Vite on 5173 |
| Login: "Pogrešno korisničko ime ili lozinka" | No admin with that username | `node createAdmin.js` in `backend/` |
| Login answers 500 `"expiresIn" should be a number of seconds…` | `JWT_EXPIRES_IN` missing | Set it (`7d`) and restart the API |
| Admin: back on the login with "Sesija je istekla. Prijavite se ponovno." | The token expired, or the API refused it | Log in again |
| Admin: adding a photo fails | Placeholder ImageKit key | Expected locally; save without a photo |
| Contact form: "Nachricht konnte nicht gesendet werden." | No Gmail credentials | Expected locally ([The contact form](#the-contact-form)) |
| Browser or e2e tests: "Executable doesn't exist" | Playwright's Chromium isn't installed | `npx playwright install chromium` |
| `npm run test:e2e` fails before any test runs, the port is in use | Something already listens on 5660, 5661 or 5662 (another e2e run?) | Free the port, or wait for that run to end |
