"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

function AspectRatio({ ratio = 1, className, style, ...props }: AspectRatioProps) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{ position: "relative", width: "100%", paddingBottom: `${100 / ratio}%`, ...style } as React.CSSProperties}
      className={cn(className)}
      {...props}
    >
      <div className="absolute inset-0">{props.children}</div>
    </div>
  );
}

export { AspectRatio };
