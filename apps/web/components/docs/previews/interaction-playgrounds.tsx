"use client";

import * as React from "react";
import { GlassSceneDock } from "@workspace/ui/components/glass-scene-dock";
import { LiquidRevealButton } from "@workspace/ui/components/liquid-reveal-button";
import { NudgeButton } from "@workspace/ui/components/nudge-button";
import { AnimatedPillButton } from "@workspace/ui/components/animated-pill-button";
import { TeamSlideReveal } from "@workspace/ui/components/team-slide-reveal";
import { LiquidChromeButton } from "@workspace/ui/components/liquid-chrome-button";
import { RadialFanDeck } from "@workspace/ui/components/radial-fan-deck";
import { AnimatedMetric } from "@workspace/ui/components/animated-metric";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

// ─── Glass Scene Dock ───────────────────────────────────────────────────────

export const {
  Preview: GlassSceneDockPlayground,
  PersonalizePanel: GlassSceneDockPersonalizePanel,
} = createComponentPlayground({
  slug: "glass-scene-dock",
  component: GlassSceneDock as unknown as React.ComponentType<StageProps>,
  componentName: "GlassSceneDock",
  defaults: {
    defaultIndex: 0,
    mode: "preview",
    enableScroll: true,
    enableHover: true,
    transitionDuration: 650,
  },
  fields: [
    {
      key: "mode",
      label: "Mode",
      type: "select",
      options: [
        { label: "Card", value: "card" },
        { label: "Preview", value: "preview" },
        { label: "Fullscreen", value: "fullscreen" },
      ],
      section: "Layout",
    },
    {
      key: "defaultIndex",
      label: "Default Scene",
      type: "slider",
      min: 0,
      max: 5,
      step: 1,
      section: "Layout",
    },
    {
      key: "transitionDuration",
      label: "Transition",
      type: "slider",
      min: 100,
      max: 1600,
      step: 20,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "enableScroll",
      label: "Scroll Control",
      type: "switch",
      section: "Interaction",
    },
    {
      key: "enableHover",
      label: "Hover Control",
      type: "switch",
      section: "Interaction",
    },
  ],
  elementClassName: "h-full w-full",
  intro: "Tune how the glass scene dock advances and transitions.",
});

// ─── Liquid Reveal Button ───────────────────────────────────────────────────

function CenterStage(props: StageProps) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      {props.children as React.ReactNode}
    </div>
  );
}

export const {
  Preview: LiquidRevealButtonPlayground,
  PersonalizePanel: LiquidRevealButtonPersonalizePanel,
} = createComponentPlayground({
  slug: "liquid-reveal-button",
  component: CenterStage as unknown as React.ComponentType<StageProps>,
  componentName: "LiquidRevealButton",
  defaults: {
    mode: "preview",
    backgroundColor: "#E5FF46",
    hoverColor: "#111111",
    textColor: "#141414",
    hoverTextColor: "#FFFFFF",
    borderColor: "#141414",
    showDemoCursor: true,
  },
  fields: [
    {
      key: "mode",
      label: "Mode",
      type: "select",
      options: [
        { label: "Card", value: "card" },
        { label: "Preview", value: "preview" },
        { label: "Fullscreen", value: "fullscreen" },
      ],
      section: "Layout",
    },
    {
      key: "backgroundColor",
      label: "Base Fill",
      type: "color",
      section: "Palette",
    },
    { key: "hoverColor", label: "Hover Fill", type: "color", section: "Palette" },
    { key: "textColor", label: "Text", type: "color", section: "Palette" },
    {
      key: "hoverTextColor",
      label: "Hover Text",
      type: "color",
      section: "Palette",
    },
    {
      key: "borderColor",
      label: "Border",
      type: "color",
      section: "Palette",
    },
    {
      key: "showDemoCursor",
      label: "Demo Cursor",
      type: "switch",
      section: "Interaction",
    },
  ],
  render: (config) => (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <LiquidRevealButton
        mode={config.mode as "card" | "preview" | "fullscreen"}
        backgroundColor={String(config.backgroundColor)}
        hoverColor={String(config.hoverColor)}
        textColor={String(config.textColor)}
        hoverTextColor={String(config.hoverTextColor)}
        borderColor={String(config.borderColor)}
        showDemoCursor={Boolean(config.showDemoCursor)}
      >
        View all projects
      </LiquidRevealButton>
    </div>
  ),
  code: (config) => `import { LiquidRevealButton } from "@/components/ui/liquid-reveal-button"

<LiquidRevealButton
  mode="${config.mode}"
  backgroundColor="${config.backgroundColor}"
  hoverColor="${config.hoverColor}"
  textColor="${config.textColor}"
  hoverTextColor="${config.hoverTextColor}"
  borderColor="${config.borderColor}"
  showDemoCursor={${config.showDemoCursor}}
>
  View all projects
</LiquidRevealButton>`,
  intro: "Restyle the liquid fill, hover state, and demo cursor.",
});

// ─── Nudge Button ───────────────────────────────────────────────────────────

export const {
  Preview: NudgeButtonPlayground,
  PersonalizePanel: NudgeButtonPersonalizePanel,
} = createComponentPlayground({
  slug: "nudge-button",
  component: CenterStage as unknown as React.ComponentType<StageProps>,
  componentName: "NudgeButton",
  defaults: {
    outer: "#1F44E5",
    middle: "#E23A1D",
    inner: "#F5A301",
    reveal: "#FFFFFF",
    duration: 850,
  },
  fields: [
    { key: "outer", label: "Outer Layer", type: "color", section: "Palette" },
    { key: "middle", label: "Middle Layer", type: "color", section: "Palette" },
    { key: "inner", label: "Inner Layer", type: "color", section: "Palette" },
    { key: "reveal", label: "Reveal", type: "color", section: "Palette" },
    {
      key: "duration",
      label: "Interaction Length",
      type: "slider",
      min: 200,
      max: 2000,
      step: 10,
      unit: "ms",
      section: "Motion",
    },
  ],
  render: (config) => (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <NudgeButton
        colors={{
          outer: String(config.outer),
          middle: String(config.middle),
          inner: String(config.inner),
          reveal: String(config.reveal),
        }}
        duration={Number(config.duration)}
      >
        BUY NUDGE
      </NudgeButton>
    </div>
  ),
  code: (config) => `import { NudgeButton } from "@/components/ui/nudge-button"

<NudgeButton
  colors={{
    outer: "${config.outer}",
    middle: "${config.middle}",
    inner: "${config.inner}",
    reveal: "${config.reveal}",
  }}
  duration={${config.duration}}
>
  BUY NUDGE
</NudgeButton>`,
  intro: "Recolor the stacked layers and adjust the interaction timing.",
});

// ─── Animated Pill Button ───────────────────────────────────────────────────

export const {
  Preview: AnimatedPillButtonPlayground,
  PersonalizePanel: AnimatedPillButtonPersonalizePanel,
} = createComponentPlayground({
  slug: "animated-pill-button",
  component: CenterStage as unknown as React.ComponentType<StageProps>,
  componentName: "AnimatedPillButton",
  defaults: {
    size: "md",
    backgroundColor: "#ffffff",
    activeColor: "#111111",
    textColor: "#111111",
    activeTextColor: "#ffffff",
  },
  fields: [
    {
      key: "size",
      label: "Size",
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
      section: "Layout",
    },
    {
      key: "backgroundColor",
      label: "Fill",
      type: "color",
      section: "Palette",
    },
    { key: "activeColor", label: "Active Fill", type: "color", section: "Palette" },
    { key: "textColor", label: "Text", type: "color", section: "Palette" },
    {
      key: "activeTextColor",
      label: "Active Text",
      type: "color",
      section: "Palette",
    },
  ],
  render: (config) => (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <AnimatedPillButton
        size={config.size as "sm" | "md" | "lg"}
        backgroundColor={String(config.backgroundColor)}
        activeColor={String(config.activeColor)}
        textColor={String(config.textColor)}
        activeTextColor={String(config.activeTextColor)}
      >
        Reserve Now
      </AnimatedPillButton>
    </div>
  ),
  code: (config) => `import { AnimatedPillButton } from "@/components/ui/animated-pill-button"

<AnimatedPillButton
  size="${config.size}"
  backgroundColor="${config.backgroundColor}"
  activeColor="${config.activeColor}"
  textColor="${config.textColor}"
  activeTextColor="${config.activeTextColor}"
>
  Reserve Now
</AnimatedPillButton>`,
  intro: "Set the pill's scale and its resting and active palette.",
});

// ─── Team Slide Reveal ──────────────────────────────────────────────────────

export const {
  Preview: TeamSlideRevealPlayground,
  PersonalizePanel: TeamSlideRevealPersonalizePanel,
} = createComponentPlayground({
  slug: "team-slide-reveal",
  component: TeamSlideReveal as unknown as React.ComponentType<StageProps>,
  componentName: "TeamSlideReveal",
  defaults: {
    name: "Takahashi Aya",
    role: "CEO, Pentaclay",
    testimonial:
      "The strongest work starts with curiosity. We listen closely, make room for ideas to evolve, and build things that feel unmistakably human.",
    radius: 14,
    duration: 480,
    compact: false,
  },
  fields: [
    { key: "name", label: "Name", type: "text", section: "Content" },
    { key: "role", label: "Role", type: "text", section: "Content" },
    {
      key: "testimonial",
      label: "Testimonial",
      type: "textarea",
      section: "Content",
    },
    {
      key: "radius",
      label: "Corner Radius",
      type: "slider",
      min: 0,
      max: 40,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "duration",
      label: "Reveal Duration",
      type: "slider",
      min: 100,
      max: 1400,
      step: 10,
      unit: "ms",
      section: "Motion",
    },
    { key: "compact", label: "Compact", type: "switch", section: "Layout" },
  ],
  render: (config) => (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden bg-zinc-100 p-5 dark:bg-zinc-950 sm:p-8"
      style={{ containerType: "inline-size" }}
    >
      <div className="aspect-[.73] h-[min(82%,32rem)] max-h-full max-w-[82cqi] shadow-2xl">
        <TeamSlideReveal
          name={String(config.name)}
          role={String(config.role)}
          testimonial={String(config.testimonial)}
          radius={Number(config.radius)}
          duration={Number(config.duration)}
          compact={Boolean(config.compact)}
          className="h-full w-full"
        />
      </div>
    </div>
  ),
  code: (config) => `import { TeamSlideReveal } from "@/components/ui/team-slide-reveal"

<div className="aspect-[.73] h-[32rem] max-w-full shadow-2xl">
  <TeamSlideReveal
    name="${config.name}"
    role="${config.role}"
    testimonial="${config.testimonial}"
    radius={${config.radius}}
    duration={${config.duration}}
    compact={${config.compact}}
    className="h-full w-full"
  />
</div>`,
  intro: "Edit the profile copy, corner radius, and reveal timing.",
});

// ─── Liquid Chrome Button ───────────────────────────────────────────────────

function LiquidChromeStage(props: StageProps) {
  return (
    <section className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-slate-100 p-8 dark:bg-[#090d13]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(95,140,172,.26),transparent_34%),linear-gradient(145deg,#f9fcff,#dce7ed_66%)] dark:bg-[radial-gradient(circle_at_50%_46%,rgba(108,157,196,.2),transparent_34%),linear-gradient(145deg,#0d1520,#07090d_66%)]" />
      <LiquidChromeButton ariaLabel="Open portfolio" {...props} />
    </section>
  );
}

export const {
  Preview: LiquidChromeButtonPlayground,
  PersonalizePanel: LiquidChromeButtonPersonalizePanel,
} = createComponentPlayground({
  slug: "liquid-chrome-button",
  component: LiquidChromeStage as unknown as React.ComponentType<StageProps>,
  componentName: "LiquidChromeButton",
  defaults: {
    size: 176,
    borderWidth: 15,
    speed: 1,
    glassOpacity: 0.44,
    icon: "cursor",
    decorative: false,
  },
  fields: [
    {
      key: "size",
      label: "Diameter",
      type: "slider",
      min: 40,
      max: 300,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "borderWidth",
      label: "Ring Width",
      type: "slider",
      min: 2,
      max: 40,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "speed",
      label: "Chrome Speed",
      type: "slider",
      min: 0,
      max: 4,
      step: 0.05,
      section: "Motion",
    },
    {
      key: "glassOpacity",
      label: "Glass Opacity",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Finish",
    },
    {
      key: "icon",
      label: "Icon",
      type: "select",
      options: [
        { label: "Cursor", value: "cursor" },
        { label: "Folder", value: "folder" },
        { label: "Lightning", value: "lightning" },
      ],
      section: "Content",
    },
    {
      key: "decorative",
      label: "Decorative",
      type: "switch",
      section: "Interaction",
    },
  ],
  stageClassName: "min-h-[560px]",
  codeExtras: '  ariaLabel="Open portfolio"',
  intro: "Shape the chrome lens, ring, and glass finish.",
});

// ─── Radial Fan Deck ────────────────────────────────────────────────────────

function RadialFanStage(props: StageProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);
  const updateProgress = React.useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const range = container.scrollHeight - container.clientHeight;
    setProgress(range > 0 ? container.scrollTop / range : 0);
  }, []);

  React.useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  return (
    <div
      ref={scrollRef}
      onScroll={updateProgress}
      className="h-full min-h-[660px] overflow-y-auto overscroll-contain"
      aria-label="Scroll to open the radial fan deck"
    >
      <div className="relative min-h-[1120px]">
        <RadialFanDeck
          scrollProgress={progress}
          className="sticky top-0 h-[660px] min-h-0"
          ariaLabel="Radial fan deck demonstration"
          {...props}
        />
      </div>
    </div>
  );
}

export const {
  Preview: RadialFanDeckPlayground,
  PersonalizePanel: RadialFanDeckPersonalizePanel,
} = createComponentPlayground({
  slug: "radial-fan-deck",
  component: RadialFanStage as unknown as React.ComponentType<StageProps>,
  componentName: "RadialFanDeck",
  defaults: {
    cardWidth: 360,
    cardAspectRatio: 0.585,
    startAngle: -24,
    fanAngle: 332,
  },
  fields: [
    {
      key: "cardWidth",
      label: "Card Width",
      type: "slider",
      min: 140,
      max: 560,
      step: 4,
      unit: "px",
      section: "Layout",
    },
    {
      key: "cardAspectRatio",
      label: "Card Aspect",
      type: "slider",
      min: 0.3,
      max: 1.2,
      step: 0.01,
      section: "Layout",
    },
    {
      key: "startAngle",
      label: "Start Angle",
      type: "slider",
      min: -180,
      max: 180,
      step: 1,
      unit: "°",
      section: "Fan",
    },
    {
      key: "fanAngle",
      label: "Fan Sweep",
      type: "slider",
      min: 90,
      max: 360,
      step: 1,
      unit: "°",
      section: "Fan",
    },
  ],
  stageClassName: "min-h-[660px]",
  intro: "Scroll the stage, then tune the card fan geometry.",
});

// ─── Animated Metric ────────────────────────────────────────────────────────

export const {
  Preview: AnimatedMetricPlayground,
  PersonalizePanel: AnimatedMetricPersonalizePanel,
} = createComponentPlayground({
  slug: "animated-metric",
  component: AnimatedMetric as unknown as React.ComponentType<StageProps>,
  componentName: "AnimatedMetric",
  defaults: {
    value: 50,
    suffix: "k+",
    prefix: "",
    label: "",
    duration: 1500,
    decimals: 0,
    once: true,
    loop: true,
    loopDelay: 1500,
    threshold: 0.25,
  },
  fields: [
    {
      key: "value",
      label: "Value",
      type: "slider",
      min: 0,
      max: 100000,
      step: 1,
      section: "Content",
    },
    { key: "prefix", label: "Prefix", type: "text", section: "Content" },
    { key: "suffix", label: "Suffix", type: "text", section: "Content" },
    { key: "label", label: "Label", type: "text", section: "Content" },
    {
      key: "duration",
      label: "Count Duration",
      type: "slider",
      min: 200,
      max: 6000,
      step: 50,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "decimals",
      label: "Decimals",
      type: "slider",
      min: 0,
      max: 4,
      step: 1,
      section: "Content",
    },
    {
      key: "loopDelay",
      label: "Loop Delay",
      type: "slider",
      min: 0,
      max: 6000,
      step: 50,
      unit: "ms",
      section: "Motion",
    },
    { key: "loop", label: "Loop", type: "switch", section: "Motion" },
    { key: "once", label: "Animate Once", type: "switch", section: "Motion" },
    {
      key: "threshold",
      label: "Trigger Threshold",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
  ],
  render: (config) => (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
      style={{ containerType: "inline-size" }}
    >
      <AnimatedMetric
        value={Number(config.value)}
        prefix={String(config.prefix)}
        suffix={String(config.suffix)}
        label={String(config.label)}
        duration={Number(config.duration)}
        decimals={Number(config.decimals)}
        once={Boolean(config.once)}
        loop={Boolean(config.loop)}
        loopDelay={Number(config.loopDelay)}
        threshold={Number(config.threshold)}
      />
    </div>
  ),
  code: (config) => `import { AnimatedMetric } from "@/components/ui/animated-metric"

<AnimatedMetric
  value={${config.value}}
  prefix="${config.prefix}"
  suffix="${config.suffix}"
  label="${config.label}"
  duration={${config.duration}}
  decimals={${config.decimals}}
  loop={${config.loop}}
  loopDelay={${config.loopDelay}}
/>`,
  intro: "Set the number, copy, and counting motion.",
});
