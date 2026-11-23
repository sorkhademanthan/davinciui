import { NextResponse } from "next/server"

/**
 * Feedback stub. Replace the console sink with a database or analytics
 * destination when the docs feedback pipeline is wired up.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
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

  return NextResponse.json({ ok: true })
}
