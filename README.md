# Hospedaje en Barcelona

Personal platform for coordinating rooms in Barcelona: listings with filters, booking requests, host confirmation, calendar blocks, per-booking messaging, and an **admin view** (operator-only) of all listings and active bookings. **There are no in-app payments.**

The **site UI is Spanish by default**; this README is in English for day-to-day development.

Stack: **Next.js (App Router)**, **TypeScript**, **Tailwind + shadcn/ui**, **PostgreSQL + Prisma**, **Auth.js** with magic link (**Resend**), deployment aimed at **Vercel** + **Neon**.

## Requirements

- Node 20+
- Postgres database (`DATABASE_URL` as `postgresql://...`)

## Setup

```bash
cp .env.example .env
# Edit .env with DATABASE_URL, AUTH_SECRET, RESEND_API_KEY, EMAIL_FROM, NEXT_PUBLIC_APP_URL, ADMIN_EMAILS
```

**Admin:** a user is an admin if their email is in `ADMIN_EMAILS` or if `User.isAdmin = true` in the database (update via Prisma Studio or SQL).

## Database

```bash
npx prisma migrate deploy
# or in development, with an empty DB:
npx prisma migrate dev
```

The initial migration lives in `prisma/migrations/`.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Home page hero backgrounds

Rotating full-bleed images are listed in **`src/lib/home-hero-images.ts`** (`HOME_HERO_IMAGES`). Add HTTPS URLs (CDN, storage) or paths to files in **`public/`** (e.g. `"/hero-1.jpg"`). The first entry is seeded from the Figma export; replace or extend the array.

## Styling (design tokens)

Semantic colors, radius, and related tokens live in **`src/app/globals.css`**.

1. **Change values in one place** — Edit the CSS custom properties under **`:root`** (light) and **`.dark`** (dark). Values use `oklch(...)` by default; you can switch to hex or other valid CSS colors if you prefer.
2. **How they reach Tailwind** — The **`@theme inline`** block maps those variables to Tailwind (e.g. `--primary` → `bg-primary`, `text-primary`, `border-border`, `text-muted-foreground`). Adjust the variable in `:root` / `.dark`; keep the `@theme` wiring unless you are adding new tokens.
3. **Use tokens in UI code** — Prefer utilities tied to semantics (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, etc.) instead of raw palette classes (`text-gray-600`) so a token change propagates everywhere.
4. **shadcn** — The project uses **CSS variables** for the UI kit (`components.json` → `tailwind.cssVariables`). New shadcn components will expect the same token names.

To add a **new** semantic color: define `--my-token` in `:root` / `.dark`, add a matching `--color-my-token: var(--my-token);` entry inside `@theme inline`, then use `bg-my-token`, `text-my-token`, or `var(--my-token)` as needed.

## Figma → Cursor (faithful implementation)

Cursor’s model **cannot log into Figma** or reliably pull specs from a link alone. Treat Figma as the source of truth for *you*, and give the chat **both visuals and numbers**.

### What to attach or paste

1. **Screenshots or exports** — Desktop (required) and mobile/tablet if layouts differ. Include full pages for layout and cropped shots for dense components (cards, forms, nav). The model can read images you drop into the chat.
2. **Measured specs from Dev Mode / Inspect** — Don’t rely on “it looks like ~16px.” Paste or list:
   - **Colors** — fills, strokes, text (hex/RGBA), including hover/active/disabled if defined.
   - **Typography** — family, weight, size, line-height, letter-spacing for each level (display, H1, body, caption).
   - **Layout** — max width, page padding, section gaps, grid columns and gutters.
   - **Effects** — corner radius, shadows, borders (width + color).
   - **Breakpoints** — where the composition changes (e.g. stack → two columns).
3. **Behavior and structure** — Short notes: sticky header, modal vs drawer, which pieces are reusable components, form validation/error states, empty states.
4. **Content** — Real or representative copy; length affects line breaks and hierarchy.

### Align with this repo

- Prefer mapping Figma **variables / styles** to **`src/app/globals.css`** tokens (see [Styling (design tokens)](#styling-design-tokens)) so future tweaks are one-line changes.
- When asking for implementation, say whether to **match Figma literally** or **approximate** with existing shadcn patterns.

### Per-screen checklist (copy into a prompt)

- Screenshot(s) for that screen/state.
- Bullet list of **colors + type scale + spacing** that matter on that screen.
- One paragraph on **responsive** behavior.
- Any **exceptions** (“only on host dashboard,” etc.).

A **view-only Figma link** is optional context for you; still provide **images + specs** in the chat for the most faithful results.

## Business rules (summary)

- Booking ranges and blocks use **half-open** date intervals `[check-in, check-out)` (hotel-style).
- Only **CONFIRMED** bookings and host **availability blocks** occupy dates; overlaps with another **PENDING** request on the same listing are not allowed.
- The **full address** is visible only to the host, admins, and guests with a **confirmed** booking.
- Photos: paste **HTTPS URLs** (one per line) in the host form. (Optional: you can add [Uploadthing](https://uploadthing.com) again for file uploads.)

## Deploy (Vercel)

1. Create a Vercel project and connect the repo.
2. Environment variables: same as in `.env.example`.
3. Run migrations against production (`prisma migrate deploy` in CI or locally against prod).

## Legal notice

The copy at `/aviso` is a **template**; replace it with text reviewed by a professional before public use.
