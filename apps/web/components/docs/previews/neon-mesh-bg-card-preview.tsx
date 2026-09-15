"use client";

import { NeonMeshBG } from "@workspace/ui/components/neon-mesh-bg";

export function NeonMeshBGCardPreview() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#0A0A08]"
      style={{ containerType: "inline-size" }}
    >
      <NeonMeshBG maxDpr={1} />
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
