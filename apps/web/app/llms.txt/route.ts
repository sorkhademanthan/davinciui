import { getLlmsText } from "@/config/docs";

export const dynamic = "force-dynamic";

export function GET() {
  // Regenerated on every request from nav groups + registry source,
  // so Foundations, MCP and new components never go stale.
  return new Response(getLlmsText(), {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
