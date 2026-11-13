"use client";

import { cn } from "@/lib/utils";

interface DemoFrameProps {
  src: string;
  title: string;
  height?: number;
  fill?: boolean;
  flush?: boolean;
}

export function DemoFrame({
  src,
  title,
  height = 360,
  fill = false,
  flush = false,
}: DemoFrameProps) {
  return (
    <div
      className={
        fill
          ? cn(
              "relative h-full w-full overflow-hidden bg-background",
              !flush && "rounded-xl border border-border",
            )
          : cn(
              "relative w-full overflow-hidden bg-background",
              !flush && "rounded-xl border border-border",
            )
      }
      style={fill ? undefined : { height }}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
