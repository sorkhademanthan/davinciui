import { hasStoredConsent, initPostHog } from "./lib/posthog-client";

// Consent-first: do not load PostHog at all until the visitor has accepted.
// Returning visitors who already accepted get it initialized immediately.
if (hasStoredConsent()) {
  initPostHog();
}
