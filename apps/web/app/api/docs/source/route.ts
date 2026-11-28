import { NextRequest, NextResponse } from "next/server"
import { highlightCode } from "@/lib/shiki"
import { readComponentSource } from "@/lib/source-code"
import type { BundledLanguage } from "shiki"

const LANGUAGE_WHITELIST = new Set<BundledLanguage>(["tsx", "typescript", "bash", "json"])

// Keep the highlighting endpoint cheap: reject oversized bodies before
// parsing/highlighting so a single request cannot pin CPU or memory.
const MAX_BODY_BYTES = 512 * 1024
const MAX_CODE_LENGTH = 200_000

function payloadTooLarge() {
  return NextResponse.json({ error: "Payload too large" }, { status: 413 })
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0")
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return payloadTooLarge()
  }

  let payload: { component?: string; code?: string; lang?: string }
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) return payloadTooLarge()
    payload = JSON.parse(raw) as typeof payload
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    const requestedLang = (payload.lang || "tsx") as BundledLanguage
    const lang = LANGUAGE_WHITELIST.has(requestedLang) ? requestedLang : "tsx"

    if (payload.component) {
      const componentName = payload.component.trim()
      if (!/^[a-z0-9-]+$/i.test(componentName)) {
        return NextResponse.json({ error: "Invalid component name" }, { status: 400 })
      }

      const source = await readComponentSource(componentName)
      if (!source) {
        return NextResponse.json({ error: "Source not found" }, { status: 404 })
      }

      const html = await highlightCode(source.trim(), lang)
      return NextResponse.json({ code: source, html })
    }

    if (!payload.code || typeof payload.code !== "string") {
      return NextResponse.json({ error: "Missing code" }, { status: 400 })
    }

    if (payload.code.length > MAX_CODE_LENGTH) {
      return payloadTooLarge()
    }

    const html = await highlightCode(payload.code.trim(), lang)
    return NextResponse.json({ html })
  } catch {
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 })
  }
}
