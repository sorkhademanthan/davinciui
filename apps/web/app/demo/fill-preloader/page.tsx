"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { FillPreloader } from "@workspace/ui/components/fill-preloader";

export default function FillPreloaderDemoPage() {
  const [replayCount, setReplayCount] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const replay = React.useCallback(() => {
    setRevealed(false);
    setReplayCount((count) => count + 1);
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <FillPreloader
        key={replayCount}
        onComplete={() => setRevealed(true)}
      />

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
