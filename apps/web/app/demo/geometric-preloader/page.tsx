"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { GeometricPreloader } from "@workspace/ui/components/geometric-preloader";

export default function GeometricPreloaderDemoPage() {
  const [replay, setReplay] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <GeometricPreloader key={replay} onComplete={() => setRevealed(true)} />
      {/* Page content revealed through the diamond exit */}
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
          Component Library
        </p>
        <h1 className="text-center text-[clamp(3rem,12vw,10rem)] font-black leading-none tracking-[-0.04em] select-none">
          DAVINCIUI
        </h1>
        <p className="max-w-md text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Expressive motion and carefully crafted components for every
          interface.
        </p>
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
            onClick={() => {
              setRevealed(false);
              setReplay((id) => id + 1);
            }}
            className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98] dark:bg-white dark:text-zinc-950"
          >
            Replay Preloader
          </button>
        )}
      </div>
    </div>
  );
}
