"use client";

import { LensDriftGrid } from "@workspace/ui/components/lens-drift-grid";

/**
 * Live miniature for the component gallery card. The grid drifts on its own
 * via autoDrift (cursor motion, no video file) and still answers real
 * drag/hover input — the route-linked card stays fully navigable.
 */
export function LensDriftGridCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <LensDriftGrid
        tileWidth={120}
        tileHeight={140}
        lensStrength={0.3}
        hoverNudge={10}
        autoDrift={{ x: 30, y: -16 }}
      />
    </div>
  );
}
