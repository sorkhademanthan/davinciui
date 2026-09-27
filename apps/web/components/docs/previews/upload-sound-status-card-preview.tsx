"use client";

import { useEffect, useRef, useState } from "react";
import { UploadSoundStatus } from "@workspace/ui/components/upload-sound-status";

/**
 * Self-demonstrating gallery card. Runs the upload on a loop while the
 * card is visible and untouched, so progress and the completion state
 * play on their own. Audio stays user-initiated: the completion ping
 * only sounds after a real gesture has unlocked audio; before that the
 * demo is purely visual. The first trusted pointer interaction hands
 * control to the visitor permanently.
 */
export function UploadSoundStatusCardPreview() {
  const hostRef = useRef<HTMLDivElement>(null);
  // Demo runs muted — progress visuals only. First real interaction
  // restores the completion cue for genuine use.
  const [live, setLive] = useState(false);
  const touchedRef = useRef(false);
  const timerRef = useRef(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = true;
    let scheduled = false;

    const run = () => {
      if (touchedRef.current) return;
      const button = host.querySelector<HTMLButtonElement>("button");
      if (!button || button.disabled) return;
      if (/uploading/i.test(button.textContent ?? "")) return;
      button.click();
    };

    const schedule = (delay: number) => {
      window.clearTimeout(timerRef.current);
      scheduled = true;
      timerRef.current = window.setTimeout(() => {
        scheduled = false;
        if (visible && !touchedRef.current) run();
      }, delay);
    };

    // Kick off shortly after the card first becomes visible.
    const io = new IntersectionObserver(
      ([entry]) => {
        const wasHidden = !visible;
        visible = entry?.isIntersecting ?? true;
        if (visible && wasHidden && !scheduled && !touchedRef.current) {
          schedule(600);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(host);
    schedule(900);

    const markTouched = () => {
      touchedRef.current = true;
      setLive(true);
      window.clearTimeout(timerRef.current);
    };
    const onRealInput = (e: Event) => {
      if (e instanceof PointerEvent && !e.isTrusted) return;
      if (e instanceof KeyboardEvent && !e.isTrusted) return;
      markTouched();
    };
    // Any real interaction anywhere on the page unlocks audio globally
    // (sticky activation) — stop the loop first so it can never sound.
    const onRealPageInput = (e: Event) => {
      if (e instanceof PointerEvent && !e.isTrusted) return;
      if (e instanceof KeyboardEvent && !e.isTrusted) return;
      markTouched();
    };
    host.addEventListener("pointerdown", onRealInput);
    host.addEventListener("keydown", onRealInput);
    window.addEventListener("pointerdown", onRealPageInput, true);
    window.addEventListener("keydown", onRealPageInput, true);

    return () => {
      window.clearTimeout(timerRef.current);
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
      className="absolute inset-0 grid place-items-center overflow-hidden bg-[#edf1e7] p-5 dark:bg-[#0d110a]"
    >
      <UploadSoundStatus
        compact
        muted={!live}
        className="relative max-w-[17rem]"
        onComplete={() => {
          // Loop the demo while the visitor hasn't taken over.
          if (touchedRef.current) return;
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            const host = hostRef.current;
            const button = host?.querySelector<HTMLButtonElement>("button");
            button?.click();
          }, 2200);
        }}
      />
    </div>
  );
}
