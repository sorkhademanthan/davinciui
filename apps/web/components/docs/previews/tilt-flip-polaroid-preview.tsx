"use client";

import { cn } from "@/lib/utils";
import {
  TiltFlipPolaroid,
  type TiltFlipPolaroidImage,
} from "@workspace/ui/components/tilt-flip-polaroid";

export const tiltFlipPolaroidDemoImage: TiltFlipPolaroidImage = {
  src: "/images/segmented-image-carousel/coastal-tree.jpg",
  alt: "Windswept tree on a foggy coastal dune",
};

export function TiltFlipPolaroidPreview({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[520px] w-full items-center justify-center bg-[#FDF2F2] p-6",
        className,
      )}
    >
      <TiltFlipPolaroid image={tiltFlipPolaroidDemoImage} />
    </div>
  );
}
