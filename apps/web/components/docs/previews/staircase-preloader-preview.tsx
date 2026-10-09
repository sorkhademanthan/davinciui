"use client";

interface StaircasePreloaderPreviewProps {
  src: string;
  title: string;
  className?: string;
}

export function StaircasePreloaderPreview({
  src,
  title,
  className,
}: StaircasePreloaderPreviewProps) {
  return (
    <div
      className={`relative h-full min-h-[600px] w-full overflow-hidden ${className ?? ""}`}
    >
      <iframe
        src={src}
        className="absolute inset-0 h-full w-full border-0"
        title={title}
      />
    </div>
  );
}
