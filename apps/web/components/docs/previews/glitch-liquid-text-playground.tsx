"use client";

import { useTheme } from "next-themes";
import { GlitchLiquidText } from "@workspace/ui/components/glitch-liquid-text";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

const GLITCH_PLAYGROUND_DEFAULTS = {
  text: "DAVINCIUI",
  fontFamily: "Anton",
  fontSize: 250,
  lineHeight: 1.2,
  textColor: "#ffffff",
  backgroundColor: "#080808",
  distortionStrength: 0.42,
  distortionRadius: 0.2,
  distortionDecay: 3,
  liquidStrength: 1,
  starburstStrength: 0.28,
  waveStrength: 0.22,
  pinchStrength: 0.22,
  chromaticAberration: 0.014,
  glitchStrength: 0.08,
  noiseStrength: 0.03,
  noiseSpeed: 0.35,
  lightIntensity: 0.14,
  grainStrength: 0.016,
  autoAnimate: false,
  interactive: true,
};

function isDefaultValue(
  key: keyof typeof GLITCH_PLAYGROUND_DEFAULTS,
  value: unknown,
) {
  return value === GLITCH_PLAYGROUND_DEFAULTS[key];
}

function GlitchLiquidTextStage({
  config,
  renderVersion,
}: {
  config: Record<string, unknown>;
  renderVersion: number;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const text =
    typeof config.text === "string"
      ? config.text
      : GLITCH_PLAYGROUND_DEFAULTS.text;
  const fontFamily =
    typeof config.fontFamily === "string"
      ? config.fontFamily
      : GLITCH_PLAYGROUND_DEFAULTS.fontFamily;
  const fontSize =
    typeof config.fontSize === "number"
      ? config.fontSize
      : GLITCH_PLAYGROUND_DEFAULTS.fontSize;
  const lineHeight =
    typeof config.lineHeight === "number"
      ? config.lineHeight
      : GLITCH_PLAYGROUND_DEFAULTS.lineHeight;
  const textColor = isDefaultValue("textColor", config.textColor)
    ? isDark
      ? "#ffffff"
      : "#18181b"
    : String(config.textColor ?? GLITCH_PLAYGROUND_DEFAULTS.textColor);
  const backgroundColor = isDefaultValue(
    "backgroundColor",
    config.backgroundColor,
  )
    ? isDark
      ? "#080808"
      : "#f8fafc"
    : String(
        config.backgroundColor ?? GLITCH_PLAYGROUND_DEFAULTS.backgroundColor,
      );
  const distortionStrength =
    typeof config.distortionStrength === "number"
      ? config.distortionStrength
      : GLITCH_PLAYGROUND_DEFAULTS.distortionStrength;
  const distortionRadius =
    typeof config.distortionRadius === "number"
      ? config.distortionRadius
      : GLITCH_PLAYGROUND_DEFAULTS.distortionRadius;
  const distortionDecay =
    typeof config.distortionDecay === "number"
      ? config.distortionDecay
      : GLITCH_PLAYGROUND_DEFAULTS.distortionDecay;
  const liquidStrength =
    typeof config.liquidStrength === "number"
      ? config.liquidStrength
      : GLITCH_PLAYGROUND_DEFAULTS.liquidStrength;
  const starburstStrength =
    typeof config.starburstStrength === "number"
      ? config.starburstStrength
      : GLITCH_PLAYGROUND_DEFAULTS.starburstStrength;
  const waveStrength =
    typeof config.waveStrength === "number"
      ? config.waveStrength
      : GLITCH_PLAYGROUND_DEFAULTS.waveStrength;
  const pinchStrength =
    typeof config.pinchStrength === "number"
      ? config.pinchStrength
      : GLITCH_PLAYGROUND_DEFAULTS.pinchStrength;
  const chromaticAberration =
    typeof config.chromaticAberration === "number"
      ? config.chromaticAberration
      : GLITCH_PLAYGROUND_DEFAULTS.chromaticAberration;
  const glitchStrength =
    typeof config.glitchStrength === "number"
      ? config.glitchStrength
      : GLITCH_PLAYGROUND_DEFAULTS.glitchStrength;
  const noiseStrength =
    typeof config.noiseStrength === "number"
      ? config.noiseStrength
      : GLITCH_PLAYGROUND_DEFAULTS.noiseStrength;
  const noiseSpeed =
    typeof config.noiseSpeed === "number"
      ? config.noiseSpeed
      : GLITCH_PLAYGROUND_DEFAULTS.noiseSpeed;
  const lightIntensity =
    typeof config.lightIntensity === "number"
      ? config.lightIntensity
      : GLITCH_PLAYGROUND_DEFAULTS.lightIntensity;
  const grainStrength =
    typeof config.grainStrength === "number"
      ? config.grainStrength
      : GLITCH_PLAYGROUND_DEFAULTS.grainStrength;
  const autoAnimate =
    typeof config.autoAnimate === "boolean"
      ? config.autoAnimate
      : GLITCH_PLAYGROUND_DEFAULTS.autoAnimate;
  const interactive =
    typeof config.interactive === "boolean"
      ? config.interactive
      : GLITCH_PLAYGROUND_DEFAULTS.interactive;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <GlitchLiquidText
        key={renderVersion}
        className="h-full w-full min-h-[560px]"
        text={text}
        fontFamily={fontFamily}
        fontSize={fontSize}
        lineHeight={lineHeight}
        textColor={textColor}
        backgroundColor={backgroundColor}
        distortionStrength={distortionStrength}
        distortionRadius={distortionRadius}
        distortionDecay={distortionDecay}
        liquidStrength={liquidStrength}
        starburstStrength={starburstStrength}
        waveStrength={waveStrength}
        pinchStrength={pinchStrength}
        chromaticAberration={chromaticAberration}
        glitchStrength={glitchStrength}
        noiseStrength={noiseStrength}
        noiseSpeed={noiseSpeed}
        lightIntensity={lightIntensity}
        grainStrength={grainStrength}
        interactive={interactive}
        autoAnimate={autoAnimate}
        fit="responsive"
        cursorEnabled
        cursorSize={48}
        cursorColor="#ffffff"
      />
    </div>
  );
}

export const {
  Preview: GlitchLiquidTextPlayground,
  PersonalizePanel: GlitchLiquidTextPersonalizePanel,
} = createComponentPlayground({
  slug: "glitch-liquid-text",
  component: GlitchLiquidText as React.ComponentType<Record<string, unknown>>,
  componentName: "GlitchLiquidText",
  defaults: {
    text: "DAVINCIUI",
    fontFamily: "Anton",
    fontSize: 250,
    lineHeight: 1.2,
    textColor: "#ffffff",
    backgroundColor: "#080808",
    distortionStrength: 0.42,
    distortionRadius: 0.2,
    distortionDecay: 3,
    liquidStrength: 1,
    starburstStrength: 0.28,
    waveStrength: 0.22,
    pinchStrength: 0.22,
    chromaticAberration: 0.014,
    glitchStrength: 0.08,
    noiseStrength: 0.03,
    noiseSpeed: 0.35,
    lightIntensity: 0.14,
    grainStrength: 0.016,
    cursorColor: "#ffffff",
    cursorSize: 48,
    autoAnimate: false,
  },
  fields: [
    {
      key: "text",
      label: "Text",
      type: "textarea",
      placeholder: "DAVINCIUI",
      section: "Content",
    },
    {
      key: "fontSize",
      label: "Font Size",
      type: "slider",
      min: 60,
      max: 300,
      step: 5,
      unit: "px",
      section: "Content",
    },
    {
      key: "lineHeight",
      label: "Line Height",
      type: "slider",
      min: 0.7,
      max: 1.6,
      step: 0.01,
      section: "Content",
    },
    { key: "textColor", label: "Text Color", type: "color", section: "Ink" },
    {
      key: "backgroundColor",
      label: "Background",
      type: "color",
      section: "Ink",
    },
    {
      key: "distortionStrength",
      label: "Liquid Distortion",
      type: "slider",
      min: 0,
      max: 2,
      step: 0.01,
      section: "Distortion",
    },
    {
      key: "distortionRadius",
      label: "Distortion Radius",
      type: "slider",
      min: 0.02,
      max: 0.8,
      step: 0.01,
      section: "Distortion",
    },
    {
      key: "distortionDecay",
      label: "Distortion Decay",
      type: "slider",
      min: 0.5,
      max: 10,
      step: 0.1,
      section: "Distortion",
    },
    {
      key: "liquidStrength",
      label: "Liquid Strength",
      type: "slider",
      min: 0,
      max: 3,
      step: 0.05,
      section: "Distortion",
    },
    {
      key: "starburstStrength",
      label: "Starburst",
      type: "slider",
      min: 0,
      max: 1.5,
      step: 0.01,
      section: "Distortion",
    },
    {
      key: "waveStrength",
      label: "Wave",
      type: "slider",
      min: 0,
      max: 1.5,
      step: 0.01,
      section: "Distortion",
    },
    {
      key: "pinchStrength",
      label: "Pinch",
      type: "slider",
      min: 0,
      max: 1.5,
      step: 0.01,
      section: "Distortion",
    },
    {
      key: "chromaticAberration",
      label: "Chromatic Split",
      type: "slider",
      min: 0,
      max: 0.1,
      step: 0.002,
      section: "Glitch",
    },
    {
      key: "glitchStrength",
      label: "Glitch Strength",
      type: "slider",
      min: 0,
      max: 2,
      step: 0.01,
      section: "Glitch",
    },
    {
      key: "noiseStrength",
      label: "Noise",
      type: "slider",
      min: 0,
      max: 0.3,
      step: 0.005,
      section: "Glitch",
    },
    {
      key: "noiseSpeed",
      label: "Noise Speed",
      type: "slider",
      min: 0,
      max: 2,
      step: 0.01,
      section: "Glitch",
    },
    {
      key: "lightIntensity",
      label: "Light Rays",
      type: "slider",
      min: 0,
      max: 2,
      step: 0.01,
      section: "Finish",
    },
    {
      key: "grainStrength",
      label: "Grain",
      type: "slider",
      min: 0,
      max: 0.2,
      step: 0.005,
      section: "Finish",
    },
    {
      key: "autoAnimate",
      label: "Auto Animate",
      type: "switch",
      section: "Finish",
    },
  ],
  render: (config, renderVersion) => (
    <GlitchLiquidTextStage
      config={config as Record<string, unknown>}
      renderVersion={renderVersion}
    />
  ),
  elementClassName: "h-full w-full",
  stageClassName: "bg-background",
  intro:
    "Move across the type to pull a localized starburst, wave, and chromatic split through the letters. Leave it alone and the type stays crisp.",
});
