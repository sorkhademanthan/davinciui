"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * SSR-safe counterpart to framer-motion's `useReducedMotion`.
 *
 * The server cannot know the user's motion preference, so reading it during
 * the first client render makes the markup disagree with the server-rendered
 * HTML (a hydration mismatch). This returns `false` until after hydration —
 * matching SSR — then updates to the real preference.
 */
export function useHydratedReducedMotion(): boolean {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return mounted && Boolean(prefersReducedMotion);
}
