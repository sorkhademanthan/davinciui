"use client";

import { useEffect, useRef } from "react";
import { HoverTransition } from "@workspace/ui/components/hover-transition";

const PORTRAIT = "url('/images/hover-transition-team.jpg')";

/**
 * Live miniature Hover Transition for the gallery card.
 * Mirrors the right-side docs preview: a team portrait card (photo,
 * name, role) whose hover state reveals the bio on a lime panel.
 * Gently pulses the hover state while visible — no hover required.
 * Real user hover takes over for a beat.
 */
export function HoverTransitionCardPreview() {
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
      // Open ~2.8s, closed ~1.6s — each side outlasts the 1.15s wipe
      // so the slow glide fully settles before reversing.
      timeout = window.setTimeout(
        () => {
          if (!visible || userHovering) return;
          open = !open;
          fire(open ? "mouseover" : "mouseout");
          schedule();
        },
        open ? 2800 : 1600,
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
    <div ref={hostRef} className="absolute inset-0 overflow-hidden bg-[#f8f8f5]">
      <HoverTransition
        effect="morph"
        direction="center"
        duration={1.15}
        tabIndex={-1}
        label="Tom Mathews, CEO"
        defaultComponent={
          <article className="relative h-full w-full overflow-hidden bg-[#f8f8f5] bg-[length:400%_200%] bg-no-repeat">
            <span
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundImage: PORTRAIT,
                backgroundPosition: "0% 0%",
                backgroundSize: "400% 200%",
                backgroundRepeat: "no-repeat",
              }}
            />
            <span className="absolute right-2 top-2 font-mono text-[7px] uppercase tracking-[0.08em] text-black/55">
              morph
            </span>
            <span className="absolute inset-x-0 bottom-0 block px-3 pb-3 text-[#151515]">
              <span className="block text-[17px] font-medium leading-none tracking-[-0.045em]">
                Tom Mathews
              </span>
              <span className="mt-1 block text-[8px] uppercase leading-none text-black/65">
                CEO
              </span>
            </span>
          </article>
        }
        hoverComponent={
          <article className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#dfff5f] p-3 text-[#111]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[length:400%_200%] bg-no-repeat opacity-[0.13] grayscale [mix-blend-mode:multiply] [mask-image:linear-gradient(to_bottom,transparent_8%,black_65%)]"
              style={{
                backgroundImage: PORTRAIT,
                backgroundPosition: "0% 0%",
              }}
            />
            <span className="relative flex justify-end font-mono text-[7px] uppercase tracking-[0.1em] text-black/55">
              <span>morph</span>
            </span>
            <span className="relative block">
              <span className="block max-w-[26ch] text-[12px] font-medium leading-[1.2] tracking-[-0.04em]">
                Leading the agency&apos;s mission to blend creativity with
                cutting-edge AI automation.
              </span>
              <span className="mt-2 block border-t border-black/25 pt-2">
                <span className="block text-[12px] font-semibold leading-none tracking-[-0.035em]">
                  Tom Mathews
                </span>
                <span className="mt-1 block text-[7px] uppercase tracking-[0.08em] text-black/55">
                  CEO
                </span>
              </span>
            </span>
          </article>
        }
        className="h-full w-full"
      />
    </div>
  );
}
