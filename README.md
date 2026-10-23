# Veloura Beauty

A multi-brand beauty store built with Next.js, TypeScript and PostgreSQL. Shoppers browse,
choose shades, check out with cash on delivery and follow their orders; an admin area runs the
shop: orders, prices, stock and sales.

**Live demo:** https://veloura-beauty-store.vercel.app

> Veloura is not affiliated with any of the brands it shows. Prices and stock are illustrative,
> and no real payments are processed: cash on delivery is the only working method, the others are
> shown as coming soon. Product photographs come from [Unsplash](https://unsplash.com/license) and
> [Pexels](https://www.pexels.com/license/); each one is credited in `src/data/photoCredits.ts`.

![Homepage](docs/screenshots/home.jpg)

| Shop                                                   | Product with shade selection                     |
| ------------------------------------------------------ | ------------------------------------------------ |
| ![Shop](docs/screenshots/shop.jpg)                     | ![Product page](docs/screenshots/product.jpg)    |
| **Shopping bag**                                       | **Checkout with a delivery map**                 |
| ![Shopping bag](docs/screenshots/cart.jpg)             | ![Checkout](docs/screenshots/checkout.jpg)       |
| **Admin: overview**                                    | **Admin: one order**                             |
| ![Admin overview](docs/screenshots/admin-overview.jpg) | ![Admin order](docs/screenshots/admin-order.jpg) |
| **Brands A–Z**                                         | **Mobile**                                       |
| ![Brands A–Z](docs/screenshots/brands.jpg)             | ![Mobile home](docs/screenshots/mobile-home.jpg) |

## Features

**For shoppers**

- **Catalogue**: 59 products from 31 brands across makeup, skincare, fragrance and haircare, with
  filters, sorting and pages. Filters live in the URL, so a view can be shared or refreshed.
- **Shades** with their own stock; the bag line follows the chosen shade.
- **Checkout** in three steps, with a promo code (`VELOURA10`), a free-delivery threshold and a
  delivery pin on an OpenStreetMap map (Leaflet, no API key).
- **Orders** priced and saved on the server, a confirmation page on an unguessable URL, and a
  confirmation email (Resend).
- **Accounts** with email and password, or Google (Better Auth). Orders, wishlist and beauty
  profile follow the account across devices; a guest's wishlist is merged in on sign-in. Guests
  can still check out.

**For the admin** (`/admin`, admins only)

- **Overview**: orders to ship and how long the oldest has waited, revenue against the previous
  period, orders, average order, revenue per day, low stock and best sellers, for 7, 30 or 90 days.
- **Orders**: tabs by status, search by reference, name or phone, and one page per order with
  the cash to collect. Status moves Placed → Shipped → Delivered; cancelling puts the items back.
- **Products**: price, an optional "was" price shown crossed out, and stock per product or shade.
  The store shows a change straight away.

## Architecture

```mermaid
flowchart LR
  shopper([Shopper]) --> pages
  admin([Admin]) --> adminpages

  subgraph vercel [Next.js on Vercel]
    pages["Store pages<br/>pre-rendered"]
    adminpages["Admin pages<br/>rendered per request"]
    api["POST /api/orders"]
    actions["Server actions<br/>wishlist, profile, admin"]
    auth["Better Auth<br/>/api/auth"]
  end

  pages --> api
  pages --> actions
  adminpages --> actions
  api --> db[(PostgreSQL<br/>Neon)]
  actions --> db
  auth --> db
  pages -. "built from" .-> db
  api -. "after the response" .-> resend[Resend email]
```

- **One codebase, two kinds of pages.** Store pages are built ahead of time from the database and
  rebuilt when an admin changes a product (`revalidatePath`), so they stay fast. Admin and
  account pages are rendered per request, behind a session check.
- **The server owns the truth.** Checkout sends only product ids, shades and quantities. The
  server validates them (Zod), prices the order from the database and saves it while taking
  stock, in one transaction.
- **Business rules are plain functions** in `src/domain` (pricing, order status moves, dashboard
  arithmetic), tested without a database or a browser.

### Decisions worth calling out

- **Money is whole cents**, in the database and in every calculation. A typed price such as
  `19.99` is read digit by digit, never multiplied as a float.
- **No overselling, no lost updates.** Every change that depends on the current value is a
  conditional update that only applies if the value is still what was expected:
  `stock >= quantity` when ordering, the order's current status when the admin moves it, and the
  stock the admin's form loaded when it is saved. If an order changed it meanwhile, the save is
  refused and nothing is written. Two shoppers buying the last item at once: one gets it, one is
  told it has just sold out.
- **Orders keep a snapshot** of names and prices at the time of purchase, so editing a product
  never rewrites past orders, and best sellers are counted at the prices actually paid.
- **Authorization on the server, every time.** Who the user is comes from the session cookie,
  never from the URL or the request body, so no one can open another account's orders. Every
  server action checks the session and validates its input, because it can be called directly.
  The admin role is read from the database on each request, so revoking it takes effect at once;
  sign-up cannot set it, and admins are made from the command line (`npm run make-admin`).
- **Nothing reveals the admin.** A signed-in customer who opens an admin URL gets the store's
  ordinary 404, with the same page title.
- **Aggregation in the database.** The dashboard's daily revenue and best sellers are `GROUP BY`
  queries, counted in Beirut time rather than UTC, so only one row per day leaves the database.
- **Rate limits in Postgres**, not in memory: 5 orders per visitor every 10 minutes, 5 sign-in
  attempts a minute. Vercel runs several server instances, and a count in memory would belong to
  only one of them. Counting is one `INSERT … ON CONFLICT` statement, so concurrent requests
  cannot both read the old count.
- **Failures leave a trail, not a stack trace.** Server logs are one JSON line each. An unexpected
  error gives the shopper a short reference and writes the same id, with the details, to the log.
  Error pages keep the store's design and offer to try again.
- **No hydration mismatches from saved state.** A guest's bag and wishlist live in
  `localStorage`; `usePersistentState` renders the default first and loads the saved value after
  mount.

### Code layout

```
src/
├── app/             Routes: (store) pages, checkout, admin, /api/orders and /api/auth
├── components/      Layout and UI building blocks, product photographs with an SVG fallback
├── data/            The catalogue the database is seeded from, merchandising, photo credits
├── domain/          Framework-free rules: catalogue, cart, pricing, order status, dashboard
├── features/        One folder per journey: products, cart, checkout, account, auth, admin
├── hooks/           Bag, wishlist and profile state, synced to the account when signed in
├── lib/             Database client, auth, logger
├── providers/       Client-side state shared by every page (catalogue, bag, customer)
├── repositories/    Access to browser storage
├── server/          Server-only code: queries, server actions, transactions, rate limiting, email
├── services/        The checkout's call to POST /api/orders
├── styles/          Design tokens and element defaults (components use CSS Modules)
├── test/            Test stand-ins, fixtures and the integration-test guard
└── views/           Content pages (home, brands, policies, 404, error)
prisma/              Schema, migrations, seed, make-admin
```

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · PostgreSQL (Neon) · Prisma 7 ·
Better Auth · Zod · Resend · CSS Modules · Framer Motion · Leaflet · Jest and React Testing
Library · Node test runner · ESLint · Prettier · GitHub Actions · Vercel

## Getting started

Requires Node.js 20.9 or newer, and Docker for the local database.

```bash
npm install          # also generates the Prisma client
cp .env.example .env # then set BETTER_AUTH_SECRET
npm run db:up        # Postgres in Docker
npm run db:migrate   # create the tables
npm run db:seed      # load the catalogue from src/data
npm run dev          # http://localhost:3000
```

To open the admin, create an account on the site, then:

```bash
npm run make-admin -- you@example.com
```

| Script                     | What it does                                             |
| -------------------------- | -------------------------------------------------------- |
| `npm run dev`              | Development server                                       |
| `npm run build`            | Production build                                         |
| `npm run test:ci`          | Unit and component tests                                 |
| `npm run test:integration` | Server code against a real Postgres (see below)          |
| `npm run lint`             | ESLint, failing on any warning                           |
| `npm run typecheck`        | TypeScript, strict mode                                  |
| `npm run format:check`     | Verify Prettier formatting                               |
| `npm run db:migrate`       | Create a migration from schema changes and apply it      |
| `npm run db:studio`        | Browse the database in the browser                       |
| `npm run make-admin`       | Give an account the admin role (`--revoke` to remove it) |

Environment variables are listed, with what each one is for, in [`.env.example`](.env.example).

## Testing

- **Unit and component tests** (Jest, React Testing Library): pricing, order status moves,
  dashboard arithmetic, validation, the server actions' access checks, the checkout journey,
  account pages, the admin's forms and their failure states. The database and session are
  replaced, so these run in seconds.
- **Integration tests** (`*.int.test.ts`, Node's test runner) run the server code against a real
  Postgres: an order priced from the database whatever the request says, two shoppers buying the
  last item at once, a refused order rolling back, cancelling restocking exactly once, an admin's
  save refused when an order changed the stock, and ten concurrent requests against a rate limit
  of five. They change data, so they refuse to run on a database whose name does not end in
  `_test`:

  ```bash
  DATABASE_URL=postgresql://veloura:veloura@127.0.0.1:5432/veloura_test npm run test:integration
  ```

CI runs formatting, lint, the type check, the unit tests, the migrations and seed, the
integration tests and a production build on every push and pull request.

## Roadmap

- A real payment provider behind the existing checkout steps.
- A verified email domain, so confirmation emails reach every shopper, and with it a "forgot
  password" email. Until then, shoppers who forget a password can sign in with Google.

How the front end was migrated to Next.js and TypeScript is described in
[`docs/refactor-roadmap.md`](docs/refactor-roadmap.md).

## Author

Built by [Maya Chaker](https://github.com/MayaChaker).
