# Known issues

Current behaviour that surprises people, bugs found and not fixed, risks, and stale things. Found by reading the code on 2026-11-23; none is fixed yet. **Check that an entry still holds before relying on it, and delete it in the same change that fixes it.**

## Security

- **Every login attempt logs the admin's document, password hash included.** `backend/controllers/authController.js` prints `USERNAME IZ FORME` and `ADMIN PRONAĐEN` with the document fetched with `+password`, so the bcrypt hash ends up in production's logs on every login.
- **No rate limit on login.** `POST /api/auth/login` takes unlimited guesses; the only defence is bcrypt's cost.
- **The contact form and the reservation request are open mail relays to the pub.** `POST /api/contact` and `POST /api/reservations` each send one Gmail message per request, with no rate limit, captcha or honeypot, so a script can flood the pub's inbox and use up the Gmail account's daily sending limit.
- **Reservation and contact messages aren't kept.** They're only emailed; if Gmail fails, the message is gone (the visitor sees an error, the reservation form with the pub's phone number).
- **The contact email's HTML isn't escaped.** `name`, `email` and `message` are put into the email's HTML as given, so a visitor can inject markup and links into the mail the pub reads. `name` also goes into the subject unchecked.
- **The admin's token lives in `localStorage`**, where any script on the site can read it. There's no third-party script today; an XSS bug would expose the token.
- **Error responses leak internals.** Most 500s and 400s return the raw exception text (`message: err.message`), and Express's HTML error pages include the stack trace unless `NODE_ENV=production` (unknown on the host: ASK).
- **Uploads have no size limit** and are held in memory (`multer.memoryStorage()`), so a very large upload can exhaust the API's memory. Only an admin can upload.
- **The writes take the whole request body.** `Category.create(req.body)`, `Food.create(req.body)` and the `findByIdAndUpdate(req.body)` calls save any field sent, `imageFileId` and `order` included. Only an admin can write.
- **No security headers** (no `helmet`) on the API.

## API

- **A refused CORS origin gets a 500 with an HTML page**, not a 403: the origin callback raises an error and there's no error handler. The same HTML 500 comes back for a non-image upload ("Možete uploadati samo slike"), and an HTML 400 for malformed JSON.
- **MongoDB is connected once, at startup, without retrying,** and the server listens even if it fails. After a failed connect every database call waits 10 s and answers 500 "buffering timed out"; the API has to be restarted.
- **The API doesn't start without `IMAGEKIT_PRIVATE_KEY`,** even though only photo uploads need it: the ImageKit client is created when `foodController.js` loads.
- **A failed save leaves its photo on ImageKit.** The photo is uploaded before the dish is created or updated; if the save then fails (a missing name, a price that isn't a number), the uploaded file stays in `/burger-pub/food` with nothing pointing at it.
- **`PATCH /api/categories/:id` answers 200 with `"category": null`** for an id that doesn't exist (no 404).
- **`protect` accepts any header starting with `Bearer`**, so `Bearerxyz` reaches `jwt.verify` (which then refuses it); harmless.
- **No 404 handler and no error handler;** unknown paths get Express's HTML "Cannot GET".
- **`backend/package.json` has no `start` script, and `"main": "index.js"` names a file that doesn't exist.**
- **Changing an admin's password doesn't revoke their tokens:** the old ones work until they expire (`JWT_EXPIRES_IN`). Only deleting the admin, or changing `JWT_SECRET`, refuses them.

## Admin

- **New dishes sort first after a reload.** The admin doesn't send `order`, so a new dish gets 0, before the seeded dishes (1, 2, …); the admin shows it at the end until the page reloads. There's no way to reorder dishes or categories in the UI.
- **An expired token still opens the admin.** `ProtectedRoute` only checks that a token exists; every change then fails with "Nevažeći ili istekli token" in an `alert`, and nothing logs the user out.
- **Errors are `alert()`s**, often with raw MongoDB text (a duplicate category slug shows `E11000 duplicate key error …`).
- **Two categories whose names differ only in `&` or spacing get the same slug** and the second is refused with that duplicate-key error.
- **The photo preview's object URL is never released** (`URL.createObjectURL` without `revokeObjectURL`); a small memory leak per preview.
- **Category names can't be edited** in the UI, although `PATCH /api/categories/:id` exists.
- **The admin is unreachable in production while maintenance mode is on** ([hosting-and-deployment.md](hosting-and-deployment.md#maintenance-mode)).

## Site

- **Tailwind's margin and padding classes do nothing, anywhere.** `src/App.css` has `* { margin: 0; padding: 0; box-sizing: border-box; }` outside any `@layer`; in Tailwind 4 an unlayered rule beats every utility (they're in `@layer utilities`), whatever their specificity. So `ml-5`, `lg:ml-[10rem]`, `px-5`, `py-3`, `mt-8`, `pt-14` … are dead: the hero headline never indents on desktop, the forms' fields have no inner padding, sections touch the screen edges. Spacing that works comes from `gap-*`, widths and heights, `translate-*`, and the important modifier (`px-4!`, which beats the reset). The reset is redundant (Tailwind's preflight already does all three, in `@layer base`), but deleting it would switch every written margin and padding on and change the look of every page; the developer chose to keep it for now (2026-11-23). The contact and reservation forms use `!` on their own spacing classes, so they look as written.
- **On phones the home page is exactly one screen and doesn't scroll** (`h-screen` with `overflow-hidden` in `src/Home.jsx`), so on short phones the bottom section ("Mehr. als nur. BURGER." and its paragraph) is cut off.
- **The menu fails silently.** If the API doesn't answer, `/menu` shows nothing below the title, with no message for the visitor (only `MENU ERROR` in the console). The same happens when the API answers with an error: `data.food` is missing, reading it throws, and the catch hides it.
- **Unknown paths are blank:** there's no 404 page.
- **The home page's carousel is static** (`burgers.json`), so the dishes on it can't be changed in the admin, and its names ("Classic Burger", "BBQ Burger") don't match the menu's ("CLASSIC BEEF BURGER", "BBQ BEEF BURGER").
- **The contact page's email isn't a link** (`mailto:`), unlike the phone and Instagram.
- **`index.html` says `lang="en"`** on a German site, and the maintenance page says "Munich" while the title says "München".
- **Images without `alt`:** the logo (`Logo.jsx`) and the hero (`Backgroundpicture.jsx`); the location icon's alt is Croatian ("Lokacija").
- **Opening hours aren't shown** anywhere ([architecture.md](architecture.md#open-decisions)).
- **The four Google Fonts are loaded with four separate `@import`s** in `src/App.css`, which delays the CSS; one combined request (or `<link>` tags in `index.html`) is faster.
- **The address is written three times** with three different Maps URLs (`IconsPage.jsx`, `ContactInfo.jsx`, `ContactMap.jsx`).

## Tooling

- **`npm run lint` fails with 86 errors**: 85 come from linting `backend/` (CommonJS for Node) with browser globals in `eslint.config.js`; the fix is a separate config block for `backend/**` with `globals.node` and `sourceType: "commonjs"`. The 86th is a real one ([testing.md](testing.md#the-lint)).
- **The root `package.json` lists `bcryptjs` and `jsonwebtoken`,** which only the API uses (it has its own copies). They aren't bundled into the site, since nothing in `src/` imports them.
- **No `engines`, no `.nvmrc`:** the Node version isn't pinned anywhere. Vite 8 and Mongoose 9 need Node 20.19 or newer.
- **`README.md` was the Vite template's** until these docs; it now points here.
- **`backend-production.zip`** (4.7 MB, code and `node_modules`, no secrets) was committed on 2026-09-24 and removed the next commit; it stays in git history and in every clone.

## Dead code and files

The unused components and `public/` files are listed in [architecture.md](architecture.md#dead-code). In short: the old static menu sections (`BeefBurger.jsx` … `Dips.jsx`), `HamburgerMenu.jsx` (imports two files that don't exist), `HamburgerMenuOptions.jsx`, `OpenMenu.jsx` (would crash), 18 unused images in `public/`, and the `.reservation` and `.allside-padding` classes in `src/App.css`.
