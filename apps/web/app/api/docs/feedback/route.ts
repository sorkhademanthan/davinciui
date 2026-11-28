import { NextResponse } from "next/server"

const MAX_BODY_BYTES = 32 * 1024

/**
 * Feedback stub. Replace the console sink with a database or analytics
 * destination when the docs feedback pipeline is wired up.
 */
export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0")
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 })
  }

  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }
    const body = JSON.parse(raw) as {
      page?: string
      helpful?: boolean
      comment?: string
    }
    console.info("[docs-feedback]", {
      page: body.page,
      helpful: body.helpful,
      hasComment: Boolean(body.comment?.trim()),
    })
  } catch {
    // Ignore malformed payloads; feedback is best-effort.
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
}
