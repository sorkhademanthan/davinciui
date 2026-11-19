"use client";

import { PremiumPreloader } from "@workspace/ui/components/editorial-curtain-preloader";

export default function PremiumPreloaderDemoPage() {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#F2EFEA] text-[#171717] dark:bg-black dark:text-[#F5F5F4]">
      <PremiumPreloader theme="auto" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55] dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.9), transparent 42%), linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)",
          backgroundSize: "auto, 64px 64px, 64px 64px",
        }}
      />

      <main className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <h1 className="text-center font-sans text-[clamp(46px,11.5vw,176px)] font-bold leading-none tracking-[-0.04em]">
            DAVINCIUI
          </h1>
        </div>
      </main>
    </div>
  );
}
