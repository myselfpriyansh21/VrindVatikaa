# Vrind Vatikaa — Banquet & Lawn

Production website + owner CMS for a real event venue/restaurant in Telibagh, Lucknow.

## Tech Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Firebase (Auth + Firestore)
· Cloudinary · Framer Motion · React Hook Form + Zod · Sonner · @dnd-kit

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in real Firebase/Cloudinary credentials
npm run dev
```

## Required Setup Before This Runs For Real

1. **Firebase project**: enable Authentication (Google Sign-In) and Firestore.
   Fill in `NEXT_PUBLIC_FIREBASE_*` and `FIREBASE_PROJECT_ID` /
   `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` in `.env.local`.
2. **Deploy Firestore rules**: `firebase deploy --only firestore:rules`.
3. **Seed the real restaurant menu** (optional, saves a lot of manual clicking):
   ```bash
   npm run seed:menu
   ```
   Populates all 9 categories and ~56 items from the real "Ghar Ki Rasoi"
   menu card directly into Firestore — safe to re-run if you send updated
   prices later (it updates existing items by matching name, never
   duplicates). Everything seeded is still fully editable afterwards via
   `/admin/restaurant/menu`.
4. **Grant yourself admin access**: sign in once at `/admin/login` (you'll be
   rejected — expected), then:
   ```bash
   npm run admin:grant -- you@example.com owner
   ```
   Sign out and back in.
5. **Cloudinary account**: fill in `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
6. **Add real content** via the now-complete admin dashboard: gallery photos,
   restaurant/catering menus, reviews, FAQs, services & facilities, and
   business settings. Nothing in this codebase fabricates business content —
   every public list renders empty (or a factual seed fallback) until real
   data is added through `/admin`.

## What's Real vs. Placeholder

- **Business contact info** (phone, WhatsApp, email, address, Instagram) is
  sourced directly from the owner's visiting card.
- **The logo** (header, footer, splash, favicon, Apple touch icon, OG image)
  is extracted from the actual supplied artwork — not recreated with text.
- **Google Maps link/embed and exact coordinates** are still placeholder —
  editable via `/admin/settings` once available.
- **Menu items, gallery photos, reviews, services/facilities** ship empty —
  the admin CMS is how the owner populates all of it, no code changes needed.

## Implementation Status — Complete

### Public site
- Editorial, restrained visual design: grouped mobile navigation panel,
  bottom-weighted hero composition, borderless pillar/FAQ layouts, label +
  description facilities format — built to the "real hospitality brand, not
  an AI template" bar
- Splash intro (localStorage, once-per-visitor) using the real logo
- Homepage: hero, pillars, services & facilities, **gallery** (category
  filter + lightbox), reviews, FAQ, contact — all reading live from
  Firestore with factual seed fallbacks
- Inquiry system end-to-end: sectioned "Check Availability" modal → client +
  server Zod validation → honeypot → rate limiting → Firestore → WhatsApp
  handoff → success state
- Restaurant page: real hours (9 AM–11 PM), live menu with the
  price-visibility rule enforced in code (restaurant shows price, catering
  never does), Restaurant + LocalBusiness JSON-LD
- Privacy Policy, sitemap.xml, robots.txt
- Branded 404 page, public + admin error boundaries, root/admin loading states
  (previously these fell through to Next.js's generic default screens)

### Admin (`/admin`)
- **Authentication**: Google Sign-In → server-verified httpOnly session
  cookie → every route protected by a Node.js-runtime Server Component
  layout (real cryptographic verification, not a frontend check), with a
  fast Edge redirect in `proxy.ts` as a first layer
- **Firestore Security Rules**: inquiries create-only for the public and
  fully unreadable without an authorized admin token; all content
  public-read-if-published, admin-write-only
- **Dashboard**: live Firestore counts, zero fabricated stats
- **Inquiries**: search, status filter, archive, status changes, contact-log
  notes, direct call/WhatsApp links
- **Restaurant Menu + Categories**: full CRUD, image upload, price field
  (shown publicly)
- **Catering Menu + Categories**: full CRUD, image upload — **no price field
  exists in this form at all**, not just hidden at render time
- **Gallery + Gallery Categories**: Cloudinary upload, publish/feature
  toggles, **drag-and-drop reordering via @dnd-kit**, delete cleans up the
  Cloudinary asset too
- **Reviews, FAQs**: add/publish/delete
- **Venue & Services**: Services and Facilities CRUD (chargeable flag +
  note, e.g. the bridal room)
- **Business Settings**: single centralized form — updates contact info,
  WhatsApp links, and footer everywhere at once

## Project Structure

```
app/                  Routes, incl. app/admin/(dashboard) route group
components/           UI by domain (layout, marketing, admin, inquiry, menu, gallery, ...)
lib/                  Firebase (client + admin), Cloudinary, validation, WhatsApp, session
services/             Server-only Firestore reads (public content, dashboard stats)
types/                Shared TypeScript types matching the Firestore schema
config/               Centralized site/business configuration (fallback layer)
scripts/              One-time admin role grant script
firestore.rules        Firestore Security Rules
```

## Key Architectural Decisions Worth Knowing

- **Admin auth uses session cookies, not client-side ID token checks** — see
  `lib/firebase/session.ts` for why.
- **Authorization is via custom claims**, set only via
  `scripts/set-admin-role.mjs` from a trusted machine — no client-writable
  path grants access.
- **Admin CMS writes go through the Firebase client SDK directly** (not
  custom API routes per module), authenticated by the same signed-in admin
  session; Firestore Security Rules are the actual enforcement point, not
  this app code. Page *access* is separately gated server-side by the
  dashboard layout.
- **Cloudinary uploads go browser → Cloudinary directly** after a
  server-issued signature; deletes go through a small server route so the
  API secret is never exposed either way.
- **Restaurant/catering price separation is enforced twice**: once in the
  admin form (the price input doesn't exist in the DOM for catering items)
  and once in the public `MenuItemCard` renderer — defense in depth, not
  reliance on a single check.
- **Reordering uses simple up/down swaps** for categories (a handful of
  items) and **@dnd-kit drag-and-drop** for the gallery (potentially many
  images) — matched to what each list actually needs.

## Content freshness

Public pages (`/`, `/restaurant`, `/privacy`) use incremental static
regeneration (`revalidate = 60`): they are served statically for speed but
rebuilt in the background at most once a minute, so admin edits (menu, FAQs,
gallery, reviews, services) appear on the live site within about a minute
with no redeploy. Contact details from Business Settings update on the next
page load via the client-side settings provider.
