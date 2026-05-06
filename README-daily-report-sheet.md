## Daily ops Google Sheet (GitHub Actions + Google WIF)

This repo includes a GitHub Actions workflow that syncs a persistent Google Sheet tab with user data and preserves an editable `contacted` column.

### What it syncs

Sheet tab: `Users` (default)

Columns (A→H):
- `userId` (primary key for upserts)
- `username`
- `email`
- `phoneNumber` (WhatsApp)
- `contacted` (editable; preserved)
- `hasListing`
- `createdAt`
- `approved`

### Required GitHub secrets

Add these repository secrets:
- `DATABASE_URL`
- `GOOGLE_SHEET_ID`

### Workflow

File: `.github/workflows/daily-report.yml`

Runs daily (cron) and can be triggered manually.

