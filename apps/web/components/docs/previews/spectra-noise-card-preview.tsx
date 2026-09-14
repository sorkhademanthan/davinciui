"use client";

import { SpectraNoise } from "@workspace/ui/components/spectra-noise";

export function SpectraNoiseCardPreview() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#03090b]"
      style={{ containerType: "inline-size" }}
    >
      <SpectraNoise maxDpr={1} resolutionScale={0.75} />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3">
        <span
          className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-white"
          style={{
            WebkitTextStroke: "0.7px rgba(3, 6, 4, 0.55)",
            textShadow: "0 3px 14px rgba(0, 0, 0, 0.55)",
          }}
        >
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
