import { getComponent } from "@/registry";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BUILD_QUEUE, nextInQueue } from "@/lib/component-groups";

function prettify(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * "Up next" sequencer for the guided component queue.
 * Links to the next component when built, otherwise shows it as queued.
 */
export function NextComponentCard({ current }: { current: string }) {
  const next = nextInQueue(current);
  if (!next) return null;
  const meta = getComponent(next);
  const title = meta?.title ?? prettify(next);
  const built = meta !== undefined;
  const href = `/experience/components/${next}`;

  return (
    <div className="mt-12 overflow-hidden rounded-2xl border border-border">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {built ? "Next component" : "Coming next"}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            {built && meta
              ? meta.description
              : `“${title}” is next in the build queue. Follow along as the library grows one component at a time.`}
          </p>
        </div>
        {built ? (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
          >
            Open {title}
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-dashed border-border px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            In queue
          </span>
        )}
      </div>
    </div>
  );
}

export { BUILD_QUEUE };
