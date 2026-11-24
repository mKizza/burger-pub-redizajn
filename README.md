# Burger Pub München — website

The website of Burger Pub, Milbertshofener Str. 34, 80807 München (https://burgerpubmunchen.de): a public site with the menu, a table reservation request and a contact form, and a small admin for the menu.

- **Site:** React 19, Vite 8, Tailwind CSS 4, React Router 7, in the repo root. Hosted on Vercel.
- **API:** Express 5 and MongoDB (Mongoose) in `backend/`, with ImageKit for dish photos and Gmail for the forms.

## Start here

- **New developer:** [docs/onboarding.md](docs/onboarding.md)
- **Rules and an index of every doc:** [CLAUDE.md](CLAUDE.md)
- **Env keys, URLs, constants, open questions:** [docs/variables.md](docs/variables.md)
- **How the code is laid out:** [docs/architecture.md](docs/architecture.md)

## Quick start

```bash
npm ci && (cd backend && npm ci)
# backend/.env: see docs/onboarding.md, step 3
cd backend && node seedCategories.js && node seedFood.js && node createAdmin.js
npm start                         # the API on :5000
npm run dev                       # in the repo root: the site on :5173
```

Maintenance mode is off; [docs/hosting-and-deployment.md](docs/hosting-and-deployment.md#maintenance-mode) explains the switch.

## Tests

```bash
npx playwright install chromium   # once per machine: the browser the tests run in
npm test                          # the site: unit and browser tests (Vitest)
npm run test:api                  # the API: Vitest, Supertest, MongoDB in memory
npm run test:e2e                  # end to end with Playwright; needs ports 5660–5662 free
npm run test:all                  # lint and all three
```

None of them needs `backend/.env` or a running server. [docs/testing.md](docs/testing.md) explains each suite.

Never commit secret values: name the key and where it's kept.
