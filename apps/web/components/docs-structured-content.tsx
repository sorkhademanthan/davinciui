import Link from "next/link";
import { ArrowUpRight, TriangleAlert } from "lucide-react";

import { Section } from "@/components/component-layout";
import { DocsSnippet } from "@/components/docs-snippet";
import type {
  DocsChangelogEntry,
  DocsComposition,
  DocsCustomization,
  DocsLink,
  DocsToken,
} from "@/lib/docs-content/types";

const sectionClass = "mt-10 scroll-mt-24";

export function DocsCompositionSection({
  title,
  composition,
}: {
  title: string;
  composition: DocsComposition;
}) {
  return (
    <Section title="Composition" className={sectionClass} id="composition">
      <div className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">
          {composition.description ??
            `Use the following composition to build a ${title}:`}
        </p>
        <DocsSnippet variant="muted" code={composition.tree} />
      </div>
    </Section>
  );
}

export function DocsProseSection({
  id,
  title,
  body,
}: {
  id: string;
  title: string;
  body: string;
}) {
  return (
    <Section title={title} className={sectionClass} id={id}>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        {body}
      </p>
    </Section>
  );
}

function TokenTable({
  tokens,
  showDefault = true,
}: {
  tokens: DocsToken[];
  showDefault?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left text-[13px] font-medium text-muted-foreground">
                Name
              </th>
              {showDefault ? (
                <th className="w-[22%] px-4 py-2.5 text-left text-[13px] font-medium text-muted-foreground">
                  Default
                </th>
              ) : null}
              <th className="px-4 py-2.5 text-left text-[13px] font-medium text-muted-foreground">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tokens.map((token) => (
              <tr
                key={token.name}
                className="transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3 align-top">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] font-medium text-foreground">
                    {token.name}
                  </code>
                </td>
                {showDefault ? (
                  <td className="px-4 py-3 align-top">
                    {token.default ? (
                      <code className="font-mono text-[13px] text-muted-foreground">
                        {token.default}
                      </code>
                    ) : (
                      <span className="text-[13px] text-muted-foreground/50">
                        -
                      </span>
                    )}
                  </td>
                ) : null}
                <td className="px-4 py-3 align-top">
                  <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
                    {token.description}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DocsCustomizationSection({
  customization,
}: {
  customization: DocsCustomization;
}) {
  const hasTokens =
    (customization.cssVars?.length ?? 0) > 0 ||
    (customization.dataAttrs?.length ?? 0) > 0 ||
    (customization.slots?.length ?? 0) > 0;

  return (
    <Section title="Customization" className={sectionClass} id="customization">
      <div className="space-y-4">
        {customization.note ? (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {customization.note}
          </p>
        ) : null}

        {customization.cssVars?.length ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              CSS variables
            </h3>
            <TokenTable tokens={customization.cssVars} />
          </div>
        ) : null}

        {customization.dataAttrs?.length ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Data attributes
            </h3>
            <TokenTable tokens={customization.dataAttrs} showDefault={false} />
          </div>
        ) : null}

        {customization.slots?.length ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Styling slots
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {customization.slots.map((slot) => (
                <code
                  key={slot}
                  className="rounded-full border bg-muted/40 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                >
                  {slot}
                </code>
              ))}
            </div>
          </div>
        ) : null}

        {!hasTokens && !customization.note ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Customize this component with Tailwind classes through the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">
              className
            </code>{" "}
            prop.
          </p>
        ) : null}
      </div>
    </Section>
  );
}

export function DocsConstraintsSection({
  constraints,
}: {
  constraints: string[];
}) {
  return (
    <Section
      title="Known constraints"
      className={sectionClass}
      id="known-constraints"
    >
      <ul className="space-y-2.5">
        {constraints.map((constraint) => (
          <li
            key={constraint}
            className="flex gap-3 rounded-md border border-border bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>{constraint}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function DocsRelatedSection({ links }: { links: DocsLink[] }) {
  return (
    <Section title="Related" className={sectionClass} id="related">
      <div className="flex flex-wrap gap-1.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {link.title}
            <ArrowUpRight className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function DocsChangelogSection({
  entries,
}: {
  entries: DocsChangelogEntry[];
}) {
  return (
    <Section title="Changelog" className={sectionClass} id="changelog">
      <ol className="space-y-4">
        {entries.map((entry) => (
          <li
            key={`${entry.version}-${entry.date}`}
            className="grid gap-1 border-l-2 border-border pl-4 sm:grid-cols-[140px_1fr] sm:gap-4"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-medium text-foreground">
                {entry.version}
              </span>
              <span>{entry.date}</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {entry.change}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
