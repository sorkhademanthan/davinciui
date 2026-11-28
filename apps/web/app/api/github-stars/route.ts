import { NextResponse } from "next/server";

const REPO = "sorkhademanthan/davinciui";

/**
 * The repo is public now, so anonymous GitHub reads work. If GitHub is
 * unreachable or rate-limited, fall back to zero rather than a stale count.
 */
const FALLBACK_STARS = 0;

function starsResponse(stars: number) {
  return NextResponse.json(
    { stars },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

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
      return starsResponse(FALLBACK_STARS);
    }
    const data = (await response.json()) as { stargazers_count?: unknown };
    return starsResponse(
      typeof data.stargazers_count === "number"
        ? data.stargazers_count
        : FALLBACK_STARS,
    );
  } catch {
    return starsResponse(FALLBACK_STARS);
  }
}
