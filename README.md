# Burger Pub München — website

The website of Burger Pub, Milbertshofener Str. 34, 80807 München (https://burgerpubmunchen.de): a public site with the menu and a contact form, and a small admin for the menu.

- **Site:** React 19, Vite 8, Tailwind CSS 4, React Router 7, in the repo root. Hosted on Vercel.
- **API:** Express 5 and MongoDB (Mongoose) in `backend/`, with ImageKit for dish photos and Gmail for the contact form.

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
node server.js                    # the API on :5000
npm run dev                       # in the repo root: the site on :5173
```

The site shows a maintenance page until launch (`src/App.jsx`); [docs/hosting-and-deployment.md](docs/hosting-and-deployment.md#maintenance-mode) explains it.

Never commit secret values: name the key and where it's kept.
