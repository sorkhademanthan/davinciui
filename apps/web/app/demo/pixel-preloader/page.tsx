"use client";

import * as React from "react";
import { PixelPreloader } from "@workspace/ui/components/pixel-preloader";

export default function PixelPreloaderDemoPage() {
  // Debug hook for visual checkpoints: /demo/pixel-preloader?progress=75
  // freezes the frontier at a fixed progress (no auto-run, no exit).
  const [frozen] = React.useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("progress");
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value)
      ? Math.min(100, Math.max(0, value))
      : null;
  });

  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      {frozen === null ? (
        <PixelPreloader />
      ) : (
        <PixelPreloader key={`frozen-${frozen}`} progress={frozen} />
      )}

      {/* Page content sitting underneath the overlay */}
      <main className="flex min-h-screen items-center justify-center px-6">
        <h1 className="text-center text-[clamp(3rem,12vw,10rem)] font-bold leading-none tracking-[-0.04em] select-none">
          DAVINCI
        </h1>
      </main>
    </div>
  );
}
