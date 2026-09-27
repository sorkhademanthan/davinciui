"use client";

import { useEffect, useRef, useState } from "react";
import { KeyboardCommandSounds } from "@workspace/ui/components/keyboard-command-sounds";

const DEMO_KEYS = ["d", "a", "v", "i", "Enter"];

/**
 * Self-demonstrating gallery card. Enables the kit once, then types a
 * looping "davi + Enter" sequence with synthetic keydown events while the
 * card is visible and untouched — the status line and key visuals play on
 * their own. Audio stays user-initiated: before any real gesture the
 * AudioContext is suspended, so the demo is purely visual. The first
 * trusted pointer or key interaction hands control to the visitor.
 */
export function KeyboardCommandSoundsCardPreview() {
  const hostRef = useRef<HTMLDivElement>(null);
  // Demo runs at zero volume — visuals only. First real interaction
  // restores live volume for genuine use.
  const [live, setLive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = true;
    let touched = false;
    let enabled = false;
    let autoEnabled = false;

    const isOn = () =>
      host
        .querySelector<HTMLButtonElement>("button")
        ?.textContent?.trim()
        .toLowerCase() !== "off";
    let step = 0;

    const enable = () => {
      if (enabled) return;
      // First button is the Off/On toggle.
      const toggle = host.querySelector<HTMLButtonElement>("button");
      if (!toggle) return;
      if (isOn()) {
        enabled = true;
        return;
      }
      toggle.click();
      enabled = true;
      autoEnabled = true;
    };

    const id = window.setInterval(() => {
      if (!visible || touched) return;
      enable();
      if (!enabled) return;
      const key = DEMO_KEYS[step % DEMO_KEYS.length];
      step += 1;
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true }),
      );
    }, 1100);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    io.observe(host);

    // Hand the kit back silent: undo our auto-enable unless the visitor
    // is directly operating the toggle themselves.
    const revertAutoEnable = (e: Event) => {
      const onToggle =
        e.target instanceof HTMLElement &&
        e.target.closest("button") === host.querySelector("button");
      if (autoEnabled && !onToggle) {
        const toggle = host.querySelector<HTMLButtonElement>("button");
        if (toggle && isOn()) toggle.click();
        autoEnabled = false;
        enabled = false;
      }
    };

    const onRealInput = (e: Event) => {
      if (e instanceof PointerEvent && !e.isTrusted) return;
      if (e instanceof KeyboardEvent && !e.isTrusted) return;
      touched = true;
      setLive(true);
      revertAutoEnable(e);
    };
    // Any real interaction anywhere on the page unlocks audio globally
    // (sticky activation) — stop the demo first so it can never sound.
    const onRealPageInput = (e: Event) => {
      if (e instanceof PointerEvent && !e.isTrusted) return;
      if (e instanceof KeyboardEvent && !e.isTrusted) return;
      touched = true;
      setLive(true);
      revertAutoEnable(e);
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
      className="absolute inset-0 grid place-items-center overflow-hidden bg-[#eaf1f4] p-5 dark:bg-[#091116]"
    >
      <KeyboardCommandSounds
        compact
        volume={live ? 0.16 : 0}
        className="relative max-w-[17rem]"
      />
    </div>
  );
}
