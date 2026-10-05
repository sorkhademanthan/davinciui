import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLI — DavinciUI",
  description:
    "Use the shadcn CLI to add DavinciUI components to your project.",
};

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm">
      <code className="font-mono text-zinc-100">{children}</code>
    </pre>
  );
}

export default function CliPage() {
  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          CLI
        </h1>
        <p className="text-[15px] leading-7 text-muted-foreground">
          DavinciUI uses the{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            shadcn
          </code>{" "}
          CLI. No separate package — add components directly to your repo.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-lg font-semibold tracking-tight">init</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Initialize config and dependencies:
          </p>
          <div className="mt-3">
            <Code>{`pnpm dlx shadcn@latest init`}</Code>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Creates components.json and adds cn utility.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">add</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add components from DavinciUI registry:
          </p>
          <div className="mt-3">
            <Code>{`pnpm dlx shadcn@latest add @davinciui/text-morph
pnpm dlx shadcn@latest add @davinciui/cinematic-card-carousel
# local preview
pnpm dlx shadcn@latest add @davinciui/scroll-media-expand --overwrite`}</Code>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Files go to{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              @/components/ui
            </code>{" "}
            per your <code className="font-mono">components.json</code>.
            Overwrite with <code className="font-mono">--overwrite</code>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            view and search
          </h2>
          <div className="mt-3">
            <Code>{`pnpm dlx shadcn@latest view @davinciui/text-morph
pnpm dlx shadcn@latest search @davinciui --query "text"`}</Code>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Inspect source before installing. Useful for reviewing dependencies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">Options</h2>
          <div className="mt-3 rounded-lg border">
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
        </section>

        <p className="text-sm leading-6 text-muted-foreground">
          Full CLI reference:{" "}
          <a
            href="https://ui.shadcn.com/docs/cli"
            className="underline underline-offset-4"
          >
            ui.shadcn.com/docs/cli
          </a>
          .
        </p>
      </div>
    </div>
  );
}
