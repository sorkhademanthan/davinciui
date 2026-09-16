"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollSyncGalleryPreviewProps {
  src: string;
  title: string;
  className?: string;
}

export function ScrollSyncGalleryPreview({
  src,
  title,
  className,
}: ScrollSyncGalleryPreviewProps) {
  return (
    <div className={cn("relative h-full min-h-[600px] w-full overflow-hidden", className)}>
      <iframe
        src={src}
        className="h-full w-full border-0 bg-transparent"
        title={title}
      />
    </div>
  );
}
