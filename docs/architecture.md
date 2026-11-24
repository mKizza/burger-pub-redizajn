# Architecture

How the pieces fit together, and what isn't decided yet. The endpoints are in [api-contract.md](api-contract.md), the models in [data-model.md](data-model.md), the values in [variables.md](variables.md), the tests in [testing.md](testing.md).

## The big picture

```
Browser ──► Site (React SPA, Vite build on Vercel: burgerpubmunchen.de)
              │  /          home: hero, favourites (from the menu), wall
              │  /menu      dishes by category, search ───────────┐
              │  /contact   details, reservation, map, form ──────┤
              │  /admin-login, /admin   menu admin (lazy) ────────┤ fetch, JSON
              │  anything else          404 page                  ▼
              │                         API (Express 5: backend/app.js, started by server.js)
              │                           ├─ /api/food        dishes (+ photo upload)
              │                           ├─ /api/categories  categories
              │                           ├─ /api/auth/login  admin login → JWT
              │                           ├─ /api/contact     contact form → Gmail
              │                           ├─ /api/reservations  table request → Gmail
              │                           ├─ /api/test        health check
              │                           └─ /uploads/*       old local photos (static)
              │                                │        │           │
              │                            MongoDB   ImageKit     Gmail SMTP
              │                         (Mongoose)  (dish photos)  (→ the pub's inbox)
              ├─ public/  photos, logo, backgrounds (served by the site, not the API)
              └─ Google Maps embed, only after the visitor clicks "Karte laden"
```

- The site is a client-rendered single-page app: `index.html` loads `src/main.jsx`; Vercel rewrites every path to `index.html` (`vercel.json`).
- The site calls the API directly from the browser, at `API_URL` (`src/config.js`): `http://localhost:5000` in dev, `VITE_API_URL` in a production build. The API allows only its listed origins (CORS).
- There are no accounts for visitors. The one kind of user is the admin, who logs in with a username and password and gets a JWT.
- Everything is JavaScript, no TypeScript. The site is ES modules; `backend/` is CommonJS (`require`), with its own `package.json` and `node_modules`.

## Repository layout

```
burger-pub-redizajn/
├── index.html            the SPA shell: lang="de", title, favicon, theme-color, og tags
├── vite.config.js        React, the React Compiler (via @rolldown/plugin-babel), Tailwind
├── vitest.config.js      the site's tests, projects "unit" and "browser" (extends vite.config.js)
├── playwright.config.js  the end-to-end tests
├── vercel.json           rewrite /(.*) → /index.html
├── eslint.config.js      flat config: the site, its tests, e2e/ and configs, backend/ as Node
├── burgers.json          the favourites' fallback when the API fails: 5 names + photos
├── menu.json             the menu before the API: the seed for seedFood.js
├── public/               static files, served at /
├── e2e/                  Playwright specs, support.js, the e2e build's vite.config.js
├── src/                  the site (below)
└── backend/
    ├── app.js            the Express app: CORS, JSON, /uploads, the routers
    ├── server.js         dotenv, the MongoDB connection, listen
    ├── routes/           one router per resource
    ├── controllers/      the handlers (and auth's `protect` middleware)
    ├── models/           Mongoose schemas: Admin, Category, Food
    ├── uploads/          5 photos from before ImageKit, served at /uploads
    ├── seedCategories.js, seedFood.js, createAdmin.js   scripts; they also export their functions
    ├── test/             the API's tests, the fakes, the e2e API server
    └── package.json      npm start, npm test
```

## The site

### `src/`

```
src/
├── main.jsx         renders <App /> in StrictMode, imports App.css
├── App.jsx          the maintenance switch, then createBrowserRouter(routes)
├── routes.jsx       the route table
├── App.css          Tailwind, the fonts, the design tokens
├── config.js        API_URL
├── pages/           one component per route: Home, Menu, Contact, NotFound, Maintenance
│   └── admin/       AdminShell, AdminLogin, Admin, RequireAdmin, lazyPages.js
├── components/
│   ├── layout/      RootLayout, SiteLayout, Header, MobileMenu, Footer, CtaBand, PageHero, WoodBackdrop
│   ├── home/        Hero, Favorites, WallSection
│   ├── menu/        MenuNav, MenuSection, MenuStates
│   ├── contact/     ContactInfo, ReservationForm, ContactForm, ContactMap, SplitHeading
│   ├── admin/       DishForm, CategoriesPanel
│   └── ui/          Icon, Button, Field, Dialog, ConfirmDialog, ToastProvider, SectionDivider, PageMeta, keepFocus
├── hooks/           useMenu, useAdminApi, useScrollSpy, useScrolled, useMediaQuery
├── lib/             plain modules, no React: api, format, menu, reservation, auth, admin, pub
└── test/            helpers for the browser tests
```

Tests sit next to their code: `*.test.js` (unit) and `*.browser.test.jsx` ([testing.md](testing.md)).

### Entry and routing

- `src/App.jsx` holds the **maintenance switch**, `const maintenance = false;`. Set to `true`, it renders `src/pages/Maintenance.jsx` ("BURGER PUB MÜNCHEN", "Unsere Website wird derzeit aktualisiert.") instead of the router, so every path shows it, the admin included ([hosting-and-deployment.md](hosting-and-deployment.md#maintenance-mode)).
- Otherwise it renders `createBrowserRouter(routes)` with the table in `src/routes.jsx`:

| Path | Page | Inside |
|---|---|---|
| `/` | `pages/Home.jsx` | `SiteLayout` |
| `/menu` | `pages/Menu.jsx` | `SiteLayout` |
| `/contact` | `pages/Contact.jsx` | `SiteLayout` |
| anything else | `pages/NotFound.jsx`: "404", "HIER GIBT'S KEINE BURGER.", links to the menu and home; `noindex` | `SiteLayout` |
| `/admin-login` | `pages/admin/AdminLogin.jsx` | `AdminShell` |
| `/admin` | `pages/admin/Admin.jsx` inside `RequireAdmin` | `AdminShell` |

- **`RootLayout`** wraps everything with `ScrollRestoration`: a new page starts at the top, Back restores the position, and a `#hash` (such as `/contact#reservieren`) scrolls to its element. That's why the app uses the data router (`createBrowserRouter`) rather than `<BrowserRouter>`; it adds about 25 kB gzipped (measured 2026-11-24).
- **`SiteLayout`**: `Header`, `<main id="inhalt">`, `Footer`.
- **`AdminShell`**: the toast provider, `noindex`, and a `Suspense` spinner. Both admin pages are `lazy` (`pages/admin/lazyPages.js`), so the build puts them in their own chunks and visitors never download them.
- **Page titles and descriptions** come from `ui/PageMeta.jsx`, which renders React 19 `<title>` and `<meta name="description">` (hoisted into `<head>`): "Menü | Burger Pub München" and so on. The og tags are static in `index.html`.

### Data and logic

- **`src/lib/api.js`:** `apiFetch(path, {method, body, token, signal})` sends JSON (or `FormData` as is), adds `Authorization: Bearer` when given a token, and returns the parsed body (`null` for 204). Failures throw `ApiError` with `status` (**0 for a network error**) and `serverMessage` (the API's `message`).
- **The menu cache:** `getMenu()` loads `/api/food` and `/api/categories` in parallel, checks the envelope, and keeps the result in memory for 5 minutes, so home and menu share one load and moving between pages doesn't refetch. A failed load isn't kept. `peekMenu()` returns fresh data synchronously (no skeleton flash on a revisit); `clearMenuCache()` drops it (the admin after every write, the menu's retry button).
- **`useMenu()`** wraps it: `{status: "loading" | "ready" | "error", food, categories, retry}`; a failure logs `MENU ERROR` in the console.
- **`src/lib/format.js`:** `formatPrice` (`14,50 €`), `imageUrl` (a path starting with `/uploads/` gets `API_URL` in front, anything else is used as is), `pluralize`, `pluralizeHr` (Croatian plural forms).
- **`src/lib/menu.js`:** `buildMenu` (groups dishes by `category._id` in the categories' order and drops empty categories), `filterMenu` and `normalizeText` (lower case, accents removed, ß → ss), `pickFavorites`, `dishAnchor` (`gericht-<_id>`).
- **`src/lib/reservation.js`:** `MAX_GUESTS`, `LIMITS`, the email and phone patterns, `nowInMunich`, `validateReservation`, `validateContact`. They mirror `backend/controllers/reservationController.js`.
- **`src/lib/auth.js`:** the token in `localStorage.token`; `isTokenUsable` decodes the JWT's `exp` for the UX only (the API checks the signature).
- **`src/lib/admin.js`:** `slugify`, `nextOrder`, `parsePrice`, `validateDish`, `validateImage`, `moveCategory`, `adminErrorMessage`.
- **`src/lib/pub.js`:** the pub's name, address, phone, email, Instagram and the Google Maps URLs. Every component reads them from here; only a few strings repeat the address as text (the map's iframe title, the home and contact pages' meta descriptions).
- State is local `useState`, plus the menu cache and one context (toasts). No data library, no global store.

### Home (`/`)

- **Hero:** full screen height, `burger-u-ruci.webp` darkened, "DEIN BURGER. / DEIN PUB." and "Mitten in Milbertshofen." with the yellow swoosh, the buttons "Menü ansehen" (`/menu`) and "Tisch reservieren" (`/contact#reservieren`), and the address with "Route planen" (Google Maps directions).
- **"Unsere Favoriten"** (`home/Favorites.jsx`), from the API through `useMenu`: the dishes **with a photo**, by category order then dish order, at most 8; each card shows photo, name and price and links to `/menu#gericht-<_id>`. A skeleton while loading. If the API fails, or no dish has a photo, it shows `burgers.json`'s five instead (no price, linking to `/menu`). The cards scroll as a marquee that loops seamlessly (the track is rendered twice and moves −50% in 45 s; the copy is `inert`) and pauses on hover or focus. With reduced motion it's a row you scroll by hand.
- **Wall section:** `WallBurgerPub.webp`, "Mehr. als nur. BURGER.", a paragraph, "Zum Menü".
- **CTA band** (`layout/CtaBand.jsx`, also on `/menu`): "Hunger bekommen? TISCH RESERVIEREN.", "Jetzt anfragen" and the phone number.

### The menu (`/menu`)

- **Search** under the "UNSER MENU" heading: matches name and description, ignoring case, accents and ß, counts the hits, and offers a reset when nothing matches.
- **Category chips** (`menu/MenuNav.jsx`): sticky under the header, one per visible category. A scroll-spy (`useScrollSpy`, an `IntersectionObserver`) marks the current one and scrolls the chip row along; a click scrolls to the section and puts its slug in the URL (`#beefBurger`).
- **Sections** (`menu/MenuSection.jsx`), one per category with dishes, `id` = the category's slug: dishes with a photo as cards (1, 2 or 3 columns), the rest as a dotted "menu board" price list. Every dish has the id `gericht-<_id>`. **Empty categories are hidden**; if none has dishes, the page says "Unser Menü wird gerade aktualisiert."
- **States** (`menu/MenuStates.jsx`): a skeleton while loading; on failure "Das Menü konnte nicht geladen werden." with the phone number and "Erneut versuchen".
- **Deep links:** `/menu#gericht-<id>` scrolls the dish into view and flashes its outline (`animate-flash`); `/menu#<slug>` opens at that category.
- The background (`layout/WoodBackdrop.jsx`, also on the contact and 404 pages) is `contact-background/contact-background-image.webp`, fixed, under a dark gradient.

### The contact page (`/contact`)

- **Four cards** (`contact/ContactInfo.jsx`): address ("Route planen"), phone (`tel:`), email (`mailto:`), Instagram.
- **The reservation request** (`contact/ReservationForm.jsx`, section `#reservieren`): date (from today, with "Heute" and "Morgen" buttons), time, a guests stepper from 1 to 20, name, email, phone, an optional message.
  - Each field is checked with `validateReservation` once it's been left, or on submit; a submit with errors focuses the first invalid field.
  - It sends `POST /api/reservations`. On success a panel ("Danke, <first name>!", the date, time and guests, "Neue Anfrage") replaces the form. On a 400 it shows the API's message as is; any other failure shows a generic message with the phone number, and the form keeps its values.
  - Groups over 20 are asked to call. Nothing is stored: the request is an email to the pub.
- **The map** (`contact/ContactMap.jsx`) is click-to-load: "Karte laden", with the note "Beim Laden der Karte werden Daten an Google übertragen." Before the click, nothing is requested from Google. Then a Google Maps embed (no API key) darkened with CSS filters. "In Google Maps öffnen" is always there.
- **The contact form** (`contact/ContactForm.jsx`): name, email, message, checked the same way (`validateContact`), sent trimmed to `POST /api/contact`; a success panel, or "Nachricht konnte nicht gesendet werden." with the phone number, keeping the text.
- Both forms use `ui/keepFocus.js` so that a validation message appearing on blur can't shift the layout under a click on the submit button.

### Header and footer

- **Header** (`layout/Header.jsx`): fixed at the top, transparent over the page, solid once the page scrolls (`useScrolled`, 12 px). A skip link "Zum Inhalt springen" leads to `#inhalt`. From `md`: HOME, MENU and "KONTAKT | RESERVIEREN", the current page marked. On phones: a "RESERVIEREN" button (`/contact#reservieren`) and a menu button that opens `layout/MobileMenu.jsx`, a full-screen native `<dialog>` with the links, "Tisch reservieren", address, phone and Instagram; Escape closes it.
- **Footer** on every public page: logo and slogan, address with "Route planen", phone, email (`mailto:`), Instagram, the page links, the copyright line.
- **No opening hours anywhere** (decided, see [Decisions](#decisions)).

### The admin (`/admin-login`, `/admin`)

The admin's language is Croatian.

- **Login** (`pages/admin/AdminLogin.jsx`): username and password, with a show-password toggle and a loading state. On success the token goes to `localStorage.token`, a toast says "Uspješno ste prijavljeni", and it opens `/admin`. On failure it shows the API's message, or "Greška pri povezivanju sa serverom" when the API can't be reached. A usable token skips the form.
- **The guard** (`RequireAdmin.jsx`) lets through only a token whose `exp` hasn't passed; otherwise it redirects to the login, which then says "Sesija je istekla. Prijavite se ponovno." if there was a token. Every write goes through `useAdminApi()`: a 401 from the API clears the token and redirects the same way.
- **The dashboard** (`pages/admin/Admin.jsx`) loads dishes and categories itself (not through the menu cache) and lists the dishes per category, empty categories included; dishes whose category is gone appear under "Bez kategorije". It has a search (name and description), a category filter, "Dodaj novo", a "+ Dodaj" per category, "Uredi" and "Obriši" per dish, "Kategorije", "Pogledaj stranicu" (opens `/menu` in a new tab) and "Odjava".
- **The dish dialog** (`components/admin/DishForm.jsx`): name, description, price (comma or dot), category, and a photo by picker or drag and drop, previewed through `FileReader` and checked in the browser (JPEG, PNG or WebP, at most 10 MB). It sends `multipart/form-data` to `POST /api/food` or `PATCH /api/food/:id`. A new dish gets `order` = the highest in its category + 1, so it stays last after a reload. Leaving the photo empty on edit keeps the current one. Errors show in the dialog.
- **Deleting a dish** asks first (`ui/ConfirmDialog.jsx`).
- **The categories dialog** (`components/admin/CategoriesPanel.jsx`):
  - add: the slug comes from the name (`slugify`: lower case, umlauts and đ transliterated, `&` and other characters → `-`, `-2`, `-3` … if taken), `order` = the highest + 1;
  - rename in place (`PATCH {name}`; the slug stays);
  - move up or down: the categories are renumbered 1 … n and each one whose `order` changed gets a `PATCH {order}`;
  - delete, only when it has no dishes (the button is disabled otherwise), after a confirmation.
- **Feedback** is toasts (`ui/ToastProvider.jsx`) and dialogs; there's no `alert()` or `window.confirm`. Error texts come from `adminErrorMessage`: the API's message, "Greška pri povezivanju sa serverom" for a network error, and "Kategorija s tim nazivom već postoji." for MongoDB's duplicate-key error.
- Every write updates the local state from the API's answer and clears the menu cache; nothing reloads.

### Design

- **Tokens** in `src/App.css`'s `@theme` block, used as Tailwind classes (`bg-brand`, `text-ember`, `font-anton`, `animate-fade-up`):

| Kind | Tokens |
|---|---|
| Colours | `brand` `#ffaf01` (amber: accents, buttons), `brand-soft` `#ffc23d` (hover), `ember` `#f58220` (orange: the favourites' borders), `ink` `#0b0b0b` (the page), `coal` `#111111`, `char` `#181818`, `smoke` `#222222` (panels) |
| Fonts | `font-anton` (display headings), `font-oswald` (navigation, labels, the menu), `font-montserrat` (body copy, the default), `font-caveat` (handwritten accents) |
| Animations | `animate-marquee` (the favourites), `animate-fade-up` (entrances), `animate-flash` (a dish opened from a link) |

- **Classes** in `@layer components`: `.swoosh` (the yellow brush underline, as an `::after`; `--swoosh-width` shortens it), `.grain` (a noise overlay), `.no-scrollbar`.
- **Fonts are self-hosted** through the `@fontsource` packages (Anton; Oswald, Montserrat and Caveat as variable fonts), bundled into `dist/assets/`. The site makes no request to Google Fonts: in Germany, loading them from Google's servers sends visitors' IP addresses to Google without consent (LG München I, 2022).
- **Tailwind's spacing classes** (`m-*`, `p-*`) work as written: there's no reset besides Tailwind's own preflight.
- **Reduced motion:** a global `prefers-reduced-motion` rule shortens every animation and transition; the favourites become a scrollable row and smooth scrolling becomes instant (`usePrefersReducedMotion`).
- **Images** are WebP, with `width` and `height`, lazy below the fold, and `fetchPriority="high"` on the hero.
- **Responsive**, mobile first, with Tailwind's `sm` / `md` / `lg` prefixes; the header switches to the phone layout below `md`.
- **Accessibility:** labelled fields, errors tied to their fields (`aria-describedby`), live regions for results and toasts, focus moved to success panels, native `<dialog>`s. The end-to-end suite runs axe on every page ([testing.md](testing.md)).

### Conventions

- One component per file, default export, named after the component (`menu/MenuStates.jsx` exports its three states by name). Pages in `src/pages/`, pieces in `src/components/<area>/`, logic without React in `src/lib/`, with unit tests.
- Copy is German on the public site, Croatian in the admin; code comments are Croatian, and few.
- No PropTypes, no TypeScript.
- Formatting follows Prettier's defaults (double quotes, semicolons, trailing commas), without a Prettier config.

### Unused files

No source file is unused. In `public/`, these are referenced by nothing and still deployed with the site: `Background-image/burger-u-ruci.png`, `burger-1.JPG`, `burger-1-copy.jpg`; `contact-background/contact-background-image.png`; `menu-background-image/menu-background-image.png`; `Logo/burger-pub-logo2.png`; `icons/location.png`, `icons/sat.png`; `burgers-images/food-6.JPG` to `food-20.JPG`. The background and logo PNGs are the originals of the WebP files the site uses (`menu-background-image.png` is the same file as `contact-background-image.png`, and `burger-pub-logo2.png` the same as `burgerpub-icon.png`). Of the PNGs, `burgerpub-icon.png` (the favicon) and `second-page-background/WallBurgerPub.png` (the `og:image`) are used.

## The API

### `backend/app.js` and `backend/server.js`

`app.js` builds the Express app and exports it (the tests use it without a server), in order:

1. **CORS** (`cors` with an origin callback): allows requests with no `Origin`, and these origins: `http://localhost:5173`, `https://burgerpubmunchen.de`, `https://www.burgerpubmunchen.de`, `https://burger-pub-redizajn.vercel.app`. Any other origin gets an error, which Express turns into a 500 HTML page.
2. `express.json()` (default 100 kB limit).
3. `/uploads` → `express.static("uploads")`, relative to the working directory.
4. The routers: `/api/food`, `/api/auth`, `/api/categories`, `/api/contact`, `/api/reservations`, and `GET /api/test`.

`server.js` (`npm start` or `node server.js`):

1. `dotenv.config()`: reads `.env` from the working directory. It runs before `app.js` is loaded, because `foodController.js` reads `IMAGEKIT_PRIVATE_KEY` when it loads.
2. `mongoose.connect(process.env.DATABASE)`, not awaited: the server listens whether or not it connects, and logs "MongoDB spojen" or the error.
3. `app.listen(PORT || 5000)`.

There is no error-handling middleware, no 404 handler, no request logging, no security headers, and no rate limiting.

### Routes and controllers

| Router | Controller | Public | Needs the admin's token |
|---|---|---|---|
| `routes/foodRoutes.js` | `controllers/foodController.js` | `GET /api/food` | `POST /`, `PATCH /:id`, `DELETE /:id` |
| `routes/categoryRoutes.js` | `controllers/categoryController.js` | `GET /api/categories` | `POST /`, `PATCH /:id`, `DELETE /:id` |
| `routes/authRoutes.js` | `controllers/authController.js` | `POST /api/auth/login` | |
| `routes/contactRoutes.js` | `controllers/contactController.js` | `POST /api/contact` | |
| `routes/reservationRoutes.js` | `controllers/reservationController.js` | `POST /api/reservations` | |

Every handler is an `async` function in a `try/catch` that answers `{status: "success", …}` or `{status: "fail" | "error", message}`; the details are in [api-contract.md](api-contract.md).

### Auth

- `login` finds the `Admin` by `username` (selecting the hidden `password`), compares with bcrypt, and signs `{id}` with `JWT_SECRET`, expiring after `JWT_EXPIRES_IN`.
- `protect` reads `Authorization: Bearer <token>`, verifies it, loads the admin by id and puts it on `req.admin`. It's put in front of every write route in the routers.
- One role: any admin can do everything. Admins are only created by `createAdmin.js`; there's no endpoint to create, list or change them.

### Photos (ImageKit)

- `foodController.js` creates one ImageKit client (`@imagekit/nodejs`) at load time with `IMAGEKIT_PRIVATE_KEY`; it throws, and the API doesn't start, without one.
- `multer` keeps the uploaded file in memory (`memoryStorage`, field `image`, only `image/*` MIME types, no size limit), then the controller uploads it as a base64 data URI to the folder `/burger-pub/food`, named `food-<ms timestamp>-<original name>`.
- The dish stores the returned `url` in `image` and `fileId` in `imageFileId`.
- On update with a new photo: upload the new one, save the dish, then delete the old file by `imageFileId` (a failed delete is logged and ignored). On delete: delete the photo (failure ignored), then the dish.

### Mail

`contactController.js` validates the three fields, then creates a nodemailer transport with `service: "gmail"` and `EMAIL_USER` / `EMAIL_PASSWORD`, and sends: from `"Burger Pub Website" <EMAIL_USER>`, to `burgerpubmunchen@gmail.com`, `replyTo` the visitor's email, subject `Neue Nachricht von <name>`, an HTML body with the three fields. The pub answers by replying.

`reservationController.js` sends table requests the same way (same Gmail transport, same recipient, `Reply-To` the guest), after validating every field on the server; its HTML body escapes the guest's input (the contact form's doesn't). Neither keeps a copy: a message that fails to send is gone, and the visitor sees an error.

## Decisions

- **The menu moved from `menu.json` to MongoDB** (2026-09-24), so the pub can edit it in the admin; `menu.json` is now only the seed.
- **Photos go to ImageKit, not the API's disk** (2026-09-24, the same commit that added the admin). The five files in `backend/uploads/` are from an earlier, uncommitted version that saved uploads there; the `/uploads` route and the site's `/uploads/` prefix rule stayed for them.
- **Reservations are requests by email** (2026-11-23, the developer): one number of guests (a guest is a seat), 1–20, any date from today and any time; the pub confirms each one itself. Nothing is stored, and no copy goes to the guest.
- **Maintenance mode** was on from 2026-10-03 and was switched off on `main` by the colleague who built the app (2026-11-23, `235c65b`). The switch and its page stay in the code ([hosting-and-deployment.md](hosting-and-deployment.md#maintenance-mode)).
- **The global `* { margin: 0; padding: 0 }` reset was removed** with the redesign (2026-11-24, the developer), so Tailwind's spacing classes work.
- **The favourites on the home page come from the API** (2026-11-24, the developer), with `burgers.json` only as the fallback.
- **No opening hours on the site** until the real hours are known (2026-11-24, the developer).

## Open decisions

- Where the API and the database run in production, and who owns the accounts (ImageKit, Gmail, Vercel, the domain): ASK ([variables.md](variables.md#to-fill-in-ask)).
- An Impressum and a Datenschutz page: required, missing, and their content needs the owner's details: ASK ([known-issues.md](known-issues.md#site)).
- The opening hours, once known.
- Dish ordering in the admin: the API can change a dish's `order`; the UI can't.
- What to do with the unused files in `public/`.
