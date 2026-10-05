"use client";

import { LensDriftGrid } from "@workspace/ui/components/lens-drift-grid";

/**
 * Live miniature for the component gallery card. Pure autoplay: the grid
 * drifts on its own and ignores all cursor, wheel, and keyboard input, so
 * nothing the mouse does affects the animation.
 */
export function LensDriftGridCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <LensDriftGrid
        tileWidth={120}
        tileHeight={140}
        lensStrength={0.3}
        autoDrift={{ x: 30, y: -16 }}
        interactive={false}
      />
    </div>
  );
}
