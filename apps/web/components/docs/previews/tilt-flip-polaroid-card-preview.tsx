"use client";

import { TiltFlipPolaroid } from "@workspace/ui/components/tilt-flip-polaroid";
import { tiltFlipPolaroidDemoImage } from "./tilt-flip-polaroid-preview";

export function TiltFlipPolaroidCardPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#FDF2F2]">
      <div className="scale-[0.58]">
        <TiltFlipPolaroid
          image={tiltFlipPolaroidDemoImage}
          maxTilt={12}
        />
      </div>
    </div>
  );
}
