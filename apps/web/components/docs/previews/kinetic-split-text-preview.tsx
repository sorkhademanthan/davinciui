"use client";

import * as React from "react";
import { create } from "zustand";
import { useTheme } from "next-themes";
import {
  KINETIC_VARIANT_META,
  KINETIC_VARIANTS,
  KineticSplitText,
  type KineticDirection,
  type KineticPreset,
  type KineticSplitMode,
  type KineticSplitTextHandle,
  type KineticStaggerPattern,
  type KineticTrigger,
  type KineticVariant,
} from "@workspace/ui/components/kinetic-split-text";
import {
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundTextArea,
} from "@/components/playground-primitives";
import { cn } from "@/lib/utils";

type KineticConfig = {
  text: string;
  split: KineticSplitMode;
  variant: KineticVariant;
  preset: KineticPreset;
  direction: KineticDirection;
  staggerPattern: KineticStaggerPattern;
  stagger: number;
  duration: number;
  trigger: KineticTrigger;
};

const DEFAULT_CONFIG: KineticConfig = {
  text: "MAKE\nMOTION\nMATTER.",
  split: "lines",
  variant: "editorial-rise",
  preset: "flip",
  direction: "up",
  staggerPattern: "forward",
  stagger: 0.09,
  duration: 0.8,
  trigger: "inView",
};

const PRESETS: readonly KineticPreset[] = [
  "reveal",
  "blur-rise",
  "flip",
  "elastic",
  "scatter",
  "cinematic",
  "custom",
];

const useKineticStore = create<{
  config: KineticConfig;
  update: (next: Partial<KineticConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

const replayBus = {
  listeners: new Set<() => void>(),
  emit() {
    for (const fn of this.listeners) fn();
  },
};

function OptionRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground/90">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{value}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              o === value
                ? "border-foreground/70 bg-foreground text-background"
                : "border-border/70 text-muted-foreground hover:text-foreground",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact pinned-variant demo for the bottom pill tabs (and the left-column
 * example boxes). The variant is fixed per tab; text, split, direction,
 * stagger, duration, and pattern stay live from the shared store. Scroll and
 * manual triggers fall back to inView here — they need external drivers that
 * a compact demo doesn't own.
 */
export function KineticVariantDemo({ variant }: { variant: KineticVariant }) {
  const text = useKineticStore((state) => state.config.text);
  const split = useKineticStore((state) => state.config.split);
  const direction = useKineticStore((state) => state.config.direction);
  const staggerPattern = useKineticStore((state) => state.config.staggerPattern);
  const stagger = useKineticStore((state) => state.config.stagger);
  const duration = useKineticStore((state) => state.config.duration);
  const trigger = useKineticStore((state) => state.config.trigger);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[320px] w-full items-center justify-center overflow-hidden px-6 py-14",
        isDark ? "bg-[#09090b]" : "bg-[#fafafa]",
      )}
      style={{ containerType: "inline-size" }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.08),transparent_64%)]"
            : "bg-[radial-gradient(ellipse_at_50%_42%,rgba(24,24,27,0.08),transparent_64%)]",
        )}
      />
      <KineticSplitText
        text={text}
        split={split}
        variant={variant}
        preset="flip"
        direction={direction}
        staggerPattern={staggerPattern}
        stagger={stagger}
        duration={duration}
        trigger={trigger === "scroll" || trigger === "manual" ? "inView" : trigger}
        fontFamily="inherit"
        fontSize="clamp(1.75rem, 9cqi, 4rem)"
        fontWeight={800}
        lineHeight={0.98}
        letterSpacing="-0.02em"
        textAlign="center"
        color={isDark ? "#fafafa" : "#18181b"}
      />
    </div>
  );
}

export function KineticSplitTextPreview() {
  const config = useKineticStore((state) => state.config);
  const handleRef = React.useRef<KineticSplitTextHandle>(null);
  const scrollHostRef = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  React.useEffect(() => {
    const replay = () => handleRef.current?.play();
    replayBus.listeners.add(replay);
    return () => {
      replayBus.listeners.delete(replay);
    };
  }, []);

  const isScroll = config.trigger === "scroll";

  return (
    <section
      className={cn(
        "relative flex h-full min-h-[560px] w-full flex-col overflow-hidden",
        isDark ? "bg-[#09090b]" : "bg-[#fafafa]",
      )}
      style={{ containerType: "inline-size" }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.08),transparent_64%)]"
            : "bg-[radial-gradient(ellipse_at_50%_42%,rgba(24,24,27,0.08),transparent_64%)]",
        )}
      />
      {!isScroll && (
        <div className="absolute left-4 top-4 z-10">
          <button
            type="button"
            onClick={() => handleRef.current?.play()}
            className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/80 backdrop-blur transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Replay
          </button>
        </div>
      )}
      {isScroll ? (
        <div ref={scrollHostRef} className="relative h-full w-full overflow-y-auto">
          <div className="flex min-h-[220%] flex-col">
            <div className="flex min-h-[100cqh] items-center justify-center px-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
                Scroll to scrub
              </p>
            </div>
            <div className="sticky top-0 flex min-h-[60cqh] items-center justify-center px-6 py-16">
              <KineticSplitText
                ref={handleRef}
                text={config.text}
                split={config.split}
                variant={config.variant}
                preset={config.preset}
                direction={config.direction}
                staggerPattern={config.staggerPattern}
                stagger={config.stagger}
                duration={config.duration}
                trigger="scroll"
                fontFamily="inherit"
                fontSize="clamp(2rem, 7cqi, 4.5rem)"
                fontWeight={800}
                lineHeight={0.98}
                letterSpacing="-0.02em"
                textAlign="center"
                color={isDark ? "#fafafa" : "#18181b"}
              />
            </div>
            <div className="flex min-h-[60cqh] items-end justify-center px-6 pb-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
                End of scrub range
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex min-h-[560px] flex-1 items-center justify-center px-6 py-16">
          <KineticSplitText
            ref={handleRef}
            text={config.text}
            split={config.split}
            variant={config.variant}
            preset={config.preset}
            direction={config.direction}
            staggerPattern={config.staggerPattern}
            stagger={config.stagger}
            duration={config.duration}
            trigger={config.trigger}
            fontFamily="inherit"
            fontSize="clamp(2rem, 7cqi, 4.5rem)"
            fontWeight={800}
            lineHeight={0.98}
            letterSpacing="-0.02em"
            textAlign="center"
            color={isDark ? "#fafafa" : "#18181b"}
          />
        </div>
      )}
    </section>
  );
}

const SPLITS: readonly KineticSplitMode[] = ["characters", "words", "lines"];
const VARIANTS: readonly KineticVariant[] = KINETIC_VARIANTS;
const DIRECTIONS: readonly KineticDirection[] = ["up", "down", "left", "right"];
const PATTERNS: readonly KineticStaggerPattern[] = [
  "forward",
  "reverse",
  "center",
  "edges",
  "random",
];
const TRIGGERS: readonly KineticTrigger[] = [
  "inView",
  "hover",
  "click",
  "load",
  "scroll",
];

export function KineticSplitTextPersonalizePanel() {
  const config = useKineticStore((state) => state.config);
  const update = useKineticStore((state) => state.update);
  const reset = useKineticStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-12 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">Personalize</h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Tune the split, motion style, direction, timing, trigger, and pattern. Hover
            or click the stage to feel hover/click modes. Motion Style here drives the
            Default playground — the bottom pill jumps straight to each style.
          </p>
        </header>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => replayBus.emit()}
            className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Replay
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reset
          </button>
        </div>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Content</PlaygroundSectionTitle>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground/90">Text</span>
            <PlaygroundTextArea
              value={config.text}
              onChange={(e) => update({ text: e.target.value })}
              placeholder={"MAKE\nMOTION\nMATTER."}
            />
          </div>
          <OptionRow label="Split" options={SPLITS} value={config.split} onChange={(split) => update({ split })} />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Motion</PlaygroundSectionTitle>
          <OptionRow label="Legacy preset" options={PRESETS} value={config.preset} onChange={(preset) => update({ preset })} />
          <p className="-mt-1 text-xs leading-relaxed text-muted-foreground">
            Anything but flip reproduces the exact previous behavior and takes
            precedence over Motion Style.
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/90">Motion Style</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {KINETIC_VARIANT_META[config.variant].title}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {VARIANTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => update({ variant: v })}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    v === config.variant
                      ? "border-foreground/70 bg-foreground text-background"
                      : "border-border/70 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {KINETIC_VARIANT_META[v].title}
                </button>
              ))}
            </div>
          </div>
          <OptionRow
            label="Direction"
            options={DIRECTIONS}
            value={config.direction}
            onChange={(direction) => update({ direction })}
          />
          <OptionRow
            label="Pattern"
            options={PATTERNS}
            value={config.staggerPattern}
            onChange={(staggerPattern) => update({ staggerPattern })}
          />
          <PlaygroundSlider
            label="Stagger"
            value={config.stagger}
            min={0}
            max={0.3}
            step={0.005}
            unit="s"
            onChange={(stagger) => update({ stagger })}
          />
          <PlaygroundSlider
            label="Duration"
            value={config.duration}
            min={0.2}
            max={1.8}
            step={0.05}
            unit="s"
            onChange={(duration) => update({ duration })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Trigger</PlaygroundSectionTitle>
          <OptionRow
            label="Trigger"
            options={TRIGGERS}
            value={config.trigger}
            onChange={(trigger) => update({ trigger })}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Scroll mode pins the type inside a scrollable stage — drag the preview pane to
            scrub forwards and backwards.
          </p>
        </section>
      </div>
    </div>
  );
}
