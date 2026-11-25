"use client";

import * as React from "react";
import { create } from "zustand";
import {
  RollingText,
  type RollingTextHandle,
  type RollingTextPattern,
} from "@workspace/ui/components/rolling-text";
import { configEquals, usePlaygroundStore } from "@/hooks/use-playground-store";
import {
  CustomizePanel,
  bindCustomizeUpdate,
  type CustomizeControl,
} from "@/components/customize-panel";

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
  fontSize: 111,
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

const CONTROLS: CustomizeControl[] = [
  { type: "text", key: "text", label: "Text", placeholder: "DAVINCIUI", maxLength: 48, group: "Content" },
  { type: "select", key: "pattern", label: "Pattern", options: [
    { label: "Sequential", value: "sequential" },
    { label: "Alternating", value: "alternating" },
  ], group: "Animation" },
  { type: "slider", key: "duplicateCount", label: "Duplicate count", min: 2, max: 16, step: 1, group: "Animation" },
  { type: "slider", key: "rollDuration", label: "Roll duration", min: 0.2, max: 2, step: 0.05, unit: "s", group: "Animation" },
  { type: "slider", key: "staggerDelay", label: "Stagger delay", min: 0, max: 0.15, step: 0.005, unit: "s", group: "Animation" },
  { type: "slider", key: "blurIntensity", label: "Blur intensity", min: 0, max: 20, step: 0.5, unit: "px", group: "Animation" },
  { type: "toggle", key: "autoPlay", label: "Auto play", group: "Animation" },
  { type: "select", key: "fontFamily", label: "Font family", options: FONT_OPTIONS, group: "Typography" },
  { type: "slider", key: "fontSize", label: "Font size", min: 24, max: 320, step: 1, unit: "px", group: "Typography" },
  { type: "select", key: "fontWeight", label: "Font weight", options: WEIGHT_OPTIONS.map((weight) => ({ label: String(weight), value: String(weight) })), group: "Typography" },
  { type: "slider", key: "lineHeight", label: "Line height", min: 0.9, max: 1.6, step: 0.05, group: "Typography" },
  { type: "text", key: "letterSpacing", label: "Letter spacing", placeholder: "-0.02em", maxLength: 12, group: "Typography" },
  { type: "color", key: "textColor", label: "Text", defaultColor: DEFAULT_CONFIG.textColor, group: "Typography" },
  { type: "select", key: "textAlign", label: "Text align", options: ALIGN_OPTIONS.map((align) => ({ label: align.charAt(0).toUpperCase() + align.slice(1), value: align })), group: "Typography" },
  { type: "toggle", key: "autoTheme", label: "Match site theme", group: "Appearance" },
  { type: "color", key: "backgroundColor", label: "Background", defaultColor: DEFAULT_CONFIG.backgroundColor, group: "Appearance" },
];

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
    const t = window.setTimeout(() => {
      const api = usePlaygroundStore.getState();
      api.registerPreviewReset("rolling-text", () => useRollingTextPlayground.getState().resetConfig());
      api.setPersonalizedCode("rolling-text", generateCode(config), !configEquals(config, DEFAULT_CONFIG));
    }, 180);
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
  const applyControlUpdate = bindCustomizeUpdate(update);
  const values = { ...config, fontWeight: String(config.fontWeight) };
  const defaults = {
    ...DEFAULT_CONFIG,
    fontWeight: String(DEFAULT_CONFIG.fontWeight),
  };

  return (
    <CustomizePanel
      slug="rolling-text"
      controls={CONTROLS}
      values={values}
      defaults={defaults}
      onChange={(key, value) => {
        if (key === "text") {
          update({ text: String(value) || "DAVINCIUI" });
        } else if (key === "letterSpacing") {
          update({ letterSpacing: String(value) || "-0.02em" });
        } else if (key === "fontWeight") {
          update({ fontWeight: Number(value) });
        } else if (key === "textColor") {
          update({ textColor: String(value), autoTheme: false });
        } else if (key === "backgroundColor") {
          update({ backgroundColor: String(value), autoTheme: false });
        } else {
          applyControlUpdate(key, value);
        }
      }}
      onReset={() => usePlaygroundStore.getState().resetPreview("rolling-text")}
    />
  );
}
