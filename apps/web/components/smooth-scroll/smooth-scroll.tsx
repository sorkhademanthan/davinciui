"use client"

import { ReactLenis, useLenis, type LenisRef } from "lenis/react"
import type { LenisOptions } from "lenis"
import { usePathname } from "next/navigation"
import * as React from "react"

type SmoothScrollProps = {
  children: React.ReactNode
  options?: Partial<LenisOptions>
}

function RouteScrollReset() {
  const pathname = usePathname()
  const lenis = useLenis()

  React.useEffect(() => {
    if (!lenis) return
    // Reset scroll on client-side navigation. Immediate prevents long animated jumps.
    lenis.scrollTo(0, { immediate: true, force: true })
  }, [lenis, pathname])

  return null
}

export function SmoothScroll({ children, options }: SmoothScrollProps) {
  const lenisRef = React.useRef<LenisRef | null>(null)
  const [reducedMotion, setReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  const setLenisRef = React.useCallback((node: LenisRef | null) => {
    lenisRef.current = node
    const w = window as Window & { __lenis?: LenisRef["lenis"] }
    if (node?.lenis) w.__lenis = node.lenis
    else if (w.__lenis) delete w.__lenis
  }, [])

  const resolvedOptions = React.useMemo<LenisOptions>(
    () => ({
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: false,
      anchors: true,
      stopInertiaOnNavigate: true,
      autoResize: true,
      autoToggle: true,
      allowNestedScroll: false,
      // Accessibility: keep native-feeling scroll for reduced-motion users.
      ...(reducedMotion ? { smoothWheel: false, syncTouch: false } : {}),
      ...options,
    }),
    [options, reducedMotion],
  )

  return (
    <ReactLenis root ref={setLenisRef} options={resolvedOptions}>
      <RouteScrollReset />
      {children}
    </ReactLenis>
  )
}
