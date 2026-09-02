import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Theming — DavinciUI",
  description: "Theming with CSS variables. Customize colors, radius and semantic tokens.",
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm">
      <code className="font-mono text-zinc-100">{children}</code>
    </pre>
  )
}

export default function ThemingPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Theming</h1>
        <p className="text-[15px] leading-7 text-muted-foreground">
          DavinciUI uses CSS variables for theming. Semantic tokens like{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">--background</code> and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">--primary</code> map to
          Tailwind utilities. Override the tokens to re-theme without touching component code.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tokens live in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">globals.css</code> under{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">:root</code> and{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.dark</code>. Tailwind
            exposes them as <code className="font-mono">bg-background</code>,{" "}
            <code className="font-mono">text-foreground</code>,{" "}
            <code className="font-mono">border-border</code>, etc.
          </p>
          <div className="mt-3">
            <Code>{`/* app/globals.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --radius: 0.625rem;
}
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
}`}</Code>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">Tokens</h2>
          <div className="mt-3 grid gap-3 text-sm">
            <div className="rounded-lg border p-4">
              <p className="font-medium">background / foreground</p>
              <p className="mt-1 leading-6 text-muted-foreground">Page shell and default text.</p>
              <code className="mt-2 inline-block rounded bg-muted px-2 py-1 font-mono text-xs">
                bg-background text-foreground
              </code>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">primary / primary-foreground</p>
              <p className="mt-1 leading-6 text-muted-foreground">Brand actions, filled buttons.</p>
              <code className="mt-2 inline-block rounded bg-muted px-2 py-1 font-mono text-xs">
                bg-primary text-primary-foreground
              </code>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">muted / muted-foreground</p>
              <p className="mt-1 leading-6 text-muted-foreground">Descriptions, placeholders.</p>
              <code className="mt-2 inline-block rounded bg-muted px-2 py-1 font-mono text-xs">
                text-muted-foreground
              </code>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">border / input / ring</p>
              <p className="mt-1 leading-6 text-muted-foreground">Borders and focus rings.</p>
              <code className="mt-2 inline-block rounded bg-muted px-2 py-1 font-mono text-xs">
                border-border ring-ring
              </code>
            </div>
          </div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            Full token list in{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">packages/ui/src/styles/globals.css</code>{" "}
            — we use Neutral base color by default.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">Customize</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Change a token globally:</p>
          <div className="mt-3">
            <Code>{`:root {
  --primary: oklch(0.55 0.22 264); /* your brand */
  --radius: 0.75rem;
}`}</Code>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No component rewrite needed — every component reads the variables.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">Add a new token</h2>
          <div className="mt-3">
            <Code>{`:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}`}</Code>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Then use <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">bg-warning</code> anywhere.
          </p>
        </section>

        <section className="rounded-lg border bg-muted/30 p-4">
          <h3 className="text-sm font-medium">Dark mode</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Same tokens, different values under{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.dark</code>. We use{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">next-themes</code> — wrap
            your app in <code className="font-mono">ThemeProvider attribute=&quot;class&quot;</code> and
            toggle with <code className="font-mono">useTheme()</code>. No separate page needed.
          </p>
        </section>
      </div>
    </div>
  )
}
