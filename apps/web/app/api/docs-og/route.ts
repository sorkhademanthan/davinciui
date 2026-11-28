import { brandOgImage } from "@/components/seo/og-image"

export const runtime = "edge"

const CACHE_CONTROL =
  "public, s-maxage=31536000, stale-while-revalidate=86400, immutable"

function clean(value: string, max: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, max)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const title = clean(url.searchParams.get("title") ?? "DavinciUI Docs", 80)
  const eyebrow = clean(url.searchParams.get("eyebrow") ?? "Documentation", 40)
  return brandOgImage(eyebrow, title, { "Cache-Control": CACHE_CONTROL })
}
