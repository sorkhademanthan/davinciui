import {
  VideoPreviewGrid,
  type VideoPreviewGridItem,
} from "@workspace/ui/components/video-preview-grid";

const HOME_CATALOG = [
  "cinematic-card-carousel",
  "geometric-trail-cursor",
  "gsap-text",
  "hover-cards",
  "lens-drift-grid",
  "pixel-flow",
  "pixel-wipe-carousel",
  "scroll-reveal-image",
  "sunlight-effect",
  "text-video-mask",
] as const;

function buildItems(count: number): VideoPreviewGridItem[] {
  return Array.from({ length: count }, (_, index) => {
    const slug = HOME_CATALOG[index % HOME_CATALOG.length];
    const theme = index % 2 === 0 ? "light" : "dark";
    return {
      id: `${slug}-${index}`,
      href: `#/${slug}/${index}`,
      poster: `/preview-videos/home/${slug}/${slug}-${theme}.webp`,
      sources: [
        {
          src: `/preview-videos/home/${slug}/${slug}-${theme}.webm`,
          type: "video/webm",
        },
        {
          src: `/preview-videos/home/${slug}/${slug}-${theme}.mp4`,
          type: "video/mp4",
        },
      ],
      title: slug,
      meta: `Item ${index + 1} of ${count}`,
    };
  });
}

export default function VideoPreviewGridDemoPage() {
  return (
    <main className="w-screen">
      <VideoPreviewGrid items={buildItems(200)} height={1280} />
      <footer className="flex h-20 w-full items-center justify-center bg-zinc-900 px-6 text-xs text-zinc-400 dark:bg-zinc-800">
        Video preview grid demo — 200 cards, hover any card to play.
      </footer>
    </main>
  );
}
