"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { NeonMeshBG } from "@workspace/ui/components/neon-mesh-bg";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

const CLIP_OPEN = "ellipse(120% 160% at 50% 0%)";
const CLIP_CLOSED = "ellipse(55% 0% at 50% 0%)";

export function HeroAtmosphere() {
  const { resolvedTheme } = useTheme();
  const shouldReduceMotion = useHydratedReducedMotion();

  // Nothing theme-dependent may render during hydration: the server cannot
  // know the user's theme (next-themes resolves it pre-paint), so branching
  // on `resolvedTheme` in the first render causes a hydration mismatch.
  // Mount first, then reveal — the first client render matches SSR exactly.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const pageBackground = isDark ? "#0a0a0a" : "#ffffff";

  // Entrance only: fade in once, then never touch opacity again.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!mounted) return;
    const show = window.setTimeout(() => setEntered(true), 400);
    return () => window.clearTimeout(show);
  }, [mounted]);

  return (
    <motion.div
      aria-hidden="true"
      animate={
        shouldReduceMotion ? undefined : { opacity: [0.97, 1, 0.97] }
      }
      transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[44svh] min-h-[360px] max-h-[520px] overflow-hidden"
    >
      {/* First-paint fallback: theme-correct via dark: variants (the theme
          class is set pre-paint). Visible only until the entrance reveal. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${
          entered ? "opacity-0" : "opacity-100"
        } bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(0,0,0,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(255,255,255,0.07),transparent_70%)]`}
      />
      {mounted && resolvedTheme && (
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: entered ? 1 : 0,
            clipPath:
              shouldReduceMotion || entered ? CLIP_OPEN : CLIP_CLOSED,
          }}
          transition={{
            opacity: { duration: 0.25, ease: "easeOut" },
            clipPath: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
          }}
        >
          <NeonMeshBG
            className="absolute inset-0"
            backgroundColor={isDark ? "#050505" : "#ffffff"}
            primaryColor={isDark ? "#333338" : "#77777f"}
            secondaryColor={isDark ? "#5b5b64" : "#3f3f46"}
            highlightColor={isDark ? "#f4f4f5" : "#ffffff"}
            scale={1.45}
            warp={1.15}
            contrast={1.6}
            brightness={0.9}
            gridSize={6.5}
            gridStrength={isDark ? 0.8 : 0.75}
            glowStrength={1}
            glowSpread={0.65}
            speed={shouldReduceMotion ? 0 : 0.45}
          />
          {isDark ? (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 46% 64% at 50% 58%, rgba(10, 10, 10, 0.2) 0%, transparent 76%)`,
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: [
                    `radial-gradient(ellipse 26% 54% at 50% 100%, ${pageBackground} 28%, transparent 74%)`,
                    `radial-gradient(ellipse 24% 32% at 2% 138%, ${pageBackground} 18%, transparent 80%)`,
                    `radial-gradient(ellipse 28% 56% at 35% 104%, ${pageBackground} 18%, transparent 78%)`,
                    `radial-gradient(ellipse 32% 46% at 67% 98%, ${pageBackground} 14%, transparent 76%)`,
                    `radial-gradient(ellipse 27% 35% at 100% 142%, ${pageBackground} 22%, transparent 82%)`,
                    `linear-gradient(to bottom, transparent 34%, ${pageBackground} 98%, ${pageBackground} 100%)`,
                  ].join(", "),
                }}
              />
            </>
          ) : (
            /* Light theme: the white melt stack would erase the mesh, so only
               a gentle bottom fade remains and the canvas stays visible. */
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, transparent 62%, ${pageBackground} 100%)`,
              }}
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
