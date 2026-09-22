import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Installation — DavinciUI",
  description:
    "How to install DavinciUI in Next.js or Vite. Add components with the shadcn CLI.",
};

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm">
      <code className="font-mono text-zinc-100">{children}</code>
    </pre>
  );
}

export default function InstallationPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Installation
        </h1>
        <p className="text-[15px] leading-7 text-muted-foreground">
          Add DavinciUI to any React project. Uses Tailwind CSS v4 and Framer
          Motion. Works with Next.js App Router, Vite, and other React
          frameworks.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            Prerequisites
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Node.js 18+</li>
            <li>Tailwind CSS v4</li>
            <li>Framer Motion for animated components</li>
            <li>TypeScript recommended</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            1. Create or open your project
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            New project with Next.js:
          </p>
          <div className="mt-3">
            <Code>{`pnpm create next-app@latest my-app --typescript --tailwind --eslint`}</Code>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Or use an existing Vite / Next.js app. No extra setup — DavinciUI
            components are self-contained.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            2. Initialize shadcn
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This creates{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              components.json
            </code>{" "}
            and adds the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              cn
            </code>{" "}
            utility.
          </p>
          <div className="mt-3">
            <Code>{`pnpm dlx shadcn@latest init`}</Code>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Choose <span className="font-medium text-foreground">New York</span>{" "}
            style, <span className="font-medium text-foreground">Neutral</span>{" "}
            base color, and enable CSS variables. See{" "}
            <Link
              href="/docs/configuration"
              className="underline underline-offset-4"
            >
              Configuration
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            3. Add a component
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Pick any component from{" "}
            <Link
              href="/docs/components"
              className="underline underline-offset-4"
            >
              Components
            </Link>{" "}
            and add it:
          </p>
          <div className="mt-3">
            <Code>{`pnpm dlx shadcn@latest add @davinciui/text-morph
pnpm dlx shadcn@latest add @davinciui/cinematic-card-carousel`}</Code>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The CLI copies the component to{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              @/components/ui
            </code>{" "}
            — you own the code. Edit freely.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">4. Use it</h2>
          <div className="mt-3">
            <Code>{`import { TextMorph } from "@/components/ui/text-morph"

export default function Page() {
  return <TextMorph words={["Design", "Animate", "Delight"]} />
}`}</Code>
          </div>
        </section>

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
