# Known issues

Current behaviour that surprises people, bugs found and not fixed, risks, and stale things. Checked against the code on 2026-11-24. **Check that an entry still holds before relying on it, and delete it in the same change that fixes it.** Several are pinned by tests marked "current behaviour" ([testing.md](testing.md)): a fix changes those tests too.

## Security

- **Every login attempt logs the admin's document, password hash included.** `backend/controllers/authController.js` prints `USERNAME IZ FORME` and `ADMIN PRONAĐEN` with the document fetched with `+password`, so the bcrypt hash ends up in production's logs on every login.
- **No rate limit on login.** `POST /api/auth/login` takes unlimited guesses; the only defence is bcrypt's cost.
- **The contact form and the reservation request are open mail relays to the pub.** `POST /api/contact` and `POST /api/reservations` each send one Gmail message per request, with no rate limit, captcha or honeypot, so a script can flood the pub's inbox and use up the Gmail account's daily sending limit.
- **Reservation and contact messages aren't kept.** They're only emailed; if Gmail fails, the message is gone (the visitor sees an error with the pub's phone number).
- **The contact email's HTML isn't escaped.** `name`, `email` and `message` are put into the email's HTML as given, so a visitor can inject markup and links into the mail the pub reads. `name` also goes into the subject unchecked.
- **The admin's token lives in `localStorage`**, where any script on the site can read it. There's no third-party script today; an XSS bug would expose the token.
- **Error responses leak internals.** Most 500s and 400s return the raw exception text (`message: err.message`), and Express's HTML error pages include the stack trace unless `NODE_ENV=production` (unknown on the host: ASK).
- **Uploads have no size limit on the API** and are held in memory (`multer.memoryStorage()`), so a very large upload can exhaust the API's memory. Only an admin can upload, and the admin's form refuses files over 10 MB, but a direct request isn't limited.
- **The writes take the whole request body.** `Category.create(req.body)`, `Food.create(req.body)` and the `findByIdAndUpdate(req.body)` calls save any field sent, `imageFileId` and `order` included. Only an admin can write.
- **No security headers** (no `helmet`) on the API.

## API

- **A refused CORS origin gets a 500 with an HTML page**, not a 403: the origin callback raises an error and there's no error handler. The same HTML 500 comes back for a non-image upload ("Možete uploadati samo slike"), and an HTML 400 for malformed JSON.
- **A request without a JSON body crashes two handlers.** Express 5 leaves `req.body` undefined then, and only the reservation controller guards against it (`req.body || {}`). Login answers 500 `Cannot destructure property 'username' of 'req.body' as it is undefined.`; the contact form answers 500 "Nachricht konnte nicht gesendet werden." instead of a 400.
- **MongoDB is connected once, at startup, without retrying,** and the server listens even if it fails. After a failed connect every database call waits 10 s and answers 500 "buffering timed out"; the API has to be restarted.
- **The API doesn't start without `IMAGEKIT_PRIVATE_KEY`,** even though only photo uploads need it: the ImageKit client is created when `foodController.js` loads.
- **`/uploads` and `.env` are found from the working directory**, not from `backend/`: started from anywhere else, the API serves no old photos and reads no `.env`.
- **A failed save leaves its photo on ImageKit.** The photo is uploaded before the dish is created or updated; if the save then fails (a missing name, a price that isn't a number), the uploaded file stays in `/burger-pub/food` with nothing pointing at it.
- **`PATCH /api/categories/:id` answers 200 with `"category": null`** for an id that doesn't exist (no 404).
- **`protect` reads the token as whatever follows the first space** of a header that starts with `Bearer`. `Bearer` alone and `Bearerxyz` have no token and answer 401 "Niste prijavljeni"; only a header like `Bearerx abc` reaches `jwt.verify` (which refuses it). Harmless.
- **No 404 handler and no error handler;** unknown paths get Express's HTML "Cannot GET".
- **`backend/package.json`'s `"main": "index.js"`** names a file that doesn't exist (start with `npm start` or `node server.js`).
- **Changing an admin's password doesn't revoke their tokens:** the old ones work until they expire (`JWT_EXPIRES_IN`). Only deleting the admin, or changing `JWT_SECRET`, refuses them.

## Admin

- **Dishes can't be reordered in the UI.** A new dish goes last in its category; to move one, the API's `PATCH /api/food/:id` with `order` is the only way.
- **Moving a category can be saved halfway.** A move sends one `PATCH` per category whose `order` changes, in parallel; if one fails, the admin shows an error toast and keeps the old order on screen, while the database may hold some of the new numbers (two categories can end up with the same `order`). Reloading shows what was saved.

## Site

- **There's no Impressum and no Datenschutz page**, which a German business website must have (§ 5 DDG; the GDPR's information duties, which the contact and reservation forms and the Google map make relevant). Their content needs the owner's details: ASK.
- **Opening hours aren't shown** anywhere, on purpose until the real hours are known ([architecture.md](architecture.md#decisions)).
- **Unknown paths answer HTTP 200 on Vercel** (the rewrite to `index.html`); the 404 page exists only in the browser, with a `noindex` meta tag.
- **The PNG originals in `public/` are unused and still deployed**, with the other unused files ([architecture.md](architecture.md#unused-files)).
- **The favourites' fallback (`burgers.json`) has its own names** ("Classic Burger", "BBQ Burger"), not the menu's ("CLASSIC BEEF BURGER"); it only shows when the API fails.

## Tooling

- **The root `package.json` lists `bcryptjs` and `jsonwebtoken`,** which only the API uses (it has its own copies). They aren't bundled into the site, since nothing in `src/` imports them.
- **No `engines`, no `.nvmrc`:** the Node version isn't pinned anywhere. Vite 8 and Mongoose 9 need Node 20.19 or newer.
- **No CI:** nothing runs the tests on a push; run `npm run test:all` before pushing ([testing.md](testing.md)).
- **`backend-production.zip`** (4.7 MB, code and `node_modules`, no secrets) was committed on 2026-09-24 and removed the next commit; it stays in git history and in every clone.
