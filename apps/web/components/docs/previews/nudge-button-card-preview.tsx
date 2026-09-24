"use client";

import { NudgeButton } from "@workspace/ui/components/nudge-button";

/** Gallery card miniature — same component, scaled by container queries. */
export function NudgeButtonCardPreview() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden px-4"
      style={{ containerType: "inline-size" }}
    >
      <NudgeButton>BUY NUDGE</NudgeButton>
    </div>
  );
}
