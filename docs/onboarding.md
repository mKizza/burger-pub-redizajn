# Onboarding: from zero to the site running

This gets a new machine from nothing to a working local copy: MongoDB, the API with the menu seeded, the site, and the tests. It takes about 15 minutes, plus the downloads for the tests. Values are in [variables.md](variables.md); day-to-day running is in [local-development.md](local-development.md).

The repo's `README.md` is a short summary that points here. This page is the setup guide.

## What you receive

- Access to the GitHub repo `mKizza/burger-pub-redizajn`.
- No secrets. Nothing local needs a real one: the keys below get local or placeholder values.

## 1. Install the tools

| Tool | Why | Notes |
|---|---|---|
| Node 22.12 or newer (20.19+ works) | Both `package.json`s. Vite 8 and Mongoose 9 need at least 20.19 | No `.nvmrc`; the code was last checked on Node 26 |
| MongoDB 7 or newer | The API's database | Any server you can reach by a `mongodb://` URL: a local `mongod` (on macOS `brew tap mongodb/brew`, then `brew trust --formula mongodb/brew/mongodb-community` and `brew trust --formula mongodb/brew/mongodb-database-tools`, then `brew install mongodb-community`; recent Homebrew refuses formulas from taps you haven't trusted, and the database tools are the server's one dependency from the same tap), Docker's `mongo` image, or a free MongoDB Atlas cluster of your own |
| `mongosh` (optional) | Looking at the data | Comes with Homebrew's MongoDB or `brew install mongosh` |
| Git with access to GitHub | The repo | |

**Ports.** The code expects the site on 5173 (Vite's default) and the API on **5000**, and the API's CORS list allows `http://localhost:5173` only. On macOS, port 5000 belongs to the AirPlay Receiver (System Settings → General → AirDrop & Handoff → AirPlay Receiver): the API fails with `EADDRINUSE` until you turn it off, and the site always calls `http://localhost:5000` in dev ([local-development.md](local-development.md#ports)).

## 2. Clone and install

```bash
git clone git@github.com:mKizza/burger-pub-redizajn.git
cd burger-pub-redizajn
npm ci                    # the site
cd backend && npm ci      # the API; also downloads a MongoDB binary (~150 MB) for its tests
```

Run the API's `npm ci` from inside `backend/`, as above: that's where the binary has to land ([testing.md](testing.md#before-the-first-run)).

## 3. The API's `.env`

Create `backend/.env` (gitignored). Every key is explained in [variables.md](variables.md#api-env-keys-backendenv):

```dotenv
PORT=5000
DATABASE=mongodb://127.0.0.1:27017/burgerpub      # your local MongoDB, never production's
JWT_SECRET=                                        # any long random string: openssl rand -hex 32
JWT_EXPIRES_IN=7d                                  # required: login fails with a 500 without it
ADMIN_USERNAME=admin                               # your local admin login
ADMIN_PASSWORD=                                    # at least 8 characters
IMAGEKIT_PRIVATE_KEY=private_local_placeholder     # required to start; a placeholder disables uploads only
EMAIL_USER=                                        # leave empty: the contact form then fails locally
EMAIL_PASSWORD=
```

- **`IMAGEKIT_PRIVATE_KEY` must not be empty:** the ImageKit client is built when the API loads, and throws without a key, so the API doesn't start. Any placeholder works; then adding or replacing a dish photo fails, and everything else works. For working uploads, use a free ImageKit account of your own, never production's.
- **Leave `EMAIL_USER` and `EMAIL_PASSWORD` empty.** The contact form always sends to the pub's real inbox through Gmail; with real credentials, every local test reaches the pub. To try the form, see [local-development.md](local-development.md#the-contact-form).

## 4. Seed the menu and the admin

Start MongoDB, then from `backend/`:

```bash
node seedCategories.js    # 7 categories
node seedFood.js          # 44 dishes from ../menu.json, 5 of them with a photo
node createAdmin.js       # the admin from ADMIN_USERNAME / ADMIN_PASSWORD
```

Each script connects, does its work, prints a line per item and exits. Running them again skips what already exists ([data-model.md](data-model.md#seed-scripts)).

## 5. Run it

Two terminals:

```bash
cd backend && node server.js     # "Server radi na portu 5000", then "MongoDB spojen"
npm run dev                      # in the repo root: http://localhost:5173
```

Check it:

- `curl -s http://localhost:5000/api/test` answers `{"status":"success","message":"Burger Pub API radi"}`.
- `curl -s http://localhost:5000/api/categories` lists 7 categories.
- `http://localhost:5173` shows the site, with the favourites from your seeded menu (maintenance mode is off: [hosting-and-deployment.md](hosting-and-deployment.md#maintenance-mode)).
- `/menu` shows the seeded menu, and `/admin-login` lets you in with your `ADMIN_*` values.

## 6. Run the checks and the tests

Once per machine, download Playwright's Chromium (into your user's Playwright cache, outside the repo); the site's browser tests and the end-to-end tests run in it:

```bash
npx playwright install chromium
```

Then, in the repo root:

```bash
npm run build        # must pass
npm run lint         # the whole repo; must pass
npm test             # the site: unit and browser tests
npm run test:api     # the API, against MongoDB in memory
npm run test:e2e     # end to end; needs ports 5660–5662 free
npm run test:all     # all of the above but the build, in order
```

None of the tests needs `backend/.env`, your MongoDB or the servers from step 5: they start their own. [testing.md](testing.md) explains each suite and lists the manual checks.

## 7. Claude Code

Start Claude in the repo root, so it reads `CLAUDE.md`. If your machine runs things differently from these docs (other ports, MongoDB elsewhere), write that in a `CLAUDE.local.md` next to it, and keep it out of git (`.git/info/exclude`): Claude reads it as overriding the defaults.
