# Data model

The MongoDB documents, how they relate, where the photos live, and the scripts that fill the database. The schemas are in `backend/models/`; the endpoints that read and write them are in [api-contract.md](api-contract.md).

## Collections

Mongoose names the collections from the models: `admins`, `categories`, `foods`. None of the schemas has timestamps (`createdAt` / `updatedAt`) or soft deletes; `__v` is Mongoose's version key.

```
Category 1 ──── * Food        (Food.category → Category._id, required)
Admin                         (stands alone)
```

### `Category` (`backend/models/categoryModel.js`)

| Field | Type | Rules |
|---|---|---|
| `name` | String | required ("Kategorija mora imati naziv"), trimmed. Shown as is, in capitals by convention ("BEEF BURGER") |
| `slug` | String | required ("Kategorija mora imati slug"), **unique** (a MongoDB index), trimmed |
| `order` | Number | required, default 0. The menu shows categories by `order`, ascending |

- The seed's slugs are camelCase and equal `menu.json`'s keys (`beefBurger`). The admin derives a new category's slug from its name (`slugify` in `src/lib/admin.js`: `"Drinks & More"` → `drinks-more`, `"Süßes"` → `suesses`, with `-2`, `-3` … when it's taken); renaming a category keeps its slug.
- `seedFood.js` finds categories by slug, and the menu page uses it as each category's anchor (`/menu#beefBurger`).
- A category can only be deleted when no dish points at it (checked by the API and the admin).

### `Food` (`backend/models/foodModel.js`)

A dish on the menu.

| Field | Type | Rules |
|---|---|---|
| `name` | String | required ("Hrana mora imati naziv"), trimmed |
| `description` | String | default `""`; the menu hides an empty one (the dips have none) |
| `price` | Number | required ("Hrana mora imati cijenu"), euros (`14.5`); no minimum in the schema (the admin accepts only a number ≥ 0 with up to two decimals, comma or dot) |
| `image` | String | default `""`; the photo's address ([Photos](#photos)) |
| `imageFileId` | String | default `""`; the ImageKit file id, set only for photos uploaded through the admin |
| `category` | ObjectId → `Category` | required ("Hrana mora imati kategoriju"); the API populates it on reads |
| `order` | Number | default 0; the position within its category, ascending |

- `GET /api/food` sorts every dish by `order` across all categories; the site then groups them by category, so `order` only matters within a category.
- Seeded dishes get `order` 1, 2, 3 … per category; a dish added in the admin gets the highest `order` in its category + 1. A dish created through the API without `order` gets 0 and sorts first. The admin can't reorder dishes ([known-issues.md](known-issues.md#admin)).
- No uniqueness on `name`: the same name may appear in two categories (ONION RINGS is under both HAUPTGERICHTE and BEILAGEN).

### `Admin` (`backend/models/adminModel.js`)

| Field | Type | Rules |
|---|---|---|
| `username` | String | required, **unique**, trimmed. The login name (not an email) |
| `password` | String | required, at least 8 characters, `select: false` (left out of queries unless asked for). Hashed with bcrypt, cost 12, in a `pre("save")` hook when it changes |

- `correctPassword(candidate, hash)` compares with bcrypt.
- Only `createAdmin.js` creates admins. To change a password, change the document through Mongoose so the hook hashes it (`admin.password = "…"; await admin.save()`), or delete it and run `createAdmin.js` again. `updateOne` would store it unhashed.

## Photos

A dish's `image` is one of four kinds, and the site decides where to load it from by its prefix (`imageUrl` in `src/lib/format.js`):

| `image` | Comes from | Served by | `imageFileId` |
|---|---|---|---|
| `https://ik.imagekit.io/…` | an upload in the admin | ImageKit's CDN | the ImageKit file id |
| `/burgers-images/food-N.JPG` | `seedFood.js`, from `menu.json` | the **site**, from `public/burgers-images/` | `""` |
| `/uploads/food-….jpg` | an upload before ImageKit | the **API**, from `backend/uploads/`; the site prefixes `API_URL` | `""` |
| `""` | no photo | nothing: on the menu the dish is a line in the price list instead of a photo card; the favourites leave it out | `""` |

- Uploads go to the ImageKit folder `/burger-pub/food`, named `food-<ms timestamp>-<original file name>`.
- Replacing a photo in the admin deletes the old ImageKit file **after** the dish is saved; deleting a dish deletes its file. Photos without an `imageFileId` (seeded, `/uploads/`) are never deleted anywhere.
- The home page's favourites are the dishes with a photo (at most 8). `burgers.json` (five names and `/burgers-images/` paths) is only their fallback when the API fails.

## Seed scripts

All three live in `backend/`, run with `node <file>` from there (they read `.env` from the working directory), connect to `DATABASE`, print one line per item and exit. None deletes anything.

Each also exports its work as a function, which neither connects nor exits: `seedCategories({log})` (and the `categories` list), `seedFood({log})`, `createAdmin({username, password, log})`. `.env` is loaded only when a script runs directly. The API tests and the e2e API call them on their in-memory databases.

| Script | What it does | Run again |
|---|---|---|
| `seedCategories.js` | Creates the 7 categories below, unless one with the same `slug` exists | skips existing slugs; doesn't update names or orders |
| `seedFood.js` | Reads `../menu.json`; for each top-level key, finds the category with that slug (skips the whole section if there's none: run `seedCategories.js` first), then creates each item unless a dish with the same `name` **and** category exists. Parses `"14,50 €"` → `14.5`, takes `description` and `image` as given, sets `order` to the item's position (1, 2, …). `menu.json`'s own `id` numbers aren't used | skips existing dishes; doesn't update prices. A dish deleted in the admin comes back |
| `createAdmin.js` | Creates an admin from `ADMIN_USERNAME` / `ADMIN_PASSWORD`, unless that username exists | prints "Admin već postoji" and leaves the password as it was |

The seeded categories:

| `order` | `name` | `slug` | Dishes in `menu.json` |
|---|---|---|---|
| 1 | BEEF BURGER | `beefBurger` | 12 (the first 5 with photos) |
| 2 | CHICKEN & VEGGIE BURGERS | `chickenVeggieBurger` | 8 |
| 3 | HAUPTGERICHTE & FINGER FOOD | `hauptgerichte` | 6 |
| 4 | BURGER PUR MIT PLATTE | `burgerPlatte` | 4 |
| 5 | SALATE | `salate` | 3 |
| 6 | BEILAGEN | `beilagen` | 5 |
| 7 | DIPS | `dips` | 6 (no descriptions) |

44 dishes in all. Whether `menu.json`'s dishes and prices match the pub's real menu: ASK; production's database is edited in the admin, so it may have moved on from the file.

## Looking at the data

```bash
mongosh "<DATABASE>"           # a local URL only
db.categories.find().sort({order: 1})
db.foods.find({}, {name: 1, price: 1, order: 1, category: 1}).sort({order: 1})
db.foods.countDocuments()
db.admins.find()               # the password isn't selected by Mongoose, but mongosh shows the hash
```
