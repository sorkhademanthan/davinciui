"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { LandingContent } from "@/components/landing/landing-frame";
import { cn } from "@/lib/utils";

type Faq = {
  q: string;
  a: React.ReactNode;
  plain: string;
};

const faqs: Faq[] = [
  {
    q: "How do I add a component?",
    a: (
      <>
        Pick a component and run its install command, e.g.{" "}
        <code className="rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[12.5px] text-zinc-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200">
          pnpm dlx shadcn@latest add @davinciui/text-morph
        </code>
        . The code lands in your project so you own it. Start with the{" "}
        <Link href="/docs/installation" className="font-medium text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-500 dark:text-white dark:decoration-white/30">
          installation guide
        </Link>{" "}
        if shadcn isn&apos;t set up yet.
      </>
    ),
    plain:
      "Pick a component and run pnpm dlx shadcn@latest add @davinciui/[slug]. The code is copied into your project. See the installation guide if shadcn is not set up yet.",
  },
  {
    q: "Can my AI tool use DavinciUI?",
    a: (
      <>
        Yes. Every component ships with a Markdown page, there&apos;s an{" "}
        <Link href="/llms.txt" className="font-medium text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-500 dark:text-white dark:decoration-white/30">
          llms.txt index
        </Link>{" "}
        and an MCP server. Point your assistant at a component page or follow the{" "}
        <Link href="/docs/mcp" className="font-medium text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-500 dark:text-white dark:decoration-white/30">
          MCP setup
        </Link>{" "}
        and it installs things correctly.
      </>
    ),
    plain:
      "Yes. Every component has a Markdown page, there is an llms.txt index, and an MCP server. Follow the MCP setup docs to let your AI install components correctly.",
  },
  {
    q: "What's the difference between components, blocks and the design system?",
    a: (
      <>
        Components handle one focused job — a cursor, a carousel, a text effect.{" "}
        <Link href="/blocks" className="font-medium text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-500 dark:text-white dark:decoration-white/30">
          Blocks
        </Link>{" "}
        combine pieces into full sections like heroes and pricing. The{" "}
        <Link href="/design-system" className="font-medium text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-500 dark:text-white dark:decoration-white/30">
          design system builder
        </Link>{" "}
        defines your tokens — palette, type, spacing — and exports production CSS or JSON.
      </>
    ),
    plain:
      "Components handle one focused job. Blocks combine pieces into full sections like heroes and pricing. The design system builder defines tokens and exports production CSS or JSON.",
  },
  {
    q: "Can I restyle everything?",
    a: (
      <>
        Yes — nothing is locked. Source lives in your repo: adjust Tailwind classes, semantic
        color tokens, typography and motion, or rewrite the component itself. Every
        component ships light and dark mode out of the box.
      </>
    ),
    plain:
      "Yes. Source lives in your repo. Adjust Tailwind classes, color tokens, typography and motion. Every component supports light and dark mode.",
  },
  {
    q: "Is it really free?",
    a: (
      <>
        Yes. DavinciUI is open source and MIT licensed — use it in personal and
        commercial projects. If it earns you money, consider{" "}
        <Link href="/sponsors" className="font-medium text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-500 dark:text-white dark:decoration-white/30">
          sponsoring the project
        </Link>{" "}
        to keep it free for everyone.
      </>
    ),
    plain:
      "Yes. DavinciUI is open source and MIT licensed for personal and commercial projects. Sponsorships keep it free.",
  },
  {
    q: "Does motion respect device preferences?",
    a: (
      <>
        Yes. Entrance and ambient motion is gated behind reduced-motion checks, so
        users who prefer less motion get the final state instantly — no animation
        required to read the content.
      </>
    ),
    plain:
      "Yes. Motion is gated behind reduced-motion checks so users who prefer less motion get the final state instantly.",
  },
];

function FaqItem({
  faq,
  index,
  open,
  onToggle,
}: {
  faq: Faq;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className="border-t border-zinc-200 first:border-t-0 dark:border-white/[0.08] lg:first:border-t">
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="group flex w-full items-center gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-background sm:gap-6 sm:py-6"
      >
        <span
          aria-hidden="true"
          className={cn(
            "hidden font-mono text-[11px] tabular-nums sm:block",
            open ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={cn(
            "flex-1 text-[15px] font-medium tracking-tight transition-colors sm:text-base",
            open
              ? "text-zinc-950 dark:text-white"
              : "text-zinc-600 group-hover:text-zinc-950 dark:text-zinc-400 dark:group-hover:text-white"
          )}
        >
          {faq.q}
        </span>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
            open
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950"
              : "border-zinc-200 text-zinc-500 group-hover:border-zinc-400 group-hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:group-hover:border-white/30 dark:group-hover:text-white"
          )}
        >
          <Plus
            className={cn(
              "size-4 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
              open && "rotate-45"
            )}
            aria-hidden="true"
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.34, ease: [0.23, 1, 0.32, 1] }
            }
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 pl-0 pr-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:pl-10 sm:pr-14 sm:text-[15px]">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const jsonLd = React.useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.plain },
      })),
    }),
    []
  );

  return (
    <LandingContent>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section aria-labelledby="faq-heading" className="py-20 sm:py-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16"
        >
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              Good questions
            </p>
            <h2
              id="faq-heading"
              className="max-w-[480px] text-[clamp(2.4rem,4.8vw,3.9rem)] font-medium leading-[1.04] tracking-[-0.05em] text-zinc-950 dark:text-white"
            >
              Everything else you&apos;re wondering.
            </h2>
            <p className="mt-6 max-w-[460px] text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Install, AI setup, styling and licensing — answered up front so you
              can get back to building.
            </p>
            <Link
              href="/docs"
              className="group mt-8 inline-flex items-center gap-1.5 text-[15px] font-semibold text-zinc-900 dark:text-white"
            >
              Read the docs
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="border-b border-zinc-200 dark:border-white/[0.08]">
            {faqs.map((faq, i) => (
              <FaqItem
                key={faq.q}
                faq={faq}
                index={i}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </motion.div>
      </section>
    </LandingContent>
  );
}
