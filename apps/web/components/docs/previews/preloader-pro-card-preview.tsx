"use client";

import { PreloaderPro } from "@workspace/ui/components/preloader-pro";

/**
 * Gallery card — the SAME PreloaderPro engine as fullscreen,
 * running in preview mode inside the card frame. It loops forever.
 */
export function PreloaderProCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <PreloaderPro mode="preview" loop />
    </div>
  );
}
