"use client";

// Central analytics helper. PostHog is initialized in opted-out mode
// (see instrumentation-client.ts) and only captures after the user grants
// consent in the cookie banner — so every track() call below is safe to
// invoke unconditionally; events simply drop until opt-in.

import posthog from "posthog-js";
import { CONSENT_STORAGE_KEY, initPostHog } from "@/lib/posthog-client";

export type AnalyticsConsent = "granted" | "denied" | null;

const STORAGE_KEY = CONSENT_STORAGE_KEY;

function readStorage(): string | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** null = undecided (banner visible), otherwise the stored choice. Never throws. */
export function getConsent(): AnalyticsConsent {
  const raw = readStorage();
  return raw === "granted" || raw === "denied" ? raw : null;
}

/** Persist the choice and flip PostHog capture accordingly. Never throws. */
export function setConsent(granted: boolean): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied");
    }
  } catch {
    // Storage blocked — consent simply won't persist.
  }
  try {
    if (granted) {
      initPostHog();
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
  } catch {
    // PostHog unavailable — nothing to flip.
  }
}

/** Capture an event only when consent was granted. Never throws. */
export function track(event: string, properties?: Record<string, unknown>): void {
  try {
    if (getConsent() !== "granted") return;
    posthog.capture(event, properties);
  } catch {
    // Analytics must never break product flows.
  }
}
