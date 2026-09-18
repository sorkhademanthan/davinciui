"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { PixelPreloader } from "@workspace/ui/components/pixel-preloader";

export default function PixelPreloaderDemoPage() {
  const [replayCount, setReplayCount] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();

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

  const replay = React.useCallback(() => {
    setRevealed(false);
    setReplayCount((count) => count + 1);
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      {frozen === null ? (
        <PixelPreloader
          key={replayCount}
          onComplete={() => setRevealed(true)}
        />
      ) : (
        <PixelPreloader key={`frozen-${frozen}`} progress={frozen} />
      )}

      {/* Page content sitting underneath the overlay */}
      <main className="flex min-h-screen items-center justify-center px-6">
        <h1 className="text-center text-[clamp(3rem,12vw,10rem)] font-bold leading-none tracking-[-0.04em] select-none">
          DAVINCI
        </h1>
      </main>

      <div className="fixed bottom-6 left-6 z-[200] flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            setTheme(resolvedTheme === "light" ? "dark" : "light")
          }
          aria-label="Toggle light and dark mode"
          className="rounded-full bg-zinc-950 p-2.5 text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98] dark:bg-white dark:text-zinc-950"
        >
          {resolvedTheme === "light" ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
        </button>
        {revealed && (
          <button
            type="button"
            onClick={replay}
            className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98] dark:bg-white dark:text-zinc-950"
          >
            Replay Preloader
          </button>
        )}
      </div>
    </div>
  );
}
