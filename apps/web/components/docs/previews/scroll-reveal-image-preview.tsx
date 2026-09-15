"use client";

import { cn } from "@/lib/utils";

interface ScrollRevealImagePreviewProps {
  src: string;
  title: string;
  className?: string;
}

export function ScrollRevealImagePreview({
  src,
  title,
  className,
}: ScrollRevealImagePreviewProps) {
  return (
    <div className={cn("relative h-full min-h-[640px] w-full overflow-hidden", className)}>
      <iframe src={src} title={title} className="h-full w-full border-0" />
    </div>
  );
}
