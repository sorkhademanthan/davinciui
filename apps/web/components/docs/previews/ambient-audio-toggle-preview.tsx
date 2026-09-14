"use client";

import { create } from "zustand";
import { AmbientAudioToggle } from "@workspace/ui/components/ambient-audio-toggle";
import {
  PlaygroundColorPicker,
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
} from "@/components/playground-primitives";

type AmbientAudioToggleConfig = {
  visualizer: "wave" | "bars";
  volume: number;
  loop: boolean;
  activeColor: string;
  inactiveColor: string;
  playingColor: string;
  pausedColor: string;
  labelPlaying: string;
  labelPaused: string;
  hideLabel: boolean;
  labelPosition: "left" | "right" | "above" | "below";
  labelGap: number;
  waveformWidth: number;
  waveformHeight: number;
  lineWeight: number;
  lineCap: "round" | "square";
  barCount: number;
  pausedAmount: number;
  animationSpeed: number;
  intensity: number;
  transition: number;
};

const DEFAULT_CONFIG: AmbientAudioToggleConfig = {
  visualizer: "wave",
  volume: 65,
  loop: true,
  activeColor: "#a7f3d0",
  inactiveColor: "#64748b",
  playingColor: "#f8fafc",
  pausedColor: "#94a3b8",
  labelPlaying: "Playing",
  labelPaused: "Play ambient audio",
  hideLabel: false,
  labelPosition: "right",
  labelGap: 10,
  waveformWidth: 148,
  waveformHeight: 44,
  lineWeight: 2.4,
  lineCap: "round",
  barCount: 28,
  pausedAmount: 0.2,
  animationSpeed: 1.1,
  intensity: 1,
  transition: 0.35,
};

const useAmbientAudioToggleStore = create<{
  config: AmbientAudioToggleConfig;
  update: (next: Partial<AmbientAudioToggleConfig>) => void;
  reset: () => void;
}>((set) => ({
  config: DEFAULT_CONFIG,
  update: (next) => set((state) => ({ config: { ...state.config, ...next } })),
  reset: () => set({ config: DEFAULT_CONFIG }),
}));

export function AmbientAudioTogglePreview() {
  const config = useAmbientAudioToggleStore((state) => state.config);

  return (
    <section
      className="relative flex h-full min-h-[560px] w-full flex-col items-center justify-center overflow-hidden bg-[#101815] px-6 text-center"
      style={{ containerType: "inline-size" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(70,132,104,0.32),transparent_64%)]" />
      <div className="relative flex items-center justify-center">
        <AmbientAudioToggle
          {...config}
          src="/audio/ambient-toggle-demo.wav"
          persistenceKey="davinciui-ambient-audio-preview"
          className="min-h-[64px] rounded-2xl px-5 py-3"
        />
      </div>
    </section>
  );
}

export function AmbientAudioTogglePersonalizePanel() {
  const config = useAmbientAudioToggleStore((state) => state.config);
  const update = useAmbientAudioToggleStore((state) => state.update);
  const reset = useAmbientAudioToggleStore((state) => state.reset);

  return (
    <div className="h-full overflow-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-7 px-4 pb-12 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            Personalize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Tune the sound, waveform, and playback label.
          </p>
        </header>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reset
          </button>
        </div>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Playback</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Volume"
            min={0}
            max={100}
            step={5}
            unit="%"
            value={config.volume}
            onChange={(volume) => update({ volume })}
          />
          <PlaygroundSwitch
            label="Loop track"
            checked={config.loop}
            onChange={(loop) => update({ loop })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Visualizer</PlaygroundSectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {(["wave", "bars"] as const).map((visualizer) => (
              <button
                key={visualizer}
                type="button"
                aria-pressed={config.visualizer === visualizer}
                onClick={() => update({ visualizer })}
                className="min-h-10 rounded-md border border-border/70 px-3 text-sm capitalize text-foreground transition-colors aria-pressed:border-foreground aria-pressed:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {visualizer}
              </button>
            ))}
          </div>
          {config.visualizer === "bars" && (
            <PlaygroundSlider
              label="Bar count"
              min={4}
              max={80}
              step={1}
              value={config.barCount}
              onChange={(barCount) => update({ barCount })}
            />
          )}
          <PlaygroundSlider
            label="Width"
            min={24}
            max={400}
            step={1}
            unit="px"
            value={config.waveformWidth}
            onChange={(waveformWidth) => update({ waveformWidth })}
          />
          <PlaygroundSlider
            label="Height"
            min={12}
            max={120}
            step={1}
            unit="px"
            value={config.waveformHeight}
            onChange={(waveformHeight) => update({ waveformHeight })}
          />
          <PlaygroundSlider
            label="Line weight"
            min={0.5}
            max={12}
            step={0.5}
            unit="px"
            value={config.lineWeight}
            onChange={(lineWeight) => update({ lineWeight })}
          />
          <div className="grid grid-cols-2 gap-2">
            {(["round", "square"] as const).map((lineCap) => (
              <button
                key={lineCap}
                type="button"
                aria-pressed={config.lineCap === lineCap}
                onClick={() => update({ lineCap })}
                className="min-h-10 rounded-md border border-border/70 px-3 text-sm capitalize text-foreground transition-colors aria-pressed:border-foreground aria-pressed:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {lineCap} caps
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Color</PlaygroundSectionTitle>
          <PlaygroundColorPicker
            label="Active waveform"
            value={config.activeColor}
            onChange={(activeColor) => update({ activeColor })}
            defaultColor={DEFAULT_CONFIG.activeColor}
          />
          <PlaygroundColorPicker
            label="Inactive waveform"
            value={config.inactiveColor}
            onChange={(inactiveColor) => update({ inactiveColor })}
            defaultColor={DEFAULT_CONFIG.inactiveColor}
          />
          <PlaygroundColorPicker
            label="Playing label"
            value={config.playingColor}
            onChange={(playingColor) => update({ playingColor })}
            defaultColor={DEFAULT_CONFIG.playingColor}
          />
          <PlaygroundColorPicker
            label="Paused label"
            value={config.pausedColor}
            onChange={(pausedColor) => update({ pausedColor })}
            defaultColor={DEFAULT_CONFIG.pausedColor}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Animation</PlaygroundSectionTitle>
          <PlaygroundSlider
            label="Speed"
            min={0.25}
            max={4}
            step={0.05}
            value={config.animationSpeed}
            onChange={(animationSpeed) => update({ animationSpeed })}
          />
          <PlaygroundSlider
            label="Intensity"
            min={0}
            max={2}
            step={0.05}
            value={config.intensity}
            onChange={(intensity) => update({ intensity })}
          />
          <PlaygroundSlider
            label="Paused amount"
            min={0}
            max={1}
            step={0.01}
            value={config.pausedAmount}
            onChange={(pausedAmount) => update({ pausedAmount })}
          />
          <PlaygroundSlider
            label="Transition"
            min={0}
            max={2}
            step={0.05}
            unit="s"
            value={config.transition}
            onChange={(transition) => update({ transition })}
          />
        </section>

        <section className="space-y-3">
          <PlaygroundSectionTitle>Label</PlaygroundSectionTitle>
          <PlaygroundSwitch
            label="Hide label"
            checked={config.hideLabel}
            onChange={(hideLabel) => update({ hideLabel })}
          />
          <label className="block space-y-1.5 text-xs font-semibold text-foreground/90">
            Position
            <select
              value={config.labelPosition}
              onChange={(event) =>
                update({
                  labelPosition: event.target
                    .value as AmbientAudioToggleConfig["labelPosition"],
                })
              }
              className="h-10 w-full rounded-md border border-border/70 bg-background px-3 text-sm font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {(["left", "right", "above", "below"] as const).map(
                (position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ),
              )}
            </select>
          </label>
          <PlaygroundSlider
            label="Gap"
            min={0}
            max={40}
            step={1}
            unit="px"
            value={config.labelGap}
            onChange={(labelGap) => update({ labelGap })}
          />
        </section>
      </div>
    </div>
  );
}
