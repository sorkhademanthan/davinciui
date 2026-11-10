"use client";

import {
  CMSMediaBento,
  BENTO_DEFAULT_ITEMS,
} from "@workspace/ui/components/cms-media-bento";
import {
  demoBoolean,
  demoEnum,
  demoNumber,
  useDemoSearchParams,
} from "@/lib/demo-search-params";

const CAPTION_MODES = ["always", "hover", "hidden"] as const;

export default function CmsMediaBentoDemoPage() {
  const params = useDemoSearchParams();

  if (!params) return null;

  const background = params.get("background") || undefined;

  return (
    <main className="h-dvh w-screen overflow-hidden bg-background">
      <CMSMediaBento
        items={BENTO_DEFAULT_ITEMS}
        background={background}
        gap={demoNumber(params, "gap", 10)}
        radius={demoNumber(params, "radius", 14)}
        captions={demoEnum(params, "captions", CAPTION_MODES, "hover")}
        hoverGrow={demoNumber(params, "hoverGrow", 1.8)}
        focusDim={demoNumber(params, "focusDim", 0.35)}
        hoverZoom={demoNumber(params, "hoverZoom", 1.04)}
        mirror={demoBoolean(params, "mirror", false)}
        openLightbox={demoBoolean(params, "openLightbox", true)}
        transitionMs={demoNumber(params, "transitionMs", 420)}
        minHeight={demoNumber(params, "minHeight", 0)}
      />
    </main>
  );
}
