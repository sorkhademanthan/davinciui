"use client";

import { SilkAurora } from "@workspace/ui/components/silk-aurora";

export function SilkAuroraCardPreview() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#050507]"
      style={{ containerType: "inline-size" }}
    >
      <SilkAurora
        baseColor="#060505"
        midColor="#19130f"
        sheenColor="#ffe2a9"
        accentColor="#c58d5d"
        intensity={0.9}
        speed={0.75}
        className="h-full w-full min-h-0"
      />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3 text-center">
        <span className="whitespace-nowrap text-[clamp(1.6rem,10cqi,3.4rem)] font-black uppercase leading-none tracking-[-0.055em] text-white">
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
