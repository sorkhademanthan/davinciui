"use client";

import { ServicesShowcase } from "@workspace/ui/components/services-showcase";

/**
 * Miniature for the component gallery card. Same component, compact
 * density — container queries scale type, rows and artwork down while
 * preserving numbers, dividers and the layered-stack effect.
 */
export function ServicesShowcaseCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0a0b]">
      <ServicesShowcase density="compact" interactive={false} />
    </div>
  );
}
