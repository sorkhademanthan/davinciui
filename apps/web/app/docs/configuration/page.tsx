import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configuration — DavinciUI",
  description: "Configuration for DavinciUI — the components.json file for the shadcn CLI.",
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm">
      <code className="font-mono text-zinc-100">{children}</code>
    </pre>
  )
}

export default function ConfigurationPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Configuration</h1>
        <p className="text-[15px] leading-7 text-muted-foreground">
          How DavinciUI is configured in your project. The CLI uses a file called{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code> to
          know where to place components and how your project is set up. Only needed if you use the
          CLI — copy-paste doesn&apos;t require it.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-lg font-semibold tracking-tight">Create it</h2>
          <div className="mt-3">
            <Code>{`pnpm dlx shadcn@latest init`}</Code>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Answers are saved to <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code> at
            the project root.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">Example — DavinciUI</h2>
          <div className="mt-3">
            <Code>{`{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}`}</Code>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">Key fields</h2>
          <div className="mt-3 space-y-4 text-sm leading-6">
            <div className="rounded-lg border p-4">
              <p className="font-mono text-xs font-medium">style</p>
              <p className="mt-1 text-muted-foreground">
                We use <code className="font-mono">new-york</code>. Controls default component
                styling. Set once at init.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-mono text-xs font-medium">tailwind.cssVariables</p>
              <p className="mt-1 text-muted-foreground">
                <code className="font-mono">true</code> — use CSS variables for theming (
                <code className="font-mono">bg-background</code>, <code className="font-mono">text-foreground</code>
                ). Recommended.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-mono text-xs font-medium">aliases</p>
              <p className="mt-1 text-muted-foreground">
                Import paths. Must match your <code className="font-mono">tsconfig.json</code> paths.
                Typical: <code className="font-mono">@/components</code> →{" "}
                <code className="font-mono">./components</code>.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-mono text-xs font-medium">registries</p>
              <p className="mt-1 text-muted-foreground">
                Optional. Add private registries for your team. DavinciUI components are under{" "}
                <code className="font-mono">@davinciui</code> — no custom registry needed.
              </p>
            </div>
          </div>
        </section>

        <p className="text-sm leading-6 text-muted-foreground">
          Full spec at{" "}
          <a href="https://ui.shadcn.com/docs/components-json" className="underline underline-offset-4">
            ui.shadcn.com/docs/components-json
          </a>
          .
        </p>
      </div>
    </div>
  )
}
