"use client";

import { SunlightEffect } from "@workspace/ui/components/sunlight-effect";

export function SunlightEffectCardPreview() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#020b07]"
      style={{ containerType: "inline-size" }}
    >
      <SunlightEffect maxDpr={1} />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3">
        <span
          className="whitespace-nowrap text-[clamp(1.65rem,11cqi,3.6rem)] font-black uppercase leading-none tracking-[-0.075em] text-[#efffd9]"
          style={{
            WebkitTextStroke: "0.7px rgba(2, 11, 7, 0.62)",
            textShadow: "0 4px 18px rgba(0, 0, 0, 0.5)",
          }}
        >
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
