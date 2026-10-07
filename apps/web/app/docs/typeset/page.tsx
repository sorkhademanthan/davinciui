import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Typeset — DavinciUI",
  description:
    "The DavinciUI type scale in practice. Headings, body, lead, muted, blockquote, list and inline code specimens.",
};

const scale = [
  {
    label: "Heading 1",
    spec: "text-4xl · font-semibold · tracking-tight",
    demo: (
      <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight">
        The quick brown fox jumps over the lazy dog
      </h1>
    ),
  },
  {
    label: "Heading 2",
    spec: "text-3xl · font-semibold · tracking-tight",
    demo: (
      <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
        The quick brown fox jumps over the lazy dog
      </h2>
    ),
  },
  {
    label: "Heading 3",
    spec: "text-2xl · font-semibold · tracking-tight",
    demo: (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        The quick brown fox jumps over the lazy dog
      </h3>
    ),
  },
  {
    label: "Heading 4",
    spec: "text-xl · font-semibold · tracking-tight",
    demo: (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        The quick brown fox jumps over the lazy dog
      </h4>
    ),
  },
] as const;

export default function TypesetPage() {
  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Typeset
        </h1>
        <p className="text-[15px] leading-7 text-muted-foreground">
          The type scale DavinciUI docs and components are set in. One sans
          (Geist), one mono (JetBrains Mono), tight tracking on headings and
          relaxed leading on body. Use this page to see the hierarchy working
          together — then apply the same pairings in component UI. See{" "}
          <Link
            href="/docs/foundations/typography"
            className="underline underline-offset-4"
          >
            Foundations → Typography
          </Link>{" "}
          for the underlying tokens.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
            Headings
          </h2>
          <div className="mt-6 space-y-8">
            {scale.map((row) => (
              <div key={row.label}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="text-sm font-medium">{row.label}</p>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {row.spec}
                  </code>
                </div>
                <div className="mt-2 text-balance">{row.demo}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
            Body
          </h2>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-sm font-medium">Lead</p>
              <p className="mt-2 text-xl leading-8 text-muted-foreground">
                A lead paragraph introduces the page. Larger, muted, and
                limited to two lines so it scans like a summary, not body
                copy.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Paragraph</p>
              <p className="mt-2 text-[15px] leading-7 [&:not(:first-child)]:mt-4">
                This is standard body copy at 15px with a 28px line height.
                DavinciUI sets prose one step below the browser default and
                compensates with generous leading, which keeps dense
                documentation readable without feeling oversized.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Small + muted</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Captions, timestamps and helper text. Muted foreground on the
                page background clears AA at this size — never place muted
                text on muted surfaces.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Inline code</p>
              <p className="mt-2 text-[15px] leading-7">
                Reference tokens like{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[13px]">
                  --background
                </code>{" "}
                or utilities like{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[13px]">
                  text-foreground
                </code>{" "}
                inline without breaking the line rhythm.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
            Blockquote + list
          </h2>
          <blockquote className="mt-6 border-l-2 border-border pl-6 italic text-muted-foreground">
            Good typesetting is invisible. If a reader notices the type before
            the words, the scale is doing too much.
          </blockquote>
          <ul className="mt-6 list-disc space-y-1 pl-5 text-[15px] leading-7">
            <li>Headings: semibold, tight tracking, balanced wrapping.</li>
            <li>Body: regular weight, relaxed leading, left aligned.</li>
            <li>Code and labels: mono, one step down in size.</li>
          </ul>
        </section>

        <section>
          <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
            Usage guidance
          </h2>
          <ul className="mt-6 list-disc space-y-1 pl-5 text-[15px] leading-7">
            <li>One <code className="rounded bg-muted px-1 py-0.5 font-mono text-[13px]">h1</code> per page, then <code className="rounded bg-muted px-1 py-0.5 font-mono text-[13px]">h2</code> for sections and <code className="rounded bg-muted px-1 py-0.5 font-mono text-[13px]">h3</code> for subsections — never skip levels for visual effect.</li>
            <li>In component UI, prefer <code className="rounded bg-muted px-1 py-0.5 font-mono text-[13px]">text-sm leading-6</code> for descriptions and <code className="rounded bg-muted px-1 py-0.5 font-mono text-[13px]">text-base leading-7</code> for longer prose.</li>
            <li>Reserve mono for code, keyboard input, and small labels — not for body copy.</li>
            <li>Keep prose line length under ~65 characters; the docs reading column enforces this for you.</li>
          </ul>
        </section>

        <section>
          <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
            Accessibility and readability
          </h2>
          <ul className="mt-6 list-disc space-y-1 pl-5 text-[15px] leading-7">
            <li>Muted text must sit on the page background, never on muted surfaces — contrast fails otherwise.</li>
            <li>Left-align body copy; avoid centered paragraphs longer than two lines.</li>
            <li>Give links visible affordances (underline + offset) rather than color alone.</li>
            <li>Pair icon-only meaning with text or an accessible label — see <Link href="/docs/foundations/icons" className="underline underline-offset-4">Foundations → Icons</Link>.</li>
          </ul>
        </section>

        <div className="flex gap-2 border-t pt-6">
          <Link
            href="/docs/skills"
            className="text-sm font-medium underline underline-offset-4"
          >
            Next: Skills →
          </Link>
        </div>
      </div>
    </div>
  );
}
