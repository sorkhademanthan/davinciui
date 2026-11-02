import type { Metadata } from "next";
import { infiniteImageGalleryItems } from "@/components/docs/previews/infinite-image-gallery-items";
import { InfiniteImageGallery } from "@workspace/ui/components/infinite-image-gallery";

export const metadata: Metadata = {
  title: "Infinite Image Gallery",
};

export default function InfiniteImageGalleryDemoPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#f3f1ec] dark:bg-[#11100e]">
      <InfiniteImageGallery
        images={infiniteImageGalleryItems}
        className="h-full min-h-0"
        aria-label="Infinite editorial and architectural image gallery"
      />
    </main>
  );
}
