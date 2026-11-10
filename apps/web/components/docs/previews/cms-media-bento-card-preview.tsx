"use client";

import {
  CMSMediaBento,
  BENTO_DEFAULT_ITEMS,
} from "@workspace/ui/components/cms-media-bento";

/**
 * Live miniature for the component gallery card. The desktop bento is forced
 * on so the weighted composition reads inside the short card frame.
 */
export function CmsMediaBentoCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <CMSMediaBento
        items={BENTO_DEFAULT_ITEMS}
        gap={6}
        radius={9}
        captions="hidden"
        hoverGrow={1.55}
        focusDim={0.25}
        transitionMs={320}
        minHeight={0}
        mobileBreakpoint={0}
        className="h-full w-full"
      />
    </div>
  );
}
