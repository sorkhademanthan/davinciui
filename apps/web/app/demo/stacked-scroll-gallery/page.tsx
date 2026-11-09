"use client";

import { StackedScrollGallery } from "@workspace/ui/components/stacked-scroll-gallery";
import {
  demoBoolean,
  demoEnum,
  demoNumber,
  demoString,
  useDemoSearchParams,
} from "@/lib/demo-search-params";

export default function StackedScrollGalleryDemoPage() {
  const params = useDemoSearchParams();
  if (!params) return null;

  return (
    <StackedScrollGallery
      viewportHeight={demoString(params, "viewportHeight", "100vh")}
      scrollDistancePerItem={demoNumber(params, "scrollDistancePerItem", 100)}
      previewHeight={demoNumber(params, "previewHeight", 44)}
      radius={demoNumber(params, "radius", 20)}
      fit={demoEnum(params, "fit", ["cover", "contain", "fill"], "cover")}
      position={demoString(params, "position", "50% 50%")}
      smoothing={demoNumber(params, "smoothing", 0.14)}
      easing={demoEnum(params, "easing", ["linear", "easeInOut"], "linear")}
      dimming={demoBoolean(params, "dimming", true)}
      dimStrength={demoNumber(params, "dimStrength", 0.3)}
      enabled={demoBoolean(params, "enabled", true)}
      pauseOffscreenVideos={demoBoolean(params, "pauseOffscreenVideos", true)}
      gutter={demoNumber(params, "gutter", 22)}
    />
  );
}
