"use client";

import { StaircasePreloader } from "@workspace/ui/components/staircase-preloader";

export default function StaircasePreloaderDemoPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <StaircasePreloader />

      {/* Page content sitting underneath the overlay */}
      <main className="flex min-h-screen items-center justify-center px-6">
        <h1 className="text-center text-[clamp(3rem,12vw,10rem)] font-bold leading-none tracking-[-0.04em] select-none">
          DAVINCIUI
        </h1>
      </main>
    </div>
  );
}
