"use client";

import { ServicesShowcase } from "@workspace/ui/components/services-showcase";

/** Full right-side / fullscreen preview. The stack owns the complete preview
 *  surface, so it stays centered and cannot be clipped by an inner scroller. */
export function ServicesShowcasePreview() {
  return <ServicesShowcase className="h-full min-h-0" />;
}
