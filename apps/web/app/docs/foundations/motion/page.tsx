"use client"

import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ComponentLayout, Section, InfoBox } from "@/components/component-layout"
import { CopyButton } from "@/components/copy-button"
import { useState, useEffect } from "react"

// ─────────────────────────────────────────────
// Local demo components — no new abstractions exported
// ─────────────────────────────────────────────

function DurationBar({ ms, label, note }: { ms: number; label: string; note: string }) {
  const shouldReduce = useReducedMotion()
  const [key, setKey] = useState(0)
  const width = Math.min(ms * 0.52, 260)

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-14 text-xs font-mono text-muted-foreground shrink-0">{ms}ms</span>
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <div className="h-2 rounded-full bg-muted flex-1 max-w-[260px] overflow-hidden relative">
          <motion.div
            key={key}
            className="h-full rounded-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: shouldReduce ? width : width }}
            transition={shouldReduce ? { duration: 0 } : { duration: ms / 1000, ease: [0.23, 1, 0.32, 1] }}
            style={{ width }}
          />
        </div>
        <span className="hidden sm:inline text-xs text-muted-foreground w-28">{note}</span>
      </div>
      <span className="text-xs font-mono text-muted-foreground hidden lg:inline w-24 text-right">{label}</span>
      <button
        onClick={() => setKey((k) => k + 1)}
        className="shrink-0 text-[11px] font-mono px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
      >
        Replay
      </button>
    </div>
  )
}

function EasingCard({
  name,
  cssVar,
  value,
  description,
  usage,
}: {
  name: string
  cssVar: string
  value: string
  description: string
  usage: string
}) {
  const shouldReduce = useReducedMotion()
  const [trigger, setTrigger] = useState(0)
  const ease: [number, number, number, number] =
    cssVar === "--ease-out-strong" ? [0.23, 1, 0.32, 1] : [0.77, 0, 0.175, 1]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{cssVar}</p>
          </div>
          <CopyButton code={`var(${cssVar})`} absolute={false} />
        </div>
        <p className="text-xs font-mono bg-muted px-2 py-1 rounded mt-3 inline-block">{value}</p>
        <p className="text-xs text-muted-foreground mt-2 leading-4">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">Use: {usage}</p>
      </div>
      <div className="border-t border-border bg-muted/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-14 rounded-lg border border-border bg-background relative overflow-hidden flex items-center px-3">
            <motion.div
              key={trigger}
              className="size-8 rounded-full bg-foreground shrink-0"
              initial={{ x: 0 }}
              animate={{ x: shouldReduce ? 0 : 176 }}
              transition={shouldReduce ? { duration: 0 } : { duration: 0.7, ease }}
              style={shouldReduce ? { transform: "translateX(0)" } : undefined}
            />
            {!shouldReduce && (
              <span className="absolute right-3 text-[10px] font-mono text-muted-foreground">→</span>
            )}
          </div>
          <button
            onClick={() => setTrigger((t) => t + 1)}
            className="shrink-0 text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            Play
          </button>
        </div>
        <p className="text-[11px] font-mono text-muted-foreground mt-2">
          transition: 700ms {value} {shouldReduce ? "(paused — reduced motion)" : ""}
        </p>
      </div>
    </div>
  )
}

function EasingComparison() {
  const shouldReduce = useReducedMotion()
  const [key, setKey] = useState(0)
  const easings: { label: string; ease: string; bezier: [number, number, number, number]; color: string }[] = [
    { label: "ease-out-strong", ease: "cubic-bezier(0.23, 1, 0.32, 1)", bezier: [0.23, 1, 0.32, 1], color: "bg-foreground" },
    { label: "ease-in-out-strong", ease: "cubic-bezier(0.77, 0, 0.175, 1)", bezier: [0.77, 0, 0.175, 1], color: "bg-primary" },
    { label: "linear (ref)", ease: "linear", bezier: [0, 0, 1, 1], color: "bg-muted-foreground" },
  ]

  return (
    <div className="rounded-xl border border-border p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-sm font-medium">Interactive comparison</p>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
        >
          Replay all
        </button>
      </div>
      <div className="space-y-3">
        {easings.map((e) => (
          <div key={e.label} className="flex items-center gap-3">
            <span className="w-36 text-xs font-mono text-muted-foreground shrink-0 hidden sm:inline">{e.label}</span>
            <span className="w-20 text-xs font-mono text-muted-foreground shrink-0 sm:hidden">
              {e.label === "ease-out-strong" ? "out-strong" : e.label === "ease-in-out-strong" ? "in-out" : "linear"}
            </span>
            <div className="flex-1 h-10 rounded-full bg-muted/60 border border-border/50 relative overflow-hidden">
              <motion.div
                key={`${e.label}-${key}`}
                className={`absolute left-1 top-1 size-8 rounded-full ${e.color}`}
                initial={{ x: 0 }}
                animate={{ x: shouldReduce ? 0 : 220 }}
                transition={
                  shouldReduce
                    ? ({ duration: 0 } as unknown as Record<string, unknown>)
                    : e.ease === "linear"
                      ? ({ duration: 0.7, ease: "linear" } as unknown as Record<string, unknown>)
                      : ({ duration: 0.7, ease: e.bezier } as unknown as Record<string, unknown>)
                }
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4 leading-5">
        Same distance, same duration (700ms) — only easing changes. <span className="font-mono">ease-out-strong</span> feels snappy;{" "}
        <span className="font-mono">ease-in-out-strong</span> lingers at both ends. Linear is mechanical — avoid for UI.
        {shouldReduce && " (Animations paused — reduced motion detected.)"}
      </p>
    </div>
  )
}

function AnimationSpecimen({
  label,
  code,
  children,
}: {
  label: string
  code: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-3">
      <div className="w-full h-28 rounded-lg border border-border bg-muted/20 flex items-center justify-center overflow-hidden">
        {children}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs font-mono text-muted-foreground">{code}</p>
      </div>
    </div>
  )
}

export default function MotionPage() {
  const shouldReduce = useReducedMotion()
  const [animKey, setAnimKey] = useState(0)
  const [showFade, setShowFade] = useState(true)
  const [showSlide, setShowSlide] = useState(true)
  const [showScale, setShowScale] = useState(true)

  // Auto-cycle for specimens when not reduced
  useEffect(() => {
    if (shouldReduce) return
    const id = setInterval(() => setAnimKey((k) => k + 1), 2200)
    return () => clearInterval(id)
  }, [shouldReduce])

  return (
    <ComponentLayout
      title="Motion"
      description="Current motion primitives — two easing variables from globals.css and Framer Motion infrastructure. No formal duration scale yet; values below are observed current usage, not official tokens. Respects prefers-reduced-motion."
    >
      <Section title="Introduction" id="introduction">
        <p className="text-sm leading-6 text-muted-foreground">
          Motion in DavinciUI is documentation-only in Phase 3. The system currently provides two CSS easing variables (
          <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">--ease-out-strong</code> and{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">--ease-in-out-strong</code>) and Framer Motion
          as the animation runtime. No <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">--duration-*</code>{" "}
          tokens exist yet — Phase 4 will formalize them. This page documents what is actually shipped today.
        </p>
        <InfoBox type="info">
          <span className="text-sm">
            Verified in <code className="font-mono text-xs px-1 py-0.5 rounded bg-cyan-500/10">packages/ui/src/styles/globals.css</code>: only two easing vars. Tailwind
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-cyan-500/10 ml-1">duration-*</code> utilities and Framer Motion
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-cyan-500/10 ml-1">duration</code> props are used ad-hoc.
          </span>
        </InfoBox>
      </Section>

      <Section title="Motion principles" id="motion-principles">
        <div className="rounded-xl border border-border bg-muted/10 p-4 sm:p-6">
          <ul className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <span className="mt-1 size-1.5 rounded-full bg-foreground shrink-0" />
              <span>
                <strong className="text-foreground font-medium">Communicate change</strong> — motion should explain what happened,
                not decorate.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1 size-1.5 rounded-full bg-foreground shrink-0" />
              <span>
                <strong className="text-foreground font-medium">Intentional</strong> — every transition has a purpose; avoid animating
                layout on scroll.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1 size-1.5 rounded-full bg-foreground shrink-0" />
              <span>
                <strong className="text-foreground font-medium">Subtle micro-interactions</strong> — hover/active feedback under
                300ms.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1 size-1.5 rounded-full bg-foreground shrink-0" />
              <span>
                <strong className="text-foreground font-medium">Meaningful emphasis</strong> — stronger motion only for
                entering/exiting or mode changes.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1 size-1.5 rounded-full bg-foreground shrink-0" />
              <span>
                <strong className="text-foreground font-medium">Respect reduced motion</strong> — honor{" "}
                <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">prefers-reduced-motion</code>.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1 size-1.5 rounded-full bg-foreground shrink-0" />
              <span>
                <strong className="text-foreground font-medium">Fewer is better</strong> — two easings are enough for now.
              </span>
            </li>
          </ul>
        </div>
      </Section>

      <Section title="Durations" id="durations">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No formal duration scale exists in <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">globals.css</code>.
            Durations are chosen per-component today. Values below are observed current usage — labeled as{" "}
            <em>examples</em>, not official tokens. Phase 4 will introduce <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">--duration-*</code>.
          </p>

          <InfoBox type="warning">
            <span className="text-sm">
              Current codebase uses <code className="font-mono text-xs">duration-300</code> (27×),{" "}
              <code className="font-mono text-xs">duration-200</code> (13×), <code className="font-mono text-xs">duration-500</code>{" "}
              (10×) for CSS, and <code className="font-mono text-xs">0.3–0.6s</code> for Framer Motion. There is no single source.
            </span>
          </InfoBox>

          <div className="rounded-xl border border-border p-4 sm:p-6">
            <p className="text-xs font-mono text-muted-foreground mb-3">Visual duration comparison — same easing (ease-out-strong)</p>
            <div className="space-y-1">
              <DurationBar ms={100} label="duration-100" note="Micro — quick feedback" />
              <DurationBar ms={150} label="duration-150" note="Micro — hover" />
              <DurationBar ms={200} label="duration-200" note="UI feedback" />
              <DurationBar ms={300} label="duration-300" note="Default — most common" />
              <DurationBar ms={500} label="duration-500" note="Emphasis — cards, panels" />
              <DurationBar ms={700} label="duration-700" note="Decorative only" />
            </div>
            <div className="mt-4 flex gap-2 text-xs font-mono text-muted-foreground border-t border-border pt-3">
              <span>100ms ━━</span>
              <span>200ms ━━━━━</span>
              <span>300ms ━━━━━━━━</span>
              <span>500ms ━━━━━━━━━━━━━</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep interactive feedback ≤ 300ms; reserve 500ms+ for large surface changes. Framer examples in the codebase use{" "}
              <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">duration: 0.3</code>–
              <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">0.7</code>.
              {shouldReduce && " (Motion reduced — bars jump to end.)"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-mono text-muted-foreground">CSS transitions</p>
              <p className="text-sm font-mono mt-2">duration-150 / 200 / 300</p>
              <p className="text-xs text-muted-foreground mt-1">Tailwind utility — most common in components.</p>
              <div className="mt-3 rounded bg-muted px-3 py-2 font-mono text-xs">transition-colors duration-200</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-mono text-muted-foreground">Framer Motion</p>
              <p className="text-sm font-mono mt-2">duration: 0.3 — 0.6</p>
              <p className="text-xs text-muted-foreground mt-1">JS-driven — modals, drag, springs.</p>
              <div className="mt-3 rounded bg-muted px-3 py-2 font-mono text-xs">transition: &#123; duration: 0.4 &#125;</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-mono text-muted-foreground">Not yet tokenized</p>
              <p className="text-sm font-mono mt-2">— no --duration-*</p>
              <p className="text-xs text-muted-foreground mt-1">Will be added in Phase 4 Tokens.</p>
              <div className="mt-3 rounded bg-muted/60 px-3 py-2 font-mono text-xs text-muted-foreground">
                Do not invent --duration-fast etc.
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Easing" id="easing">
        <p className="text-sm text-muted-foreground mb-4">
          Two cubic-bezier variables are the current implementation. Both are defined in{" "}
          <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">:root</code> and{" "}
          <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">.dark</code> (same values). Framer Motion mirrors them
          via <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">packages/ui/src/lib/ease.ts</code> for JS animations.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <EasingCard
            name="Ease Out Strong"
            cssVar="--ease-out-strong"
            value="cubic-bezier(0.23, 1, 0.32, 1)"
            description="Snappy deceleration — fast start, soft landing. Entries and reveals."
            usage="entrances, hover lifts, page elements appearing"
          />
          <EasingCard
            name="Ease In-Out Strong"
            cssVar="--ease-in-out-strong"
            value="cubic-bezier(0.77, 0, 0.175, 1)"
            description="Smooth both ends — held entrance and exit. Modal and drawer transitions."
            usage="exits, modals, full-page transitions"
          />
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/10 p-4 font-mono text-xs space-y-1">
          <p>
            <span className="text-muted-foreground">CSS:</span> transition-timing-function: var(--ease-out-strong);
          </p>
          <p>
            <span className="text-muted-foreground">Tailwind:</span> ease-[var(--ease-out-strong)]{" "}
            <span className="text-muted-foreground">or</span> ease-[cubic-bezier(0.23,1,0.32,1)]
          </p>
          <p>
            <span className="text-muted-foreground">Framer:</span> transition: &#123; ease: [0.23, 1, 0.32, 1] &#125;{" "}
            <span className="text-muted-foreground">· see</span> packages/ui/src/lib/ease.ts
          </p>
        </div>

        <div className="mt-4">
          <EasingComparison />
        </div>

        <div className="rounded-xl border border-border p-4 flex gap-3 bg-amber-500/5 border-amber-500/20">
          <span className="text-amber-600 dark:text-amber-400 text-sm">ⓘ</span>
          <p className="text-xs leading-5 text-amber-800 dark:text-amber-200">
            <strong>JS mirror:</strong> <code className="font-mono px-1 py-0.5 rounded bg-white/60 dark:bg-black/20 text-xs">EASE_OUT = [0.16, 1, 0.3, 1]</code> in{" "}
            <code className="font-mono text-xs">ease.ts</code> is the Framer-friendly approximation. CSS vars remain the source of
            truth for stylesheets — do not diverge from them. Spring presets (SPRING_PRESS, SPRING_PANEL, etc.) are also in that file
            and are documented under Animations.
          </p>
        </div>
      </Section>

      <Section title="Transitions" id="transitions">
        <p className="text-sm text-muted-foreground mb-4">
          Practical transition types — hover or focus to preview. All use existing Tailwind utilities; no new motion abstraction.
          Durations are labeled as current examples.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Opacity */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium">Opacity</p>
                <p className="text-xs font-mono text-muted-foreground">transition-opacity duration-200</p>
              </div>
              <CopyButton code="transition-opacity duration-200" absolute={false} />
            </div>
            <div className="group h-20 rounded-lg border border-border bg-muted/20 flex items-center justify-center overflow-hidden">
              <div className="size-16 rounded-xl bg-foreground opacity-60 group-hover:opacity-100 transition-opacity duration-200 ease-out flex items-center justify-center text-primary-foreground text-xs font-mono">
                hover
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Fades — tooltips, overlays, disabled states.</p>
          </div>

          {/* Transform — translate */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium">Transform — translate</p>
                <p className="text-xs font-mono text-muted-foreground">transition-transform duration-300</p>
              </div>
              <CopyButton code="transition-transform duration-300" absolute={false} />
            </div>
            <div className="group h-20 rounded-lg border border-border bg-muted/20 flex items-center justify-center overflow-hidden">
              <div className="size-16 rounded-xl bg-foreground flex items-center justify-center text-primary-foreground text-xs font-mono transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-[-4px]">
                lift
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Lifts — cards, buttons (use translate, not top).</p>
          </div>

          {/* Scale */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium">Scale</p>
                <p className="text-xs font-mono text-muted-foreground">transition-transform duration-200</p>
              </div>
              <CopyButton code="hover:scale-105 duration-200" absolute={false} />
            </div>
            <div className="group h-20 rounded-lg border border-border bg-muted/20 flex items-center justify-center overflow-hidden">
              <div className="size-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xs font-mono transition-transform duration-200 ease-out group-hover:scale-105">
                scale
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Press feedback — keep subtle (1.02–1.05).</p>
          </div>

          {/* Color / background */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium">Color / background</p>
                <p className="text-xs font-mono text-muted-foreground">transition-colors duration-200</p>
              </div>
              <CopyButton code="transition-colors duration-200" absolute={false} />
            </div>
            <div className="h-20 rounded-lg border border-border bg-muted/20 flex items-center justify-center">
              <button className="h-9 px-5 rounded-full bg-foreground text-background text-sm font-medium transition-colors duration-200 hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Hover / Focus
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Buttons, links — color only, never layout.</p>
          </div>

          {/* Border */}
          <div className="rounded-xl border border-border p-4 sm:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium">Border / shadow</p>
                <p className="text-xs font-mono text-muted-foreground">transition-[border-color,box-shadow] duration-300</p>
              </div>
              <CopyButton code="transition-[border-color,box-shadow] duration-300" absolute={false} />
            </div>
            <div className="group h-20 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-[var(--shadow-card-hover)] transition-[border-color,box-shadow] duration-300 flex items-center justify-center">
              <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">hover — border + shadow</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Cards and panels — pair with shadow tokens.</p>
          </div>
        </div>
      </Section>

      <Section title="Animations" id="animations">
        <p className="text-sm text-muted-foreground mb-2">
          Restrained Framer Motion specimens — documentation only. Each loops only if reduced motion is not preferred. Springs are
          already in <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">packages/ui/src/lib/ease.ts</code>.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              setShowFade((v) => !v)
              setShowSlide((v) => !v)
              setShowScale((v) => !v)
            }}
            className="text-xs font-mono px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors"
          >
            Toggle specimens
          </button>
          <span className="text-xs font-mono text-muted-foreground px-2 py-1.5">
            Framer Motion · {shouldReduce ? "reduced motion — static" : "auto-cycles every 2.2s"}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimationSpecimen label="Fade" code="opacity 0 → 1, 0.4s">
            <AnimatePresence mode="wait">
              {showFade && (
                <motion.div
                  key={`fade-${animKey}-${showFade}`}
                  initial={shouldReduce ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduce ? { opacity: 1 } : { opacity: 0 }}
                  transition={shouldReduce ? { duration: 0 } : { duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="size-16 rounded-xl bg-foreground"
                />
              )}
            </AnimatePresence>
          </AnimationSpecimen>

          <AnimationSpecimen label="Slide" code="y 8 → 0, 0.4s ease-out">
            <AnimatePresence mode="wait">
              {showSlide && (
                <motion.div
                  key={`slide-${animKey}-${showSlide}`}
                  initial={shouldReduce ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={shouldReduce ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }}
                  transition={shouldReduce ? { duration: 0 } : { duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="w-24 h-16 rounded-xl bg-foreground flex items-center justify-center text-primary-foreground text-xs font-mono"
                >
                  slide
                </motion.div>
              )}
            </AnimatePresence>
          </AnimationSpecimen>

          <AnimationSpecimen label="Scale" code="scale 0.96 → 1, 0.35s">
            <AnimatePresence mode="wait">
              {showScale && (
                <motion.div
                  key={`scale-${animKey}-${showScale}`}
                  initial={shouldReduce ? { scale: 1, opacity: 1 } : { scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={shouldReduce ? { scale: 1, opacity: 1 } : { scale: 0.96, opacity: 0 }}
                  transition={shouldReduce ? { duration: 0 } : { duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                  className="size-16 rounded-xl bg-primary"
                />
              )}
            </AnimatePresence>
          </AnimationSpecimen>

          <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-3">
            <div className="w-full h-28 rounded-lg border border-border bg-muted/20 flex items-center justify-center">
              <motion.button
                whileTap={shouldReduce ? undefined : { scale: 0.97 }}
                whileHover={shouldReduce ? undefined : { y: -1 }}
                transition={
                  shouldReduce
                    ? undefined
                    : ({ type: "spring", stiffness: 500, damping: 30, mass: 0.6 } as unknown as Record<string, number>)
                }
                className="h-10 px-5 rounded-full bg-foreground text-background text-sm font-medium shadow-sm active:shadow-none"
              >
                Spring press
              </motion.button>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Spring</p>
              <p className="text-xs font-mono text-muted-foreground">SPRING_PRESS — tap me</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/10 p-4 font-mono text-xs space-y-1">
          <p>&lt;motion.div initial=&#123;&#123; opacity: 0 &#125;&#125; animate=&#123;&#123; opacity: 1 &#125;&#125; transition=&#123;&#123; duration: 0.4, ease: [0.23, 1, 0.32, 1] &#125;&#125; /&gt;</p>
          <p className="text-muted-foreground">Springs: SPRING_PRESS / PANEL / LAYOUT from packages/ui/src/lib/ease.ts — use via Framer type: &quot;spring&quot;.</p>
        </div>
      </Section>

      <Section title="Interaction examples" id="interaction-examples">
        <p className="text-sm text-muted-foreground mb-4">
          Hover, focus, and active states — all with existing utilities. Durations are examples, not tokens.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-3">Hover lift — duration-300 ease-out-strong</p>
            <div className="group rounded-xl border border-border bg-muted/20 p-4 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-default">
              <p className="text-sm font-medium">Card hover</p>
              <p className="text-xs text-muted-foreground">Lifts — transform + shadow</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-3">Focus ring — duration-150</p>
            <div className="flex flex-col gap-2">
              <input
                placeholder="Focus me (Tab)"
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-[box-shadow] duration-150"
              />
              <button className="h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-[box-shadow] duration-150">
                Focus ring
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground mb-3">Active press — spring</p>
            <motion.button
              whileTap={shouldReduce ? undefined : { scale: 0.985 }}
              transition={shouldReduce ? undefined : ({ type: "spring", stiffness: 500, damping: 30, mass: 0.6 } as unknown as Record<string, number>)}
              className="w-full h-10 rounded-xl bg-foreground text-background text-sm font-medium active:scale-[0.985] transition-transform"
            >
              Press and hold
            </motion.button>
            <p className="text-xs text-muted-foreground mt-2">Uses SPRING_PRESS — already in ease.ts.</p>
          </div>
        </div>
      </Section>

      <Section title="Reduced motion" id="reduced-motion">
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                <span className="text-amber-600 dark:text-amber-400 text-sm">♿</span>
              </div>
              <div>
                <p className="text-sm font-medium">Required: prefers-reduced-motion</p>
                <p className="text-sm text-muted-foreground leading-6">
                  All demos on this page check{" "}
                  <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">useReducedMotion()</code> (Framer) or{" "}
                  <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">@media (prefers-reduced-motion: reduce)</code>{" "}
                  and disable or collapse motion to an instant transition. Do not disable accessibility to make demos more impressive.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-mono text-muted-foreground mb-2">CSS approach</p>
                <div className="rounded bg-muted px-3 py-2 font-mono text-xs leading-5">
                  <p>@media (prefers-reduced-motion: reduce) &#123;</p>
                  <p className="pl-3">.motion &#123; transition: none !important; &#125;</p>
                  <p className="pl-3">.motion &#123; animation: none !important; &#125;</p>
                  <p>&#125;</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Use for pure CSS transitions/animations.</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-mono text-muted-foreground mb-2">Framer approach</p>
                <div className="rounded bg-muted px-3 py-2 font-mono text-xs leading-5">
                  <p>const shouldReduce = useReducedMotion()</p>
                  <p>transition=&#123;&#123; duration: shouldReduce ? 0 : 0.4 &#125;&#125;</p>
                  <p className="text-muted-foreground">// SPRING_* already respects this if guarded</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Used throughout this page — animations pause when reduced.</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-3 flex items-center gap-3">
              <div className={`size-2.5 rounded-full ${shouldReduce ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`} />
              <p className="text-xs font-mono text-muted-foreground">
                Detected preference:{" "}
                <span className="text-foreground font-medium">{shouldReduce ? "reduce — animations disabled" : "no-preference — animations enabled"}</span>
                <span className="hidden sm:inline"> · Try in DevTools → Rendering → Emulate prefers-reduced-motion</span>
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Existing components already use{" "}
              <code className="font-mono px-1 py-0.5 rounded bg-muted">motion-reduce:transition-none</code> and{" "}
              <code className="font-mono px-1 py-0.5 rounded bg-muted">useReducedMotion</code> — e.g., pricing-01/02 blocks and scroll choreography.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Guidelines" id="guidelines">
        <div className="rounded-xl border border-border bg-muted/10 p-4 sm:p-6">
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>
              Use <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">var(--ease-out-strong)</code> for entrances and
              hover feedback; <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">var(--ease-in-out-strong)</code> for
              paired enter/exit (modals, drawers).
            </li>
            <li>
              Keep durations as <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">duration-150</code>–
              <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">300</code> for UI, reserve 500ms+ for large surfaces.
              Do not invent duration tokens until Phase 4.
            </li>
            <li>Prefer transform/opacity over height/width — compositor-friendly, no layout thrash.</li>
            <li>
              Springs: use <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">SPRING_PRESS</code> (stiffness 500) for taps,{" "}
              <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">SPRING_PANEL</code> for overlays — both already in
              <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">ease.ts</code>.
            </li>
            <li>Always guard with prefers-reduced-motion — instant (duration 0) is the accessible fallback.</li>
            <li>Avoid animating on scroll or on every card — motion must communicate change.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs space-y-1 mt-4">
          <p>transition: transform 300ms var(--ease-out-strong);</p>
          <p>transition: opacity 200ms ease-out;</p>
          <p className="text-muted-foreground">/* Framer */ transition: &#123; duration: 0.4, ease: [0.23, 1, 0.32, 1] &#125;</p>
        </div>
      </Section>

      <Section title="Framer Motion in this project" id="framer-motion">
        <div className="rounded-xl border border-border p-4 sm:p-6">
          <p className="text-sm text-muted-foreground leading-6">
            Framer Motion <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">^12.23.26</code> is already installed (
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">apps/web/package.json</code>). Real usage in the repo:
            docs preview spring (<code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">type: &quot;spring&quot; damping 25 stiffness 300</code>), hero sections, and{" "}
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">useReducedMotion</code> checks. No new framework is created here — specimens above reuse{" "}
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">motion.*</code> and{" "}
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">AnimatePresence</code> directly.
          </p>
        </div>
      </Section>
    </ComponentLayout>
  )
}
