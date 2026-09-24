"use client";

import { NudgeButton } from "@workspace/ui/components/nudge-button";

/** Right-side / fullscreen preview — centered, theme-aware, no demo chrome. */
export function NudgeButtonPreview() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <NudgeButton>BUY NUDGE</NudgeButton>
    </div>
  );
}
