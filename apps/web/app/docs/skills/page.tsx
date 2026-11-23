import type { Metadata } from "next";
import Link from "next/link";
import { DocsSnippet } from "@/components/docs-snippet";
import { Section, InfoBox } from "@/components/component-layout";

export const metadata: Metadata = {
  title: "Skills — DavinciUI",
  description:
    "Teach your AI assistant DavinciUI. Install the skill once and describe what you want in plain words — it finds, installs, and composes the right animated components.",
};

const PROMPTS = [
  {
    title: "Landing hero",
    prompt: `"Add a landing hero with a plasma background and a text-morph headline."`,
  },
  {
    title: "Animated section",
    prompt: `"Add a stats section with count-up cards and a scroll reveal."`,
  },
  {
    title: "Polish an existing page",
    prompt: `"Add a magnetic button and a cursor trail to my pricing page — keep my theme tokens."`,
  },
] as const;

export default function SkillsPage() {
  return (
    <div className="w-full max-w-[648px] py-6 md:py-8 lg:px-0 lg:py-10">
      <div className="space-y-4">
        <p className="docs-eyebrow">Docs</p>
        <h1 className="text-[36px] font-medium leading-[1.15] tracking-tight">
          Skills
        </h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Teach your AI assistant DavinciUI once — then stop pasting docs links.
          The skill gives assistants like Claude Code project-aware context about
          every animated component, so you describe the outcome in plain words
          and it finds, installs, and composes the right pieces with the correct
          APIs for your project.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <Section title="Install the skill" id="install">
          <p className="text-sm leading-6 text-muted-foreground">
            One command installs the DavinciUI skill into your project. Your
            assistant loads it automatically whenever you work with components:
          </p>
          <DocsSnippet
            code={`# pnpm
pnpm dlx skills add https://github.com/sorkhademanthan/davinciui --skill davinciui

# npm
npx skills add https://github.com/sorkhademanthan/davinciui --skill davinciui

# yarn
yarn dlx skills add https://github.com/sorkhademanthan/davinciui --skill davinciui

# bun
bunx --bun skills add https://github.com/sorkhademanthan/davinciui --skill davinciui`}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            Success looks like: a{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              davinciui
            </code>{" "}
            skill in your agent&apos;s skills list. From then on, just ask —
            no setup per conversation.
          </p>
          <InfoBox type="tip">
            You can also browse and verify the skill source on{" "}
            <a
              href="https://skills.sh"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              skills.sh
            </a>
            . The skill file itself lives at{" "}
            <code className="font-mono">skills/davinciui/SKILL.md</code> in the
            DavinciUI repo — readable, forkable, yours to inspect.
          </InfoBox>
        </Section>

        <Section title="What your assistant learns" id="what-included">
          <p className="text-sm leading-6 text-muted-foreground">
            The skill is a compact briefing your assistant reads before it
            writes code. Here is what is inside:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">
                Project context.
              </strong>{" "}
              On every task it runs{" "}
              <code className="font-mono">shadcn info --json</code> to read your{" "}
              <code className="font-mono">components.json</code> — framework,
              Tailwind version, aliases, icon library, installed components,
              and resolved file paths. Code lands in the right folder the first
              time, not the assumed one.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                CLI commands.
              </strong>{" "}
              The full workflow —{" "}
              <code className="font-mono">add</code>,{" "}
              <code className="font-mono">view</code>,{" "}
              <code className="font-mono">search</code>,{" "}
              <code className="font-mono">docs</code> — including dry-run
              inspection before installing and{" "}
              <code className="font-mono">--overwrite</code> when you want a
              newer registry version. See{" "}
              <Link href="/docs/cli" className="underline underline-offset-4">
                CLI
              </Link>
              .
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Theming and composition rules.
              </strong>{" "}
              Semantic tokens over hardcoded colors, dark-mode pairs for every
              override, transform-and-opacity motion, and how DavinciUI pieces
              compose with your existing shadcn/ui primitives. See{" "}
              <Link
                href="/docs/theming"
                className="underline underline-offset-4"
              >
                Theming
              </Link>
              .
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Registry awareness.
              </strong>{" "}
              Every component is a registry item under the{" "}
              <code className="font-mono">@davinciui</code> namespace with
              declared files and dependencies — so the assistant installs{" "}
              <code className="font-mono">framer-motion</code> or{" "}
              <code className="font-mono">lucide-react</code> when the item
              needs it, instead of guessing. See{" "}
              <Link
                href="/docs/registry"
                className="underline underline-offset-4"
              >
                Registry
              </Link>
              .
            </li>
          </ul>
        </Section>

        <Section title="Try it" id="try-it">
          <p className="text-sm leading-6 text-muted-foreground">
            With the skill installed, prompts like these just work — copy one
            into your assistant:
          </p>
          <div className="grid gap-3">
            {PROMPTS.map((item) => (
              <div key={item.title} className="rounded-lg border p-4">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 font-mono text-[13px] leading-6 text-muted-foreground">
                  {item.prompt}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            The assistant will <code className="font-mono">view</code> or{" "}
            <code className="font-mono">search</code> the registry, show you
            what it plans to add, then run{" "}
            <code className="font-mono">add @davinciui/…</code> and wire up the
            import — respecting your aliases and theme.
          </p>
        </Section>

        <Section title="How it works" id="how-it-works">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">
                Project detection.
              </strong>{" "}
              The skill activates when it finds a{" "}
              <code className="font-mono">components.json</code> file — that is
              how it knows you are in a shadcn-style project.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Context injection.
              </strong>{" "}
              It reads your project configuration into context, so generated
              imports, paths, and dependency installs match your setup instead
              of a generic template.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Discovery before code.
              </strong>{" "}
              It checks the registry —{" "}
              <code className="font-mono">search</code>,{" "}
              <code className="font-mono">view</code>, component docs — before
              writing anything, so it never hand-rebuilds a component from
              memory.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Your code, your rules.
              </strong>{" "}
              Installing is a one-time copy into your repo. The assistant edits
              your files like any teammate would — nothing updates silently, and
              everything is reviewable in git.
            </li>
          </ul>
        </Section>

        <Section title="Skills vs MCP vs llms.txt" id="skills-vs-mcp">
          <p className="text-sm leading-6 text-muted-foreground">
            DavinciUI meets assistants three ways. Pick the one that matches how
            you work:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">Skills</strong>{" "}
              (this page) — best for everyday building. Procedural knowledge
              baked into the agent: which command to run, where files go, how
              to theme. Install once, benefit forever.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                <Link href="/docs/mcp" className="underline underline-offset-4">
                  MCP server
                </Link>
              </strong>{" "}
              — best for live registry access. Lets a connected agent search,
              browse, and install components directly from the registry during
              the session.
            </li>
            <li>
              <strong className="font-medium text-foreground">llms.txt</strong>{" "}
              — best for lightweight or offline-capable assistants. The whole
              registry as plain text at{" "}
              <code className="font-mono">davinciui.com/llms.txt</code> — paste
              it, or point any assistant at it, no integration needed.
            </li>
          </ul>
          <InfoBox type="info">
            Skills and MCP complement each other: the skill teaches the{" "}
            <em>workflow</em>, MCP provides the{" "}
            <em>live catalog</em>. Install the skill first; add MCP when you
            want the agent to browse the registry itself.
          </InfoBox>
        </Section>

        <Section title="Troubleshooting" id="troubleshooting">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">
                Assistant ignores your aliases
              </strong>{" "}
              — the skill could not read{" "}
              <code className="font-mono">components.json</code>. Make sure you
              ran{" "}
              <code className="font-mono">shadcn init</code> and the file sits
              at the project root.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Wrong component installed
              </strong>{" "}
              — slugs are exact and kebab-cased. Ask the assistant to{" "}
              <code className="font-mono">view</code> the candidate first, or
              copy the slug from the{" "}
              <Link
                href="/docs/components"
                className="underline underline-offset-4"
              >
                Components
              </Link>{" "}
              page.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Skill not loading
              </strong>{" "}
              — confirm it appears in your agent&apos;s skills list after
              install, then restart the session. Skills load at session start.
            </li>
          </ul>
        </Section>

        <div className="flex items-center justify-between gap-2 border-t pt-6">
          <Link
            href="/docs/typeset"
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            ← Previous: Typeset
          </Link>
          <Link
            href="/docs/registry"
            className="text-sm font-medium underline underline-offset-4"
          >
            Next: Registry →
          </Link>
        </div>
      </div>
    </div>
  );
}
