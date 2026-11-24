"use client"

import * as React from "react"
import { useLenis } from "lenis/react"

/**
 * Stops Lenis while an overlay/modal is active to prevent background scroll.
 * Cleanup always restarts Lenis so scroll is never left locked.
 */
export function useLenisOverlayLock(active: boolean) {
  const lenis = useLenis()

  React.useEffect(() => {
    if (!lenis) return
    if (active) lenis.stop()
    else lenis.start()
    return () => {
      lenis.start()
    }
  }, [active, lenis])
}
