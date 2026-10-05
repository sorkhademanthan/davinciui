import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (projectToken && host) {
  posthog.init(projectToken, {
    api_host: host,
    defaults: "2026-01-30",
    capture_exceptions: true,
    // Consent-first: nothing is captured until the user accepts the cookie
    // banner (lib/analytics + CookieConsent flips this via opt-in).
    opt_out_capturing_by_default: true,
    debug: process.env.NODE_ENV === "development",
  });
}
