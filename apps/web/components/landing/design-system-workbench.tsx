"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, RotateCcw, SunMoon } from "lucide-react";
import posthog from "posthog-js";
import { LandingContent } from "@/components/landing/landing-frame";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import styles from "./component-workbench.module.css";

const accents = [
  { name: "Ember", value: "#d9622b" },
  { name: "Iris", value: "#6c5ce7" },
  { name: "Moss", value: "#3e7c4f" },
  { name: "Ocean", value: "#2f7de1" },
  { name: "Rose", value: "#e14d6b" },
  { name: "Amber", value: "#c98a12" },
] as const;

const tabs = ["Color", "Typography", "Radius", "Spacing", "Grid", "Shadows", "Motion"] as const;
type Tab = (typeof tabs)[number];

function CopyMini({ value, label, dark }: { value: string; label: string; dark?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      try {
        input.select();
        document.execCommand("copy");
      } catch {
        return;
      } finally {
        input.remove();
      }
    }
    try {
      posthog.capture("design_system_specimen_copied", { kind: label });
    } catch {
      // noop
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        minHeight: 28,
        padding: "3px 10px",
        borderRadius: 999,
        border: `1px solid ${dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)"}`,
        background: "transparent",
        color: "inherit",
        fontSize: 11,
        fontWeight: 650,
        cursor: "pointer",
      }}
    >
      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function MotionRow({
  index,
  label,
  meta,
  duration,
  ease,
  replayKey,
  dark,
  disabled,
}: {
  index: string;
  label: string;
  meta: string;
  duration: number;
  ease: [number, number, number, number];
  replayKey: number;
  dark: boolean;
  disabled: boolean;
}) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dist, setDist] = React.useState(0);
  const fg = dark ? "#fff" : "#171717";
  const muted = dark ? "#a4a4a1" : "#858580";
  const hairline = dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setDist(Math.max(0, el.clientWidth - 32));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [x1, y1, x2, y2] = ease;
  const curvePath = `M 3 25 C ${3 + 34 * x1} ${25 - 22 * y1}, ${3 + 34 * x2} ${25 - 22 * y2}, 37 3`;

  return (
    <div
      style={{
        border: `1px solid ${hairline}`,
        borderRadius: 12,
        padding: "10px 12px 12px",
        background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: "var(--ds-accent)", fontWeight: 700 }}>
          {index}
        </span>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "-0.01em", color: fg }}>{label}</p>
        <span style={{ flex: 1 }} aria-hidden="true" />
        <svg width="40" height="26" viewBox="0 0 40 28" fill="none" aria-hidden="true">
          <line x1="3" y1="25" x2="37" y2="25" stroke={muted} strokeOpacity="0.35" strokeWidth="1" />
          <line x1="3" y1="25" x2="3" y2="3" stroke={muted} strokeOpacity="0.35" strokeWidth="1" />
          <path d={curvePath} stroke="var(--ds-accent)" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="3" cy="25" r="2" fill="var(--ds-accent)" />
          <circle cx="37" cy="3" r="2" fill="var(--ds-accent)" />
        </svg>
        <code style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: muted, whiteSpace: "nowrap" }}>{meta}</code>
      </div>
      <div
        ref={trackRef}
        style={{
          position: "relative",
          height: 36,
          borderRadius: 999,
          background: dark ? "#262728" : "#ececea",
        }}
      >
        <motion.span
          key={replayKey}
          aria-hidden="true"
          initial={{ x: disabled ? dist : 0 }}
          animate={{ x: dist }}
          transition={disabled ? { duration: 0 } : { duration, ease: ease as unknown as never, repeat: Infinity, repeatType: "mirror", repeatDelay: 0.5 }}
          style={{
            position: "absolute",
            top: 6,
            left: 4,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--ds-accent)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
          }}
        />
      </div>
    </div>
  );
}

export function DesignSystemWorkbench() {
  const reduceMotion = useHydratedReducedMotion();
  const [tab, setTab] = React.useState<Tab>("Color");
  const [accent, setAccent] = React.useState<string>(accents[3].value);
  const [dark, setDark] = React.useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false
  );
  const [userOverridden, setUserOverridden] = React.useState(false);
  const [replayKey, setReplayKey] = React.useState(0);
  const [gutter, setGutter] = React.useState(16);
  const [radiusDemo, setRadiusDemo] = React.useState(14);

  // Follow the system theme by default until the user manually toggles.
  React.useEffect(() => {
    if (userOverridden || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [userOverridden]);

  const accentName = accents.find((a) => a.value === accent)?.name ?? "Custom";
  const fg = dark ? "#f4f4f3" : "#171717";
  const muted = dark ? "#a4a4a1" : "#6f6f6b";
  const stageBg = dark ? "#111213" : "#fbfbfa";
  const hairline = dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";

  const cssText = `:root {
  --ds-accent: ${accent}; /* ${accentName} */
  --ds-radius: 14px;
  --ds-spacing: 20px;
  color-scheme: ${dark ? "dark" : "light"};
}`;
  const jsonText = JSON.stringify(
    { meta: { name: "Landing tokens" }, accent: { value: accent, name: accentName }, radius: { base: 14 }, spacing: { base: 20 }, theme: dark ? "dark" : "light" },
    null,
    2
  );

  const shades = [
    { pct: 8, name: "50" },
    { pct: 28, name: "100" },
    { pct: 48, name: "200" },
    { pct: 68, name: "400" },
    { pct: 88, name: "600" },
    { pct: 100, name: "900" },
  ];

  const tabReadout: Record<Tab, string> = {
    Color: `${accentName} · ${accent}`,
    Typography: "4 steps · tight → wide",
    Radius: "base 14px · 5 steps",
    Spacing: "base 20px · 6 steps",
    Grid: "12 cols · live gutter",
    Shadows: "5 steps · theme-aware",
    Motion: "3 easings · reduced-motion safe",
  };

  return (
    <LandingContent>
      <style>{`
        .ds-specimen button:focus-visible { outline: 2px solid var(--ds-focus, #2f7de1); outline-offset: 2px; }
        .ds-export-card { transition: transform 0.25s cubic-bezier(0.23,1,0.32,1), box-shadow 0.25s; }
        .ds-export-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -16px rgba(0,0,0,0.35); }
        .ds-swatch { transition: background 0.25s, transform 0.2s; }
        .ds-grid-cell { transition: background 0.25s, opacity 0.2s, transform 0.2s; cursor: crosshair; }
        .ds-grid-cell:hover { opacity: 1 !important; transform: scaleY(1.04); }
        .ds-shadow-box { transition: transform 0.25s cubic-bezier(0.23,1,0.32,1), box-shadow 0.25s; }
        .ds-shadow-box:hover { transform: translateY(-4px); }
        .ds-tab-track { scrollbar-width: none; }
        .ds-tab-track::-webkit-scrollbar { display: none; }
        .ds-stage-body { display: flex; flex-direction: column; justify-content: center; min-height: 320px; }
        @media (max-width: 640px) {
          .ds-shade-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .ds-type-row { grid-template-columns: minmax(0,1fr) auto !important; gap: 8px 12px !important; }
          .ds-type-row > span:first-child { display: none; }
          .ds-role-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ds-tab-meta { display: none !important; }
          .ds-stage-body { min-height: 480px; }
          .ds-space-row { grid-template-columns: 24px minmax(0,1fr) auto !important; }
          .ds-space-visual { grid-column: 1 / -1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ds-export-card:hover { transform: none; }
          .ds-grid-cell:hover { transform: none; }
          .ds-shadow-box:hover { transform: none; }
        }
      `}</style>
      <section className={`${styles.section} ds-specimen`} aria-labelledby="ds-specimen-heading" style={{ marginTop: 56, ["--ds-focus" as string]: accent } as React.CSSProperties}>
        <div className={styles.intro}>
          <p className={styles.kicker}>Design system builder</p>
          <h2 id="ds-specimen-heading">Tokens in. Product out.</h2>
          <p>One accent and one theme drive every specimen below — then export them as production CSS or JSON.</p>
        </div>

        {/* Toolbar: accent + theme — slim, nothing like panel 01 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            padding: "12px 16px",
            border: `1px solid ${hairline}`,
            borderRadius: 16,
            background: dark ? "#1d1d1f" : "#fff",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} role="group" aria-label="Choose accent color">
            <span style={{ fontSize: 11, fontWeight: 650, color: muted, fontVariantNumeric: "tabular-nums" }}>
              Accent ·{" "}
              <span style={{ display: "inline-block", minWidth: "6ch" }}>{accentName}</span>
            </span>
            <span style={{ display: "flex", gap: 7 }}>
              {accents.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  title={a.name}
                  aria-label={`Accent ${a.name}`}
                  aria-pressed={accent === a.value}
                  onClick={() => {
                    setAccent(a.value);
                    posthog.capture("design_system_specimen_interaction", { control: "accent", value: a.name });
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: a.value,
                    border: "none",
                    outline: accent === a.value ? `2px solid ${fg}` : "none",
                    outlineOffset: 2,
                    cursor: "pointer",
                  }}
                />
              ))}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {tab === "Motion" && (
              <button
                type="button"
                onClick={() => setReplayKey((k) => k + 1)}
                aria-label="Replay motion specimens"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  minHeight: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  border: `1px solid ${hairline}`,
                  background: "transparent",
                  color: fg,
                  fontSize: 11,
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={13} aria-hidden="true" /> Replay
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setUserOverridden(true);
                setDark((v) => !v);
                posthog.capture("design_system_specimen_interaction", { control: "theme" });
              }}
              aria-pressed={dark}
              aria-label="Toggle specimen theme"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 30,
                padding: "0 12px",
                borderRadius: 999,
                border: `1px solid ${hairline}`,
                background: dark ? fg : "transparent",
                color: dark ? (fg === "#f4f4f3" ? "#171717" : fg) : fg,
                fontSize: 11,
                fontWeight: 650,
                cursor: "pointer",
              }}
            >
              <SunMoon size={13} aria-hidden="true" /> {dark ? "Dark" : "Light"}
            </button>
          </div>
        </div>

        {/* Specimen sheet */}
        <div
          style={{
            border: `1px solid ${hairline}`,
            borderRadius: 21,
            background: stageBg,
            color: fg,
            overflow: "hidden",
            transition: "background 0.25s",
            ["--ds-accent" as string]: accent,
          } as React.CSSProperties}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 16px",
              borderBottom: `1px solid ${hairline}`,
            }}
          >
            <div
              className="ds-tab-track"
              style={{
                display: "flex",
                gap: 2,
                padding: 3,
                borderRadius: 999,
                background: dark ? "#222324" : "#efefec",
                overflowX: "auto",
                maxWidth: "100%",
              }}
              role="tablist"
              aria-label="Token categories"
            >
              {tabs.map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setTab(t);
                      posthog.capture("design_system_specimen_interaction", { control: "tab", value: t });
                    }}
                    style={{
                      position: "relative",
                      padding: "7px 14px",
                      borderRadius: 999,
                      border: "none",
                      background: "transparent",
                      color: active ? (dark ? "#111213" : "#fff") : muted,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {active && (
                      <motion.span
                        layoutId="ds-tab-pill"
                        transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.18, duration: 0.45 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 999,
                          background: dark ? "#f4f4f3" : "#171717",
                        }}
                        aria-hidden="true"
                      />
                    )}
                    <span style={{ position: "relative" }}>{t}</span>
                  </button>
                );
              })}
            </div>
            <code className="ds-tab-meta" style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: muted, whiteSpace: "nowrap", textAlign: "right", minWidth: "22ch", fontVariantNumeric: "tabular-nums" }}>
              {tabReadout[tab]}
            </code>
          </div>

          <div style={{ padding: "28px 24px 32px" }} role="tabpanel" aria-label={`${tab} tokens`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                className="ds-stage-body"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              >
                {tab === "Color" && (
                  <div>
                    <div className="ds-shade-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                      {shades.map((s) => (
                        <div key={s.name}>
                          <div
                            className="ds-swatch"
                            style={{
                              height: 72,
                              borderRadius: 12,
                              background: `color-mix(in srgb, var(--ds-accent) ${s.pct}%, ${dark ? "black" : "white"})`,
                              border: `1px solid ${hairline}`,
                            }}
                          />
                          <p style={{ margin: "8px 0 0", fontSize: 10, fontFamily: "ui-monospace, monospace", color: muted, textAlign: "center" }}>
                            {s.name} · {s.pct}%
                          </p>
                        </div>
                      ))}
                    </div>
                    <p style={{ margin: "24px 0 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
                      Applied as roles
                    </p>
                    <div className="ds-role-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {[
                        { name: "Surface", token: "--ds-surface", demoBg: dark ? "#1d1e20" : "#ffffff", demoColor: fg, demoBorder: hairline, glyph: "Aa" },
                        { name: "Muted", token: "--ds-muted", demoBg: dark ? "#262728" : "#f0efec", demoColor: muted, demoBorder: "transparent", glyph: "Aa" },
                        { name: "Border", token: "--ds-border", demoBg: "transparent", demoColor: muted, demoBorder: dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.2)", glyph: "▢" },
                        { name: "Accent", token: "--ds-accent", demoBg: "color-mix(in srgb, var(--ds-accent) 14%, transparent)", demoColor: "var(--ds-accent)", demoBorder: "color-mix(in srgb, var(--ds-accent) 35%, transparent)", glyph: "Aa" },
                      ].map((role) => (
                        <div
                          key={role.name}
                          style={{ border: `1px solid ${hairline}`, borderRadius: 12, overflow: "hidden", background: dark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)" }}
                        >
                          <div
                            style={{
                              height: 56,
                              display: "grid",
                              placeItems: "center",
                              background: role.demoBg,
                              borderBottom: `1px solid ${role.demoBorder === "transparent" ? hairline : role.demoBorder}`,
                              boxShadow: role.name === "Border" ? `inset 0 0 0 2px ${role.demoBorder}` : "none",
                              fontSize: 20,
                              fontWeight: 700,
                              color: role.demoColor,
                              transition: "background 0.25s, color 0.25s",
                            }}
                            aria-hidden="true"
                          >
                            {role.glyph}
                          </div>
                          <div style={{ padding: "8px 10px 10px" }}>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: fg }}>{role.name}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 9, fontFamily: "ui-monospace, monospace", color: muted }}>{role.token}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "Typography" && (
                  <div style={{ display: "grid" }}>
                    {[
                      { index: "01", specimen: "Tokens in. Product out.", size: 38, weight: 550, letterSpacing: "-0.025em", lineHeight: 1.05, token: "text-display", spec: "38 · 550 · -2.5%" },
                      { index: "02", specimen: "The quick brown fox", size: 26, weight: 550, letterSpacing: "-0.015em", lineHeight: 1.15, token: "text-title", spec: "26 · 550 · -1.5%" },
                      { index: "03", specimen: "Body copy sets the rhythm for everything else on the page.", size: 15, weight: 400, letterSpacing: "0", lineHeight: 1.55, token: "text-body", spec: "15 · 400 · 155%" },
                      { index: "04", specimen: "SPACING · RHYTHM · HIERARCHY", size: 12, weight: 700, letterSpacing: "0.1em", lineHeight: 1.4, token: "text-caption", spec: "12 · 700 · +10%" },
                    ].map((row, i, arr) => (
                      <div
                        key={row.token}
                        className="ds-type-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "28px minmax(0,1fr) auto",
                          gap: 16,
                          alignItems: "baseline",
                          padding: "13px 4px",
                          borderBottom: i === arr.length - 1 ? "none" : `1px solid ${hairline}`,
                        }}
                      >
                        <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: "var(--ds-accent)", fontWeight: 700 }}>
                          {row.index}
                        </span>
                        <p style={{ margin: 0, fontSize: row.size, fontWeight: row.weight, letterSpacing: row.letterSpacing, lineHeight: row.lineHeight, color: fg }}>
                          {row.specimen}
                        </p>
                        <span style={{ textAlign: "right", flex: "none" }}>
                          <code style={{ display: "block", fontSize: 10, fontFamily: "ui-monospace, monospace", color: fg }}>{row.token}</code>
                          <code style={{ display: "block", marginTop: 3, fontSize: 9, fontFamily: "ui-monospace, monospace", color: muted }}>{row.spec}</code>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "Radius" && (
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
                        Corner radius
                      </p>
                      <p style={{ margin: 0, fontSize: 10, fontFamily: "ui-monospace, monospace", color: fg, fontVariantNumeric: "tabular-nums" }}>
                        {radiusDemo === 999 ? "full · pill" : `${radiusDemo}px${radiusDemo === 14 ? " · base" : ""}`}
                      </p>
                    </div>
                    <div
                      style={{
                        borderRadius: radiusDemo === 999 ? 999 : radiusDemo * 1.6,
                        background: dark ? "#1d1e20" : "#ffffff",
                        border: `1px solid ${hairline}`,
                        padding: "20px 22px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        transition: "border-radius 0.3s cubic-bezier(0.23,1,0.32,1)",
                        overflow: "hidden",
                      }}
                    >
                      <span style={{ width: 40, height: 40, flex: "none", borderRadius: radiusDemo === 999 ? 999 : Math.max(4, radiusDemo), background: "var(--ds-accent)", transition: "border-radius 0.3s cubic-bezier(0.23,1,0.32,1)" }} aria-hidden="true" />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", height: 10, width: "55%", borderRadius: 999, background: dark ? "#3a3b3d" : "#e2e2de" }} aria-hidden="true" />
                        <span style={{ display: "block", height: 8, width: "80%", marginTop: 7, borderRadius: 999, background: dark ? "#2c2d2f" : "#efefec" }} aria-hidden="true" />
                      </span>
                      <span
                        style={{
                          flex: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#fff",
                          background: "var(--ds-accent)",
                          borderRadius: radiusDemo === 999 ? 999 : Math.max(6, radiusDemo * 0.7),
                          padding: "9px 18px",
                          transition: "border-radius 0.3s cubic-bezier(0.23,1,0.32,1)",
                        }}
                        aria-hidden="true"
                      >
                        Action
                      </span>
                    </div>
                    <div className="ds-tab-track" style={{ display: "flex", gap: 6, overflowX: "auto", marginTop: 14, paddingBottom: 2 }} role="group" aria-label="Corner radius presets">
                      {[
                        { name: "Sharp", value: 4 },
                        { name: "Base", value: 14 },
                        { name: "Soft", value: 24 },
                        { name: "Round", value: 32 },
                        { name: "Pill", value: 999 },
                      ].map((r) => {
                        const active = radiusDemo === r.value;
                        return (
                          <button
                            key={r.name}
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              setRadiusDemo(r.value);
                              posthog.capture("design_system_specimen_interaction", { control: "radius", value: r.name });
                            }}
                            style={{
                              flex: "none",
                              padding: "7px 14px",
                              borderRadius: 999,
                              border: `1px solid ${active ? "transparent" : hairline}`,
                              background: active ? "var(--ds-accent)" : "transparent",
                              color: active ? "#fff" : muted,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {r.name} · {r.value === 999 ? "full" : `${r.value}px`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tab === "Spacing" && (
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
                        True-scale gaps
                      </p>
                      <p style={{ margin: 0, fontSize: 10, fontFamily: "ui-monospace, monospace", color: muted }}>
                        measured live · 1:1
                      </p>
                    </div>
                    <div style={{ display: "grid" }}>
                    {[
                      { token: "space-1", px: 4 },
                      { token: "space-2", px: 8 },
                      { token: "space-4", px: 16 },
                      { token: "space-6", px: 24 },
                      { token: "space-10", px: 40 },
                      { token: "space-16", px: 64 },
                    ].map((row, i, arr) => (
                      <div
                        key={row.token}
                        className="ds-space-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "28px 96px minmax(0,1fr) auto",
                          gap: 12,
                          alignItems: "center",
                          padding: "12px 4px",
                          borderBottom: i === arr.length - 1 ? "none" : `1px solid ${hairline}`,
                        }}
                      >
                        <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: "var(--ds-accent)", fontWeight: 700 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <code style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: muted, whiteSpace: "nowrap" }}>
                          {row.token}
                        </code>
                        <span className="ds-space-visual" style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                          <span
                            style={{ width: 22, height: 22, flex: "none", borderRadius: 7, background: "color-mix(in srgb, var(--ds-accent) 30%, transparent)", border: "1px solid color-mix(in srgb, var(--ds-accent) 55%, transparent)" }}
                            aria-hidden="true"
                          />
                          <span
                            style={{ width: row.px, flex: "none", maxWidth: "100%", height: 22, backgroundImage: "linear-gradient(90deg, var(--ds-accent) 2px, transparent 2px)", backgroundSize: "6px 100%", backgroundRepeat: "repeat-x", backgroundPosition: "center", opacity: 0.55 }}
                            aria-hidden="true"
                          />
                          <span
                            style={{ width: 22, height: 22, flex: "none", borderRadius: 7, background: "var(--ds-accent)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                            aria-hidden="true"
                          />
                        </span>
                        <code style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: fg, flex: "none", fontVariantNumeric: "tabular-nums" }}>{row.px}px</code>
                      </div>
                    ))}
                    </div>
                  </div>
                )}

                {tab === "Grid" && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
                        12-column grid
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }} role="group" aria-label="Gutter size">
                        <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: muted }}>gutter</span>
                        {[8, 16, 24].map((g) => (
                          <button
                            key={g}
                            type="button"
                            aria-pressed={gutter === g}
                            onClick={() => {
                              setGutter(g);
                              posthog.capture("design_system_specimen_interaction", { control: "gutter", value: g });
                            }}
                            style={{
                              minWidth: 30,
                              padding: "4px 8px",
                              borderRadius: 999,
                              border: "none",
                              background: gutter === g ? "var(--ds-accent)" : "transparent",
                              color: gutter === g ? "#fff" : muted,
                              fontSize: 10,
                              fontWeight: 700,
                              fontFamily: "ui-monospace, monospace",
                              cursor: "pointer",
                            }}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0,1fr))", gap: gutter }} aria-hidden="true">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div
                          key={i}
                          className="ds-grid-cell"
                          style={{
                            height: 148,
                            borderRadius: 8,
                            background: i >= 4 && i <= 7 ? "var(--ds-accent)" : "color-mix(in srgb, var(--ds-accent) 22%, transparent)",
                            border: "1px solid color-mix(in srgb, var(--ds-accent) 45%, transparent)",
                            opacity: i >= 4 && i <= 7 ? 1 : 0.75,
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ margin: "14px 0 0", fontSize: 10, fontFamily: "ui-monospace, monospace", color: muted, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                      12 cols · {gutter}px gutter · content spans 5–8
                    </p>
                  </div>
                )}

                {tab === "Shadows" && (
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
                        Elevation scale
                      </p>
                      <p style={{ margin: 0, fontSize: 10, fontFamily: "ui-monospace, monospace", color: muted }}>
                        5 steps · {dark ? "dark" : "light"} tuned
                      </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 12 }}>
                      {[
                        { name: "xs", token: "shadow-xs", shadow: dark ? "0 1px 2px rgba(0,0,0,0.5)" : "0 1px 2px rgba(0,0,0,0.08)" },
                        { name: "sm", token: "shadow-sm", shadow: dark ? "0 2px 8px rgba(0,0,0,0.55)" : "0 2px 8px -2px rgba(0,0,0,0.14)" },
                        { name: "md", token: "shadow-md", shadow: dark ? "0 8px 24px rgba(0,0,0,0.6)" : "0 8px 24px -8px rgba(0,0,0,0.2)" },
                        { name: "lg", token: "shadow-lg", shadow: dark ? "0 20px 48px rgba(0,0,0,0.65)" : "0 20px 48px -12px rgba(0,0,0,0.28)" },
                        { name: "xl", token: "shadow-xl", shadow: dark ? "0 32px 72px rgba(0,0,0,0.7)" : "0 32px 72px -16px rgba(0,0,0,0.34)" },
                      ].map((s, i) => (
                        <div key={s.name} style={{ textAlign: "center" }}>
                          <div
                            className="ds-shadow-box"
                            style={{
                              height: 104,
                              borderRadius: 14,
                              background: dark ? "#262728" : "#ffffff",
                              border: `1px solid ${hairline}`,
                              boxShadow: s.shadow,
                              display: "grid",
                              placeItems: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: "ui-monospace, monospace",
                              color: "var(--ds-accent)",
                            }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <p style={{ margin: "10px 0 0", fontSize: 11, fontWeight: 700, color: fg }}>{s.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 9, fontFamily: "ui-monospace, monospace", color: muted }}>{s.token}</p>
                        </div>
                      ))}
                    </div>
                    <p style={{ margin: "14px 0 0", fontSize: 11, color: muted }}>Hover a level to feel it lift — shadows deepen automatically in dark mode.</p>
                  </div>
                )}

                {tab === "Motion" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <MotionRow index="01" label="Snappy" meta="180ms · ease-out" duration={0.35} ease={[0.2, 0.9, 0.3, 1]} replayKey={replayKey} dark={dark} disabled={!!reduceMotion} />
                    <MotionRow index="02" label="Smooth" meta="320ms · ease-in-out" duration={0.7} ease={[0.65, 0, 0.35, 1]} replayKey={replayKey} dark={dark} disabled={!!reduceMotion} />
                    <MotionRow index="03" label="Drift" meta="600ms · ease-out-expo" duration={1.2} ease={[0.23, 1, 0.32, 1]} replayKey={replayKey} dark={dark} disabled={!!reduceMotion} />
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: muted }}>Respects reduced-motion — static end-state when the OS asks for it.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Export strip — three cards, nothing like panel 02 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
          <div className="ds-export-card" style={{ border: `1px solid ${dark ? "#383838" : "#e5e5e2"}`, borderRadius: 16, background: dark ? "#1d1d1f" : "#fff", padding: 18, color: dark ? "#f4f4f3" : "#171717" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>CSS variables</p>
            <p style={{ margin: "4px 0 12px", fontSize: 12, color: dark ? "#a4a4a1" : "#6f6f6b" }}>Paste into your globals. Dark mode included.</p>
            <CopyMini value={cssText} label="design tokens css" dark={dark} />
          </div>
          <div className="ds-export-card" style={{ border: `1px solid ${dark ? "#383838" : "#e5e5e2"}`, borderRadius: 16, background: dark ? "#1d1d1f" : "#fff", padding: 18, color: dark ? "#f4f4f3" : "#171717" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Tokens JSON</p>
            <p style={{ margin: "4px 0 12px", fontSize: 12, color: dark ? "#a4a4a1" : "#6f6f6b" }}>Import back into the builder any time.</p>
            <CopyMini value={jsonText} label="design tokens json" dark={dark} />
          </div>
          <Link
            href="/design-system"
            onClick={() => posthog.capture("design_system_specimen_docs_opened")}
            className="ds-export-card"
            style={{ border: `1px solid ${dark ? "#383838" : "#e5e5e2"}`, borderRadius: 16, background: dark ? "#1d1d1f" : "#fff", padding: 18, textDecoration: "none", display: "block" }}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 13, fontWeight: 700, color: dark ? "#f4f4f3" : "#171717" }}>
              Full builder <ArrowUpRight size={15} aria-hidden="true" />
            </span>
            <span style={{ display: "block", marginTop: 4, fontSize: 12, color: dark ? "#a4a4a1" : "#6f6f6b" }}>
              Foundations, themes, validation, PDF handbook.
            </span>
          </Link>
        </div>
      </section>
    </LandingContent>
  );
}
