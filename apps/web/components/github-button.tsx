"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const GITHUB_REPO = "sorkhademanthan/davinciui"
const STARS_CACHE_KEY = "github-stars-cache-v2"
const STARS_CACHE_TTL = 15 * 60 * 1000

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.303 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.388-1.333-1.757-1.333-1.757-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.834 2.807 1.305 3.493.998.108-.776.418-1.305.762-1.605-2.666-.304-5.467-1.333-5.467-5.93 0-1.312.469-2.382 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.009-.323 3.301 1.23A11.52 11.52 0 0 1 12 5.8c1.02.005 2.047.139 3.006.404 2.291-1.553 3.298-1.23 3.298-1.23.652 1.653.241 2.874.117 3.176.769.839 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.48 5.921.431.371.824 1.103.824 2.222v3.293c0 .319.192.688.802.576C20.566 21.795 24 17.298 24 12 24 5.372 18.627 0 12 0Z" />
    </svg>
  )
}

function useGitHubStars() {
  const [stars, setStars] = React.useState<number | null>(null)

  React.useLayoutEffect(() => {
    try {
      const cached = localStorage.getItem(STARS_CACHE_KEY)
      if (!cached) return
      const { count } = JSON.parse(cached) as { count?: unknown }
      if (typeof count === "number") setStars(count)
    } catch {
      // The regular fetch below remains the fallback.
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    const fetchStars = async () => {
      try {
        const cached = localStorage.getItem(STARS_CACHE_KEY)
        if (cached) {
          const { count, timestamp } = JSON.parse(cached) as {
            count?: unknown
            timestamp?: unknown
          }
          if (typeof count === "number") {
            setStars(count)
            if (
              typeof timestamp === "number" &&
              Date.now() - timestamp < STARS_CACHE_TTL
            ) {
              return
            }
          }
        }

        const response = await fetch("/api/github-stars")
        if (!response.ok) return
        const data = (await response.json()) as {
          stargazers_count?: unknown
          stars?: unknown
        }
        const count =
          typeof data.stars === "number"
            ? data.stars
            : typeof data.stargazers_count === "number"
              ? data.stargazers_count
              : null
        if (cancelled || typeof count !== "number") return
        setStars(count)
        localStorage.setItem(
          STARS_CACHE_KEY,
          JSON.stringify({ count, timestamp: Date.now() }),
        )
      } catch {
        // Keep the header quiet if the proxy is unreachable or storage is blocked.
      }
    }

    fetchStars()
    return () => {
      cancelled = true
    }
  }, [])

  return stars
}

export function GitHubButton({
  className,
  labelClassName,
}: {
  className?: string
  labelClassName?: string
}) {
  const stars = useGitHubStars()
  const hasStars = typeof stars === "number"
  const formattedStars = hasStars
    ? new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
      })
        .format(stars)
        .toLowerCase()
    : null

  return (
    <a
      href={`https://github.com/${GITHUB_REPO}`}
      target="_blank"
      rel="noreferrer"
      title={
        hasStars
          ? `${stars} star${stars === 1 ? "" : "s"} on GitHub`
          : "View on GitHub"
      }
      className={cn(
        "group inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted/60 hover:text-foreground sm:px-3",
        className,
      )}
    >
      <GitHubIcon className="size-4" />
      <span className={cn("hidden sm:inline", labelClassName)}>GitHub</span>
      {hasStars ? (
        <span className="inline-flex items-center gap-0.5 text-xs tabular-nums text-muted-foreground">
          <Star className="size-3" aria-hidden="true" />
          {formattedStars}
        </span>
      ) : null}
      <span className="sr-only">View {GITHUB_REPO} on GitHub</span>
    </a>
  )
}
