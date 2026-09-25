"use client";

import { LiquidChromeButton } from "@workspace/ui/components/liquid-chrome-button";

export function LiquidChromeButtonPreview() {
  return (
    <section className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-slate-100 p-8 dark:bg-[#090d13]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(95,140,172,.26),transparent_34%),linear-gradient(145deg,#f9fcff,#dce7ed_66%)] dark:bg-[radial-gradient(circle_at_50%_46%,rgba(108,157,196,.2),transparent_34%),linear-gradient(145deg,#0d1520,#07090d_66%)]" />
      <LiquidChromeButton size={176} borderWidth={15} speed={1} glassOpacity={0.44} ariaLabel="Open portfolio" />
    </section>
  );
}
