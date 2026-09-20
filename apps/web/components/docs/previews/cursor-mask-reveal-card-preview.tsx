"use client";

import { CursorMaskReveal } from "@workspace/ui/components/cursor-mask-reveal";

const foreground = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=70";
const background = "https://images.unsplash.com/photo-1528459105426-b9548367069b?auto=format&fit=crop&w=900&q=70";
const circle = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='white'/%3E%3C/svg%3E";

export function CursorMaskRevealCardPreview() {
  return <CursorMaskReveal backgroundImage={background} foregroundImage={foreground} cursorImage={circle} cursorSize={148} foregroundOpacity={0.24} smoothing={0.08} className="absolute inset-0" />;
}
