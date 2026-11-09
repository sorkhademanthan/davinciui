"use client";

import * as React from "react";
import { TextReveal } from "@workspace/ui/components/text-reveal";
import {
  TextRevealScrollStage,
  PREVIEW_SCROLL_REGION,
  TEXT_REVEAL_PREVIEW_TRIGGER,
} from "@/components/docs/previews/text-reveal-scroll-stage";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

const sampleText =
  "DavinciUI brings a growing library of thoughtfully crafted components and flexible patterns together, helping teams build polished, consistent interfaces faster. Explore, customize every detail, and bring motion-rich experiences to life—from the first prototype through the final product.";

function TextRevealStage(props: StageProps) {
  const {
    revealStyle = "linear",
    revealBy = "words",
    text = sampleText,
    fontSize = 28,
    lineHeight = 1.45,
    ...style
  } = props;

  return (
    <TextRevealScrollStage>
      <TextReveal
        text={text as string}
        revealStyle={revealStyle as "linear"}
        revealBy={revealBy as "words"}
        fontSize={fontSize as number}
        lineHeight={lineHeight as number}
        startPosition="top top"
        endPosition="bottom bottom"
        scroller={PREVIEW_SCROLL_REGION}
        trigger={TEXT_REVEAL_PREVIEW_TRIGGER}
        revealedColor="var(--foreground)"
        unrevealedColor="var(--foreground)"
        className="mx-auto max-w-2xl"
        {...style}
      />
    </TextRevealScrollStage>
  );
}

export const {
  Preview: TextRevealPlayground,
  PersonalizePanel: TextRevealPersonalizePanel,
} = createComponentPlayground({
  slug: "text-reveal",
  component: TextRevealStage as unknown as React.ComponentType<StageProps>,
  componentName: "TextReveal",
  defaults: {
    text: sampleText,
    revealStyle: "linear",
    revealBy: "words",
    fromOpacity: 0.15,
    toOpacity: 1,
    revealSoftness: 0.24,
    fontSize: 28,
    lineHeight: 1.45,
    scrub: true,
    scrubSmoothness: 0.3,
  },
  fields: [
    { key: "text", label: "Text", type: "textarea", section: "Content" },
    {
      key: "revealStyle",
      label: "Reveal Style",
      type: "select",
      section: "Reveal",
      options: [
        { label: "Linear", value: "linear" },
        { label: "Diagonal", value: "diagonal" },
        { label: "Random", value: "random" },
        { label: "Center Out", value: "center-out" },
        { label: "Edges In", value: "edges-in" },
      ],
    },
    {
      key: "revealBy",
      label: "Reveal By",
      type: "select",
      section: "Reveal",
      options: [
        { label: "Words", value: "words" },
        { label: "Characters", value: "characters" },
      ],
    },
    {
      key: "fromOpacity",
      label: "From Opacity",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Reveal",
    },
    {
      key: "toOpacity",
      label: "To Opacity",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Reveal",
    },
    {
      key: "revealSoftness",
      label: "Softness",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Reveal",
    },
    {
      key: "fontSize",
      label: "Font Size",
      type: "slider",
      min: 12,
      max: 72,
      step: 1,
      unit: "px",
      section: "Typography",
    },
    {
      key: "lineHeight",
      label: "Line Height",
      type: "slider",
      min: 1,
      max: 2.4,
      step: 0.05,
      section: "Typography",
    },
    { key: "scrub", label: "Scrub On Scroll", type: "switch", section: "Scroll" },
    {
      key: "scrubSmoothness",
      label: "Scrub Smoothness",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Scroll",
    },
  ],
  codeImportExtra:
    'import { TextRevealScrollStage, PREVIEW_SCROLL_REGION, TEXT_REVEAL_PREVIEW_TRIGGER } from "@/components/docs/previews/text-reveal-scroll-stage"',
  codeExtras: `  startPosition="top top"
  endPosition="bottom bottom"
  scroller={PREVIEW_SCROLL_REGION}
  trigger={TEXT_REVEAL_PREVIEW_TRIGGER}
  revealedColor="var(--foreground)"
  unrevealedColor="var(--foreground)"`,
  stageClassName: "min-h-[420px]",
  intro: "Rewrite the copy and tune the reveal order, softness, and scrub.",
});
