"use client";

import { cn } from "@/lib/utils";
import {
  TiltFlipPolaroid,
  type TiltFlipPolaroidImage,
} from "@workspace/ui/components/tilt-flip-polaroid";

export const tiltFlipPolaroidDemoImage: TiltFlipPolaroidImage = {
  src: "https://images.unsplash.com/photo-1610846202780-b4d9837371ea?w=900&q=85&auto=format&fit=crop",
  alt: "Lone figure passing through a muted green field",
};

export function TiltFlipPolaroidPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[520px] w-full items-center justify-center bg-[#FAFAFA] p-6 transition-colors duration-300 dark:bg-[#0A0A0B]",
        className,
      )}
    >
      <TiltFlipPolaroid image={tiltFlipPolaroidDemoImage} />
    </div>
  );
}
