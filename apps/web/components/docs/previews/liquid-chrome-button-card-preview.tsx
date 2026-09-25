"use client";

import { LiquidChromeButton } from "@workspace/ui/components/liquid-chrome-button";

export function LiquidChromeButtonCardPreview() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden bg-slate-100 dark:bg-[#090d13]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(95,140,172,.26),transparent_48%)] dark:bg-[radial-gradient(circle_at_50%_44%,rgba(107,164,207,.24),transparent_48%)]" />
      <LiquidChromeButton decorative size={82} borderWidth={8} speed={0.8} glassOpacity={0.46} />
    </div>
  );
}
