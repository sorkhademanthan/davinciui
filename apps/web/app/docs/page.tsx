import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { components } from "@/registry";

const CATEGORIES = [
  {
    title: "Text Animations",
    href: "/experience/components?tab=Text%20Animations",
    desc: "Kinetic reveals, morph and scramble.",
  },
  {
    title: "Premium Components",
    href: "/experience/components?tab=Premium%20Components",
    desc: "Polished, interactive React components.",
  },
  {
    title: "Hero Backgrounds",
    href: "/experience/components?tab=Hero%20Backgrounds",
    desc: "WebGL gradients, aurora and plasma.",
  },
  {
    title: "Visual Effects",
    href: "/experience/components?tab=Visual%20Effects",
    desc: "Ripple, trail and magnetic effects.",
  },
] as const;

const QUICK_LINKS = [
  {
    title: "Installation",
    href: "/docs/installation",
    desc: "Add to any Next.js / Vite project.",
  },
  {
    title: "Configuration",
    href: "/docs/configuration",
    desc: "The components.json file explained.",
  },
  {
    title: "Theming",
    href: "/docs/theming",
    desc: "CSS variables and dark mode.",
  },
  {
    title: "CLI",
    href: "/docs/cli",
    desc: "shadcn CLI for registry installs.",
  },
] as const;

function getCount(category: string) {
  return Object.values(components).filter((c) => c.category === category)
    .length;
}

export default function DocsPage() {
  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
      {/* Header — shadcn style: tight, typographic */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Introduction
        </h1>
        <p className="text-[15px] leading-7 text-muted-foreground">
          DavinciUI is a collection of beautifully crafted, open-code
          components. Copy, paste, customize — built with Tailwind CSS and
          Framer Motion. Works with Next.js, Vite and any React framework.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          This is not a component library you install from npm. It&apos;s how
          you build your own. You own the code.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/docs/installation"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Get Started <ArrowRight className="size-3.5" />
        </Link>
        <Link
          href="/experience/components"
          className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Browse Components
        </Link>
      </div>

      {/* Installation — single command, tab-aware via docs style */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold tracking-tight">Installation</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Use the <span className="font-mono text-foreground">shadcn</span> CLI.
          Pick a component and add it directly to your project.
        </p>
        <div className="mt-3 overflow-hidden rounded-lg border bg-zinc-950">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <Terminal className="size-3.5" /> pnpm
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              shadcn CLI
            </span>
          </div>
          <pre className="overflow-x-auto p-4 text-sm">
            <code className="font-mono">
              <span className="text-violet-400">pnpm</span>{" "}
              <span className="text-zinc-100">
                dlx shadcn@latest add @davinciui/text-morph
              </span>
            </code>
          </pre>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Replace{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            text-morph
          </code>{" "}
          with any component slug. See{" "}
          <Link href="/docs/cli" className="underline underline-offset-4">
            CLI docs
          </Link>
          .
        </p>
      </div>

      {/* Principles — 3 compact points, no gradients */}
      <div className="mt-10 grid gap-6 border-y py-8 sm:grid-cols-3">
        <div>
          <h3 className="text-sm font-medium">Open Code</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Actual component code in your repo. Edit anything.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Composable</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Consistent API. Predictable props, predictable motion.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Beautiful defaults</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Minimal, modern styling that works out of the box.
          </p>
        </div>
      </div>

      {/* Browse categories — shadcn component grid style */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Browse</h2>
          <Link
            href="/experience/components"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
      </div>

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold tracking-tight">Get Started</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => (
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
      </div>

      {/* Foundations — muted, below the fold like shadcn */}
      <div className="mt-10 rounded-lg border border-dashed bg-muted/30 p-4">
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

      <p className="mt-8 text-xs text-muted-foreground">
        Press{" "}
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
          ⌘K
        </kbd>{" "}
        to search anything.
      </p>
    </div>
  );
}
