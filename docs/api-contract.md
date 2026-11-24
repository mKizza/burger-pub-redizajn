# API contract

Every endpoint of the Express API in `backend/`, as the code answers today. How the pieces fit is in [architecture.md](architecture.md); the documents' fields are in [data-model.md](data-model.md).

**Get the contract from code, not from this page, when they disagree:** the routes are in `backend/app.js` and `backend/routes/*.js`, the answers in `backend/controllers/*.js`. Then fix this page.

## Conventions

- **Base address:** `http://localhost:5000` locally (`PORT`), `VITE_API_URL` for the production site. Paths start with `/api`; no version prefix.
- **Bodies are JSON** (`Content-Type: application/json`), except the dish writes, which also take `multipart/form-data` for the photo.
- **The envelope:**
  - success: `{"status": "success", …}`, with the payload under `data` (`data.food`, `data.categories`, `data.category`) and, for lists, a `results` count;
  - client error: `{"status": "fail", "message": "…"}` (4xx);
  - server error: `{"status": "error", "message": "…"}` (500), where `message` is often the raw exception text.
- **Messages** are Croatian, except the contact form's and the reservation's, which are German (the site shows them to visitors).
- **Documents** come straight from Mongoose: `_id` (an ObjectId string) and `__v` included, field names camelCase.
- **No pagination, no filtering, no sorting parameters.** Lists are sorted by `order`.
- **Some errors aren't JSON:** a refused CORS origin (500), malformed JSON (400), a non-image upload (500) and an unknown path (404) get Express's default HTML page. With `NODE_ENV` other than `production`, that page includes the stack trace.

## Auth

Writes need the admin's token: `Authorization: Bearer <token>`, from `POST /api/auth/login`. The `protect` middleware answers:

| Status | `message` | When |
|---|---|---|
| 401 | `Niste prijavljeni` | no token: no `Authorization` header, one that doesn't start with `Bearer`, or one with nothing after a space (`Bearer` alone, `Bearerxyz`) |
| 401 | `Nevažeći ili istekli token` | the token (whatever follows the first space) doesn't verify or has expired |
| 401 | `Admin više ne postoji` | the token's admin was deleted |

### `POST /api/auth/login`

Body: `{"username": "…", "password": "…"}`.

| Status | Body |
|---|---|
| 200 | `{"status": "success", "token": "<JWT>"}`. The JWT carries `{id}` (the admin's `_id`) and expires after `JWT_EXPIRES_IN` |
| 400 | `{"status": "fail", "message": "Unesite korisničko ime i lozinku"}`: a field is missing |
| 401 | `{"status": "fail", "message": "Pogrešno korisničko ime ili lozinka"}`: no such user, or the wrong password (the same answer for both) |
| 500 | `{"status": "error", "message": "…"}`: for example `JWT_SECRET` or `JWT_EXPIRES_IN` missing, or no JSON body at all: `Cannot destructure property 'username' of 'req.body' as it is undefined.` |

No rate limit. No refresh, no logout endpoint: logging out is the site deleting its copy of the token.

## Categories

### `GET /api/categories`

Public. All categories, sorted by `order` ascending.

```json
{
  "status": "success",
  "results": 7,
  "data": {
    "categories": [
      { "_id": "…", "name": "BEEF BURGER", "slug": "beefBurger", "order": 1, "__v": 0 }
    ]
  }
}
```

500 `{"status": "error", "message": "…"}` if the database fails.

### `POST /api/categories`

Admin. Body: the category's fields, `{"name": "…", "slug": "…", "order": 8}`; the whole body is passed to `Category.create`. The admin sends all three: a slug made unique against the existing ones, and `order` = the highest + 1.

| Status | Body |
|---|---|
| 201 | `{"status": "success", "data": {"category": {…}}}` |
| 400 | `{"status": "fail", "message": "…"}`: a validation message ("Kategorija mora imati naziv", "Kategorija mora imati slug") or MongoDB's duplicate-key error for a slug that exists (`E11000 duplicate key error …`) |

### `PATCH /api/categories/:id`

Admin. Body: any of the fields; validators run.

| Status | Body |
|---|---|
| 200 | `{"status": "success", "data": {"category": {…}}}`, the updated category. **`"category": null` with 200 when no category has that id** |
| 400 | `{"status": "fail", "message": "…"}`: validation, or an `_id` that isn't an ObjectId (`Cast to ObjectId failed …`) |

The admin sends `{"name": "…"}` to rename a category (the slug stays) and `{"order": n}` to move one: it renumbers the categories 1 … n and sends one request per category whose `order` changed.

### `DELETE /api/categories/:id`

Admin.

| Status | Body |
|---|---|
| 204 | empty |
| 400 | `{"status": "fail", "message": "Kategoriju nije moguće obrisati jer sadrži N proizvoda."}`: it still has dishes |
| 404 | `{"status": "fail", "message": "Kategorija nije pronađena"}` |
| 400 | `{"status": "fail", "message": "…"}`: an invalid id |

## Dishes (food)

### `GET /api/food`

Public. Every dish, sorted by `order` ascending across all categories, with `category` populated.

```json
{
  "status": "success",
  "results": 44,
  "data": {
    "food": [
      {
        "_id": "…",
        "name": "CLASSIC BEEF BURGER",
        "description": "100% Beef-Patty, Cheddar, Salat, Tomate, Zwiebeln, Gurken und Burger-Sauce",
        "price": 14.5,
        "image": "/burgers-images/food1-1.JPG",
        "imageFileId": "",
        "category": { "_id": "…", "name": "BEEF BURGER", "slug": "beefBurger", "order": 1, "__v": 0 },
        "order": 1,
        "__v": 0
      }
    ]
  }
}
```

- `price` is a number in euros; the site formats it as `14,50 €`.
- `image` is one of: an ImageKit URL (`https://ik.imagekit.io/…`), a path the **site** serves from `public/` (`/burgers-images/…`, the seeded dishes), a path the **API** serves (`/uploads/…`, old files), or `""` ([data-model.md](data-model.md#photos)).
- 500 `{"status": "error", "message": "…"}` if the database fails.

### `POST /api/food`

Admin. `multipart/form-data` (what the admin sends) or JSON (without a photo):

| Field | |
|---|---|
| `name` | required |
| `description` | optional, default `""` |
| `price` | required, a number (`14.5`; a form field's string is cast) |
| `category` | required, a category's `_id` |
| `image` | optional, a file; only `image/*` MIME types |
| anything else | saved as given: the whole body goes to `Food.create`, so `order`, `image` or `imageFileId` can be set too |

With a file, the API uploads it to ImageKit first and sets `image` and `imageFileId` from the answer.

| Status | Body |
|---|---|
| 201 | `{"status": "success", "data": {"food": {…}}}`, with `category` populated |
| 400 | `{"status": "fail", "message": "…"}`: validation ("Hrana mora imati naziv", "Hrana mora imati cijenu", "Hrana mora imati kategoriju", or a cast error for a price that isn't a number), or ImageKit refusing the upload (a bad key) |
| 500 | HTML: the file isn't an image ("Možete uploadati samo slike") |

The admin sends `order` with a new dish: the highest `order` in its category + 1, so it sorts last. A request without `order` gets 0, which sorts before the seeded dishes.

### `PATCH /api/food/:id`

Admin. The same fields as `POST`, all optional; validators run. With a new file: the new photo is uploaded, the dish saved, then the old photo deleted from ImageKit (a failed delete is only logged).

| Status | Body |
|---|---|
| 200 | `{"status": "success", "data": {"food": {…}}}` |
| 404 | `{"status": "fail", "message": "Jelo nije pronađeno"}` |
| 400 | `{"status": "fail", "message": "…"}`: validation, an invalid id, an ImageKit error |

### `DELETE /api/food/:id`

Admin. Deletes the dish's ImageKit photo, if it has an `imageFileId` (a failure is only logged), then the dish.

| Status | Body |
|---|---|
| 204 | empty |
| 404 | `{"status": "fail", "message": "Jelo nije pronađeno"}` |
| 400 | `{"status": "fail", "message": "…"}`: an invalid id |

## Contact

### `POST /api/contact`

Public. Body: `{"name": "…", "email": "…", "message": "…"}`. Sends one email through Gmail to the pub (`burgerpubmunchen@gmail.com`), with the visitor's address as `Reply-To` ([architecture.md](architecture.md#mail)).

| Status | Body |
|---|---|
| 200 | `{"status": "success", "message": "Nachricht erfolgreich gesendet."}` |
| 400 | `{"status": "fail", "message": "Bitte füllen Sie alle Felder aus."}`: a field is missing or empty |
| 500 | `{"status": "error", "message": "Nachricht konnte nicht gesendet werden."}`: sending failed (no or wrong Gmail credentials), or the request had no JSON body at all; the API logs `EMAIL ERROR` |

The API doesn't validate the email address beyond its presence (the site checks its form before sending). No rate limit, no captcha ([known-issues.md](known-issues.md#security)).

## Reservations

### `POST /api/reservations`

Public. A table reservation **request**: one email to the pub (`burgerpubmunchen@gmail.com`), `Reply-To` the guest; nothing is stored, nothing is booked. The pub confirms by replying or calling. Code: `backend/controllers/reservationController.js`.

Body (JSON):

| Field | Rules |
|---|---|
| `name` | required, at most 100 characters; whitespace is collapsed to single spaces |
| `email` | required, at most 200 characters, `something@something.tld` |
| `phone` | required, at most 40 characters, at least 6 of digits, spaces, `+ ( ) / -` |
| `date` | required, `YYYY-MM-DD`, a real date, today or later **in Munich's time zone** (`Europe/Berlin`, whatever the server's zone) |
| `time` | required, `HH:MM`, 00:00–23:59; for today, later than the current time in Munich. Not checked against opening hours (the site has none) |
| `guests` | required, a whole number from 1 to 20. One guest is one seat |
| `message` | optional, at most 2000 characters |

| Status | Body |
|---|---|
| 200 | `{"status": "success", "message": "Reservierungsanfrage erfolgreich gesendet."}` |
| 400 | `{"status": "fail", "message": "…"}`, German and meant for the guest (the site shows it): `Bitte fülle alle Pflichtfelder aus.`, `Eine deiner Angaben ist zu lang.`, `Bitte gib eine gültige E-Mail-Adresse an.`, `Bitte gib eine gültige Telefonnummer an.`, `Online kannst du für 1 bis 20 Personen reservieren. Für größere Gruppen ruf uns bitte an.`, `Bitte wähle ein gültiges Datum.`, `Bitte wähle eine gültige Uhrzeit.`, `Das Datum liegt in der Vergangenheit.`, `Die Uhrzeit liegt in der Vergangenheit.` |
| 500 | `{"status": "error", "message": "Reservierungsanfrage konnte nicht gesendet werden."}`: sending failed; the API logs `RESERVATION ERROR` |

The email's subject reads `Reservierungsanfrage: Do., 24.12.2026, 19:30 Uhr, 4 Personen – <name>`; the body lists date, time, guests, name, email, phone and the message (HTML-escaped), and says the request isn't confirmed yet. No rate limit, no captcha ([known-issues.md](known-issues.md#security)).

## Other

| Endpoint | Answer |
|---|---|
| `GET /api/test` | 200 `{"status": "success", "message": "Burger Pub API radi"}` ("the API works"). Doesn't touch the database |
| `GET /uploads/<file>` | the file from `backend/uploads/`, statically |
| anything else | 404, Express's HTML page |

## Calling it by hand

```bash
API=http://localhost:5000
TOKEN=$(curl -s -X POST $API/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"<ADMIN_USERNAME>","password":"<ADMIN_PASSWORD>"}' | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')

curl -s $API/api/categories
curl -s -X POST $API/api/food -H "Authorization: Bearer $TOKEN" \
  -F name='TEST BURGER' -F price=9.5 -F category=<category _id> -F image=@photo.jpg
```

Only ever against a local API; the same calls against production change the live menu.
