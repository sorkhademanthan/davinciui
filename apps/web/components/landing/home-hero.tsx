"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, RotateCcw, Terminal } from "lucide-react";
import { ServicesShowcase } from "@workspace/ui/components/services-showcase";
import { TextMorph } from "@workspace/ui/components/text-morph";
import { AnimatedPillButton } from "@workspace/ui/components/animated-pill-button";
import { LandingContent, LandingGutter } from "./landing-frame";
import { track } from "@/lib/analytics";
import styles from "./home-hero.module.css";

const demos = [
  { tab: "Cards", title: "Services showcase", slug: "services-showcase", description: "A little perspective changes everything." },
  { tab: "Typography", title: "Text morph", slug: "text-morph", description: "Give your words a proper entrance." },
  { tab: "Buttons", title: "Animated pill button", slug: "animated-pill-button", description: "A small interaction. A satisfying response." },
] as const;

export function HomeHero() {
  const [active, setActive] = useState(0);
  const [replay, setReplay] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demo = demos[active]!;
  const command = `pnpm dlx shadcn@latest add @davinciui/${demo.slug}`;

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const selectDemo = (index: number) => {
    setActive(index);
    setSaved(false);
    setCopyState("idle");
    if (resetTimer.current) clearTimeout(resetTimer.current);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % demos.length;
    else if (event.key === "ArrowLeft") next = (index + demos.length - 1) % demos.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = demos.length - 1;
    else return;
    event.preventDefault();
    selectDemo(next);
    tabs.current[next]?.focus();
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopyState("copied");
      track("component_install_command_copied");
    } catch {
      setCopyState("error");
    }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2500);
  };

  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <LandingGutter>
        <LandingContent>
          <div className={styles.layout}>
            <div className={styles.intro}>
              <h1 id="home-hero-heading" className={styles.heading}>
                <span>Give your</span>
                <span>interface life.</span>
              </h1>
              <p className={styles.description}>
                Animated React components for people who care about the details. Find your favorite, make it yours, and build something worth feeling.
              </p>

              <div className={styles.actions}>
                <Link href="/experience/components" className={styles.primaryAction} onClick={() => track("components_browse_started")}>
                  Browse components
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/docs/installation" className={styles.secondaryAction}>Read the docs</Link>
              </div>
              <p className={styles.ownership}><Check size={15} aria-hidden="true" /> Free &amp; open source. Yours to customize.</p>
            </div>

            <div className={styles.playground}>
              <div className={styles.toolbar}>
                <div role="tablist" aria-label="Explore component previews" className={styles.tabs}>
                  {demos.map((item, index) => (
                    <button
                      key={item.slug}
                      ref={(element) => { tabs.current[index] = element; }}
                      id={`hero-tab-${index}`}
                      type="button"
                      role="tab"
                      aria-selected={active === index}
                      aria-controls={`hero-preview-${index}`}
                      tabIndex={active === index ? 0 : -1}
                      onKeyDown={(event) => onTabKeyDown(event, index)}
                      onClick={() => selectDemo(index)}
                    >{item.tab}</button>
                  ))}
                </div>
                <span className={styles.liveLabel}><span aria-hidden="true" />Live preview</span>
              </div>

              <div id={`hero-preview-${active}`} role="tabpanel" aria-labelledby={`hero-tab-${active}`} tabIndex={0} className={styles.preview}>
                <div className={styles.scene} key={`${active}-${replay}`}>
                  {active === 0 && (
                    <div className={styles.cardDemo}>
                      <ServicesShowcase density="compact" interactive={false} autoPlay={false} aria-label="Three photographic cards unfolding into a layered stack" />
                    </div>
                  )}
                  {active === 1 && (
                    <div className={styles.typeDemo}>
                      <TextMorph
                        words={["Ideas.", "In motion."]}
                        interval={2200}
                        morphDuration={620}
                        className="text-[clamp(3.3rem,6vw,5.5rem)] font-[550] leading-[1.02] tracking-[-0.065em]"
                      />
                    </div>
                  )}
                  {active === 2 && (
                    <div className={styles.buttonDemo}>
                      <div className={styles.buttonHalo} aria-hidden="true" />
                      <AnimatedPillButton label={saved ? "Added to collection" : "Add to collection"} onClick={() => setSaved(!saved)} size="lg" />
                      <p role="status">{saved ? "That’s the feeling. Click to try again." : "Hover, focus, or tap. Try it out."}</p>
                    </div>
                  )}
                </div>
                <div className={styles.previewCaption}>
                  <div>
                    <Link href={`/experience/components/${demo.slug}`}>{demo.title}<ArrowUpRight size={14} aria-hidden="true" /></Link>
                    <p>{demo.description}</p>
                  </div>
                  <button type="button" aria-label={`Replay ${demo.title} preview`} title="Replay preview" className={styles.replay} onClick={() => { setReplay((value) => value + 1); setSaved(false); }}><RotateCcw size={16} aria-hidden="true" /></button>
                </div>
              </div>

              <div className={styles.command}>
                <Terminal size={15} aria-hidden="true" />
                <code title={command}>{command}</code>
                <button type="button" onClick={copyCommand} aria-label={copyState === "copied" ? "Install command copied" : "Copy install command"} title="Copy install command">
                  {copyState === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                </button>
                <span role="status" className={styles.copyFeedback}>{copyState === "copied" ? "Copied" : copyState === "error" ? "Select the command to copy it." : ""}</span>
              </div>
            </div>
          </div>

          <div className={styles.foundation}>
            <p>From the first idea to the final interaction.</p>
            <ul aria-label="Built with"><li>React</li><li>TypeScript</li><li>Tailwind CSS</li><li>Motion</li></ul>
          </div>
        </LandingContent>
      </LandingGutter>
    </section>
  );
}
