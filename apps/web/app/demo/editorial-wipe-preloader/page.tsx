"use client";

import { EditorialWipePreloader } from "@workspace/ui/components/editorial-wipe-preloader";

export default function EditorialWipePreloaderDemoPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <EditorialWipePreloader />

      {/* Page content sitting underneath the overlay */}
      <main className="flex min-h-screen items-center justify-center px-6">
        <h1 className="text-center text-[clamp(3rem,12vw,10rem)] font-bold leading-none tracking-[-0.04em] select-none">
          DAVINCIUI
        </h1>
      </main>
    </div>
  );
}
