"use client";

import { ScrollSyncGallery } from "@workspace/ui/components/scroll-sync-gallery";
import {
  demoEnum,
  demoNumber,
  demoString,
  useDemoSearchParams,
} from "@/lib/demo-search-params";

export default function ScrollSyncGalleryDemoPage() {
  const params = useDemoSearchParams();
  if (!params) return null;

  return (
    <ScrollSyncGallery
      preset={demoEnum(
        params,
        "preset",
        ["alternating", "flow", "mixed"],
        "alternating",
      )}
      scrollHeight={demoNumber(params, "scrollHeight", 400)}
      viewportHeight={demoString(params, "viewportHeight", "100vh")}
      gap={demoNumber(params, "gap", 0)}
      rowGap={demoNumber(params, "rowGap", 0)}
      travel={demoNumber(params, "travel", 0.65)}
      smoothing={demoNumber(params, "smoothing", 0.12)}
      objectFit={demoEnum(
        params,
        "objectFit",
        ["cover", "contain", "fill"],
        "cover",
      )}
      objectPosition={demoString(params, "objectPosition", "50% 50%")}
      desktopColumns={demoNumber(params, "desktopColumns", 4)}
      tabletColumns={demoNumber(params, "tabletColumns", 3)}
      mobileColumns={demoNumber(params, "mobileColumns", 2)}
    />
  );
}
