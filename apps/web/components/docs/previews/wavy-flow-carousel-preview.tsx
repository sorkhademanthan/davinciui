"use client";

export function WavyFlowCarouselPreview() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden bg-background">
      <iframe
        src="/demo/wavy-flow-carousel"
        title="Wavy Flow Carousel demo"
        loading="lazy"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
