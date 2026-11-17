"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight, Check, Copy, RotateCcw, Repeat2, SunMoon, MousePointerClick, Timer, LayoutGrid } from "lucide-react";
import { useTheme } from "next-themes";
import posthog from "posthog-js";
import { cinematicDemoCards } from "@/components/docs/previews/cinematic-card-carousel-items";
import { LandingContent } from "@/components/landing/landing-frame";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import styles from "./component-workbench.module.css";

const installCommands = {
  npm: "npx shadcn@latest add @davinciui/cinematic-card-carousel",
  pnpm: "pnpm dlx shadcn@latest add @davinciui/cinematic-card-carousel",
  yarn: "yarn dlx shadcn@latest add @davinciui/cinematic-card-carousel",
  bun: "bunx --bun shadcn@latest add @davinciui/cinematic-card-carousel",
} as const;
type PackageManager = keyof typeof installCommands;
const CinematicCardCarousel = dynamic(
  () => import("@workspace/ui/components/cinematic-card-carousel").then((module) => module.CinematicCardCarousel),
  { ssr: false },
);

function CopyControl({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const [copyError, setCopyError] = React.useState(false);

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(value);
    } catch {
      const previousFocus = document.activeElement as HTMLElement | null;
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      let fallbackCopied = false;
      try {
        input.select();
        fallbackCopied = document.execCommand("copy");
      } catch {
        fallbackCopied = false;
      } finally {
        input.remove();
        previousFocus?.focus();
      }
      if (!fallbackCopied) {
        setCopyError(true);
        window.setTimeout(() => setCopyError(false), 2500);
        return;
      }
    }

    try {
      posthog.capture("component_workbench_copied", { kind: label });
    } catch {
      // Copy succeeds even when analytics is unavailable.
    }
    setCopyError(false);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={copy} className={styles.copyButton} aria-label={`Copy ${label}`}>
      {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      <span aria-hidden="true">{copied ? "Copied" : copyError ? "Retry" : "Copy"}</span>
      <span className="sr-only" aria-live="polite">{copied ? `${label} copied` : copyError ? `Could not copy ${label}` : ""}</span>
    </button>
  );
}

export function ComponentWorkbench() {
  const { resolvedTheme } = useTheme();
  const reduceMotion = useHydratedReducedMotion();

  // Theme is unknowable during SSR. Gate it until after mount so the first
  // client render matches the server HTML exactly (prevents hydration
  // mismatches); it settles on the next render.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [isNear, setIsNear] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [loop, setLoop] = React.useState(true);
  const [themeOverride, setThemeOverride] = React.useState<"dark" | "light" | null>(null);
  const [replayKey, setReplayKey] = React.useState(0);
  const [autoPlayMs, setAutoPlayMs] = React.useState<1400 | 2800 | 5000>(2800);
  const [showArrows, setShowArrows] = React.useState(true);
  const [startIndex, setStartIndex] = React.useState(2);
  const [activeIndex, setActiveIndex] = React.useState(2);
  const [packageManager, setPackageManager] = React.useState<PackageManager>("npm");
  const installCommand = installCommands[packageManager];
  const previewTheme = themeOverride ?? (mounted && resolvedTheme === "dark" ? "dark" : "light");
  const effectiveAutoPlay = loop && !reduceMotion ? autoPlayMs : undefined;

  React.useEffect(() => {
    setThemeOverride(null);
  }, [resolvedTheme]);

  React.useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setIsNear(true);
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      const visible = Boolean(entry?.isIntersecting);
      setIsVisible(visible);
      if (visible) {
        setIsNear(true);
      }
    }, { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const usageProps = `  items={items}\n  initialIndex={${startIndex}}\n  loop={${loop}}${effectiveAutoPlay ? `\n  autoPlayInterval={${effectiveAutoPlay}}` : ""}${showArrows ? "" : "\n  showArrows={false}"}`;
  const usageDisplayCode = `<CinematicCardCarousel\n${usageProps}\n/>`;
  const usageCode = `import { CinematicCardCarousel } from "@/components/ui/cinematic-card-carousel";

const items = [
  { id: "one", src: "/images/portrait-01.jpg", title: "First frame" },
  { id: "two", src: "/images/portrait-02.jpg", title: "Second frame" },
  { id: "three", src: "/images/portrait-03.jpg", title: "Third frame" },
];

export default function Gallery() {
  return <CinematicCardCarousel
${usageProps}
  />;
}`;

  return (
    <LandingContent>
      <section ref={sectionRef} className={styles.section} aria-labelledby="workbench-heading">
        <div className={styles.intro}>
          <p className={styles.kicker}>From preview to product</p>
          <h2 id="workbench-heading">See it. Shape it. Ship it.</h2>
          <p>Try the real component, tune the experience, and take the setup into your project.</p>
        </div>

        <div className={styles.workbench}>
          <div className={styles.controls} aria-label="Carousel settings">
            <div className={styles.panelHeading}>
              <span className={styles.panelIndex}>01</span>
              <div>
                <h3>Make it yours</h3>
                <p>Changes show up in the live preview.</p>
              </div>
            </div>

            <div className={styles.controlList}>
              <button
                type="button"
                className={styles.controlButton}
                aria-pressed={loop}
                onClick={() => {
                  setLoop((current) => !current);
                  posthog.capture("component_workbench_interaction", { control: "loop" });
                }}
              >
                <span className={styles.controlIcon}><Repeat2 size={18} aria-hidden="true" /></span>
                <span className={styles.controlText}><strong>Loop motion</strong><small>{loop ? reduceMotion ? "Reduced motion" : "Playing" : "Paused"}</small></span>
                <span className={`${styles.switch} ${loop ? styles.switchOn : ""}`} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.controlButton}
                onClick={() => {
                  setThemeOverride(previewTheme === "dark" ? "light" : "dark");
                  posthog.capture("component_workbench_interaction", { control: "theme" });
                }}
              >
                <span className={styles.controlIcon}><SunMoon size={18} aria-hidden="true" /></span>
                <span className={styles.controlText}><strong>Preview theme</strong><small>{previewTheme === "dark" ? "Dark" : "Light"}</small></span>
                <span className={styles.controlValue} aria-hidden="true">{previewTheme === "dark" ? "D" : "L"}</span>
              </button>
              <button
                type="button"
                className={styles.controlButton}
                onClick={() => {
                  setActiveIndex(startIndex);
                  setReplayKey((current) => current + 1);
                  posthog.capture("component_workbench_interaction", { control: "replay" });
                }}
              >
                <span className={styles.controlIcon}><RotateCcw size={18} aria-hidden="true" /></span>
                <span className={styles.controlText}><strong>Replay</strong><small>Return to the starting card</small></span>
              </button>
              <button
                type="button"
                className={styles.controlButton}
                aria-pressed={showArrows}
                onClick={() => {
                  setShowArrows((current) => !current);
                  posthog.capture("component_workbench_interaction", { control: "arrows" });
                }}
              >
                <span className={styles.controlIcon}><MousePointerClick size={18} aria-hidden="true" /></span>
                <span className={styles.controlText}><strong>Edge arrows</strong><small>{showArrows ? "Shown" : "Hidden"}</small></span>
                <span className={`${styles.switch} ${showArrows ? styles.switchOn : ""}`} aria-hidden="true" />
              </button>

              <div className={styles.segmentGroup}>
                <span className={styles.segmentLabel}><Timer size={13} aria-hidden="true" /> Autoplay pace</span>
                <div className={styles.segmentRow} role="group" aria-label="Autoplay pace">
                  {([1400, 2800, 5000] as const).map((ms) => (
                    <button
                      key={ms}
                      type="button"
                      className={`${styles.segmentButton} ${autoPlayMs === ms ? styles.segmentActive : ""}`}
                      aria-pressed={autoPlayMs === ms}
                      onClick={() => {
                        setAutoPlayMs(ms);
                        posthog.capture("component_workbench_interaction", { control: "pace", value: ms });
                      }}
                    >
                      {ms === 1400 ? "Brisk" : ms === 2800 ? "Cine" : "Slow"}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.segmentGroup}>
                <span className={styles.segmentLabel}><LayoutGrid size={13} aria-hidden="true" /> Starting card · {startIndex + 1} of {cinematicDemoCards.length}</span>
                <div className={styles.startGrid} role="group" aria-label="Choose starting card">
                  {cinematicDemoCards.map((card, index) => (
                    <button
                      key={card.id}
                      type="button"
                      className={`${styles.startThumb} ${startIndex === index ? styles.startThumbActive : ""}`}
                      aria-pressed={startIndex === index}
                      aria-label={`Start on card ${index + 1}: ${card.title}`}
                      title={card.title}
                      onClick={() => {
                        setStartIndex(index);
                        setActiveIndex(index);
                        setReplayKey((current) => current + 1);
                        posthog.capture("component_workbench_interaction", { control: "start-index", value: index });
                      }}
                    >
                      <img src={card.src} alt="" loading="lazy" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className={styles.controlHint}>Drag, swipe, click a side card, use ← → keys, or tap the dots below the preview.</p>
          </div>

          <div className={`${styles.preview} ${themeOverride === null ? styles.previewAuto : themeOverride === "dark" ? styles.previewDark : styles.previewLight} ${themeOverride === "dark" ? "dark" : ""}`} data-preview-theme={previewTheme}>
            <div className={styles.previewTopline}>
              <span>Cinematic card carousel</span>
              <span className={styles.liveIndicator}><i aria-hidden="true" /> Live preview</span>
            </div>
            <div className={styles.previewStage}>
              {isNear ? (
                <CinematicCardCarousel
                  key={`${replayKey}-${startIndex}`}
                  items={cinematicDemoCards}
                  initialIndex={startIndex}
                  loop={loop}
                  autoPlayInterval={loop && isVisible && !reduceMotion ? autoPlayMs : undefined}
                  showArrows={showArrows}
                  onIndexChange={setActiveIndex}
                  className={styles.carousel}
                />
              ) : (
                <div className={styles.previewPlaceholder} aria-hidden="true">
                  <img src="/images/spiral-3d-slider/prism-portrait.webp" alt="" loading="lazy" />
                </div>
              )}
            </div>
            <div className={styles.previewFooter}>
              <div className={styles.dotRow} role="group" aria-label="Jump to card">
                {cinematicDemoCards.map((card, index) => (
                  <button
                    key={card.id}
                    type="button"
                    className={`${styles.dot} ${activeIndex === index ? styles.dotActive : ""}`}
                    aria-pressed={activeIndex === index}
                    aria-label={`Go to card ${index + 1}: ${card.title}`}
                    onClick={() => {
                      setStartIndex(index);
                      setActiveIndex(index);
                      setReplayKey((current) => current + 1);
                      posthog.capture("component_workbench_interaction", { control: "dot-jump", value: index });
                    }}
                  />
                ))}
              </div>
              <span className={styles.counter} aria-live="polite">{activeIndex + 1} / {cinematicDemoCards.length}</span>
            </div>
            <p className={styles.previewCaption}>{cinematicDemoCards[activeIndex]?.title ?? "A focused frame, with the rest of the story in reach."}</p>
          </div>

          <div className={styles.codePanel}>
            <div className={styles.panelHeading}>
              <span className={styles.panelIndex}>02</span>
              <div>
                <h3>Use it in your project</h3>
                <p>Install, then make it your own.</p>
              </div>
            </div>
            <div className={styles.codeContent}>
              <div className={styles.snippetGroup}>
                <div className={styles.snippetHeadingRow}>
                  <span className={styles.snippetHeading}>Install</span>
                  <div className={styles.pmTabs} role="group" aria-label="Package manager">
                    {(Object.keys(installCommands) as PackageManager[]).map((pm) => (
                      <button
                        key={pm}
                        type="button"
                        className={`${styles.pmTab} ${packageManager === pm ? styles.pmTabActive : ""}`}
                        aria-pressed={packageManager === pm}
                        onClick={() => {
                          setPackageManager(pm);
                          posthog.capture("component_workbench_interaction", { control: "pm", value: pm });
                        }}
                      >
                        {pm}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.command}>
                  <code>{installCommand}</code>
                  <CopyControl value={installCommand} label="install command" />
                </div>
              </div>
              <div className={styles.snippetGroup}>
                <div className={styles.snippetHeadingRow}>
                  <span className={styles.snippetHeading}>React · mirrors panel 01</span>
                  <CopyControl value={usageCode} label="usage code" />
                </div>
                <div className={styles.codeBlock}>
                  <pre><code>{usageDisplayCode}</code></pre>
                </div>
              </div>
              <div className={styles.snippetGroup}>
                <div className={styles.snippetHeadingRow}>
                  <span className={styles.snippetHeading}>Props</span>
                </div>
                <dl className={styles.propsTable}>
                  <div className={styles.propsRow}><dt>items</dt><dd>CinematicCardItem[]</dd></div>
                  <div className={styles.propsRow}><dt>initialIndex</dt><dd>number · {startIndex}</dd></div>
                  <div className={styles.propsRow}><dt>loop</dt><dd>boolean · {String(loop)}</dd></div>
                  <div className={styles.propsRow}><dt>autoPlayInterval</dt><dd>ms · {effectiveAutoPlay ?? "off"}</dd></div>
                  <div className={styles.propsRow}><dt>showArrows</dt><dd>boolean · {String(showArrows)}</dd></div>
                  <div className={styles.propsRow}><dt>onIndexChange</dt><dd>(index) =&gt; void</dd></div>
                </dl>
              </div>
            </div>
            <Link
              href="/experience/components/cinematic-card-carousel"
              className={styles.docsLink}
              onClick={() => posthog.capture("component_workbench_docs_opened")}
            >
              Explore component <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </LandingContent>
  );
}
