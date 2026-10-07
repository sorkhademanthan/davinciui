import type { Metadata } from "next"
import Link from "next/link"
import { Section } from "@/components/component-layout"

export const metadata: Metadata = {
  title: "Changelog — DavinciUI",
  description: "Latest updates to DavinciUI.",
}

export default function ChangelogPage() {
  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Changelog</h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          What changed in the registry and docs, and how to follow future
          releases. Entries below reflect the repository&apos;s commit history —
          not a marketing timeline.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <Section title="How to follow releases" id="how-to-follow-releases">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              GitHub releases:{" "}
              <a
                href="https://github.com/sorkhademanthan/davinciui/releases"
                className="underline underline-offset-4"
              >
                sorkhademanthan/davinciui releases
              </a>{" "}
              — the authoritative source for versioned notes.
            </li>
            <li>
              Commit history (<code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">git log</code>) records
              every registry addition and docs change.
            </li>
            <li>
              Because installed components are copied source, nothing auto-updates:
              re-run <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">shadcn add … --overwrite</code> to
              pick up a newer version of something you already installed.
            </li>
          </ul>
        </Section>

        <Section title="Recent registry additions" id="recent-additions">
          <p className="text-sm leading-6 text-muted-foreground">
            Per commit history, recent registry work added:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Form and feedback pieces: textarea, toggle, switch, label, skeleton, spinner.</li>
            <li>Layout and navigation: sidebar, aspect-ratio, button-group, carousel, pagination, link.</li>
            <li>Interactive and motion pieces: testimonial-marquee, spotlight-card, scrub-input, lens-drift-grid, hyper-text.</li>
            <li>Docs and distribution: registry index, CLI registry wiring, docs shell and component pages.</li>
          </ul>
          <p className="text-sm leading-6 text-muted-foreground">
            For the current catalog, see{" "}
            <Link href="/docs/components" className="underline underline-offset-4">Components</Link> — it is
            generated from the registry, so it never goes stale.
          </p>
        </Section>

        <Section title="Migration notes" id="migration-notes">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Re-installing with <code className="font-mono">--overwrite</code> replaces local files. Commit your customizations first.</li>
            <li>If a component&apos;s dependencies changed upstream, the installer adds the new packages on re-install — restart the dev server afterwards.</li>
            <li>No breaking-change policy is published yet. When one lands, it will be linked here with per-component upgrade steps.</li>
          </ul>
        </Section>
      </div>
    </div>
  )
}
