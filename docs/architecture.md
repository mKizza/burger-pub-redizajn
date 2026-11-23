# Architecture

How the pieces fit together, and what isn't decided yet. The endpoints are in [api-contract.md](api-contract.md), the models in [data-model.md](data-model.md), the values in [variables.md](variables.md).

## The big picture

```
Browser ──► Site (React SPA, Vite build on Vercel: burgerpubmunchen.de)
              │  /          home: hero, static carousel (burgers.json), wall
              │  /menu      dishes by category ──────────────┐
              │  /contact   address, reservation, map, form ─┤
              │  /admin-login, /admin   menu admin ──────────┤ fetch, JSON
              │                                              ▼
              │                         API (Express 5, backend/server.js)
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
              └─ public/  photos, logo, backgrounds (served by the site, not the API)
```

- The site is a client-rendered single-page app: `index.html` loads `src/main.jsx`; Vercel rewrites every path to `index.html` (`vercel.json`).
- The site calls the API directly from the browser, at `API_URL` (`src/config.js`): `http://localhost:5000` in dev, `VITE_API_URL` in a production build. The API allows only its listed origins (CORS).
- There are no accounts for visitors. The one kind of user is the admin, who logs in with a username and password and gets a JWT.
- Everything is JavaScript, no TypeScript. The site is ES modules; `backend/` is CommonJS (`require`), with its own `package.json` and `node_modules`.

## Repository layout

```
burger-pub-redizajn/
├── index.html            the SPA shell (title "Burger Pub München", favicon, lang="en")
├── vite.config.js        React, the React Compiler (via @rolldown/plugin-babel), Tailwind
├── vercel.json           rewrite /(.*) → /index.html
├── eslint.config.js      flat config for **/*.{js,jsx}, browser globals (also hits backend/)
├── burgers.json          the home page carousel: 5 names + photos
├── menu.json             the menu before the API: the seed for seedFood.js
├── public/               static files, served at /
├── src/                  the site (flat: pages and components side by side)
│   └── components/       the API-backed pieces: MenuSection, Admin, AdminLogin, ProtectedRoute
└── backend/
    ├── server.js         the Express app
    ├── routes/           one router per resource
    ├── controllers/      the handlers (and auth's `protect` middleware)
    ├── models/           Mongoose schemas: Admin, Category, Food
    ├── uploads/          5 photos from before ImageKit, served at /uploads
    ├── seedCategories.js, seedFood.js, createAdmin.js   one-off scripts
    └── package.json      no scripts besides a failing "test"; run with `node server.js`
```

## The site

### Entry and routing

- `src/main.jsx` renders `<App />` in `StrictMode` and imports `src/App.css`.
- `src/App.jsx` holds the **maintenance switch**: `const maintenance = true;` returns a full-screen message ("Burger Pub Munich", "Unsere Website wird derzeit aktualisiert.", "Wir sind bald wieder für euch da! 🍔") before the router, so it covers every path. With `false`, it renders the router:

| Path | Component | What |
|---|---|---|
| `/` | `src/Home.jsx` | the landing page |
| `/menu` | `src/Menu.jsx` | the menu, from the API |
| `/contact` | `src/Contact.jsx` | contact details, map, form |
| `/admin-login` | `src/components/AdminLogin.jsx` | the admin's login form |
| `/admin` | `src/components/Admin.jsx` inside `src/components/ProtectedRoute.jsx` | the menu admin |

There is no catch-all route: any other path renders an empty black page.

### The home page (`/`)

Built from small presentational components, all static:

- `MenuTrack.jsx`: the top bar on every public page. `Logo.jsx` on the left; `NavLink`s HOME, MENU and a yellow "KONTAKT | RESERVIEREN" button (to `/contact`; smaller text and padding on phones) on the right; the active link is underlined. It's absolutely positioned over the page.
- `Backgroundpicture.jsx`: the hero, `public/Background-image/burger-u-ruci.png` darkened and faded (`.background-image`), with `Backgroundtext.jsx` ("DEIN BURGER. / DEIN PUB. / Mitten in Milbertshofen.", tilted −5°, its yellow swoosh an `::after`) and `IconsPage.jsx` (the address, linking to Google Maps directions). It's one flex column with the picture behind it: a spacer the height of the logo, the text centred in the space left, a spacer for the swoosh, then the address. So the text can't run into the logo or the address on any screen; when a screen is too short, the hero grows past its `min-h` (42vh / 45vh / 70vh) instead. A 48 px spacer below keeps the page under it where it was. The spacers are `div`s with heights, because padding classes don't work on this site ([known-issues.md](known-issues.md#site)).
- `FooterText.jsx`: the "UNSERE FAVORITEN" divider.
- `BurgersMarquee.jsx`: `burgers.json` rendered twice in a row and scrolled by the `animate-marquee` keyframes (−15% over 10 s, looping). **Not from the API**: the admin can't change it.
- `BurgerWallFooter.jsx`: `public/second-page-background/WallBurgerPub.png` with `SecondBackgroundtext.jsx` ("Mehr. als nur. BURGER." and a short paragraph).

### The menu (`/menu`)

`Menu.jsx` fetches `GET /api/food` and `GET /api/categories` in parallel on mount, then builds one section per category, in the categories' `order`:

- dishes are matched by `item.category._id === category._id` (the API populates `category` on each dish), in the API's order (`order` ascending);
- the price becomes `14,50 €` (`toFixed(2)`, dot → comma);
- an empty category still gets its heading;
- while loading it shows "MENÜ WIRD GELADEN..."; on failure it logs `MENU ERROR` to the console and shows nothing.

`components/MenuSection.jsx` renders a section: the category title with a yellow rule, then a grid of cards (one column, two from `lg`) with the photo (or a grey "Burger Pub" placeholder), name, price and description. A photo path starting with `/uploads/` is prefixed with `API_URL`; anything else (an ImageKit URL, a `/burgers-images/…` path from `public/`) is used as is.

The page background is `public/menu-background-image/menu-background-image.png`, fixed, under a 65% black overlay.

### The contact page (`/contact`)

- `ContactNaslov.jsx`: the "KONTAKT" heading and "Wir freuen uns auf dich."
- `ContactInfo.jsx`: address (Google Maps directions link), phone (`tel:` link), email (plain text, **not** a `mailto:` link), Instagram link.
- `ReservationForm.jsx` ("Tisch reservieren.", anchor `#reservieren`): a table reservation **request**. Date (today or later in Munich), time, guests (a select, 1–20; one guest is one seat), name, email, phone, an optional message → `POST /api/reservations` as JSON. On success it clears and says the pub confirms by email or phone; on a 400 it shows the API's message (date in the past and the like), otherwise a generic error with the pub's phone number. Groups over 20 are asked to call. Nothing is stored: the request is an email to the pub.
- `ContactMap.jsx`: a Google Maps embed (`maps?q=…&output=embed`, no API key) darkened with CSS filters, and an "In Google Maps öffnen →" button.
- `ContactForm.jsx`: name, email, message (all `required`), `POST /api/contact` as JSON. Shows "Nachricht erfolgreich gesendet!" and clears the form, or "Nachricht konnte nicht gesendet werden."; the button reads "Wird gesendet..." while sending.

The page background is `public/contact-background/contact-background-image.png`, fixed.

### The admin (`/admin-login`, `/admin`)

- **Login** (`AdminLogin.jsx`): username and password → `POST /api/auth/login`. On success the token goes to `localStorage.token`, an `alert` says "Uspješno ste prijavljeni", and it navigates to `/admin`. On failure it shows the API's message.
- **The guard** (`ProtectedRoute.jsx`) only checks that `localStorage.token` exists; the API checks it's valid.
- **The admin** (`Admin.jsx`, one ~700-line component): loads dishes and categories like the menu page, then lists the dishes per category as cards with UREDI (edit) and OBRIŠI (delete).
  - **Add / edit** (a modal): name, description, price (number, step 0.01), category (a select), photo (JPEG, PNG or WebP; preview shown). Sent as `multipart/form-data` to `POST /api/food` or `PATCH /api/food/:id` with `Authorization: Bearer <token>`. Leaving the photo empty on edit keeps the current one.
  - **Delete** a dish after a `window.confirm`.
  - **Categories** (a modal): add one by name (the slug is derived: lower case, `&` removed, spaces → `-`; `order` = the number of categories + 1), delete one with no dishes (the button is disabled otherwise). There's no UI to rename or reorder categories, or to reorder dishes, although the API can update both.
  - **Logout** (ODJAVA) removes the token and goes to `/admin-login`.
  - Errors are shown with `alert()`. Every write updates the local state from the API's answer; nothing reloads.
- The admin's language is Croatian ("Dodaj novo jelo", "Kategorije", "Cijena €").

### Design

- **Colours**, written inline as Tailwind arbitrary values, with no tokens: `#ffaf01` (amber: accents, headings, buttons, rules), `#f58220` (orange: the carousel's photo borders), near-black backgrounds (`rgba(0,0,0,0.904)` on `body`; `#0d0d0d`, `#111`, `#151515`, `#181818`, `#222` in the admin), white text with opacity steps (`text-white/70`, `/50`, `/40`).
- **Fonts** (Google Fonts, `@import`ed in `src/App.css`; tokens in its `@theme` block): `font-anton` (display headings), `font-oswald` (navigation, labels, the menu), `font-caveat` (handwritten accents), `font-montserrat` (body copy, the login page).
- **Margins and paddings:** Tailwind's `m-*` and `p-*` classes are written all over the code but have no effect: an unlayered `* { margin: 0; padding: 0 }` in `src/App.css` overrides them ([known-issues.md](known-issues.md#site)). What you see is the layout without them. The reset stays (2026-11-23); space things with `gap-*`, heights, widths, spacer elements, or the important modifier (`px-4!`: the menu page and the contact and reservation forms mark their spacing classes this way), and check the result in the browser.
- **Custom CSS** in `src/App.css`: `.background-image` and `.border-filter` (darken and fade an image's edge with a gradient mask), `@keyframes marquee` / `.animate-marquee`. `.reservation` and `.allside-padding` are unused.
- **Responsive** with Tailwind's `sm` / `md` / `lg` / `xl` prefixes, mobile first; mobile layout was the focus of the last design commits.
- The yellow underline swoosh under headings is a `clip-path` polygon on an `::after` pseudo-element (`Backgroundtext.jsx`, `SecondBackgroundtext.jsx`).

### Conventions

- One component per file, default export, the file named after the component; `src/` is flat, with the API-backed parts in `src/components/`.
- Component names mix German and Croatian (`UnserMenuNaslov`: "naslov" is Croatian for title; `ContactNaslov`), and comments are Croatian. Follow the file you're in.
- State is local `useState`; data loads in `useEffect` with `fetch`. No data library, no context, no global store.
- No PropTypes, no TypeScript, no tests.

### Dead code

Files nothing imports; `vite build` ignores them:

| File | What it was |
|---|---|
| `src/BeefBurger.jsx`, `ChickenVeggieBurger.jsx`, `Hauptgerichte.jsx`, `BurgerPlatte.jsx`, `Salate.jsx`, `Beilagen.jsx`, `Dips.jsx` | the menu page before the API: one section each, read from `menu.json` |
| `src/HamburgerMenu.jsx` | a mobile menu; imports `./ButtonOpen` and `./ButtonClosed`, **which don't exist**: importing it breaks the build |
| `src/HamburgerMenuOptions.jsx` | its links (`#home`, `#lunch`, `#drinks`, `#reservieren` …) from an earlier one-page design; only `HamburgerMenu.jsx` uses it |
| `src/OpenMenu.jsx` | a menu modal; calls `.map` on `menu.json`, an object, so it would crash |

Unused files in `public/`: `burgers-images/food-6.JPG` to `food-20.JPG`, `Background-image/burger-1.JPG`, `Background-image/burger-1-copy.jpg`, `icons/sat.png`. They're still deployed with the site.

## The API

### `backend/server.js`

In order:

1. `dotenv.config()`: reads `.env` from the working directory.
2. **CORS** (`cors` with an origin callback): allows requests with no `Origin`, and these origins: `http://localhost:5173`, `https://burgerpubmunchen.de`, `https://www.burgerpubmunchen.de`, `https://burger-pub-redizajn.vercel.app`. Any other origin gets an error, which Express turns into a 500 HTML page.
3. `express.json()` (default 100 kB limit).
4. `/uploads` → `express.static("uploads")`, relative to the working directory.
5. The routers: `/api/food`, `/api/auth`, `/api/categories`, `/api/contact`, and `GET /api/test`.
6. `mongoose.connect(process.env.DATABASE)`, not awaited: the server listens whether or not it connects, and logs "MongoDB spojen" or the error.
7. `app.listen(PORT || 5000)`.

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
- **Maintenance mode until launch** (2026-10-03): the redesign stays hidden until it's switched off (confirmed pre-launch by the developer, 2026-11-23).

## Open decisions

- Where the API and the database run in production, and who owns the accounts (ImageKit, Gmail, Vercel, the domain): ASK ([variables.md](variables.md#to-fill-in-ask)).
- Whether the home page's carousel should come from the API (the admin can't change it today).
- What to do with the dead files and the unused photos in `public/`.
- Whether the admin needs category renaming and ordering, and dish ordering (the API supports both; the UI doesn't).
- Opening hours: the site doesn't show any (`public/icons/sat.png`, a clock icon, is unused).
