"use client";

interface DemoFrameProps {
  src: string;
  title: string;
  height?: number;
}

export function DemoFrame({ src, title, height = 360 }: DemoFrameProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border bg-background"
      style={{ height }}
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
