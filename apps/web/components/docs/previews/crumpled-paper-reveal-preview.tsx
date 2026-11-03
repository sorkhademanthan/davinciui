"use client";

import { cn } from "@/lib/utils";
import {
  CrumpledPaperReveal,
  type CrumpledPaperRevealProps,
} from "@workspace/ui/components/crumpled-paper-reveal";

export const crumpledPaperRevealDemoImage: NonNullable<
  CrumpledPaperRevealProps["image"]
> = {
  src: "/images/segmented-image-carousel/coastal-tree.jpg",
  alt: "A wind-shaped tree on a pale coastal hillside",
};

export function CrumpledPaperRevealPreview({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[520px] w-full items-center justify-center overflow-hidden bg-[#ece6da] p-6 transition-colors duration-300 dark:bg-[#12110f]",
        className,
      )}
    >
      <div className="w-full max-w-[340px]">
        <CrumpledPaperReveal
          image={crumpledPaperRevealDemoImage}
          alt="A wind-shaped tree on a pale coastal hillside"
          trigger="hover"
          aspect="4:5"
          shape="Tight Wad"
          duration={1}
        />
      </div>
    </div>
  );
}
