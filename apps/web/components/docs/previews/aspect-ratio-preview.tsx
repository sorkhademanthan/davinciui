"use client";

import { AspectRatio } from "@workspace/ui/components/aspect-ratio";

export function AspectRatioPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-[300px]">
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg bg-muted">
          <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800" alt="Landscape" className="h-full w-full object-cover" />
        </AspectRatio>
      </div>
    </div>
  );
}

export function AspectRatioSquarePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-[260px]">
        <AspectRatio ratio={1} className="overflow-hidden rounded-lg bg-muted">
          <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600" alt="Square" className="h-full w-full object-cover" />
        </AspectRatio>
      </div>
    </div>
  );
}

export function AspectRatioPortraitPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-[220px]">
        <AspectRatio ratio={3 / 4} className="overflow-hidden rounded-lg bg-muted">
          <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600" alt="Portrait" className="h-full w-full object-cover" />
        </AspectRatio>
      </div>
    </div>
  );
}

export function AspectRatioRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <div className="w-[300px]">
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg bg-muted">
          <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800" alt="RTL" className="h-full w-full object-cover" />
        </AspectRatio>
      </div>
    </div>
  );
}
