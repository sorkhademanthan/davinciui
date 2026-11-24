import { NextResponse } from "next/server";

const REPO = "sorkhademanthan/davinciui";

/**
 * The repo is currently private, so anonymous GitHub API reads return 404.
 * Keep the last known public count so the button still shows a number until
 * the repo is made public or a GITHUB_TOKEN is configured.
 */
const FALLBACK_STARS = 1;

/**
 * Star count proxy. Browsers share a tiny unauthenticated GitHub quota, so
 * every visitor fetching api.github.com directly gets rate-limited and sees
 * a stale number forever. This route fetches once per hour (cached) for all
 * visitors, with an optional token for a higher quota.
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
      return NextResponse.json({ stars: FALLBACK_STARS });
    }
    const data = (await response.json()) as { stargazers_count?: unknown };
    return NextResponse.json({
      stars:
        typeof data.stargazers_count === "number"
          ? data.stargazers_count
          : FALLBACK_STARS,
    });
  } catch {
    return NextResponse.json({ stars: FALLBACK_STARS });
  }
}
