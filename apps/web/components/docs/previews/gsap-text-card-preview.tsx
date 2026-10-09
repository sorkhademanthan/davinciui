"use client";

import { KineticText } from "@workspace/ui/components/gsap-text";

/**
 * Homepage tile — the exact GSAP Text (gsap-text) gallery animation:
 * DAVINCIUI centered, layered 3D depth, continuous vertical motion.
 */
export function GSAPTextCardPreview({ fontSize = 46 }: { fontSize?: number }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center overflow-hidden px-6"
    >
      <KineticText
        text="DAVINCIUI"
        htmlTag="span"
        direction="both"
        layerCount={5}
        distance={112}
        duration={4.8}
        font={{
          fontFamily: "inherit",
          fontSize,
          fontWeight: 800,
          letterSpacing: "-0.055em",
          lineHeight: 1,
        }}
      />
    </div>
  );
}
