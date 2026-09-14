"use client";

import { Noiser } from "@workspace/ui/components/noiser";

export function NoiserCardPreview() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_25%_20%,#603c9a_0%,transparent_48%),linear-gradient(135deg,#11101c_0%,#29244a_55%,#10131f_100%)]"
      style={{ containerType: "inline-size" }}
    >
      <Noiser
        colorMode="duo"
        colorA="#f5efff"
        colorB="#a38bff"
        frequency={0.32}
        noiseOpacity={0.78}
        colorOpacity={0.78}
        animated
        fps={12}
      />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3">
        <span
          className="whitespace-nowrap text-[clamp(1.5rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-white"
          style={{
            WebkitTextStroke: "0.7px rgba(17, 16, 28, 0.55)",
            textShadow: "0 3px 14px rgba(0, 0, 0, 0.4)",
          }}
        >
          DAVINCIUI
        </span>
      </div>
    </div>
  );
}
