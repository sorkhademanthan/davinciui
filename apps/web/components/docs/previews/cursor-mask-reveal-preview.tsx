"use client";

import { CursorMaskReveal } from "@workspace/ui/components/cursor-mask-reveal";

const portrait = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=90";
const palette = "https://images.unsplash.com/photo-1528459105426-b9548367069b?auto=format&fit=crop&w=1800&q=90";
const orangeDisc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='white'/%3E%3C/svg%3E";

export function CursorMaskRevealPreview() {
  return (
    <CursorMaskReveal
      backgroundImage={palette}
      foregroundImage={portrait}
      cursorImage={orangeDisc}
      alt="Portrait with a colorful image revealed through a large circular cursor"
      cursorSize={286}
      foregroundOpacity={0.16}
      smoothing={0.13}
      className="h-full min-h-[600px] w-full bg-[#f7f5f2]"
    >
      <div className="pointer-events-none flex min-h-[600px] items-end p-7 sm:p-10">
        <p className="max-w-xs text-sm leading-6 text-white/80 mix-blend-difference">
          Upload a transparent PNG or SVG to make the reveal unmistakably yours.
        </p>
      </div>
    </CursorMaskReveal>
  );
}
