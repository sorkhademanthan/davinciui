"use client";

import { use, useEffect } from "react";

import { CharacterField } from "@workspace/ui/components/character-field";
import { InkFlow } from "@workspace/ui/components/ink-flow";
import { NeonMeshBG } from "@workspace/ui/components/neon-mesh-bg";
import { Noiser } from "@workspace/ui/components/noiser";
import { SilkAurora } from "@workspace/ui/components/silk-aurora";
import { SoftFluidGradient } from "@workspace/ui/components/soft-fluid-gradient";
import { SpectraNoise } from "@workspace/ui/components/spectra-noise";

const SLUGS = [
  "neon-mesh-bg",
  "silk-aurora",
  "soft-fluid-gradient",
  "ink-flow",
  "character-field",
  "spectra-noise",
  "noiser",
] as const;

function Preview({ slug }: { slug: string }) {
  switch (slug) {
    case "neon-mesh-bg":
      return <NeonMeshBG maxDpr={1} />;
    case "silk-aurora":
      return (
        <SilkAurora
          baseColor="#060505"
          midColor="#19130f"
          sheenColor="#ffe2a9"
          accentColor="#c58d5d"
          intensity={0.9}
          speed={0.75}
          className="h-full w-full min-h-0"
        />
      );
    case "soft-fluid-gradient":
      return <SoftFluidGradient speed={0.26} density={1} maxDpr={1} />;
    case "ink-flow":
      return <InkFlow maxDpr={1} />;
    case "character-field":
      return (
        <CharacterField
          className="h-full w-full"
          characterSet="mixed"
          fontSize={12}
          characterSpacing={1}
          lineHeight={1.4}
          maxDpr={1}
        />
      );
    case "spectra-noise":
      return <SpectraNoise maxDpr={1} resolutionScale={0.75} />;
    case "noiser":
      return (
        <Noiser
          className="h-full w-full"
          colorMode="duo"
          colorA="#f5efff"
          colorB="#a38bff"
          frequency={0.32}
          noiseOpacity={0.78}
          colorOpacity={0.78}
          animated
          fps={12}
        />
      );
    default:
      return null;
  }
}

export default function CaptureComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.documentElement.style.cursor = "none";
  }, []);

  if (!SLUGS.includes(slug as (typeof SLUGS)[number])) return null;

  return (
    <main
      data-preview-slug={slug}
      className="fixed inset-0 h-screen w-screen overflow-hidden"
      style={{ background: "#000" }}
    >
      <Preview slug={slug} />
    </main>
  );
}
