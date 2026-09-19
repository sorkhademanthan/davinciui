"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { PreloaderPro } from "@workspace/ui/components/preloader-pro";

/**
 * Fullscreen demo — the SAME PreloaderPro engine as the card,
 * filling the viewport. It loops forever; the docs shell's Fullscreen
 * control simply gives it a larger container. The Moon/Sun toggle flips
 * the website theme and the hero follows it live.
 */
export default function PreloaderProDemoPage() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="h-dvh w-full overflow-hidden bg-white dark:bg-zinc-950">
      <PreloaderPro mode="fullscreen" loop />

      <div className="fixed right-6 bottom-6 z-[200]">
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
      </div>
    </div>
  );
}
