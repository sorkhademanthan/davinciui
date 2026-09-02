"use client";

import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { DitheredLogo } from "@workspace/ui/components/dithered-logo";
import { cn } from "@/lib/utils";
import { usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  PlaygroundSectionTitle,
  PlaygroundSlider,
  PlaygroundSwitch,
} from "@/components/playground-primitives";

export interface DitheredLogoConfig {
  imageSrc: string;
  gridSize: number;
  scale: number;
  dotScale: number;
  invert: boolean;
  cornerRadius: number;
  threshold: number;
  contrast: number;
  gamma: number;
  blur: number;
  diffusionStrength: number;
  serpentine: boolean;
}

export const DITHERED_LOGO_DEFAULT_CONFIG: DitheredLogoConfig = {
  imageSrc: "/images/dithered-logo/logo.svg",
  gridSize: 200,
  scale: 0.36,
  dotScale: 1,
  invert: true,
  cornerRadius: 0.2,
  threshold: 180,
  contrast: 0,
  gamma: 1.0,
  blur: 3.75,
  diffusionStrength: 1.0,
  serpentine: true,
};

const PRESETS: Array<{ name: string; config: DitheredLogoConfig }> = [
  {
    name: "Default",
    config: DITHERED_LOGO_DEFAULT_CONFIG,
  },
  {
    name: "Outline",
    config: {
      ...DITHERED_LOGO_DEFAULT_CONFIG,
      invert: false,
      threshold: 160,
      blur: 2.5,
    },
  },
  {
    name: "Dense",
    config: {
      ...DITHERED_LOGO_DEFAULT_CONFIG,
      gridSize: 260,
      scale: 0.42,
      dotScale: 0.85,
      threshold: 165,
      blur: 2,
      diffusionStrength: 1.0,
    },
  },
  {
    name: "Soft",
    config: {
      ...DITHERED_LOGO_DEFAULT_CONFIG,
      blur: 6,
      gamma: 1.4,
      threshold: 190,
      contrast: -10,
      diffusionStrength: 0.85,
    },
  },
  {
    name: "Sharp",
    config: {
      ...DITHERED_LOGO_DEFAULT_CONFIG,
      gridSize: 180,
      threshold: 140,
      blur: 1.2,
      gamma: 0.85,
      contrast: 20,
      diffusionStrength: 1.15,
      cornerRadius: 0.08,
    },
  },
];

interface DitheredLogoPlaygroundStore {
  config: DitheredLogoConfig;
  renderVersion: number;
  activePreset: string;
  setConfig: (config: DitheredLogoConfig) => void;
  updateConfig: (updates: Partial<DitheredLogoConfig>) => void;
  setActivePreset: (preset: string) => void;
  resetPreview: () => void;
  resetConfig: () => void;
}

const useDitheredLogoPlaygroundStore = create<DitheredLogoPlaygroundStore>((set) => ({
  config: DITHERED_LOGO_DEFAULT_CONFIG,
  renderVersion: 0,
  activePreset: "Default",
  setConfig: (config) => set({ config }),
  updateConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),
  setActivePreset: (preset) => set({ activePreset: preset }),
  resetPreview: () =>
    set((state) => ({
      renderVersion: state.renderVersion + 1,
    })),
  resetConfig: () =>
    set(() => ({
      config: DITHERED_LOGO_DEFAULT_CONFIG,
      activePreset: "Default",
      renderVersion: 0,
    })),
}));

function generateCode(config: DitheredLogoConfig) {
  return `import { DitheredLogo } from "@/components/ui/dithered-logo"

<div className="h-[600px] w-full bg-white text-black">
  <DitheredLogo
    imageSrc="${config.imageSrc}"
    className="h-full w-full"
    gridSize={${config.gridSize}}
    scale={${config.scale}}
    dotScale={${config.dotScale}}
    invert={${config.invert}}
    cornerRadius={${config.cornerRadius}}
    threshold={${config.threshold}}
    contrast={${config.contrast}}
    gamma={${config.gamma}}
    blur={${config.blur}}
    diffusionStrength={${config.diffusionStrength}}
    serpentine={${config.serpentine}}
  />
</div>`;
}

// ─── Variant previews (static, for bottom bar) ───────────────────────────────

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full min-h-full w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white">
      <div className="h-[520px] w-full">{children}</div>
    </div>
  );
}

export function DitheredLogoDefaultPreview() {
  return (
    <PreviewFrame>
      <DitheredLogo imageSrc="/images/dithered-logo/logo.svg" className="h-full w-full" scale={0.36} />
    </PreviewFrame>
  );
}

export function DitheredLogoOutlinePreview() {
  return (
    <PreviewFrame>
      <DitheredLogo imageSrc="/images/dithered-logo/logo.svg" className="h-full w-full" scale={0.36} invert={false} threshold={160} blur={2.5} />
    </PreviewFrame>
  );
}

export function DitheredLogoDensePreview() {
  return (
    <PreviewFrame>
      <DitheredLogo imageSrc="/images/dithered-logo/logo.svg" className="h-full w-full" gridSize={260} scale={0.42} dotScale={0.85} threshold={165} blur={2} />
    </PreviewFrame>
  );
}

export function DitheredLogoSoftPreview() {
  return (
    <PreviewFrame>
      <DitheredLogo imageSrc="/images/dithered-logo/logo.svg" className="h-full w-full" scale={0.36} blur={6} gamma={1.4} threshold={190} contrast={-10} diffusionStrength={0.85} />
    </PreviewFrame>
  );
}

export function DitheredLogoSharpPreview() {
  return (
    <PreviewFrame>
      <DitheredLogo imageSrc="/images/dithered-logo/logo.svg" className="h-full w-full" gridSize={180} scale={0.36} threshold={140} blur={1.2} gamma={0.85} contrast={20} diffusionStrength={1.15} cornerRadius={0.08} />
    </PreviewFrame>
  );
}

// ─── Interactive playground (default preview) ────────────────────────────────

export function DitheredLogoPlayground() {
  const config = useDitheredLogoPlaygroundStore((s) => s.config);
  const renderVersion = useDitheredLogoPlaygroundStore((s) => s.renderVersion);

  useEffect(() => {
    const t = setTimeout(() => usePlaygroundStore.getState().setCode(generateCode(config)), 250);
    return () => clearTimeout(t);
  }, [config]);

  return (
    <div className="h-full min-h-full w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white">
      <DitheredLogo
        key={renderVersion}
        imageSrc={config.imageSrc}
        className="h-full w-full"
        gridSize={config.gridSize}
        scale={config.scale}
        dotScale={config.dotScale}
        invert={config.invert}
        cornerRadius={config.cornerRadius}
        threshold={config.threshold}
        contrast={config.contrast}
        gamma={config.gamma}
        blur={config.blur}
        diffusionStrength={config.diffusionStrength}
        serpentine={config.serpentine}
      />
    </div>
  );
}

export function DitheredLogoPersonalizePanel() {
  const config = useDitheredLogoPlaygroundStore((s) => s.config);
  const activePreset = useDitheredLogoPlaygroundStore((s) => s.activePreset);
  const setConfig = useDitheredLogoPlaygroundStore((s) => s.setConfig);
  const updateConfig = useDitheredLogoPlaygroundStore((s) => s.updateConfig);
  const setActivePreset = useDitheredLogoPlaygroundStore((s) => s.setActivePreset);
  const resetConfig = useDitheredLogoPlaygroundStore((s) => s.resetConfig);

  const selectedPresetConfig = useMemo(() => PRESETS.find((p) => p.name === activePreset)?.config, [activePreset]);

  const handleChange = <K extends keyof DitheredLogoConfig>(key: K, value: DitheredLogoConfig[K]) => {
    updateConfig({ [key]: value } as Partial<DitheredLogoConfig>);
    if (activePreset === "Custom") return;
    const matched = PRESETS.find((p) => JSON.stringify(p.config) === JSON.stringify({ ...config, [key]: value }));
    setActivePreset(matched?.name ?? "Custom");
  };

  const handlePresetChange = (name: string) => {
    const preset = PRESETS.find((p) => p.name === name);
    if (!preset) return;
    setConfig({ ...preset.config });
    setActivePreset(name);
  };

  return (
    <div className="h-full overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-6 px-4 pb-10 pt-20">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">Personalize</h2>
          <p className="text-sm leading-relaxed text-muted-foreground/90">Tune dithering, scale and diffusion in real time. Hover to repel, click to ripple.</p>
        </header>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground/90">
            Current preset: <span className="font-mono text-foreground">{activePreset}</span>
          </div>
          <button type="button" onClick={resetConfig} className="rounded-md border border-border/40 bg-white/50 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground dark:bg-white/[0.03]">
            Reset
          </button>
        </div>

        <div>
          <PlaygroundSectionTitle>Presets</PlaygroundSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.name || (activePreset !== "Custom" && selectedPresetConfig && preset.name === activePreset);
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetChange(preset.name)}
                  className={cn(
                    "rounded-md border p-2 text-center text-[10px] font-mono uppercase tracking-widest transition-colors",
                    isActive ? "border-zinc-500/70 bg-zinc-100 dark:border-zinc-500/80 dark:bg-zinc-900/70" : "border-border/70 bg-transparent"
                  )}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Sampling</PlaygroundSectionTitle>
          <PlaygroundSlider label="Grid Size" min={80} max={320} step={10} value={config.gridSize} onChange={(v) => handleChange("gridSize", v)} />
          <PlaygroundSlider label="Scale" min={0.2} max={0.8} step={0.02} value={config.scale} onChange={(v) => handleChange("scale", v)} />
          <PlaygroundSlider label="Dot Scale" min={0.4} max={1.8} step={0.05} value={config.dotScale} onChange={(v) => handleChange("dotScale", v)} />
          <PlaygroundSlider label="Corner Radius" min={0} max={0.5} step={0.02} value={config.cornerRadius} onChange={(v) => handleChange("cornerRadius", v)} />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Dithering</PlaygroundSectionTitle>
          <PlaygroundSlider label="Threshold" min={80} max={220} step={1} value={config.threshold} onChange={(v) => handleChange("threshold", v)} />
          <PlaygroundSlider label="Contrast" min={-50} max={50} step={1} value={config.contrast} onChange={(v) => handleChange("contrast", v)} />
          <PlaygroundSlider label="Gamma" min={0.5} max={2.2} step={0.05} value={config.gamma} onChange={(v) => handleChange("gamma", v)} />
          <PlaygroundSlider label="Blur" min={0} max={8} step={0.25} value={config.blur} onChange={(v) => handleChange("blur", v)} />
          <PlaygroundSlider label="Diffusion Strength" min={0.2} max={1.4} step={0.05} value={config.diffusionStrength} onChange={(v) => handleChange("diffusionStrength", v)} />
        </div>

        <div className="space-y-3">
          <PlaygroundSectionTitle>Options</PlaygroundSectionTitle>
          <PlaygroundSwitch label="Invert (rounded mask)" checked={config.invert} onChange={(v) => handleChange("invert", v)} />
          <PlaygroundSwitch label="Serpentine scan" checked={config.serpentine} onChange={(v) => handleChange("serpentine", v)} />
        </div>
      </div>
    </div>
  );
}
