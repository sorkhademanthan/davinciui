import type { Metadata } from "next";
import Link from "next/link";
import { DocsSnippet } from "@/components/docs-snippet";
import { Section } from "@/components/component-layout";

export const metadata: Metadata = {
  title: "CLI — DavinciUI",
  description:
    "Use the shadcn CLI to add DavinciUI components to your project.",
};

export default function CliPage() {
  return (
    <div className="w-full max-w-[648px] py-6 md:py-8 lg:px-0 lg:py-10">
      <div className="space-y-4">
        <p className="docs-eyebrow">Docs</p>
        <h1 className="text-[36px] font-medium leading-[1.15] tracking-tight">
          CLI
        </h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          DavinciUI has no installer of its own — it uses the{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            shadcn
          </code>{" "}
          CLI. Three commands cover the whole workflow:{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">init</code> sets
          up your project, <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">add</code> installs
          components, and <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">view</code> /{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">search</code> let
          you inspect the registry first.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <Section title="init" id="init">
          <p className="text-sm leading-6 text-muted-foreground">
            Initializes config and dependencies in the current project. Run once
            per project:
          </p>
          <DocsSnippet code={`pnpm dlx shadcn@latest init`} />
          <p className="text-sm leading-6 text-muted-foreground">
            What changes: writes{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code> at
            the project root, adds the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">cn()</code> utility,
            and wires the CSS variables setup. Then add the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@davinciui</code> registry
            block as described in{" "}
            <Link href="/docs/installation" className="underline underline-offset-4">
              Installation
            </Link>.
          </p>
        </Section>

        <Section title="add" id="add">
          <p className="text-sm leading-6 text-muted-foreground">
            Copies a registry component into your project:
          </p>
          <DocsSnippet
            code={`pnpm dlx shadcn@latest add @davinciui/text-morph`}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            What changes: the component file lands under your{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">aliases.ui</code>{" "}
            directory (default{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@/components/ui</code>),
            and its npm dependencies are installed. Re-running with{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">--overwrite</code> replaces
            local files with the current registry version:
          </p>
          <DocsSnippet
            code={`pnpm dlx shadcn@latest add @davinciui/scroll-media-expand --overwrite`}
          />
        </Section>

        <Section title="Package-manager equivalents" id="package-managers">
          <p className="text-sm leading-6 text-muted-foreground">
            The same commands through npm, yarn, or bun:
          </p>
          <DocsSnippet
            code={`# init
npx shadcn@latest init
yarn dlx shadcn@latest init
bunx --bun shadcn@latest init

# add
npx shadcn@latest add @davinciui/text-morph
yarn dlx shadcn@latest add @davinciui/text-morph
bunx --bun shadcn@latest add @davinciui/text-morph`}
          />
        </Section>

        <Section title="view and search" id="view-and-search">
          <p className="text-sm leading-6 text-muted-foreground">
            Inspect a component&apos;s source or find candidates before installing:
          </p>
          <DocsSnippet
            code={`pnpm dlx shadcn@latest view @davinciui/text-morph
pnpm dlx shadcn@latest search @davinciui --query "text"`}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            What changes: nothing — both are read-only. Useful for reviewing a
            component&apos;s dependencies and file list before it touches your repo.
          </p>
        </Section>

        <Section title="Common command workflows" id="workflows">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li><strong className="font-medium text-foreground">First install:</strong> <code className="font-mono">init</code> → add the registry block → <code className="font-mono">add @davinciui/…</code> → render and verify (full path in <Link href="/docs/installation" className="underline underline-offset-4">Installation</Link>).</li>
            <li><strong className="font-medium text-foreground">Evaluate before committing:</strong> <code className="font-mono">search</code> for candidates → <code className="font-mono">view</code> the shortlist → <code className="font-mono">add</code> the winner.</li>
            <li><strong className="font-medium text-foreground">Pick up registry updates:</strong> re-run <code className="font-mono">add</code> with <code className="font-mono">--overwrite</code>. Installed files never update on their own.</li>
          </ul>
        </Section>

        <Section title="Options" id="options">
          <div className="rounded-lg border">
            <div className="divide-y text-sm">
              <div className="flex gap-4 p-3">
                <code className="shrink-0 font-mono text-xs">
                  -o, --overwrite
                </code>
                <span className="text-muted-foreground">
                  Overwrite existing files
                </span>
              </div>
              <div className="flex gap-4 p-3">
                <code className="shrink-0 font-mono text-xs">-y, --yes</code>
                <span className="text-muted-foreground">Skip confirmation</span>
              </div>
              <div className="flex gap-4 p-3">
                <code className="shrink-0 font-mono text-xs">-p, --path</code>
                <span className="text-muted-foreground">
                  Custom install path
                </span>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Failure recovery and troubleshooting" id="troubleshooting">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li><strong className="font-medium text-foreground">Unknown registry or 404:</strong> the <code className="font-mono">@davinciui</code> entry in <code className="font-mono">components.json</code> is missing or wrong — compare with <Link href="/docs/configuration" className="underline underline-offset-4">Configuration</Link>.</li>
            <li><strong className="font-medium text-foreground">Files land in the wrong folder:</strong> aliases in <code className="font-mono">components.json</code> disagree with <code className="font-mono">tsconfig.json</code> paths. Fix both, or pass <code className="font-mono">-p</code> for a one-off override.</li>
            <li><strong className="font-medium text-foreground">Half-installed component:</strong> delete the partially written files and re-run <code className="font-mono">add</code> — installs are file copies, so retrying is safe.</li>
            <li><strong className="font-medium text-foreground">Local edits lost after --overwrite:</strong> expected — overwrite replaces files. Commit before updating, then re-apply customizations.</li>
          </ul>
          <p className="text-sm leading-6 text-muted-foreground">
            Full CLI reference:{" "}
            <a
              href="https://ui.shadcn.com/docs/cli"
              className="underline underline-offset-4"
            >
              ui.shadcn.com/docs/cli
            </a>
            . For the distribution model behind these commands, see{" "}
            <Link href="/docs/registry" className="underline underline-offset-4">Registry</Link>{" "}
            and to browse what to install,{" "}
            <Link href="/docs/components" className="underline underline-offset-4">Components</Link>.
          </p>
        </Section>
      </div>
    </div>
  );
}
