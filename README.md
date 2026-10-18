# Veloura Beauty

A multi-brand beauty storefront built with Next.js and TypeScript. It covers the full shopping
journey: catalogue, brands, search, shades, bag, and a three-step checkout with a delivery map.

**Live demo:** https://veloura-beauty-store.vercel.app

> Veloura is not affiliated with any of the brands it shows. Prices and stock are illustrative.
> No real payments are processed: the payment options at checkout are presentation only, and
> everything a shopper saves stays in their own browser. Product photographs come from
> [Unsplash](https://unsplash.com/license) and [Pexels](https://www.pexels.com/license/); each one
> is credited in `src/data/photoCredits.ts`.

![Homepage](docs/screenshots/home.jpg)

| Shop                                             | Product with shade selection                  |
| ------------------------------------------------ | --------------------------------------------- |
| ![Shop](docs/screenshots/shop.jpg)               | ![Product page](docs/screenshots/product.jpg) |
| **Shopping bag**                                 | **Checkout with a delivery map**              |
| ![Shopping bag](docs/screenshots/cart.jpg)       | ![Checkout](docs/screenshots/checkout.jpg)    |
| **Brands A–Z**                                   | **Customer care**                             |
| ![Brands A–Z](docs/screenshots/brands.jpg)       | ![Customer care](docs/screenshots/care.jpg)   |
| **Mobile**                                       |                                               |
| ![Mobile home](docs/screenshots/mobile-home.jpg) |                                               |

## Features

- **Catalogue**: 59 products from 31 brands (Chanel, Dior, Le Labo, NARS, The Ordinary, Kiehl's,
  Olaplex…) across makeup, skincare, fragrance and haircare, with category, brand, price and
  availability filters, sorting and pages. Filters live in the URL, so a filtered view can be
  shared or refreshed.
- **Brands A–Z** and a page per brand, plus a search results page.
- **Shade variants**: foundations, concealers and lipsticks have selectable shades with their own
  price and stock; the bag line follows the chosen shade.
- **Bag and checkout**: quantities capped at stock, a promo code (`VELOURA10`), a free-delivery
  threshold, and a three-step checkout (information, delivery, payment). The delivery step drops a
  pin on an OpenStreetMap map (Leaflet, no API key) and fills the street and area from it.
- **Order confirmation** on its own URL, so it survives a reload.
- **Account pages without an account**: beauty profile, order history and wishlist share one
  side menu and are persisted in `localStorage`.
- **Customer care** with a menu of topics and each topic's answers as an accordion.
- **Accessibility**: keyboard-operable dialogs with focus trapping and focus return, labelled
  controls, a skip link, and reduced-motion support.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · CSS Modules · Framer Motion · Leaflet ·
MUI icons · Jest and React Testing Library · ESLint · Prettier · GitHub Actions · Vercel

## How it is built

```
src/
├── app/                 Routes, layouts, metadata, sitemap and robots (Next.js App Router)
│   ├── (store)/         Storefront pages sharing the header and footer
│   └── checkout/        Checkout and order confirmation, without store navigation
├── components/
│   ├── layout/          Header, footer, search, side menu layout
│   └── product-art/     Product photographs, with an SVG fallback
├── data/                Catalogue (one file per category), merchandising and photo credits
├── domain/              Framework-free business rules (cart, pricing, selection, wishlist)
├── features/            One folder per journey: products, cart, checkout, account, wishlist, profile
├── hooks/               Commerce and customer state, persistence, modal behaviour
├── providers/           Client-side state shared by every page
├── repositories/        Access to the catalogue and to browser storage
├── services/            Order creation (demo or hosted checkout)
├── styles/              Design tokens and element defaults (components use CSS Modules)
└── views/               Content pages (home, brands, policies, 404)
```

Some decisions worth calling out:

- **Static where possible.** Every product, category and policy page is pre-rendered at build time
  (`generateStaticParams`) with its own title and description; unknown URLs return a real 404.
  Interactive parts (bag, filters, checkout) are client components inside those pages.
- **No hydration mismatches from saved state.** The bag, wishlist and profile live in
  `localStorage`, which the server cannot read. `usePersistentState` renders the default first
  and loads the saved value after mount, and exposes a `hydrated` flag so checkout does not
  redirect an "empty" bag before it has loaded.
- **Business rules are plain functions.** Pricing, cart updates and variant resolution live in
  `src/domain` with their own unit tests, so components stay thin and the rules can move to a
  server later without rewriting the UI. Prices are calculated in whole cents to avoid
  floating-point drift.
- **Photography by convention, with an SVG fallback.** Each product has a photograph at
  `public/images/products/<slug>.webp`, attached to the catalogue in `src/data/productImages.ts`.
  Tests fail if a photograph or its credit is missing. `ProductVisual` serves it through
  `next/image` with a `sizes` hint per placement; a product without a photograph is drawn as SVG
  by `ProductArt` from its packaging type and colours.
- **State that should be shareable is in the URL** (shop filters, selected shade, order
  confirmation); state that belongs to the shopper is in `localStorage` behind
  `storageRepository`.
- **One hook for every modal surface.** The bag, quick view, filters and mobile menu share
  `useModalDialog` for scroll lock, focus trapping, Escape to close and focus return.
- **Checkout is ready for a real payment provider.** Setting `NEXT_PUBLIC_CHECKOUT_URL` makes the
  last step post product ids and quantities to a server endpoint that creates a hosted payment
  session; the server, not the browser, decides prices.

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                 | What it does                   |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Development server             |
| `npm run build`        | Production build               |
| `npm start`            | Serve the production build     |
| `npm run test:ci`      | Run the test suite once        |
| `npm run lint`         | ESLint, failing on any warning |
| `npm run typecheck`    | TypeScript, strict mode        |
| `npm run format:check` | Verify Prettier formatting     |

Optional environment variables are listed in [`.env.example`](.env.example).

## Testing

Unit tests cover the domain rules (pricing, cart state, variant selection, shop filters).
Integration tests walk through checkout to the confirmation page, URL-driven filters,
and the route handlers' not-found and metadata behaviour, with `next/navigation` replaced by an
in-memory stand-in (`src/test/navigation.ts`). CI runs formatting, lint, the type check, tests and a
production build on every push and pull request.

## Roadmap

- A real payment provider behind the existing checkout steps.

The full plan is in [`docs/refactor-roadmap.md`](docs/refactor-roadmap.md).

## Author

Built by [Maya Chaker](https://github.com/MayaChaker).
