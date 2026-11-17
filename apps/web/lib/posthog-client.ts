import posthog from "posthog-js";

export const CONSENT_STORAGE_KEY = "davinciui.cookie-consent";

let initialized = false;

/** Consent is only meaningful on the client; storage can throw when blocked. */
export function hasStoredConsent(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === "granted";
  } catch {
    return false;
  }
}

/**
 * Loads PostHog only after the visitor grants consent. Initializing earlier
 * makes the library pull its config, flags, surveys and autocapture bundles
 * over the network on every visit — extra requests (and data) before consent.
 */
export function initPostHog(): void {
  if (initialized) return;
  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!projectToken || !host) return;

  initialized = true;
  posthog.init(projectToken, {
    api_host: host,
    defaults: "2026-01-30",
    capture_exceptions: true,
    // Still opt-out by default: init alone must not capture anything.
    opt_out_capturing_by_default: true,
    debug: process.env.NODE_ENV === "development",
  });
  posthog.opt_in_capturing();
}
