import type { Metadata } from "next"
import Link from "next/link"
import { DocsSnippet } from "@/components/docs-snippet"
import { Section, InfoBox } from "@/components/component-layout"

export const metadata: Metadata = {
  title: "Theming — DavinciUI",
  description: "Theming with CSS variables. Customize colors, radius and semantic tokens.",
}

export default function ThemingPage() {
  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Theming</h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          DavinciUI components read your project&apos;s CSS variables, so re-theming
          means overriding tokens — never rewriting components. Change{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">--primary</code> once,
          and every installed component follows.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <Section title="How theme values flow into components" id="how-theme-values-flow">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>You define primitive values (oklch colors, radii) as CSS variables in your global stylesheet.</li>
            <li>Tailwind CSS v4 exposes them as utilities — <code className="font-mono">bg-background</code>, <code className="font-mono">text-foreground</code>, <code className="font-mono">border-border</code> — via the theme mapping.</li>
            <li>Installed components use only those utilities, so they inherit whatever values your project sets.</li>
          </ul>
          <p className="text-sm leading-6 text-muted-foreground">
            The practical consequence: theme at the token layer and components stay
            untouched. If you fork a component&apos;s classes instead, you take over
            its theme maintenance too.
          </p>
        </Section>

        <Section title="CSS variables and semantic tokens" id="css-variables">
          <p className="text-sm leading-6 text-muted-foreground">
            Tokens live in your global stylesheet under{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">:root</code>, with dark
            overrides under{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.dark</code>:
          </p>
          <DocsSnippet
            code={`/* app/globals.css */
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
}`}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            Tokens are semantic — they describe a role (<code className="font-mono">primary</code>,{" "}
            <code className="font-mono">muted</code>, <code className="font-mono">destructive</code>) rather than a
            literal color — so light and dark modes can assign different values to the
            same role. Status tokens (<code className="font-mono">--info</code>,{" "}
            <code className="font-mono">--success</code>, <code className="font-mono">--warning</code>) and
            chart tokens (<code className="font-mono">--chart-1</code>…<code className="font-mono">--chart-5</code>)
            follow the same pattern. The full inventory is documented in{" "}
            <Link href="/docs/foundations/colors" className="underline underline-offset-4">Foundations → Colors</Link>.
          </p>
        </Section>

        <Section title="Light and dark mode setup" id="light-and-dark-mode">
          <p className="text-sm leading-6 text-muted-foreground">
            Dark mode is a class toggle. Define both value sets, then switch the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">dark</code> class on
            the document element — the established way is{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">next-themes</code>:
          </p>
          <DocsSnippet
            code={`import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}`}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            Toggle with <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">useTheme()</code> from{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">next-themes</code>.
            Components need no theme props — they re-render from the variables automatically.
          </p>
          <InfoBox type="info">
            Every token you override needs a <code className="font-mono">.dark</code> value too.
            A token with only a light value is the most common cause of unreadable dark-mode UI.
          </InfoBox>
        </Section>

        <Section title="Safe customization examples" id="safe-customization">
          <p className="text-sm leading-6 text-muted-foreground">
            Change a token globally — no component rewrite needed:
          </p>
          <DocsSnippet
            code={`:root {
  --primary: oklch(0.55 0.22 264); /* your brand */
  --radius: 0.75rem;
}
.dark {
  --primary: oklch(0.75 0.18 264);
}`}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            To add a genuinely new token (one that does not exist yet, e.g.{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">--brand</code>), declare the
            variable and map it into Tailwind so utilities like{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">bg-brand</code> work:
          </p>
          <DocsSnippet
            code={`:root {
  --brand: oklch(0.55 0.22 264);
  --brand-foreground: oklch(0.98 0.01 264);
}
@theme inline {
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
}`}
          />
        </Section>

        <Section title="Motion and contrast considerations" id="motion-and-contrast">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Keep animations on transform and opacity where possible — they stay smooth regardless of theme.</li>
            <li>Check every overridden token pair (<code className="font-mono">--primary</code> on <code className="font-mono">--primary-foreground</code>, muted text on page background) for readable contrast in <em>both</em> modes.</li>
            <li>Never use muted text on a muted surface — it fails contrast at small sizes. See <Link href="/docs/typeset" className="underline underline-offset-4">Typeset</Link> for the rule.</li>
            <li>Honor <code className="font-mono">prefers-reduced-motion</code>: animated components already gate motion behind it (see <Link href="/docs/foundations/motion" className="underline underline-offset-4">Foundations → Motion</Link>). Custom animation wrappers should do the same.</li>
          </ul>
        </Section>

        <Section title="How to avoid breaking accessibility" id="accessibility">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Keep focus rings visible: do not restyle or remove <code className="font-mono">--ring</code> usage on interactive components.</li>
            <li>Preserve the foreground/background pairing of every token you touch — status colors especially must stay distinguishable by more than hue alone where they convey meaning.</li>
            <li>Test interactive components (dialogs, menus, tooltips) with keyboard only after re-theming; visual changes can hide focus order problems.</li>
          </ul>
        </Section>

        <Section title="Related foundations" id="related-foundations">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["Colors", "/docs/foundations/colors"],
                ["Typography", "/docs/foundations/typography"],
                ["Borders", "/docs/foundations/borders"],
                ["Border Radius", "/docs/foundations/border-radius"],
                ["Shadows", "/docs/foundations/shadows"],
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
        </Section>
      </div>
    </div>
  )
}
