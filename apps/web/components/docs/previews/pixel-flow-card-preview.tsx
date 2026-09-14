"use client";

import { PixelFlow } from "@workspace/ui/components/pixel-flow";

export function PixelFlowCardPreview() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#0d0820]"
      style={{ containerType: "inline-size" }}
    >
      <PixelFlow preset="reference-purple" />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3">
        <span
          className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-white"
          style={{
            WebkitTextStroke: "0.7px rgba(5, 8, 12, 0.52)",
            textShadow: "0 3px 14px rgba(0, 0, 0, 0.48)",
          }}
        >
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
