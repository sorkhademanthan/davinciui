"use client";

import {
  PREMIUM_PRELOADER_IMAGES,
  PremiumPreloader,
} from "@workspace/ui/components/premium-preloader";

/** Gallery card — the same engine running scoped and looping forever. */
export function PremiumPreloaderCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F2EFEA] text-[#171717] dark:bg-[#0B0B0C] dark:text-[#F5F5F4]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.85), transparent 48%), linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "auto, 40px 40px, 40px 40px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.07), transparent 48%), linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "auto, 40px 40px, 40px 40px",
        }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center px-5 text-center"
        style={{ containerType: "inline-size" }}
      >
        <p className="font-sans text-[clamp(22px,8.4cqw,40px)] font-bold leading-none tracking-[-0.04em]">
          DAVINCIUI
        </p>
      </div>

      <PremiumPreloader
        mode="preview"
        sequence="logo-images"
        images={PREMIUM_PRELOADER_IMAGES}
        theme="auto"
        loop
        loopHold={700}
      />
    </div>
  );
}
