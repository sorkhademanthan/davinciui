"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const TextMorph = dynamic(
  () =>
    import("@workspace/ui/components/text-morph").then(
      (module) => module.TextMorph,
    ),
  { ssr: false },
);

const KineticText = dynamic(
  () =>
    import("@workspace/ui/components/gsap-text").then(
      (module) => module.KineticText,
    ),
  { ssr: false },
);

const ShakeText = dynamic(
  () =>
    import("@workspace/ui/components/shake-text").then(
      (module) => module.ShakeText,
    ),
  { ssr: false },
);

const EncryptedText = dynamic(
  () =>
    import("@workspace/ui/components/encrypted-text").then(
      (module) => module.EncryptedText,
    ),
  { ssr: false },
);

const FluidParticleText = dynamic(
  () =>
    import("@workspace/ui/components/fluid-particle-text").then(
      (module) => module.FluidParticleText,
    ),
  { ssr: false },
);

const GlitchLiquidText = dynamic(
  () =>
    import("@workspace/ui/components/glitch-liquid-text").then(
      (module) => module.GlitchLiquidText,
    ),
  { ssr: false },
);

const TextVideoMask = dynamic(
  () =>
    import("@workspace/ui/components/text-video-mask").then(
      (module) => module.TextVideoMask,
    ),
  { ssr: false },
);

const RandomTextReveal = dynamic(
  () =>
    import("@workspace/ui/components/random-text-reveal").then(
      (module) => module.RandomTextReveal,
    ),
  { ssr: false },
);

const ShaderText = dynamic(
  () =>
    import("@workspace/ui/components/shader-text").then(
      (module) => module.ShaderText,
    ),
  { ssr: false },
);

const TextReveal = dynamic(
  () =>
    import("@workspace/ui/components/text-reveal").then(
      (module) => module.TextReveal,
    ),
  { ssr: false },
);

const RollingText = dynamic(
  () =>
    import("@workspace/ui/components/rolling-text").then(
      (module) => module.RollingText,
    ),
  { ssr: false },
);

type ComponentCardLivePreviewProps = {
  slug:
    | "gsap-text"
    | "text-morph"
    | "shake-text"
    | "encrypted-text"
    | "fluid-particle-text"
    | "glitch-liquid-text"
    | "text-video-mask"
    | "random-text-reveal"
    | "shader-text"
    | "text-reveal"
    | "rolling-text";
};

export function ComponentCardLivePreview({
  slug,
}: ComponentCardLivePreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(host);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  const staticLabel =
    slug === "fluid-particle-text" ? "INK" : "DAVINCIUI";

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-background"
    >
      {!shouldRender || (reducedMotion && slug !== "shader-text") ? (
        <span className="text-3xl font-black tracking-[-0.055em] text-foreground sm:text-4xl">
          {staticLabel}
        </span>
      ) : slug === "shader-text" ? (
        <ShaderText
          text="DAVINCIUI"
          preset="aurora"
          fontSize={48}
          fontWeight={800}
          speed={1.2}
          className="max-w-full"
        />
      ) : slug === "text-reveal" ? (
        <TextReveal
          text="DAVINCIUI"
          revealStyle="diagonal"
          revealBy="characters"
          fontFamily="inherit"
          fontSize="clamp(1.7rem, 3vw, 2.3rem)"
          fontWeight={800}
          textAlign="center"
          revealedColor={isDark ? "#f4f4f5" : "#18181b"}
          unrevealedColor={isDark ? "#f4f4f5" : "#18181b"}
          className="px-4"
        />
      ) : slug === "rolling-text" ? (
        <RollingText
          text="DAVINCIUI"
          pattern="alternating"
          duplicateCount={7}
          rollDuration={1.25}
          staggerDelay={0.035}
          blurIntensity={2}
          fontFamily="inherit"
          fontSize="clamp(1.35rem, 2.7vw, 2.1rem)"
          fontWeight={800}
          letterSpacing="-0.055em"
          textColor="var(--foreground)"
          backgroundColor="transparent"
          className="px-4"
        />
      ) : slug === "text-morph" ? (
        <TextMorph
          words={["DAVINCIUI", "COMPONENTS"]}
          interval={1800}
          morphDuration={560}
          className="text-3xl font-black tracking-[-0.055em] text-foreground sm:text-4xl"
        />
      ) : slug === "shake-text" ? (
        <ShakeText text="DAVINCIUI" fontSize="clamp(2rem, 3vw, 2.65rem)" />
      ) : slug === "encrypted-text" ? (
        <EncryptedText
          text="DAVINCIUI"
          fontSize="clamp(1.7rem, 2.6vw, 2.25rem)"
          scrambleDuration={420}
          revealDuration={900}
          holdDuration={1200}
          encryptedColor={isDark ? "#8fb58b" : "#466944"}
          revealedColor={isDark ? "#f5f5f4" : "#18181b"}
        />
      ) : slug === "fluid-particle-text" ? (
        <FluidParticleText
          preset="showcase"
          text="INK"
          padding={0.16}
          color={isDark ? "#f4f4f5" : "#18181b"}
          background={isDark ? "#09090b" : "#fafafa"}
          particleSpacing={2.5}
          particleSize={1.5}
          maxParticles={14000}
          maxDpr={1}
          outline
          strokeWidth={1.5}
          className="h-full w-full"
        />
      ) : slug === "glitch-liquid-text" ? (
        <GlitchLiquidText
          text={"DAVINCIUI\nCOMPONENTS"}
          fontSize={54}
          fontWeight={800}
          lineHeight={0.95}
          backgroundColor={isDark ? "#09090b" : "#fafafa"}
          textColor={isDark ? "#f4f4f5" : "#18181b"}
          cursorEnabled={false}
          distortionStrength={0.42}
          liquidStrength={1.1}
          glitchStrength={0.3}
          grainStrength={0.012}
          className="h-full w-full"
        />
      ) : slug === "text-video-mask" ? (
        <TextVideoMask
          text="DAVINCI."
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          fontSize={120}
          backgroundColor={isDark ? "#09090b" : "#fafafa"}
          fallbackColor={isDark ? "#f4f4f5" : "#18181b"}
          className="h-full w-full"
        />
      ) : slug === "random-text-reveal" ? (
        <div className="flex h-full w-full items-center justify-center px-6">
          <RandomTextReveal
            text="DavinciUI brings expressive motion and carefully crafted components to every interface."
            fontSize="clamp(0.95rem, 1.5vw, 1.2rem)"
            fontWeight={600}
            lineHeight={1.2}
            color={isDark ? "#f4f4f5" : "#18181b"}
            textAlign="center"
            maxDelay={1}
            triggerPosition="bottom"
            loop
            loopDelay={2}
          />
        </div>
      ) : (
        <KineticText
          text="DAVINCIUI"
          htmlTag="span"
          direction="both"
          layerCount={5}
          distance={112}
          duration={4.8}
          font={{
            fontFamily: "inherit",
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.055em",
            lineHeight: 1,
          }}
        />
      )}
    </div>
  );
}
