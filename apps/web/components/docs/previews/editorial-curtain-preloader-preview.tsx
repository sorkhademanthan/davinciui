"use client";

interface PremiumPreloaderPreviewProps {
  src: string;
  title: string;
  className?: string;
}

export function PremiumPreloaderPreview({
  src,
  title,
  className,
}: PremiumPreloaderPreviewProps) {
  return (
    <div
      className={`relative h-full min-h-[600px] w-full overflow-hidden bg-[#F5F3F1] dark:bg-[#101012] ${className ?? ""}`}
    >
      <iframe
        src={src}
        className="absolute inset-0 h-full w-full border-0 bg-[#F5F3F1] dark:bg-[#101012]"
        title={title}
      />
    </div>
  );
}
