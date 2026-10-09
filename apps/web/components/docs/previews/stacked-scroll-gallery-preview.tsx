"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StackedScrollGalleryPreviewProps {
  src: string;
  title: string;
  className?: string;
}

export function StackedScrollGalleryPreview({
  src,
  title,
  className,
}: StackedScrollGalleryPreviewProps) {
  return (
    <div className={cn("relative h-full min-h-[600px] w-full overflow-hidden", className)}>
      <iframe
        src={src}
        className="absolute inset-0 h-full w-full border-0 bg-transparent"
        title={title}
      />
    </div>
  );
}
