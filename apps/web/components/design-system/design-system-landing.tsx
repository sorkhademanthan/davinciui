"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  FolderOpen,
  Layers3,
  Moon,
  Plus,
  Sun,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { DesignSystemConfig } from "@/lib/design-system/domain";
import { browserDesignSystems } from "@/lib/design-system/repository";

export function DesignSystemLanding() {
  const [systems, setSystems] = useState<DesignSystemConfig[]>([]);

  useEffect(() => setSystems(browserDesignSystems.list()), []);

  const duplicate = (system: DesignSystemConfig) => {
    const copy = structuredClone(system);
    copy.id = `${system.id}-copy-${crypto.randomUUID().slice(0, 4)}`;
    copy.meta.name = `${system.meta.name} copy`;
    browserDesignSystems.save(copy);
    setSystems(browserDesignSystems.list());
  };

  const remove = (id: string) => {
    if (!window.confirm("Delete this design system from this browser?")) return;
    browserDesignSystems.remove(id);
    setSystems(browserDesignSystems.list());
  };

  return (
    <main className="min-h-[calc(100svh-3.5rem)] min-w-0 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
      <div className="w-full">
        <header>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            <Link
              href="/"
              className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Home
            </Link>
            <ChevronRight aria-hidden="true" className="size-3.5" />
            <span className="text-foreground">Design System</span>
          </nav>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Design systems
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Define the foundations, tokens, and themes behind your product.
              </p>
            </div>
            {systems.length > 0 && (
              <Link
                href="/design-system/new"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Plus aria-hidden="true" className="size-4" />
                New system
              </Link>
            )}
          </div>
        </header>

        {systems.length > 0 ? (
          <SystemsSection
            systems={systems}
            duplicate={duplicate}
            remove={remove}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </main>
  );
}

const onboardingSteps = [
  {
    n: "01",
    title: "Pick a starter",
    text: "SaaS, enterprise, editorial — tuned foundations, not a blank canvas.",
  },
  {
    n: "02",
    title: "Add your brand",
    text: "Name, color, and type. Enough to make it unmistakably yours.",
  },
  {
    n: "03",
    title: "Refine in the builder",
    text: "Tune colors, type, spacing, and themes with live preview.",
  },
] as const;

function EmptyState() {
  return (
    <section
      className="mt-6 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      aria-labelledby="start-heading"
    >
      <div className="grid lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
        {/* Onboarding copy */}
        <div className="relative flex flex-col justify-center overflow-hidden p-6 sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-gradient-to-br from-foreground/[0.07] to-transparent blur-2xl"
          />
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Get started in ~60 seconds
          </p>
          <h2
            id="start-heading"
            className="mt-4 max-w-md text-balance text-2xl font-semibold leading-[1.1] tracking-[-0.04em] sm:text-[2rem]"
          >
            Create your first design system
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-[15px]">
            Choose a starter, add your brand, and refine each foundation in the
            workspace. Everything saves locally — export when you&apos;re ready.
          </p>

          <ol className="mt-7 space-y-0 border-t border-border">
            {onboardingSteps.map((s) => (
              <li
                key={s.n}
                className="group flex gap-4 border-b border-border py-3.5"
              >
                <span className="font-mono text-[11px] font-medium leading-6 text-muted-foreground">
                  {s.n}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-6">{s.title}</p>
                  <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
                    {s.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/design-system/new"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-all hover:bg-foreground/85 hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Create design system
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <p className="text-xs leading-5 text-muted-foreground">
              Free · Stored in this browser ·
              <span className="text-foreground"> No sign-up needed</span>
            </p>
          </div>
        </div>

        <FoundationWorkbench />
      </div>
    </section>
  );
}

const accentOptions = [
  { name: "Indigo", color: "#5265db", soft: "#e9ecff", darkSoft: "#202b58" },
  { name: "Teal", color: "#087f70", soft: "#def5ee", darkSoft: "#123b36" },
  { name: "Coral", color: "#bd4e42", soft: "#ffebe8", darkSoft: "#4b2827" },
  { name: "Slate", color: "#48546b", soft: "#e8ecf2", darkSoft: "#303949" },
] as const;

function FoundationWorkbench() {
  const [accentIndex, setAccentIndex] = useState(0);
  const [previewDark, setPreviewDark] = useState(false);
  const accent = accentOptions[accentIndex]!;

  useEffect(
    () => setPreviewDark(document.documentElement.classList.contains("dark")),
    [],
  );

  return (
    <div className="relative min-w-0 border-t border-border bg-zinc-50/80 p-4 dark:bg-[#111115] sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="text-sm font-medium leading-5">Live theme preview</p>
            <p className="text-xs leading-5 text-muted-foreground">
              Every choice updates the whole interface.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Preview accent color"
            className="flex items-center gap-0.5 rounded-full border border-border bg-background p-1"
          >
            {accentOptions.map((option, index) => (
              <button
                type="button"
                key={option.name}
                title={option.name}
                aria-label={`${option.name} accent`}
                aria-pressed={accentIndex === index}
                onClick={() => setAccentIndex(index)}
                className={`grid size-8 place-items-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  accentIndex === index
                    ? "bg-muted ring-1 ring-foreground/30"
                    : "hover:bg-muted"
                }`}
              >
                <span
                  className="size-5 rounded-full ring-1 ring-black/10 dark:ring-white/20"
                  style={{ backgroundColor: option.color }}
                />
              </button>
            ))}
          </div>
          <div
            role="group"
            aria-label="Preview appearance"
            className="flex rounded-full border border-border bg-background p-1"
          >
            <button
              type="button"
              aria-label="Light preview"
              aria-pressed={!previewDark}
              onClick={() => setPreviewDark(false)}
              className={`grid size-8 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                !previewDark
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun aria-hidden="true" className="size-3.5" />
            </button>
            <button
              type="button"
              aria-label="Dark preview"
              aria-pressed={previewDark}
              onClick={() => setPreviewDark(true)}
              className={`grid size-8 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                previewDark
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Browser preview */}
      <div
        className={`mt-4 overflow-hidden rounded-xl border shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] transition-colors duration-300 ${
          previewDark
            ? "border-white/10 bg-[#17191e] text-white"
            : "border-zinc-200 bg-white text-zinc-900"
        }`}
      >
        {/* Window chrome */}
        <div
          className={`flex items-center gap-2 border-b px-4 py-2.5 ${
            previewDark ? "border-white/10" : "border-zinc-100"
          }`}
        >
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="size-2.5 rounded-full bg-[#ff5f57]" />
            <i className="size-2.5 rounded-full bg-[#febc2e]" />
            <i className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span
            className={`mx-auto hidden items-center gap-2 rounded-md px-3 py-1 font-mono text-[11px] sm:flex ${
              previewDark
                ? "bg-white/[0.06] text-zinc-400"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            northstar.design/overview
          </span>
          <span className="w-10" />
        </div>

        {/* App bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span
              className="grid size-8 place-items-center rounded-lg text-white transition-colors duration-300"
              style={{ backgroundColor: accent.color }}
            >
              <Layers3 aria-hidden="true" className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Northstar
            </span>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              previewDark
                ? "bg-white/10 text-zinc-300"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            Interface preview
          </span>
        </div>

        {/* Overview body */}
        <div className="grid gap-4 px-4 pb-4 sm:grid-cols-[minmax(0,1fr)_minmax(190px,0.6fr)] sm:px-5 sm:pb-5">
          <div
            className={`rounded-lg border p-4 transition-colors ${
              previewDark
                ? "border-white/[0.08] bg-white/[0.02]"
                : "border-zinc-100 bg-zinc-50/60"
            }`}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-300"
              style={{
                backgroundColor: previewDark ? accent.darkSoft : accent.soft,
                color: previewDark ? "#f7f8ff" : accent.color,
              }}
            >
              <Check aria-hidden="true" className="size-3" />
              Workspace
            </span>
            <p className="mt-3 text-[1.65rem] font-semibold leading-[1.1] tracking-[-0.045em]">
              Project overview
            </p>
            <p
              className={`mt-1.5 max-w-xs text-[13px] leading-5 ${
                previewDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              A clear view of current work and what comes next — styled by your
              tokens.
            </p>

            {/* Stats */}
            <div
              className={`mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center ${
                previewDark ? "border-white/10" : "border-zinc-200/70"
              }`}
            >
              {[
                ["12", "Active"],
                ["98%", "Synced"],
                ["4", "Themes"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-sm font-semibold tabular-nums">{v}</p>
                  <p
                    className={`text-[11px] ${
                      previewDark ? "text-zinc-500" : "text-zinc-500"
                    }`}
                  >
                    {l}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mt-3 flex flex-wrap gap-2"
              aria-label="Example component styles"
            >
              <span
                className="inline-flex h-9 items-center rounded-lg px-3.5 text-xs font-semibold text-white shadow-sm transition-colors duration-300"
                style={{ backgroundColor: accent.color }}
              >
                New project
              </span>
              <span
                className={`inline-flex h-9 items-center rounded-lg border px-3.5 text-xs font-semibold transition-colors ${
                  previewDark
                    ? "border-white/20 hover:bg-white/5"
                    : "border-zinc-300 hover:bg-zinc-100"
                }`}
              >
                View activity
              </span>
            </div>
          </div>

          {/* Tokens card */}
          <div
            className={`flex flex-col rounded-lg border p-3.5 ${
              previewDark
                ? "border-white/10 bg-[#1e2027]"
                : "border-zinc-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-medium ${
                  previewDark ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                Semantic roles
              </span>
              <span
                className="size-2 rounded-full transition-colors duration-300"
                style={{ backgroundColor: accent.color }}
              />
            </div>
            <div className="mt-3 space-y-2 text-xs">
              {[
                {
                  label: "Accent / 500",
                  swatch: accent.color,
                  hex: accent.color,
                },
                {
                  label: "Soft surface",
                  swatch: previewDark ? accent.darkSoft : accent.soft,
                  hex: previewDark ? accent.darkSoft : accent.soft,
                },
                {
                  label: "Text primary",
                  swatch: previewDark ? "#ffffff" : "#18181b",
                  hex: previewDark ? "#FFF" : "#18181B",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between rounded-md px-2 py-1.5 ${
                    previewDark ? "bg-white/[0.04]" : "bg-zinc-50"
                  }`}
                >
                  <span
                    className={previewDark ? "text-zinc-300" : "text-zinc-600"}
                  >
                    {row.label}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase">
                    {row.hex}
                    <span
                      className="size-5 rounded-[5px] ring-1 ring-black/10 dark:ring-white/15"
                      style={{ backgroundColor: row.swatch }}
                    />
                  </span>
                </div>
              ))}
            </div>
            <div
              className={`mt-auto border-t pt-2.5 text-[11px] leading-4 ${
                previewDark
                  ? "border-white/10 text-zinc-500"
                  : "border-zinc-100 text-zinc-500"
              } mt-3`}
            >
              One token change updates every component below.
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span>Interactive — try a color or appearance above.</span>
        <span className="hidden font-mono sm:inline">
          accent: {accent.color}
        </span>
      </p>
    </div>
  );
}

function SystemsSection({
  systems,
  duplicate,
  remove,
}: {
  systems: DesignSystemConfig[];
  duplicate: (system: DesignSystemConfig) => void;
  remove: (id: string) => void;
}) {
  return (
    <section className="mt-9" aria-labelledby="systems-heading">
      <div className="flex items-end justify-between border-b border-border pb-4">
        <div>
          <h2
            id="systems-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Your systems
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stored locally in this browser.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {systems.length} total
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {systems.map((system) => (
          <article
            key={system.id}
            className="rounded-xl border border-border p-5 transition-colors hover:border-foreground/40"
          >
            <div className="flex items-start justify-between">
              <span
                className="size-9 rounded-lg border border-white/10"
                style={{ background: system.foundation.colors[0]?.base }}
              />
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Check aria-hidden="true" className="size-3 text-emerald-500" />
                Draft
              </span>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              {system.meta.brand || "DavinciUI"}
            </p>
            <h3 className="mt-1 font-medium">{system.meta.name}</h3>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
              {system.meta.description ||
                "A configurable visual language for your product."}
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
              <Link
                href={`/design-system/${system.id}/colors`}
                className="inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FolderOpen aria-hidden="true" className="size-4" />
                Open system
              </Link>
              <span className="flex gap-1">
                <button
                  type="button"
                  aria-label={`Duplicate ${system.meta.name}`}
                  onClick={() => duplicate(system)}
                  className="grid size-10 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Copy aria-hidden="true" className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${system.meta.name}`}
                  onClick={() => remove(system.id)}
                  className="grid size-10 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
