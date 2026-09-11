"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export interface EncryptedTextProps {
  /** The readable value revealed at the end of each cycle. */
  text: string;
  /** Characters used while the value is encrypted. */
  characters?: string;
  /** Time spent fully encrypted before decryption starts, in milliseconds. */
  scrambleDuration?: number;
  /** Duration of the left-to-right decryption, in milliseconds. */
  revealDuration?: number;
  /** Time the readable value remains visible, in milliseconds. */
  holdDuration?: number;
  /** Repeat the encryption and decryption sequence. */
  loop?: boolean;
  /** Color of unresolved cipher characters. */
  encryptedColor?: string;
  /** Color of resolved characters. */
  revealedColor?: string;
  /** Font size. Numbers become px; strings pass through. */
  fontSize?: number | string;
  /** Font weight applied to every character. */
  fontWeight?: number;
  /** Letter spacing. Numbers become px; strings pass through. */
  letterSpacing?: number | string;
  /** Font family applied to every character. */
  fontFamily?: string;
  /** Extra classes for the outer element. */
  className?: string;
}

export const ENCRYPTED_TEXT_DEFAULTS = {
  characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*",
  scrambleDuration: 520,
  revealDuration: 1100,
  holdDuration: 1500,
  loop: true,
  encryptedColor: "#5f845c",
  revealedColor: "currentColor",
  fontSize: 80,
  fontWeight: 700,
  letterSpacing: "0.08em",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;

const FRAME_INTERVAL = 42;

function randomCharacter(characters: string) {
  return characters[Math.floor(Math.random() * characters.length)] ?? "0";
}

function scrambleText(text: string, characters: string, resolvedCount: number) {
  return Array.from(text, (character, index) => {
    if (/\s/.test(character) || index < resolvedCount) return character;
    return randomCharacter(characters);
  }).join("");
}

export function EncryptedText({
  text,
  characters = ENCRYPTED_TEXT_DEFAULTS.characters,
  scrambleDuration = ENCRYPTED_TEXT_DEFAULTS.scrambleDuration,
  revealDuration = ENCRYPTED_TEXT_DEFAULTS.revealDuration,
  holdDuration = ENCRYPTED_TEXT_DEFAULTS.holdDuration,
  loop = ENCRYPTED_TEXT_DEFAULTS.loop,
  encryptedColor = ENCRYPTED_TEXT_DEFAULTS.encryptedColor,
  revealedColor = ENCRYPTED_TEXT_DEFAULTS.revealedColor,
  fontSize = ENCRYPTED_TEXT_DEFAULTS.fontSize,
  fontWeight = ENCRYPTED_TEXT_DEFAULTS.fontWeight,
  letterSpacing = ENCRYPTED_TEXT_DEFAULTS.letterSpacing,
  fontFamily = ENCRYPTED_TEXT_DEFAULTS.fontFamily,
  className,
}: EncryptedTextProps) {
  const [frame, setFrame] = React.useState(() => ({
    value: text,
    resolvedCount: text.length,
  }));

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cipher =
      characters.length > 0 ? characters : ENCRYPTED_TEXT_DEFAULTS.characters;
    const scrambleTime = Math.max(0, scrambleDuration);
    const revealTime = Math.max(1, revealDuration);
    const holdTime = Math.max(0, holdDuration);
    const cycleDuration = scrambleTime + revealTime + holdTime;
    let animationFrame = 0;
    let cycleStartedAt = performance.now();
    let lastRenderedAt = 0;
    let completed = false;
    let showingResolvedText = false;

    const showResolvedText = () => {
      if (showingResolvedText) return;
      showingResolvedText = true;
      setFrame({ value: text, resolvedCount: text.length });
    };

    const animate = (now: number) => {
      if (motionQuery.matches || completed || text.length === 0) {
        showResolvedText();
        return;
      }

      let elapsed = now - cycleStartedAt;
      if (elapsed >= cycleDuration) {
        if (!loop) {
          completed = true;
          showResolvedText();
          return;
        }
        cycleStartedAt = now;
        elapsed = 0;
      }

      if (now - lastRenderedAt >= FRAME_INTERVAL) {
        lastRenderedAt = now;

        if (elapsed < scrambleTime) {
          showingResolvedText = false;
          setFrame({ value: scrambleText(text, cipher, 0), resolvedCount: 0 });
        } else if (elapsed < scrambleTime + revealTime) {
          const progress = (elapsed - scrambleTime) / revealTime;
          const resolvedCount = Math.min(
            text.length,
            Math.floor(progress * (text.length + 1)),
          );
          if (resolvedCount === text.length) {
            showResolvedText();
          } else {
            showingResolvedText = false;
            setFrame({
              value: scrambleText(text, cipher, resolvedCount),
              resolvedCount,
            });
          }
        } else {
          showResolvedText();
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleMotionChange = () => {
      if (motionQuery.matches) {
        window.cancelAnimationFrame(animationFrame);
        showResolvedText();
        return;
      }
      completed = false;
      cycleStartedAt = performance.now();
      animationFrame = window.requestAnimationFrame(animate);
    };

    motionQuery.addEventListener("change", handleMotionChange);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [characters, holdDuration, loop, revealDuration, scrambleDuration, text]);

  const resolvedFontSize =
    typeof fontSize === "number" ? `${fontSize}px` : fontSize;
  const resolvedLetterSpacing =
    typeof letterSpacing === "number" ? `${letterSpacing}px` : letterSpacing;

  return (
    <span
      aria-label={text}
      className={cn("inline-flex whitespace-pre", className)}
      style={{
        fontFamily,
        fontSize: resolvedFontSize,
        fontWeight,
        letterSpacing: resolvedLetterSpacing,
        lineHeight: 1,
      }}
    >
      <span aria-hidden="true" className="inline-flex whitespace-pre">
        {Array.from(frame.value, (character, index) => (
          <span
            key={index}
            className="inline-block min-w-[0.6em] text-center"
            style={{
              color:
                index < frame.resolvedCount ? revealedColor : encryptedColor,
            }}
          >
            {character}
          </span>
        ))}
      </span>
    </span>
  );
}

export default EncryptedText;
