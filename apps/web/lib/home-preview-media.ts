/**
 * Homepage bento preview videos.
 *
 * Defaults to the app's own static assets (served from the Vercel CDN).
 * Point `NEXT_PUBLIC_HOME_PREVIEW_VIDEO_BASE` at the R2 public bucket to serve
 * the same paths from Cloudflare instead, e.g.
 * `https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/home`.
 */
const BASE = (
  process.env.NEXT_PUBLIC_HOME_PREVIEW_VIDEO_BASE ?? "/preview-videos/home"
).replace(/\/$/, "");

export type HomePreviewTheme = "light" | "dark";

export function homePreviewMedia(slug: string, theme: HomePreviewTheme) {
  const path = `${BASE}/${slug}/${slug}-${theme}`;
  return {
    webm: `${path}.webm`,
    mp4: `${path}.mp4`,
    poster: `${path}.webp`,
  };
}
