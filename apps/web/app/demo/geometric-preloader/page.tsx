"use client";

import { GeometricPreloader } from "@workspace/ui/components/geometric-preloader";

export default function GeometricPreloaderDemoPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <GeometricPreloader />
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
    </div>
  );
}
