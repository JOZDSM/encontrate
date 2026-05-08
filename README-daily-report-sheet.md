## Daily ops Google Sheet (GitHub Actions + Google WIF)

This repo includes a GitHub Actions workflow that syncs a persistent Google Sheet
with two tabs:

- `Users` — one row per user; preserves the editable `contacted` column.
- `Listings` — one row per listing with engagement counts; preserves the editable
  `notes` column. The script auto-creates the tab if it doesn't exist.

### Users tab

Columns (A→I):
- `userId` (primary key for upserts)
- `username`
- `email`
- `phoneNumber` (WhatsApp)
- `contacted` (editable; preserved; dropdown: Yes / No / Completed)
- `hasListing`
- `createdAt`
- `approved`
- `country` (editable; preserved; dropdown of Latin America, Northern America
  and Europe countries; defaults to `Unknown` for new and blank rows)

Both `contacted` and `country` are sheet-only ops fields. The script defaults
new and blank rows but never overwrites a value you've already set.

### Listings tab

Columns (A→N):
- `listingId` (primary key for upserts)
- `title`
- `hostName`
- `hostEmail`
- `city`
- `neighborhood`
- `priceEur`
- `favorites` — count of users that added the listing to favorites
- `uniqueVisits` — count of unique users that opened the listing detail page
  (counted once per user, regardless of how many times they reopen it; host
  and platform admin views are excluded)
- `confirmedBookings`
- `photos`
- `createdAt`
- `url` — public listing URL, when `PUBLIC_URL_BASE` is configured
- `notes` (editable; preserved)

`uniqueVisits` is backed by the `ListingVisit` table, populated server-side on
the listing detail page via `next/server`'s `after()`.

### Required GitHub secrets

Add these repository secrets:
- `DATABASE_URL`
- `GOOGLE_SHEET_ID`
- `PUBLIC_URL_BASE` (optional; e.g. `https://encontrate.es` — used to populate
  the `url` column in the `Listings` tab)

### Workflow

File: `.github/workflows/daily-report.yml`

Runs daily (cron) and can be triggered manually.
