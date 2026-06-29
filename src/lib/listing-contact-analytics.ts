import posthog from "posthog-js";

/**
 * Custom PostHog events for listing detail contact surfaces.
 *
 * Unified insight ("Users who contacted via a listing"):
 * Trends → Unique users → OR across:
 * - listing_contact_phone_clicked
 * - listing_contact_email_clicked
 * - listing_contact_inquiry_opened
 * - listing_host_inquiry_submitted
 * - booking_request_clicked
 * - booking_request_submitted (optional: completed only)
 *
 * Break down by `listing_id` or event name as needed.
 */
export function captureListingContactEvent(
  event: string,
  listingId: string,
  props?: Record<string, boolean | string | number>,
) {
  posthog.capture(event, { listing_id: listingId, ...props });
}
