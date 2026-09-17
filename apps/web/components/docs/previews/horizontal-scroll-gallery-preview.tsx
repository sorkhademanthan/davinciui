"use client";

import { cn } from "@/lib/utils";

interface HorizontalScrollGalleryPreviewProps {
  src: string;
  title: string;
  className?: string;
}

export function HorizontalScrollGalleryPreview({
  src,
  title,
  className,
}: HorizontalScrollGalleryPreviewProps) {
  return (
    <div className={cn("relative h-full min-h-[640px] w-full overflow-hidden", className)}>
      <iframe src={src} title={title} className="h-full w-full border-0" />
    </div>
  );
}
