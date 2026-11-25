"use client";

import { AmbientStrip } from "@workspace/ui/components/ambient-strip";
import { ambientStripDemoItems } from "./ambient-strip-items";

export function AmbientStripPreview() {
  return (
    <AmbientStrip
      items={ambientStripDemoItems}
      loop
      className="h-full min-h-[520px]"
    />
  );
}
