"use client";

/**
 * Cookieless analytics helper.
 *
 * Launch policy: no PostHog, no consent banner, no analytics cookies.
 * Vercel Analytics and Umami are aggregate and cookieless. Custom events are
 * forwarded to Umami when its script is ready; otherwise they are dropped.
 * Analytics must never break product flows, so every call is guarded.
 */

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

export function track(
  event: string,
  properties?: Record<string, unknown>,
): void {
  try {
    if (typeof window === "undefined") return;
    window.umami?.track(event, properties);
  } catch {
    // Analytics unavailable — nothing to do.
  }
}
