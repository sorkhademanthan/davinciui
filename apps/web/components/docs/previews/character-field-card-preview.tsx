"use client";

import { CharacterField } from "@workspace/ui/components/character-field";

export function CharacterFieldCardPreview() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#060a09]"
      style={{ containerType: "inline-size" }}
    >
      <CharacterField
        className="h-full w-full"
        characterSet="mixed"
        fontSize={12}
        characterSpacing={1}
        lineHeight={1.4}
        maxDpr={1}
      />
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
