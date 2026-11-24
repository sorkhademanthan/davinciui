"use client";

import { useEffect, useRef } from "react";
import { MediaTextHover } from "@workspace/ui/components/media-text-hover";

/**
 * Self-playing card thumbnail for Media Text Hover.
 * Card-scale 2:1 media window (42×21), height matched to the exact
 * cap-height of the 30px headline — the same proportions the right-side
 * docs preview and fullscreen mode share (128×64).
 * Pulses the split headline open and closed (same spring reveal as a
 * manual hover) while the card is visible — no hover required. Real
 * user hover takes over for a beat.
 *
 * React's onMouseEnter/Leave are derived from native mouseover/mouseout,
 * so the pulse dispatches those bubbling events on the component root.
 */
export function MediaTextHoverCardPreview() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timeout = 0;
    let visible = true;
    let userHovering = false;
    let open = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry?.isIntersecting ?? true;
        if (next === visible) return;
        visible = next;
        if (visible) schedule();
        else window.clearTimeout(timeout);
      },
      { threshold: 0.05 },
    );
    observer.observe(host);

    const onEnter = (e: Event) => {
      if (e instanceof MouseEvent && !e.isTrusted) return;
      userHovering = true;
      window.clearTimeout(timeout);
    };
    const onLeave = (e: Event) => {
      if (e instanceof MouseEvent && !e.isTrusted) return;
      userHovering = false;
      schedule();
    };
    host.addEventListener("mouseenter", onEnter);
    host.addEventListener("mouseleave", onLeave);

    const fire = (type: "mouseover" | "mouseout") => {
      const target =
        (host.firstElementChild as HTMLElement | null) ?? host;
      const rect = target.getBoundingClientRect();
      target.dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        }),
      );
    };

    const schedule = () => {
      window.clearTimeout(timeout);
      if (!visible || userHovering) return;
      // Open ~2.2s, closed ~1.1s — enough to read the spring either way.
      timeout = window.setTimeout(
        () => {
          if (!visible || userHovering) return;
          open = !open;
          fire(open ? "mouseover" : "mouseout");
          schedule();
        },
        open ? 2200 : 1100,
      );
    };
    schedule();

    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
      host.removeEventListener("mouseenter", onEnter);
      host.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="text-foreground absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <MediaTextHover
        text="DAVINCIUI"
        splitIndex={5}
        mediaSrc="/preview-videos/component-animations/spiral3dslider.mp4"
        mediaWidth={42}
        mediaHeight={21}
        fontFamily="Anton, 'Anton SC', Arial Narrow, sans-serif"
        fontSize={32}
        letterSpacing="-0.02em"
        textColor="currentColor"
        backgroundColor="transparent"
        tabIndex={-1}
      />
    </div>
  );
}
