"use client";

import { SoftFluidGradient } from "@workspace/ui/components/soft-fluid-gradient";

export function SoftFluidGradientCardPreview() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#c8d8e5]"
      style={{ containerType: "inline-size" }}
    >
      <SoftFluidGradient speed={0.26} density={1} maxDpr={1} />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3">
        <span
          className="whitespace-nowrap text-[clamp(1.4rem,9cqi,3.1rem)] font-black uppercase leading-none tracking-[-0.075em] text-white"
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
