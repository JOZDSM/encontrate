# GA4 catalogue analytics (providers)

Catalogue interactions are sent to **Google Analytics 4**. Each service provider gets a **view-only Looker Studio** report filtered to their `service_slug`, so they see live Google-backed numbers without access to other providers’ data.

Do **not** invite providers as GA4 Viewers on the full property — they would see every service.

## 1. Create the GA4 property

1. Open [Google Analytics](https://analytics.google.com/) → Admin → Create property for `encontrate.es`.
2. Create a **Web** data stream (URL: `https://www.encontrate.es`).
3. Copy the Measurement ID (`G-XXXXXXXX`).
4. Set env vars (local `.env` and Vercel):

   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
   ```

5. Redeploy / restart the app so the client bundle picks up the public env var.

## 2. Register custom dimensions (event-scoped)

Admin → Data display → Custom definitions → Create custom dimensions:

| Dimension name       | Scope | Event parameter       |
|----------------------|-------|------------------------|
| Service ID           | Event | `service_id`           |
| Service slug         | Event | `service_slug`         |
| Service title        | Event | `service_title`        |
| Professional name    | Event | `professional_name`    |
| Catalogue surface    | Event | `catalogue_surface`    |
| Contact option       | Event | `contact_option`       |

Dimensions only apply to events received **after** they are registered.

## 3. Events the app sends

| Event                              | Meaning                                      |
|------------------------------------|----------------------------------------------|
| `service_card_clicked`             | Card / search hit / similar card click       |
| `service_page_view`                | Service detail page viewed                   |
| `service_contact_opened`           | Contactar dialog opened                      |
| `service_contact_option_clicked`   | WhatsApp / email / Instagram / website       |
| `service_outbound_clicked`         | Direct website/Instagram icon (not dialog)   |
| `service_share_clicked`            | Compartir                                    |
| `catalogue_search_opened`          | Catalogue search overlay opened              |
| `catalogue_search_result_clicked`  | Search result clicked                        |

`catalogue_surface` examples: `recommended`, category slug, `search`, `similar`, `hero`, `description`.

Verify in GA4 **Realtime** or **DebugView** (with [Google Analytics Debugger](https://chrome.google.com/webstore) optional).

## 4. Looker Studio report for each provider

1. Open [Looker Studio](https://lookerstudio.google.com/) → Create → Report.
2. Add a **Google Analytics** data source → select this GA4 property.
3. Build scorecards / time series for:
   - `service_page_view` (page views)
   - `service_card_clicked`
   - `service_contact_opened`
   - `service_contact_option_clicked` (breakdown by `contact_option`)
   - `service_outbound_clicked` + `service_share_clicked`
4. Add a **report-level filter**: `Service slug` equals the provider’s slug (e.g. `florencia-gambini`).
5. File → Share → **Viewer** only → copy link → send to the provider.
6. For the next provider: **File → Make a copy**, change the slug filter, share the new link.

Tip: keep one untitled “TEMPLATE” report without a filter (or with a placeholder slug) and always copy from it.

## 5. Ops checklist (per new catalogue client)

- [ ] Service published with a stable `slug`
- [ ] Confirm events in GA4 Realtime for that slug
- [ ] Copy Looker template → filter `Service slug = …`
- [ ] Share view-only link with the provider
