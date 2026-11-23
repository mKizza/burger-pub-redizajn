# Local development

How the app runs day to day, and what goes wrong. First-time setup is in [onboarding.md](onboarding.md); values are in [variables.md](variables.md).

## What runs where

| Piece | How it runs | Address |
|---|---|---|
| Site | `npm run dev` in the repo root | `http://localhost:5173` |
| API | `node server.js` in `backend/` (no watch mode in the repo; `node --watch server.js` restarts on changes) | `http://localhost:5000` (`PORT`) |
| MongoDB | your server | `DATABASE` in `backend/.env` |
| Dish photos | ImageKit (needs a real key), or the files in `public/` for the seeded dishes | |
| Contact-form mail | Gmail, to the pub's real inbox (don't, locally) | |

In dev the site calls the API at `http://localhost:5000`, hardcoded in `src/config.js`; a production build calls `VITE_API_URL` instead. Nothing else connects the two.

## Ports

- **5000 on macOS** belongs to the AirPlay Receiver. The API then dies at startup with `EADDRINUSE`. Turn it off (System Settings → General → AirDrop & Handoff → AirPlay Receiver), or run the API on another `PORT`; but the site still calls 5000 in dev, so another port also needs `src/config.js` changed locally (don't commit it) or a dev proxy.
- **5173** is the only dev origin in the API's CORS list (`backend/server.js`). If Vite moves to 5174 because 5173 is taken, every call from the site fails with a CORS error. Free 5173, or start Vite with `--port 5173 --strictPort` to get an error instead of a silent move.
- CORS is checked on the `Origin` header only: `curl` and anything else without one is always allowed. A refused origin gets a **500** with an HTML error page, not a 403 ([known-issues.md](known-issues.md#api)).

## The site

- **The maintenance page is the default.** `src/App.jsx` returns it before the router when `const maintenance = true`, so every path shows it, `/admin-login` included. Flip it to `false` locally to work on the site, and keep that line out of your commits.
- **The menu page needs the API and MongoDB.** `/menu` fetches `/api/food` and `/api/categories` together. If either fails, the page logs `MENU ERROR` in the browser console and shows nothing below the title: no message for the visitor.
- **The home page doesn't use the API.** Its carousel ("Unsere Favoriten") is `burgers.json`, five fixed names and photos from `public/burgers-images/`.
- **Unknown paths render a blank black page**: there is no 404 route.
- **The React Compiler is on** (`babel-plugin-react-compiler` through `@rolldown/plugin-babel` in `vite.config.js`): components are memoized automatically, so hand-written `useMemo` / `useCallback` aren't needed. It also makes dev builds slower.
- **Tailwind 4** is configured in CSS (`src/App.css`, the `@theme` block), not in a `tailwind.config.js`.

## The admin

- `http://localhost:5173/admin-login`, with your `ADMIN_USERNAME` / `ADMIN_PASSWORD` (`node createAdmin.js` in `backend/` makes it).
- The token is kept in `localStorage` under `token`. `/admin` only checks that it exists, not that it's valid: after it expires (`JWT_EXPIRES_IN`) the admin still opens, and every change fails with "Nevažeći ili istekli token". Log out (ODJAVA) and in again.
- A new dish gets `order` 0, so after a reload it sorts **first** in its category, while the admin shows it last until then ([known-issues.md](known-issues.md#admin)).

## The API

- **Run it from `backend/`.** `dotenv` reads `.env` from the working directory, and `/uploads` is served from `./uploads`.
- **It doesn't start without `IMAGEKIT_PRIVATE_KEY`** ("The IMAGEKIT_PRIVATE_KEY environment variable is missing or empty"). A placeholder is enough to start.
- **It connects to MongoDB once, at startup, and never retries.** If MongoDB wasn't up, the API keeps running and logs "Greška pri spajanju na MongoDB"; every request that needs the database then waits 10 seconds and fails. Start MongoDB first, then restart the API.
- **Login needs `JWT_SECRET` and `JWT_EXPIRES_IN`.** Without either, `POST /api/auth/login` answers 500 with jsonwebtoken's message.
- **Every login attempt is logged** with the username and the admin document, password hash included ([known-issues.md](known-issues.md#security)).
- **Logs** go to the terminal only (`console.log`).

## Photos

- The admin uploads a photo to ImageKit (folder `/burger-pub/food`) and stores its URL and file id on the dish. Replacing a photo deletes the old one from ImageKit; deleting a dish deletes its photo.
- With a placeholder key, adding or replacing a photo fails (the admin shows ImageKit's error in an alert); dishes without a photo, and every other field, work.
- The seeded dishes point at files in `public/burgers-images/` (`/burgers-images/food-2.JPG`), served by the site, not the API. Deleting such a dish touches nothing on ImageKit.
- `backend/uploads/` holds five photos from before ImageKit, served at `/uploads/…`; the site prefixes such paths with the API's address ([data-model.md](data-model.md#photos)).

## The contact form

`POST /api/contact` and `POST /api/reservations` each build a Gmail transport (`EMAIL_USER`, `EMAIL_PASSWORD`) on every message and send it to `burgerpubmunchen@gmail.com`, the pub's inbox; the recipient is fixed in `backend/controllers/contactController.js` and `reservationController.js`. Everything below holds for both. Locally:

- **Without credentials** the form answers "Nachricht konnte nicht gesendet werden." and the API logs `EMAIL ERROR`. That's the safe default.
- **With real Gmail credentials** every test message reaches the pub. Don't.
- To see the mail, point nodemailer at a local mail catcher (Mailpit, MailHog) **in your working tree only**, for example a transport of `{ host: "127.0.0.1", port: 1025 }`, and don't commit it.

## MongoDB

- Database name: whatever `DATABASE` names (the docs use `burgerpub`). Collections: `admins`, `categories`, `foods` ([data-model.md](data-model.md)).
- `mongosh "$DATABASE"` (or your URL) to look: `db.foods.find({}, {name: 1, price: 1, order: 1})`.
- Starting over: drop the database, then run the seed scripts and `createAdmin.js` again.

## Working with Claude locally

- **Don't let Claude manage long-running servers** unless it starts them as background tasks: a server it starts dies with that task.
- **Claude must never kill processes by name or port**: that can hit other projects on the machine.
- **The rules Claude follows** are at the top of [CLAUDE.md](../CLAUDE.md).

## Common problems

| Symptom | Cause | Fix |
|---|---|---|
| `Error: listen EADDRINUSE: address already in use :::5000` | macOS's AirPlay Receiver has 5000 | Turn it off, or another `PORT` (then see [Ports](#ports)) |
| API exits at once: "The IMAGEKIT_PRIVATE_KEY environment variable is missing or empty" | No key in `backend/.env`, or the API isn't run from `backend/` | Set a placeholder; `cd backend` first |
| Every page is "Unsere Website wird derzeit aktualisiert" | Maintenance mode, as committed | `const maintenance = false;` locally, uncommitted |
| `/menu` stays empty below the title | The API or MongoDB isn't answering; the console says `MENU ERROR` | Check `curl http://localhost:5000/api/categories` |
| Requests hang ~10 s, then 500 "buffering timed out" | The API started before MongoDB | Start MongoDB, restart the API |
| The browser console says CORS, the API answers 500 | The site isn't on `http://localhost:5173` | Run Vite on 5173 |
| Login: "Pogrešno korisničko ime ili lozinka" | No admin with that username | `node createAdmin.js` in `backend/` |
| Login answers 500 `"expiresIn" should be a number of seconds…` | `JWT_EXPIRES_IN` missing | Set it (`7d`) and restart the API |
| Admin: every change fails with "Nevažeći ili istekli token" | The token expired | ODJAVA, then log in again |
| Admin: adding a photo fails | Placeholder ImageKit key | Expected locally; save without a photo |
| Contact form: "Nachricht konnte nicht gesendet werden." | No Gmail credentials | Expected locally ([The contact form](#the-contact-form)) |
| `npm run lint` shows 86 errors | It lints `backend/` with browser globals | `npx eslint src` ([testing.md](testing.md)) |
