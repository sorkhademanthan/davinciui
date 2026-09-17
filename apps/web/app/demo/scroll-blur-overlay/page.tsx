"use client";

import { ScrollBlurOverlayInteractivePreview } from "@/components/docs/previews/scroll-blur-overlay-interactive-preview";

export default function ScrollBlurOverlayDemoPage() {
  return (
    <main className="relative h-svh overflow-hidden bg-[#050611]">
      <ScrollBlurOverlayInteractivePreview className="relative inset-auto h-full" />
    </main>
  );
}
