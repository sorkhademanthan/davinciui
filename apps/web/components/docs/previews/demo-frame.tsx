"use client";

interface DemoFrameProps {
  src: string;
  title: string;
  height?: number;
  fill?: boolean;
}

export function DemoFrame({
  src,
  title,
  height = 360,
  fill = false,
}: DemoFrameProps) {
  return (
    <div
      className={
        fill
          ? "relative h-full w-full overflow-hidden rounded-xl border border-border bg-background"
          : "relative w-full overflow-hidden rounded-xl border border-border bg-background"
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
