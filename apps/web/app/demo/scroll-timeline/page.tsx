"use client";

import { ScrollTimeline } from "@workspace/ui/components/scroll-timeline";
import {
  demoBoolean,
  demoEnum,
  demoNumber,
  demoString,
  useDemoSearchParams,
} from "@/lib/demo-search-params";

export default function ScrollTimelineDemoPage() {
  const params = useDemoSearchParams();
  if (!params) return null;

  return (
    <ScrollTimeline
      scrollPerItem={demoNumber(params, "scrollPerItem", 100)}
      rotationAmount={demoNumber(params, "rotationAmount", 82)}
      yearSize={demoString(params, "yearSize", "clamp(9rem, 19vw, 20rem)")}
      descriptionWidth={demoString(
        params,
        "descriptionWidth",
        "min(28rem, 30vw)",
      )}
      easing={demoEnum(params, "easing", ["linear", "smooth"], "smooth")}
      viewportHeight={demoString(params, "viewportHeight", "100vh")}
      smoothing={demoNumber(params, "smoothing", 0)}
      disableAnimation={demoBoolean(params, "disableAnimation", false)}
      pauseWhenOffscreen={demoBoolean(params, "pauseWhenOffscreen", true)}
    />
  );
}
