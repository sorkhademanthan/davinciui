import * as React from "react"

/** Matches the app's desktop breakpoint; safe during SSR (false on first paint). */
export function useIsDesktop(query = "(min-width: 1024px)") {
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    const sync = () => setIsDesktop(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [query])

  return isDesktop
}
