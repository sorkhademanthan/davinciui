"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { create } from "zustand";
import {
  RANDOM_TEXT_REVEAL_DEFAULT_TEXT,
  RandomTextReveal,
  type RandomTextRevealEase,
  type RandomTextRevealMode,
  type RandomTextRevealTrigger,
} from "@workspace/ui/components/random-text-reveal";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
  PlaygroundTextArea,
} from "@/components/playground-primitives";
import { cn } from "@/lib/utils";

const EASE_OPTIONS: RandomTextRevealEase[] = [
  "Linear",
  "Power1 Out",
  "Power2 Out",
  "Power3 Out",
  "Power4 Out",
  "Sine Out",
  "Expo Out",
  "Circ Out",
  "Back Out",
];

const MODE_OPTIONS: RandomTextRevealMode[] = [
  "random",
  "forward",
  "reverse",
  "center-out",
  "edges-in",
];

const TRIGGER_OPTIONS: RandomTextRevealTrigger[] = ["top", "center", "bottom"];

interface RandomTextRevealConfig {
  text: string;
  fromOpacity: number;
  toOpacity: number;
  duration: number;
  minDelay: number;
  maxDelay: number;
  ease: RandomTextRevealEase;
  animationMode: RandomTextRevealMode;
  triggerPosition: RandomTextRevealTrigger;
  triggerOffset: number;
  replay: boolean;
  randomizeEachReplay: boolean;
  loop: boolean;
  loopDelay: number;
  color: string;
}

const DEFAULT_CONFIG: RandomTextRevealConfig = {
  text: RANDOM_TEXT_REVEAL_DEFAULT_TEXT,
  fromOpacity: 0.12,
  toOpacity: 1,
  duration: 0.35,
  minDelay: 0,
  maxDelay: 1.5,
  ease: "Power2 Out",
  animationMode: "random",
  triggerPosition: "center",
  triggerOffset: 0,
  replay: true,
  randomizeEachReplay: true,
  loop: false,
  loopDelay: 2,
  color: "#000000",
};

interface RandomTextRevealStore {
  config: RandomTextRevealConfig;
  updateConfig: (updates: Partial<RandomTextRevealConfig>) => void;
  resetConfig: () => void;
}

const useRandomTextRevealStore = create<RandomTextRevealStore>((set) => ({
  config: DEFAULT_CONFIG,
  updateConfig: (updates) =>
    set((state) => ({ config: { ...state.config, ...updates } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));

function generateCode(config: RandomTextRevealConfig, color: string) {
  return `import { RandomTextReveal } from "@/components/ui/random-text-reveal"

<RandomTextReveal
  text=${JSON.stringify(config.text)}
  fontWeight={600}
  fontSize="clamp(1.5rem, 5cqi, 3.5rem)"
  lineHeight={1.1}
  letterSpacing="-0.03em"
  color="${color}"
  fromOpacity={${config.fromOpacity}}
  toOpacity={${config.toOpacity}}
  duration={${config.duration}}
  minDelay={${config.minDelay}}
  maxDelay={${config.maxDelay}}
  ease="${config.ease}"
  animationMode="${config.animationMode}"
  triggerPosition="${config.triggerPosition}"
  triggerOffset={${config.triggerOffset}}
  replay={${config.replay}}
  randomizeEachReplay={${config.randomizeEachReplay}}
/>`;
}

export function RandomTextRevealPlayground() {
  const config = useRandomTextRevealStore((state) => state.config);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const color =
    config.color === DEFAULT_CONFIG.color
      ? isDark
        ? "#f5f5f4"
        : "#000000"
      : config.color;

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("random-text-reveal", () => useRandomTextRevealStore.getState().resetConfig());
      api.setPersonalizedCode("random-text-reveal", generateCode(config, color), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [config, color]);

  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden px-6 py-16 [container-type:inline-size] lg:min-h-[520px]">
      <RandomTextReveal
        text={config.text || RANDOM_TEXT_REVEAL_DEFAULT_TEXT}
        fontWeight={600}
        fontSize="clamp(1.5rem, 5cqi, 3.5rem)"
        lineHeight={1.1}
        letterSpacing="-0.03em"
        color={color}
        textAlign="center"
        fromOpacity={config.fromOpacity}
        toOpacity={config.toOpacity}
        duration={config.duration}
        minDelay={config.minDelay}
        maxDelay={config.maxDelay}
        ease={config.ease}
        animationMode={config.animationMode}
        triggerPosition={config.triggerPosition}
        triggerOffset={config.triggerOffset}
        replay={config.replay}
        randomizeEachReplay={config.randomizeEachReplay}
        loop={config.loop}
        loopDelay={config.loopDelay}
      />
    </div>
  );
}

function OptionGrid<T extends string>({
  options,
  value,
  onChange,
  format,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-md border px-2 py-2 text-xs font-semibold capitalize transition-colors",
            value === option
              ? "border-foreground/60 bg-foreground text-background"
              : "border-border/70 text-muted-foreground hover:text-foreground",
          )}
        >
          {format ? format(option) : option}
        </button>
      ))}
    </div>
  );
}

export function RandomTextRevealPersonalizePanel() {
  const config = useRandomTextRevealStore((state) => state.config);
  const updateConfig = useRandomTextRevealStore((state) => state.updateConfig);
  const resetConfig = useRandomTextRevealStore((state) => state.resetConfig);

  return (
    <div className="h-full overflow-auto bg-background [scrollbar-width:thin]">
      <div className="space-y-7 px-4 pb-10 pt-5">
        <header className="space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Set the message, scatter timing and scroll trigger for the reveal.
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetConfig}
            className="rounded-md border border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset
          </button>
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Message</PlaygroundSectionTitle>
          <PlaygroundTextArea
            value={config.text}
            rows={4}
            onChange={(event) =>
              updateConfig({
                text:
                  event.target.value.slice(0, 400) ||
                  RANDOM_TEXT_REVEAL_DEFAULT_TEXT,
              })
            }
            placeholder="Text to reveal…"
          />
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Reveal</PlaygroundSectionTitle>
          <OptionGrid
            options={MODE_OPTIONS}
            value={config.animationMode}
            onChange={(animationMode) => updateConfig({ animationMode })}
          />
          <PlaygroundSlider
            label="From opacity"
            min={0}
            max={1}
            step={0.01}
            value={config.fromOpacity}
            onChange={(fromOpacity) => updateConfig({ fromOpacity })}
          />
          <PlaygroundSlider
            label="To opacity"
            min={0}
            max={1}
            step={0.01}
            value={config.toOpacity}
            onChange={(toOpacity) => updateConfig({ toOpacity })}
          />
          <PlaygroundSlider
            label="Duration"
            min={0.05}
            max={1.5}
            step={0.05}
            value={config.duration}
            unit="s"
            onChange={(duration) => updateConfig({ duration })}
          />
          <PlaygroundSlider
            label="Min delay"
            min={0}
            max={3}
            step={0.05}
            value={config.minDelay}
            unit="s"
            onChange={(minDelay) => updateConfig({ minDelay })}
          />
          <PlaygroundSlider
            label="Max delay"
            min={0}
            max={5}
            step={0.05}
            value={config.maxDelay}
            unit="s"
            onChange={(maxDelay) => updateConfig({ maxDelay })}
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Ease</PlaygroundSectionTitle>
          <OptionGrid
            options={EASE_OPTIONS}
            value={config.ease}
            onChange={(ease) => updateConfig({ ease })}
            format={(ease) => ease.replace(" Out", "")}
          />
        </div>

        <div className="space-y-4">
          <PlaygroundSectionTitle>Trigger</PlaygroundSectionTitle>
          <OptionGrid
            options={TRIGGER_OPTIONS}
            value={config.triggerPosition}
            onChange={(triggerPosition) => updateConfig({ triggerPosition })}
          />
          <PlaygroundSlider
            label="Trigger offset"
            min={-300}
            max={300}
            step={10}
            value={config.triggerOffset}
            unit="px"
            onChange={(triggerOffset) => updateConfig({ triggerOffset })}
          />
          <PlaygroundSwitch
            label="Replay on re-enter"
            checked={config.replay}
            onChange={(replay) => updateConfig({ replay })}
          />
          <PlaygroundSwitch
            label="Loop continuously"
            checked={config.loop}
            onChange={(loop) => updateConfig({ loop })}
          />
          <PlaygroundSlider
            label="Loop delay"
            min={0.5}
            max={6}
            step={0.5}
            value={config.loopDelay}
            unit="s"
            onChange={(loopDelay) => updateConfig({ loopDelay })}
          />
          <PlaygroundSwitch
            label="Randomize each replay"
            checked={config.randomizeEachReplay}
            onChange={(randomizeEachReplay) =>
              updateConfig({ randomizeEachReplay })
            }
          />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Color</PlaygroundSectionTitle>
          <PlaygroundColorPicker
            label="Text"
            value={config.color}
            onChange={(color) => updateConfig({ color })}
            defaultColor="#000000"
          />
        </div>
      </div>
    </div>
  );
}
