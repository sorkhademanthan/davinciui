import { brandOgImage } from "@/components/seo/og-image"

export const runtime = "edge"

export function GET(request: Request) {
  const url = new URL(request.url)
  const title = url.searchParams.get("title") ?? "DavinciUI Docs"
  const eyebrow = url.searchParams.get("eyebrow") ?? "Documentation"
  return brandOgImage(eyebrow, title)
}
