"use client";

import { AsciiImage } from "@workspace/ui/components/ascii-image";
import type { ReactNode } from "react";

const imageSrc = "/images/players/ronaldo-ascii.png";

function PreviewFrame({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="relative size-full min-h-[420px] overflow-hidden bg-[#151619]">
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-4 pt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
        <span>{label}</span>
        <span>Render / Live</span>
      </div>
    </div>
  );
}

export function AsciiImagePreview() {
  return (
    <PreviewFrame label="Ronaldo · ASCII">
      <AsciiImage
        src={imageSrc}
        alt="Cristiano Ronaldo rendered as ASCII typography"
        preset="classic"
        resolution="medium"
        backgroundMode="edge"
        backgroundThreshold={0.1}
        fit="cover"
        foreground="#f1f1f1"
        background="#151619"
      />
    </PreviewFrame>
  );
}

export function AsciiIsolatedPreview() {
  return (
    <PreviewFrame label="Isolated">
      <AsciiImage
        src={imageSrc}
        alt="Cristiano Ronaldo with dark background suppressed"
        preset="detailed"
        resolution="high"
        backgroundMode="edge"
        backgroundThreshold={0.1}
        fit="cover"
        background="transparent"
        foreground="#f1f1f1"
      />
    </PreviewFrame>
  );
}

export function AsciiTerminalPreview() {
  return (
    <PreviewFrame label="Terminal">
      <AsciiImage
        src={imageSrc}
        alt="Ronaldo in classic terminal ASCII"
        preset="classic"
        resolution="medium"
        backgroundMode="edge"
        backgroundThreshold={0.1}
        fit="cover"
        foreground="#f1f1f1"
        background="#151619"
      />
    </PreviewFrame>
  );
}

export function AsciiColorPreview() {
  return (
    <PreviewFrame label="Source color">
      <AsciiImage
        src={imageSrc}
        alt="Ronaldo ASCII rendering using source image colors"
        preset="detailed"
        colorMode="source"
        background="#151619"
      />
    </PreviewFrame>
  );
}

export function AsciiScramblePreview() {
  return (
    <PreviewFrame label="Scramble">
      <AsciiImage
        src={imageSrc}
        alt="Ronaldo ASCII portrait resolving from scrambled characters"
        preset="detailed"
        effect="scramble"
        foreground="#f1f1f1"
        background="#151619"
      />
    </PreviewFrame>
  );
}

export function AsciiCatalogPreview() {
  return (
    <AsciiImage
      src={imageSrc}
      alt="ASCII artwork"
      preset="detailed"
      resolution="high"
      foreground="#f1f1f1"
      background="#151619"
    />
  );
}
