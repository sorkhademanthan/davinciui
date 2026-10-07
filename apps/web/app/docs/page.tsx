import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { components } from "@/registry";
import { DocsSnippet } from "@/components/docs-snippet";
import { Section, InfoBox } from "@/components/component-layout";

const CATEGORIES = [
  {
    title: "Text Animations",
    href: "/docs/components#text-animations",
    desc: "Kinetic reveals, morph and scramble.",
  },
  {
    title: "Premium Components",
    href: "/docs/components#premium-components",
    desc: "Polished, interactive React components.",
  },
  {
    title: "Hero Backgrounds",
    href: "/docs/components#hero-backgrounds",
    desc: "WebGL gradients, aurora and plasma.",
  },
  {
    title: "Visual Effects",
    href: "/docs/components#visual-effects",
    desc: "Ripple, trail and magnetic effects.",
  },
] as const;

const PATHS = [
  {
    title: "Install your first component",
    href: "/docs/installation",
    desc: "Prerequisites, shadcn setup, and your first add command.",
  },
  {
    title: "Browse components",
    href: "/docs/components",
    desc: "Previews, install commands, source, props, and examples.",
  },
  {
    title: "Configure the registry",
    href: "/docs/configuration",
    desc: "components.json aliases and the @davinciui namespace.",
  },
  {
    title: "Customize theme and tokens",
    href: "/docs/theming",
    desc: "CSS variables, dark mode, and safe customization.",
  },
] as const;

function getCount(category: string) {
  return Object.values(components).filter((c) => c.category === category)
    .length;
}

export default function DocsPage() {
  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Introduction
        </h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          DavinciUI is a collection of animated React components you add to
          your own codebase. There is no runtime package to install and no
          version to upgrade — the shadcn CLI copies component source into
          your project, and from that point the code is yours to read, edit,
          and maintain.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/docs/installation"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Get Started <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/docs/components"
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Browse Components
          </Link>
        </div>
      </div>

      <div className="mt-10 space-y-10">
        <Section title="What DavinciUI is" id="what-is-davinciui">
          <p className="text-sm leading-6 text-muted-foreground">
            DavinciUI follows the shadcn open-code model: instead of shipping a
            JavaScript bundle, it ships readable component source. You pick a
            component, the CLI writes its files into{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@/components/ui</code>,
            and you import it like any file you wrote yourself.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">Stack:</strong> React 19,
              Tailwind CSS v4, Framer Motion for animated components, and the shadcn
              CLI for installs.
            </li>
            <li>
              <strong className="font-medium text-foreground">Who it is for:</strong> developers
              building marketing sites, dashboards, or product UI who want polished
              motion without adopting a heavyweight component framework.
            </li>
            <li>
              <strong className="font-medium text-foreground">What you own:</strong> the
              full source of every component you add, its styles, and its behavior —
              including the right to modify or delete anything.
            </li>
          </ul>
          <p className="text-sm leading-6 text-muted-foreground">
            If you are new to this model, read{" "}
            <Link href="/docs/registry" className="underline underline-offset-4">
              how the registry works
            </Link>{" "}
            before installing.
          </p>
        </Section>

        <Section title="Quick start" id="quick-start">
          <p className="text-sm leading-6 text-muted-foreground">
            From an existing React project with shadcn initialized, one command
            adds a component:
          </p>
          <DocsSnippet code={`pnpm dlx shadcn@latest add @davinciui/text-morph`} />
          <p className="text-sm leading-6 text-muted-foreground">
            Then render it from where the CLI placed it:
          </p>
          <DocsSnippet
            code={`import { TextMorph } from "@/components/ui/text-morph"

export default function Page() {
  return <TextMorph words={["Design", "Animate", "Delight"]} />
}`}
          />
          <InfoBox type="tip">
            First time here? Start with{" "}
            <Link href="/docs/installation" className="underline underline-offset-4">
              Installation
            </Link>{" "}
            for prerequisites, and{" "}
            <Link href="/docs/configuration" className="underline underline-offset-4">
              Configuration
            </Link>{" "}
            for aliases and registry setup.
          </InfoBox>
        </Section>

        <Section title="How it works" id="how-it-works">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">Registry:</strong> every
              component is a JSON item at{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">davinciui.com/r/[name].json</code>{" "}
              describing its files and npm dependencies.
            </li>
            <li>
              <strong className="font-medium text-foreground">Install:</strong> the CLI
              resolves <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@davinciui/[slug]</code>,
              downloads the files, and writes them into your repo.
            </li>
            <li>
              <strong className="font-medium text-foreground">Ownership:</strong> installed
              files are plain project files. They do not update automatically and do
              not phone home — re-run the add command to pick up a newer version.
            </li>
          </ul>
          <p className="text-sm leading-6 text-muted-foreground">
            This is the key difference from a traditional package: installing a
            component is a one-time copy, not an ongoing dependency. Your bundle
            includes only the code you added, and debugging means reading your own
            files.
          </p>
        </Section>

        <Section title="Choose a path" id="choose-a-path">
          <div className="grid gap-3 sm:grid-cols-2">
            {PATHS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <span className="text-sm font-medium">{link.title}</span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {link.desc}
                </span>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Documentation map" id="documentation-map">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              <Link href="/docs/installation" className="underline underline-offset-4">Getting Started</Link>{" "}
              — install, configure, theme, and drive the CLI.
            </li>
            <li>
              <Link href="/docs/components" className="underline underline-offset-4">Components</Link>{" "}
              — the catalog: previews, install commands, source, and props per component.
            </li>
            <li>
              <Link href="/docs/foundations/colors" className="underline underline-offset-4">Foundations</Link>{" "}
              — colors, typography, spacing, radius, shadows, motion, and the other
              design tokens components are built on.
            </li>
            <li>
              <Link href="/docs/registry" className="underline underline-offset-4">Registry</Link>{" "}
              — the distribution model: items, namespaces, updates, and troubleshooting.
            </li>
            <li>
              <Link href="/docs/skills" className="underline underline-offset-4">Skills</Link>{" "}
              — teach your AI assistant DavinciUI so it installs and composes components for you.
            </li>
            <li>
              <Link href="/docs/mcp" className="underline underline-offset-4">MCP</Link>{" "}
              — connect the registry to your AI coding assistant.
            </li>
          </ul>
        </Section>

        <Section title="Browse" id="browse">
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((cat) => {
              const count = getCount(cat.title);
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium group-hover:underline underline-offset-4">
                      {cat.title}
                    </h3>
                    <span className="shrink-0 rounded-full border bg-background px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                      {count}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {cat.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </Section>

        <div className="rounded-lg border border-dashed bg-muted/30 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium">Foundations</span>
            <span className="text-muted-foreground">—</span>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["Colors", "/docs/foundations/colors"],
                  ["Typography", "/docs/foundations/typography"],
                  ["Spacing", "/docs/foundations/spacing"],
                  ["Motion", "/docs/foundations/motion"],
                ] as const
              ).map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-full border bg-background px-2.5 py-1 text-xs hover:bg-accent"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Press{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
            ⌘K
          </kbd>{" "}
          to search anything.
        </p>
      </div>
    </div>
  );
}
