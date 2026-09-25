"use client";

import { ServicesShowcase } from "@workspace/ui/components/services-showcase";

/**
 * Miniature for the component gallery card. It loops automatically while
 * remaining display-only, so the route-linked card stays fully navigable.
 */
export function ServicesShowcaseCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <ServicesShowcase density="compact" interactive={false} autoPlay />
    </div>
  );
}
