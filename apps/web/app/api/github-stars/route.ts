import { NextResponse } from "next/server";

const REPO = "sorkhademanthan/davinciui";

/**
 * Star count proxy. Browsers share a tiny unauthenticated GitHub quota, so
 * every visitor fetching api.github.com directly gets rate-limited and sees
 * a stale number forever. This route fetches once per hour (cached) for all
 * visitors, with an optional token for a higher quota. A private/renamed
 * repo yields { stars: null } and the header falls back to a plain button.
 */
export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "davinciui-site",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const response = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return NextResponse.json({ stars: null });
    }
    const data = (await response.json()) as { stargazers_count?: unknown };
    return NextResponse.json({
      stars:
        typeof data.stargazers_count === "number" ? data.stargazers_count : null,
    });
  } catch {
    return NextResponse.json({ stars: null });
  }
}
