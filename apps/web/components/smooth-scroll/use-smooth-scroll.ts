"use client"

import { useLenis } from "lenis/react"
import type Lenis from "lenis"
import type { ScrollCallback } from "lenis"

export function useSmoothScroll(
  callback?: ScrollCallback,
  deps: readonly unknown[] = [],
  priority?: number,
): Lenis | undefined {
  return useLenis(callback, deps as unknown[], priority)
}
