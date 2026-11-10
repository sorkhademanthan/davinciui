"use client";

import { ScrollMediaExpand } from "@workspace/ui/components/scroll-media-expand";
import {
  demoBoolean,
  demoEnum,
  demoNumber,
  demoString,
  useDemoSearchParams,
} from "@/lib/demo-search-params";

export default function ScrollMediaExpandDemoPage() {
  const params = useDemoSearchParams();
  if (!params) return null;

  return (
    <ScrollMediaExpand
      src="https://images.unsplash.com/photo-1517796931930-443b6f13cf65?auto=format&fit=crop&w=2400&q=85"
      leftLabel={demoString(params, "leftLabel", "©2026")}
      rightLabel={demoString(params, "rightLabel", "Showreel")}
      overlayText={demoString(params, "overlayText", "Play showreel")}
      objectPosition={demoString(params, "objectPosition", "50% 35%")}
      objectFit={demoEnum(
        params,
        "objectFit",
        ["cover", "contain", "fill"],
        "cover",
      )}
      initialWidth={demoNumber(params, "initialWidth", 280)}
      initialHeight={demoNumber(params, "initialHeight", 72)}
      sectionHeight={demoString(params, "sectionHeight", "300vh")}
      viewportHeight={demoString(params, "viewportHeight", "100svh")}
      startRadius={demoNumber(params, "startRadius", 999)}
      endRadius={demoNumber(params, "endRadius", 0)}
      showOverlay={demoBoolean(params, "showOverlay", true)}
      showScrollHint={demoBoolean(params, "showScrollHint", false)}
      smoothing={demoNumber(params, "smoothing", 0)}
      enabled={demoBoolean(params, "enabled", true)}
    />
  );
}
