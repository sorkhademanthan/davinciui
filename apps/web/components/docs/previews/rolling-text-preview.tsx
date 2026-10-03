"use client";

import * as React from "react";
import { create } from "zustand";
import {
  RollingText,
  type RollingTextHandle,
  type RollingTextPattern,
} from "@workspace/ui/components/rolling-text";
import { cn } from "@/lib/utils";
import { usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundInput,
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
} from "@/components/playground-primitives";

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

interface RollingTextPlaygroundConfig {
  text: string;
  pattern: RollingTextPattern;
  duplicateCount: number;
  rollDuration: number;
  staggerDelay: number;
  blurIntensity: number;
  autoPlay: boolean;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textColor: string;
  backgroundColor: string;
  textAlign: "left" | "center" | "right";
  /** Follow the site theme instead of the explicit text/background colors. */
  autoTheme: boolean;
}

const DEFAULT_CONFIG: RollingTextPlaygroundConfig = {
  text: "DAVINCIUI",
  pattern: "alternating",
  duplicateCount: 8,
  rollDuration: 1.4,
  staggerDelay: 0.04,
  blurIntensity: 3,
  autoPlay: true,
  fontFamily: "Inter, sans-serif",
  fontSize: 60,
  fontWeight: 900,
  lineHeight: 1,
  letterSpacing: "-0.02em",
  textColor: "#ffffff",
  backgroundColor: "#000000",
  textAlign: "center",
  autoTheme: true,
};

interface RollingTextPlaygroundStore {
  config: RollingTextPlaygroundConfig;
  updateConfig: (u: Partial<RollingTextPlaygroundConfig>) => void;
  resetConfig: () => void;
  /** Live handle of the playground instance so the panel can replay it. */
  handle: RollingTextHandle | null;
  setHandle: (handle: RollingTextHandle | null) => void;
}

const useRollingTextPlayground = create<RollingTextPlaygroundStore>((set) => ({
  config: DEFAULT_CONFIG,
  updateConfig: (u) => set((s) => ({ config: { ...s.config, ...u } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
  handle: null,
  setHandle: (handle) => set({ handle }),
}));

const FONT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
];

const WEIGHT_OPTIONS = [400, 600, 700, 800, 900];

const ALIGN_OPTIONS: Array<RollingTextPlaygroundConfig["textAlign"]> = ["left", "center", "right"];

function generateCode(c: RollingTextPlaygroundConfig) {
  const themeProps = c.autoTheme
    ? ""
    : `\n  textColor="${c.textColor}"\n  backgroundColor="${c.backgroundColor}"`;
  return `import { RollingText } from "@/components/ui/rolling-text"

<RollingText
  text=${JSON.stringify(c.text)}
  pattern=${JSON.stringify(c.pattern)}
  duplicateCount={${c.duplicateCount}}
  rollDuration={${c.rollDuration}}
  staggerDelay={${c.staggerDelay}}
  blurIntensity={${c.blurIntensity}}
  autoPlay={${c.autoPlay}}
  fontFamily=${JSON.stringify(c.fontFamily)}
  fontSize={${c.fontSize}}
  fontWeight={${c.fontWeight}}
  lineHeight={${c.lineHeight}}
  letterSpacing=${JSON.stringify(c.letterSpacing)}${themeProps}
  textAlign=${JSON.stringify(c.textAlign)}
/>`;
}

// ─────────────────────────────────────────────────────────────
// Playground — black stage that fills the preview pane
// ─────────────────────────────────────────────────────────────

export function RollingTextPlayground() {
  const config = useRollingTextPlayground((s) => s.config);
  const setHandle = useRollingTextPlayground((s) => s.setHandle);

  React.useEffect(() => {
    const t = window.setTimeout(() => usePlaygroundStore.getState().setCode(generateCode(config)), 180);
    return () => window.clearTimeout(t);
  }, [config]);

  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden bg-background p-6 lg:min-h-[520px]">
      <RollingText
        ref={setHandle}
        text={config.text}
        pattern={config.pattern}
        duplicateCount={config.duplicateCount}
        rollDuration={config.rollDuration}
        staggerDelay={config.staggerDelay}
        blurIntensity={config.blurIntensity}
        autoPlay={config.autoPlay}
        fontFamily={config.fontFamily}
        fontSize={config.fontSize}
        fontWeight={config.fontWeight}
        lineHeight={config.lineHeight}
        letterSpacing={config.letterSpacing}
        textColor={config.autoTheme ? undefined : config.textColor}
        backgroundColor={config.autoTheme ? undefined : config.backgroundColor}
        textAlign={config.textAlign}
      />
    </div>
  );
}

export function RollingTextPreview() {
  return <RollingTextPlayground />;
}

// ─────────────────────────────────────────────────────────────
// Personalize panel
// ─────────────────────────────────────────────────────────────

export function RollingTextPersonalizePanel() {
  const config = useRollingTextPlayground((s) => s.config);
  const update = useRollingTextPlayground((s) => s.updateConfig);
  const reset = useRollingTextPlayground((s) => s.resetConfig);
  const handle = useRollingTextPlayground((s) => s.handle);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-10 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter">Personalize</h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Tune the rolling columns — pattern, timing, typography and stage.
          </p>
        </header>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handle?.play()}
            className="rounded-md border border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-foreground hover:bg-foreground/5"
          >
            Replay
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        </div>

        <div>
          <PlaygroundSectionTitle>Content</PlaygroundSectionTitle>
          <PlaygroundInput
            value={config.text}
            onChange={(e) => update({ text: e.target.value.slice(0, 48) || "DAVINCIUI" })}
            placeholder="DAVINCIUI"
          />
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Animation</PlaygroundSectionTitle>
          <div className="grid grid-cols-2 gap-1.5">
            {(["sequential", "alternating"] as const).map((pattern) => (
              <button
                key={pattern}
                type="button"
                onClick={() => update({ pattern })}
                className={cn(
                  "rounded-md border px-2 py-2 font-mono text-[10px] uppercase tracking-wide capitalize",
                  config.pattern === pattern
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {pattern}
              </button>
            ))}
          </div>
          <PlaygroundSlider label="Duplicate count" min={2} max={16} step={1} value={config.duplicateCount} onChange={(v) => update({ duplicateCount: Math.round(v) })} />
          <PlaygroundSlider label="Roll duration" min={0.2} max={2} step={0.05} value={config.rollDuration} unit="s" onChange={(v) => update({ rollDuration: v })} />
          <PlaygroundSlider label="Stagger delay" min={0} max={0.15} step={0.005} value={config.staggerDelay} unit="s" onChange={(v) => update({ staggerDelay: v })} />
          <PlaygroundSlider label="Blur intensity" min={0} max={20} step={0.5} value={config.blurIntensity} unit="px" onChange={(v) => update({ blurIntensity: v })} />
          <PlaygroundSwitch label="Auto play" checked={config.autoPlay} onChange={(autoPlay) => update({ autoPlay })} />
          <button
            type="button"
            onClick={() => handle?.play()}
            className="w-full rounded-md border border-border/70 px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5"
          >
            Replay animation
          </button>
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Typography</PlaygroundSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.label}
                type="button"
                onClick={() => update({ fontFamily: font.value })}
                className={cn(
                  "rounded-md border px-2 py-2 text-xs font-semibold",
                  config.fontFamily === font.value
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {font.label}
              </button>
            ))}
          </div>
          <PlaygroundSlider label="Font size" min={24} max={140} step={1} value={config.fontSize} unit="px" onChange={(v) => update({ fontSize: Math.round(v) })} />
          <div className="grid grid-cols-5 gap-1.5">
            {WEIGHT_OPTIONS.map((weight) => (
              <button
                key={weight}
                type="button"
                onClick={() => update({ fontWeight: weight })}
                className={cn(
                  "rounded-md border px-2 py-2 font-mono text-[10px] tracking-wide",
                  config.fontWeight === weight
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {weight}
              </button>
            ))}
          </div>
          <PlaygroundSlider label="Line height" min={0.9} max={1.6} step={0.05} value={config.lineHeight} onChange={(v) => update({ lineHeight: v })} />
          <div>
            <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Letter spacing
            </div>
            <PlaygroundInput
              value={config.letterSpacing}
              onChange={(e) => update({ letterSpacing: e.target.value.slice(0, 12) || "-0.02em" })}
              placeholder="-0.02em"
            />
          </div>
          <PlaygroundColorPicker
            label="Text"
            value={config.textColor}
            onChange={(textColor) => update({ textColor, autoTheme: false })}
            defaultColor="#ffffff"
          />
          <div className="grid grid-cols-3 gap-1.5">
            {ALIGN_OPTIONS.map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => update({ textAlign: align })}
                className={cn(
                  "rounded-md border px-2 py-2 font-mono text-[10px] uppercase tracking-wide capitalize",
                  config.textAlign === align
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {align}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Appearance</PlaygroundSectionTitle>
          <PlaygroundSwitch
            label="Match site theme"
            checked={config.autoTheme}
            onChange={(autoTheme) => update({ autoTheme })}
          />
          <PlaygroundColorPicker
            label="Background"
            value={config.backgroundColor}
            onChange={(backgroundColor) => update({ backgroundColor, autoTheme: false })}
            defaultColor="#000000"
          />
        </div>
      </div>
    </div>
  );
}
