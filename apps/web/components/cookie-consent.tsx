"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { getConsent, setConsent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Consent-first analytics banner. Renders only when the visitor hasn't
 * chosen yet; the choice persists in localStorage and flips PostHog
 * capture via opt-in/opt-out (PostHog starts opted-out — see
 * instrumentation-client.ts).
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (granted: boolean) => {
    setConsent(granted);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-5 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.4)] dark:border-white/10 dark:bg-[#131316] dark:shadow-[0_24px_70px_-24px_rgba(0,0,0,0.9)] sm:left-6 sm:right-auto sm:bottom-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300">
          <BarChart3 className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
            Privacy-friendly analytics
          </p>
          <p className="mt-1 text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">
            We use PostHog to understand aggregate usage — no ads, no sale of
            data. See our{" "}
            <Link
              href="/privacy-policy"
              className="underline underline-offset-2 transition-colors hover:text-zinc-950 dark:hover:text-white"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => choose(false)}
          className={cn(
            "inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium text-zinc-700 transition-colors",
            "hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            "dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/[0.08]",
          )}
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          autoFocus
          className={cn(
            "inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors",
            "hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            "dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-[#131316]",
          )}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
