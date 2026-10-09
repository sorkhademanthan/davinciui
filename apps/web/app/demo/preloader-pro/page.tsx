"use client";

import { PreloaderPro } from "@workspace/ui/components/preloader-pro";

/**
 * Fullscreen demo — the SAME PreloaderPro engine as the card,
 * filling the viewport. It loops forever; the docs shell's Fullscreen
 * control simply gives it a larger container.
 */
export default function PreloaderProDemoPage() {
  return (
    <div className="h-dvh w-full overflow-hidden bg-white dark:bg-zinc-950">
      <PreloaderPro mode="fullscreen" loop />
    </div>
  );
}
