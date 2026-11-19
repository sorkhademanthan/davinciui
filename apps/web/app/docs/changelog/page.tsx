import type { Metadata } from "next"
import Link from "next/link"
import { DocsSnippet } from "@/components/docs-snippet"
import { Section, InfoBox } from "@/components/component-layout"

export const metadata: Metadata = {
  title: "Changelog — DavinciUI",
  description:
    "Latest updates and announcements from DavinciUI. New components, agent skills, docs, and distribution improvements.",
}

const ARCHIVE = [
  { date: "October 2026", title: "Docs refresh", desc: "Rewritten installation, theming, CLI, and configuration guides, new docs shell with sidebar navigation, and per-route OG images." },
  { date: "October 2026", title: "Registry index and llms.txt", desc: "Machine-readable catalog at /r/registry.json and a plain-text index at /llms.txt so assistants can browse the whole library." },
  { date: "October 2026", title: "MCP server docs", desc: "Setup guide for connecting the registry to AI coding assistants through the shadcn MCP server." },
  { date: "October 2026", title: "Typeset guide", desc: "The DavinciUI type scale documented as a specimen page: headings, body, code, and usage rules." },
  { date: "October 2026", title: "Site foundations", desc: "Analytics instrumentation, cookie consent, legal pages, command menu, and branded 404." },
  { date: "September 2026", title: "Forms and overlays", desc: "date-picker, input-group, input-otp, native-select, alert-dialog, dropdown-menu, context-menu, and hover-card." },
  { date: "September 2026", title: "Premium scroll galleries", desc: "cms-scroll-gallery, interactive-media-accordion, scroll-reveal-image, stacked-scroll-gallery, scroll-sync-gallery, scroll-media-expand, and scroll-timeline." },
  { date: "September 2026", title: "Visual effects wave", desc: "pixel-wipe-carousel, segmented-image-carousel, burn-plus, cinematic-card-carousel, vertical-image-marquee, hover-cards, profile-carousel, and services-showcase." },
] as const

export default function ChangelogPage() {
  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Changelog</h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Latest updates and announcements. New components, skills, and docs —
          newest first, with install commands where they matter.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <InfoBox type="info">
          Installed components are copied source, so nothing auto-updates.
          Re-run{" "}
          <code className="font-mono">shadcn add @davinciui/… --overwrite</code>{" "}
          to pick up a newer version — commit your customizations first.
          Authoritative release notes live on{" "}
          <a
            href="https://github.com/sorkhademanthan/davinciui/releases"
            className="underline underline-offset-4"
          >
            GitHub releases
          </a>
          .
        </InfoBox>

        <Section title="November 2026 — Preloader Pro V4" id="november-2026-editorial-card-arc-preloader">
          <p className="text-sm leading-6 text-muted-foreground">
            Preloader Pro V4 is a seven-card editorial sequence: portrait stills
            rise from the lower edge, collapse into a centred pile, then fan
            into a shallow arc while the counter climbs to 100. The centre card
            lifts and expands into a full-bleed 16:9 image before the overlay
            fades or slides away. The whole sequence runs on one deterministic
            requestAnimationFrame timeline with replay and seek handles,
            reduced-motion fallback, page-load mode, responsive light/dark
            palettes, scroll locking, and an optional once-per-session guard.
          </p>
          <DocsSnippet
            code={`pnpm dlx shadcn@latest add @davinciui/editorial-card-arc-preloader`}
          />
        </Section>

        <Section title="November 2026 — Preloader Pro V1 refinement" id="november-2026-glitch-shred-preloader">
          <p className="text-sm leading-6 text-muted-foreground">
            Preloader Pro V1 now matches the reference composition more
            closely: the counter keeps its full glyph height and baseline, the
            exit reveals the page on a continuous coverage curve instead of
            stalling, glitch bursts run on a deterministic schedule with a
            counter-only pre-exit hit, and the fullscreen stage plus gallery
            card fill their surfaces without clipping. It now follows the site
            light/dark theme, opens the shred with seeded glitch bars, and
            exposes <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">onExitStart</code>{" "}
            so underlying content can enter while the overlay breaks apart. The
            component also exposes a seek clock used by its new Playwright
            regression suite.
          </p>
          <DocsSnippet
            code={`pnpm dlx shadcn@latest add @davinciui/glitch-shred-preloader`}
          />
        </Section>

        <Section title="October 2026 — Agent skill" id="october-2026-skill">
          <p className="text-sm leading-6 text-muted-foreground">
            Your AI assistant can now learn DavinciUI. The{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">davinciui</code>{" "}
            skill teaches agents your project&apos;s aliases, the{" "}
            <code className="font-mono">@davinciui</code> namespace, install and
            theming rules, and a map of all 80+ components — so you describe the
            outcome in plain words and it installs the right pieces. Read the{" "}
            <Link href="/docs/skills" className="underline underline-offset-4">
              Skills guide
            </Link>
            , then install it:
          </p>
          <DocsSnippet
            code={`npx skills add https://github.com/sorkhademanthan/davinciui --skill davinciui`}
          />
        </Section>

        <Section title="September 2026 — Cursor effects" id="september-2026-cursors">
          <p className="text-sm leading-6 text-muted-foreground">
            Eight custom cursors in one drop — spring-driven followers, RGB
            trails, lightning, fluid, and geometric variants. All disable
            themselves on touch devices and never block interaction:
          </p>
          <DocsSnippet
            code={`pnpm dlx shadcn@latest add @davinciui/magic-cursor-pro`}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            Browse the full set in{" "}
            <Link
              href="/docs/components#cursor-effects"
              className="underline underline-offset-4"
            >
              Components → Cursor Effects
            </Link>
            .
          </p>
        </Section>

        <Section title="September 2026 — Preloaders and sound" id="september-2026-preloaders-sound">
          <p className="text-sm leading-6 text-muted-foreground">
            Two brand-new categories. Six preloaders — fill, staircase, pixel,
            editorial wipe, geometric, and a pro variant — plus five sound
            utilities including an ambient toggle, interaction kit, and voice
            recorder:
          </p>
          <DocsSnippet
            code={`pnpm dlx shadcn@latest add @davinciui/cinematic-panel-preloader
pnpm dlx shadcn@latest add @davinciui/ambient-audio-toggle`}
          />
        </Section>

        <Section title="September 2026 — Text animation wave" id="september-2026-text">
          <p className="text-sm leading-6 text-muted-foreground">
            Twelve text animations landed together: particle fields, morphing
            words, encrypted reveals, glitch-liquid, shader text, video masks,
            and rolling tickers. Start with the signature piece:
          </p>
          <DocsSnippet
            code={`pnpm dlx shadcn@latest add @davinciui/text-morph`}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            See them all under{" "}
            <Link
              href="/docs/components#text-animations"
              className="underline underline-offset-4"
            >
              Components → Text Animations
            </Link>
            .
          </p>
        </Section>

        <Section title="September 2026 — Hero backgrounds" id="september-2026-heroes">
          <p className="text-sm leading-6 text-muted-foreground">
            The hero collection grew to nine: ink flow, soft fluid gradients,
            neon mesh, spectra noise, sunlight, character fields, and pixel
            flow join the original silk aurora and liquid chrome:
          </p>
          <DocsSnippet
            code={`pnpm dlx shadcn@latest add @davinciui/ink-flow`}
          />
        </Section>

        <Section title="August 2026 — First components" id="august-2026-first">
          <p className="text-sm leading-6 text-muted-foreground">
            The registry opened with its first four pieces — text-morph,
            hover-transition, lens-drift-grid, and orbit-spiral-gallery —
            establishing the copy-paste distribution model under the{" "}
            <code className="font-mono">@davinciui</code> namespace. See{" "}
            <Link href="/docs/registry" className="underline underline-offset-4">
              Registry
            </Link>{" "}
            for how installs work.
          </p>
        </Section>

        <Section title="June 2026 — Registry begins" id="june-2026-beginnings">
          <p className="text-sm leading-6 text-muted-foreground">
            The first two hero backgrounds — silk-aurora and liquid-chrome —
            proved the concept: animated WebGL pieces delivered as registry JSON
            instead of an npm package.
          </p>
        </Section>

        <Section title="More updates" id="more-updates">
          <div className="divide-y rounded-lg border">
            {ARCHIVE.map((item) => (
              <div key={`${item.date}-${item.title}`} className="flex gap-4 p-3 text-sm">
                <span className="w-28 shrink-0 font-mono text-xs leading-6 text-muted-foreground">
                  {item.date}
                </span>
                <span className="leading-6 text-muted-foreground">
                  <strong className="font-medium text-foreground">{item.title}</strong>
                  {" — "}
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            For the current catalog, see{" "}
            <Link href="/docs/components" className="underline underline-offset-4">
              Components
            </Link>{" "}
            — it is generated from the registry, so it never goes stale.
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
