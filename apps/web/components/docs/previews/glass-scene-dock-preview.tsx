"use client";

import { GlassSceneDock } from "@workspace/ui/components/glass-scene-dock";

/** Full right-side / fullscreen preview. The component owns its scroll
 *  container, so it fills the preview panel and scrubs scenes internally. */
export function GlassSceneDockPreview() {
  return (
    <div className="h-full w-full">
      <GlassSceneDock />
    </div>
  );
}
