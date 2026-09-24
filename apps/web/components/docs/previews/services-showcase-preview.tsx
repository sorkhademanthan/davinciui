"use client";

import { ServicesShowcase } from "@workspace/ui/components/services-showcase";

/** Full right-side / fullscreen preview. Rendered inside the docs
 *  scrollable preview surface so nested-scroll parallax is exercised. */
export function ServicesShowcasePreview() {
  return <ServicesShowcase className="min-h-full" />;
}
