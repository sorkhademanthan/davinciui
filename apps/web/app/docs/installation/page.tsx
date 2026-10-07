import type { Metadata } from "next";
import Link from "next/link";
import { DocsSnippet } from "@/components/docs-snippet";
import { Section, InfoBox } from "@/components/component-layout";

export const metadata: Metadata = {
  title: "Installation — DavinciUI",
  description:
    "How to install DavinciUI in Next.js or Vite. Add components with the shadcn CLI.",
};

export default function InstallationPage() {
  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Installation
        </h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Add DavinciUI to an existing React project in about five minutes:
          prepare the project, initialize shadcn, register the{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@davinciui</code>{" "}
          namespace, install one component, and render it.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <Section title="Prerequisites" id="prerequisites">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Node.js 18 or later.</li>
            <li>A React project — Next.js App Router or Vite. TypeScript is recommended.</li>
            <li>Tailwind CSS v4 set up in the project. DavinciUI components are styled with Tailwind utilities and CSS variables.</li>
            <li>Internet access to the registry at <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">davinciui.com/r</code>.</li>
          </ul>
          <InfoBox type="info">
            Animated components render with Framer Motion. The CLI installs it
            automatically when a component declares it — you do not need to add
            it yourself upfront.
          </InfoBox>
        </Section>

        <Section title="Create or open a supported project" id="create-or-open-a-project">
          <p className="text-sm leading-6 text-muted-foreground">
            For a new project with Next.js:
          </p>
          <DocsSnippet code={`pnpm create next-app@latest my-app --typescript --tailwind --eslint`} />
          <p className="text-sm leading-6 text-muted-foreground">
            Or open your existing Vite or Next.js app — DavinciUI components are
            self-contained files, so there is no starter template and no extra
            setup beyond Tailwind. Success looks like: your app builds and Tailwind
            utilities apply before you continue.
          </p>
        </Section>

        <Section title="Initialize shadcn" id="initialize-shadcn">
          <p className="text-sm leading-6 text-muted-foreground">
            This creates{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code>{" "}
            and the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">cn</code>{" "}
            utility. Run it in the project root:
          </p>
          <DocsSnippet code={`pnpm dlx shadcn@latest init`} />
          <p className="text-sm leading-6 text-muted-foreground">
            Choose <span className="font-medium text-foreground">New York</span>{" "}
            style, <span className="font-medium text-foreground">Neutral</span>{" "}
            base color, and enable CSS variables. Success looks like: a{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code>{" "}
            file at the project root. Every prompt answer is explained in{" "}
            <Link href="/docs/configuration" className="underline underline-offset-4">
              Configuration
            </Link>.
          </p>
        </Section>

        <Section title="Register DavinciUI in components.json" id="register-davinciui">
          <p className="text-sm leading-6 text-muted-foreground">
            Tell the CLI where the DavinciUI registry lives. Without this block,
            the CLI cannot resolve{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@davinciui/*</code>{" "}
            names. Add it to{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code>:
          </p>
          <DocsSnippet
            code={`{
  "registries": {
    "@davinciui": "https://davinciui.com/r/{name}.json"
  }
}`}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{"{name}"}</code>{" "}
            is a placeholder the CLI fills with the component slug. See{" "}
            <Link href="/docs/configuration" className="underline underline-offset-4">
              Configuration
            </Link>{" "}
            for the full file and{" "}
            <Link href="/docs/registry" className="underline underline-offset-4">
              Registry
            </Link>{" "}
            for how resolution works.
          </p>
        </Section>

        <Section title="Install a first component" id="install-a-first-component">
          <p className="text-sm leading-6 text-muted-foreground">
            Pick any component from{" "}
            <Link href="/docs/components" className="underline underline-offset-4">
              Components
            </Link>{" "}
            and add it:
          </p>
          <DocsSnippet code={`pnpm dlx shadcn@latest add @davinciui/text-morph`} />
          <p className="text-sm leading-6 text-muted-foreground">
            The CLI copies the component to{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@/components/ui</code>{" "}
            (or wherever your{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">aliases.ui</code>{" "}
            points) and installs its npm dependencies. Success looks like: a new{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components/ui/text-morph.tsx</code>{" "}
            file in your repo — you own the code and can edit it freely.
          </p>
        </Section>

        <Section title="Render and verify it" id="render-and-verify-it">
          <p className="text-sm leading-6 text-muted-foreground">
            Import from the installed path and render:
          </p>
          <DocsSnippet
            code={`import { TextMorph } from "@/components/ui/text-morph"

export default function Page() {
  return <TextMorph words={["Design", "Animate", "Delight"]} />
}`}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            Success looks like: the words cycle with a fluid morph animation. If
            the text renders but does not animate, check that{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">framer-motion</code>{" "}
            was installed and that you restarted the dev server after adding new
            dependencies.
          </p>
        </Section>

        <Section title="Common installation problems" id="common-installation-problems">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">“Could not resolve @davinciui/…”</strong>{" "}
              — the <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">registries</code> block
              is missing or misspelled in{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code>.
              Re-check the namespace against the snippet above.
            </li>
            <li>
              <strong className="font-medium text-foreground">Import errors after install</strong>{" "}
              — your <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">tsconfig.json</code> paths
              do not match the <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">aliases</code> in{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code>.
              Align them, then reinstall.
            </li>
            <li>
              <strong className="font-medium text-foreground">Missing dependency at runtime</strong>{" "}
              — confirm the package manager finished and restart the dev server.
              Animated components need{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">framer-motion</code>;
              icon-driven ones need{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">lucide-react</code>.
            </li>
            <li>
              <strong className="font-medium text-foreground">Stale output after editing</strong>{" "}
              — installed files are yours, not live-linked. If a re-install does not
              pick up registry changes, pass{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">--overwrite</code>{" "}
              to replace local files.
            </li>
          </ul>
          <p className="text-sm leading-6 text-muted-foreground">
            Still stuck? The{" "}
            <Link href="/docs/cli" className="underline underline-offset-4">CLI reference</Link>{" "}
            covers failure recovery, and a representative end-to-end example lives on the{" "}
            <Link href="/docs/components/text-morph" className="underline underline-offset-4">
              Text Morph page
            </Link>.
          </p>
        </Section>

        <section className="rounded-lg border bg-muted/30 p-4">
          <h3 className="text-sm font-medium">No CLI?</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Copy the source directly from the component page — every page shows
            the full code and required dependencies. The CLI is just a shortcut.
          </p>
        </section>

        <div className="flex gap-2 border-t pt-6">
          <Link
            href="/docs/configuration"
            className="text-sm font-medium underline underline-offset-4"
          >
            Next: Configuration →
          </Link>
        </div>
      </div>
    </div>
  );
}
