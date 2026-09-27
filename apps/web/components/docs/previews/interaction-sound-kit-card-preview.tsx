"use client";

import { useEffect, useRef } from "react";
import { InteractionSoundKit } from "@workspace/ui/components/interaction-sound-kit";

/**
 * Self-demonstrating gallery card. Cycles the action buttons on a timer
 * while the card is visible and untouched, so the highlight states play
 * on their own. Audio stays user-initiated: before any real gesture the
 * AudioContext is suspended, so the demo is purely visual. The first
 * trusted pointer interaction hands control to the visitor permanently.
 */
export function InteractionSoundKitCardPreview() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = true;
    let touched = false;
    let step = 0;
    const id = window.setInterval(() => {
      if (!visible || touched) return;
      const actions = host.querySelectorAll<HTMLButtonElement>(
        'button[aria-label]:not([aria-pressed])',
      );
      // First labeled button is the mute toggle (has aria-pressed);
      // action buttons carry aria-label without aria-pressed.
      const target = actions[step % Math.max(1, actions.length)];
      step += 1;
      target?.click();
    }, 1600);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    io.observe(host);

    const onRealInput = (e: Event) => {
      if (e instanceof PointerEvent && !e.isTrusted) return;
      if (e instanceof KeyboardEvent && !e.isTrusted) return;
      touched = true;
    };
    // Any real interaction anywhere on the page unlocks audio globally
    // (sticky activation) — stop the demo first so it can never sound.
    const onRealPageInput = (e: Event) => {
      if (e instanceof PointerEvent && !e.isTrusted) return;
      if (e instanceof KeyboardEvent && !e.isTrusted) return;
      touched = true;
    };
    host.addEventListener("pointerdown", onRealInput);
    host.addEventListener("keydown", onRealInput);
    window.addEventListener("pointerdown", onRealPageInput, true);
    window.addEventListener("keydown", onRealPageInput, true);

    return () => {
      window.clearInterval(id);
      io.disconnect();
      host.removeEventListener("pointerdown", onRealInput);
      host.removeEventListener("keydown", onRealInput);
      window.removeEventListener("pointerdown", onRealPageInput, true);
      window.removeEventListener("keydown", onRealPageInput, true);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 grid place-items-center overflow-hidden bg-[#e7ece4] p-5 dark:bg-[#0c100d]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(104,151,109,.16),transparent_56%)]" />
      <InteractionSoundKit compact defaultMuted className="relative max-w-[17rem]" />
    </div>
  );
}
