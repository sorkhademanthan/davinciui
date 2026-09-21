"use client";

import { CursorMaskReveal } from "@workspace/ui/components/cursor-mask-reveal";

const foreground = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=70";
const background = "https://images.unsplash.com/photo-1528459105426-b9548367069b?auto=format&fit=crop&w=900&q=70";
const circle = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='white'/%3E%3C/svg%3E";

export function CursorMaskRevealCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ containerType: "inline-size" }}>
      <CursorMaskReveal backgroundImage={background} foregroundImage={foreground} cursorImage={circle} cursorSize={148} foregroundOpacity={0.24} smoothing={0.08} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-3">
        <span
          className="whitespace-nowrap text-[clamp(1.7rem,11cqi,3.8rem)] font-black uppercase leading-none tracking-[-0.075em] text-white mix-blend-difference"
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
