"use client";

interface PreloaderProPreviewProps {
  src: string;
  title: string;
  className?: string;
}

export function PreloaderProPreview({
  src,
  title,
  className,
}: PreloaderProPreviewProps) {
  return (
    <div
      className={`relative h-full min-h-[600px] w-full overflow-hidden bg-white ${className ?? ""}`}
    >
      <iframe
        src={src}
        className="absolute inset-0 h-full w-full border-0 bg-white"
        title={title}
      />
    </div>
  );
}
