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
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

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

const optionLabel = (value: string) =>
  value.replace(/-/g, " ").replace(/^./, (char) => char.toUpperCase());

const CONTROLS: CustomizeControl[] = [
  { type: "textarea", key: "text", label: "Message", placeholder: "Text to reveal…", group: "Message" },
  { type: "select", key: "animationMode", label: "Animation mode", options: MODE_OPTIONS.map((option) => ({ label: optionLabel(option), value: option })), group: "Reveal" },
  { type: "slider", key: "fromOpacity", label: "From opacity", min: 0, max: 1, step: 0.01, group: "Reveal" },
  { type: "slider", key: "toOpacity", label: "To opacity", min: 0, max: 1, step: 0.01, group: "Reveal" },
  { type: "slider", key: "duration", label: "Duration", min: 0.05, max: 1.5, step: 0.05, unit: "s", group: "Reveal" },
  { type: "slider", key: "minDelay", label: "Min delay", min: 0, max: 3, step: 0.05, unit: "s", group: "Reveal" },
  { type: "slider", key: "maxDelay", label: "Max delay", min: 0, max: 5, step: 0.05, unit: "s", group: "Reveal" },
  { type: "select", key: "ease", label: "Ease", options: EASE_OPTIONS.map((ease) => ({ label: ease.replace(" Out", ""), value: ease })), group: "Ease" },
  { type: "select", key: "triggerPosition", label: "Trigger position", options: TRIGGER_OPTIONS.map((option) => ({ label: optionLabel(option), value: option })), group: "Trigger" },
  { type: "slider", key: "triggerOffset", label: "Trigger offset", min: -300, max: 300, step: 10, unit: "px", group: "Trigger" },
  { type: "toggle", key: "replay", label: "Replay on re-enter", group: "Trigger" },
  { type: "toggle", key: "loop", label: "Loop continuously", group: "Trigger" },
  { type: "slider", key: "loopDelay", label: "Loop delay", min: 0.5, max: 6, step: 0.5, unit: "s", group: "Trigger" },
  { type: "toggle", key: "randomizeEachReplay", label: "Randomize each replay", group: "Trigger" },
  { type: "color", key: "color", label: "Text", defaultColor: "#000000", group: "Color" },
];

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

export function RandomTextRevealPersonalizePanel() {
  const config = useRandomTextRevealStore((state) => state.config);
  const updateConfig = useRandomTextRevealStore((state) => state.updateConfig);
  const updateValue = bindCustomizeUpdate(updateConfig);

  return (
    <CustomizePanel
      slug="random-text-reveal"
      controls={CONTROLS}
      values={config}
      defaults={DEFAULT_CONFIG}
      onChange={(key, value) => {
        if (key === "text") {
          updateConfig({
            text:
              String(value).slice(0, 400) || RANDOM_TEXT_REVEAL_DEFAULT_TEXT,
          });
          return;
        }
        updateValue(key, value);
      }}
      onReset={() => usePlaygroundStore.getState().resetPreview("random-text-reveal")}
    />
  );
}
