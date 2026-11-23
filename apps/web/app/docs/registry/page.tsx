import type { Metadata } from "next";
import Link from "next/link";
import { DocsSnippet } from "@/components/docs-snippet";
import { Section } from "@/components/component-layout";

export const metadata: Metadata = {
  title: "Registry — DavinciUI",
  description:
    "How the DavinciUI registry works. Browse registry.json, install any item with the shadcn CLI, and pin the @davinciui namespace.",
};

export default function RegistryPage() {
  return (
    <div className="w-full max-w-[648px] py-6 md:py-8 lg:px-0 lg:py-10">
      <div className="space-y-4">
        <p className="docs-eyebrow">Docs</p>
        <h1 className="text-[36px] font-medium leading-[1.15] tracking-tight">
          Registry
        </h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Every DavinciUI component ships as a registry item — a JSON file the{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            shadcn
          </code>{" "}
          CLI resolves, downloads, and copies into your project. No npm
          package, no version lock. You own the code.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <Section title="What the registry contains" id="what-the-registry-contains">
          <p className="text-sm leading-6 text-muted-foreground">
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              registry.json
            </code>{" "}
            lists every available item with its name, files, and dependencies:
          </p>
          <DocsSnippet variant="muted" code={`https://davinciui.com/r/registry.json`} />
          <p className="text-sm leading-6 text-muted-foreground">
            Each item also has its own file at{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              /r/[name].json
            </code>{" "}
            — e.g.{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              /r/text-morph.json
            </code>
            . An item declares the component source files to copy, the npm
            packages they need (for example{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">framer-motion</code> or{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">lucide-react</code>),
            and a description. Nothing executes on DavinciUI&apos;s servers — the
            JSON only describes what to copy.
          </p>
        </Section>

        <Section title="How the CLI resolves a registry item" id="how-resolution-works">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>You run <code className="font-mono">pnpm dlx shadcn@latest add @davinciui/text-morph</code>.</li>
            <li>The CLI reads the <code className="font-mono">@davinciui</code> entry in your <code className="font-mono">components.json</code> and expands <code className="font-mono">{"{name}"}</code> to <code className="font-mono">text-morph</code>.</li>
            <li>It downloads <code className="font-mono">https://davinciui.com/r/text-morph.json</code>, copies the listed files into your aliased directories, and installs the listed dependencies.</li>
          </ul>
          <p className="text-sm leading-6 text-muted-foreground">
            Resolution is per-install and network-dependent: the CLI fetches the
            item JSON at install time, so an offline machine cannot add new components
            (already-installed files keep working).
          </p>
        </Section>

        <Section title="Registry namespace configuration" id="namespace-configuration">
          <p className="text-sm leading-6 text-muted-foreground">
            The namespace scopes third-party registries so names never clash
            with your local components or other registries. Add it to{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              components.json
            </code>{" "}
            (see{" "}
            <Link
              href="/docs/configuration"
              className="underline underline-offset-4"
            >
              Configuration
            </Link>
            ):
          </p>
          <DocsSnippet
            variant="muted"
            code={`{
  "registries": {
    "@davinciui": "https://davinciui.com/r/{name}.json"
  }
}`}
          />
        </Section>

        <Section title="Installable source and dependencies" id="source-and-dependencies">
          <p className="text-sm leading-6 text-muted-foreground">
            Pick a component from{" "}
            <Link
              href="/docs/components"
              className="underline underline-offset-4"
            >
              Components
            </Link>{" "}
            and add it under the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              @davinciui
            </code>{" "}
            namespace:
          </p>
          <DocsSnippet variant="muted" code={`pnpm dlx shadcn@latest add @davinciui/text-morph`} />
          <p className="text-sm leading-6 text-muted-foreground">
            What you get: the component file under{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@/components/ui</code>,
            plus its declared npm dependencies installed into your project. Each
            component page lists its own requirements — check them before adding
            animation- or canvas-heavy pieces.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            See <Link href="/docs/cli" className="underline underline-offset-4">CLI</Link> for
            npm / yarn / bun variants and <Link href="/docs/installation" className="underline underline-offset-4">Installation</Link> for
            project setup.
          </p>
        </Section>

        <Section title="Updating an installed component" id="updating">
          <p className="text-sm leading-6 text-muted-foreground">
            Installed source does <strong className="font-medium text-foreground">not</strong> update
            automatically. To pick up a newer registry version, re-run add with{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">--overwrite</code>:
          </p>
          <DocsSnippet variant="muted" code={`pnpm dlx shadcn@latest add @davinciui/text-morph --overwrite`} />
          <p className="text-sm leading-6 text-muted-foreground">
            Overwrite replaces your local files, so commit first and re-apply any
            customizations afterwards.
          </p>
        </Section>

        <Section title="Reading or inspecting registry JSON" id="inspecting">
          <p className="text-sm leading-6 text-muted-foreground">
            Open any item URL in the browser, or preview it without installing:
          </p>
          <DocsSnippet variant="muted" code={`pnpm dlx shadcn@latest view @davinciui/text-morph`} />
          <p className="text-sm leading-6 text-muted-foreground">
            Assistants can read the whole registry as plain text via{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              /llms.txt
            </code>
            , install the{" "}
            <Link href="/docs/skills" className="underline underline-offset-4">
              DavinciUI skill
            </Link>
            , or install through the{" "}
            <Link href="/docs/mcp" className="underline underline-offset-4">
              MCP server
            </Link>
            .
          </p>
        </Section>

        <Section title="Troubleshooting failed installs" id="troubleshooting">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li><strong className="font-medium text-foreground">404 or unknown registry</strong> — the <code className="font-mono">registries</code> block is missing from <code className="font-mono">components.json</code>. Re-add it per <Link href="/docs/configuration" className="underline underline-offset-4">Configuration</Link>.</li>
            <li><strong className="font-medium text-foreground">Wrong slug</strong> — item names are exact and kebab-cased. Copy the slug from the component page or <code className="font-mono">view</code> it first.</li>
            <li><strong className="font-medium text-foreground">Dependency install fails</strong> — finish with your own package manager, then restart the dev server.</li>
            <li><strong className="font-medium text-foreground">Files in the wrong place</strong> — aliases disagree with <code className="font-mono">tsconfig.json</code> paths; see <Link href="/docs/installation" className="underline underline-offset-4">Installation → Common problems</Link>.</li>
          </ul>
        </Section>

        <div className="flex gap-2 border-t pt-6">
          <Link
            href="/docs/changelog"
            className="text-sm font-medium underline underline-offset-4"
          >
            Next: Changelog →
          </Link>
        </div>
      </div>
    </div>
  );
}
