"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const markerVariants = cva("group/marker flex w-full items-center gap-2 text-muted-foreground", {
  variants: {
    variant: {
      default: "justify-center text-center",
      border: "justify-center border-b border-border/70 pb-3 text-center",
      separator: "",
    },
    size: {
      default: "text-[13px] leading-6",
      sm: "text-xs leading-5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type MarkerVariant = NonNullable<VariantProps<typeof markerVariants>["variant"]>;
export type MarkerSize = NonNullable<VariantProps<typeof markerVariants>["size"]>;
export type MarkerTone = "neutral" | "success" | "warning" | "error" | "info";

interface MarkerContextValue {
  tone: MarkerTone;
  size: MarkerSize;
}

const MarkerContext = React.createContext<MarkerContextValue>({ tone: "neutral", size: "default" });

function useMarker(): MarkerContextValue {
  return React.useContext(MarkerContext);
}

export interface MarkerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof markerVariants> {
  /** Semantic tone — tints the icon chip (and dot) while text stays calm. @default "neutral" */
  tone?: MarkerTone;
  /** Render as a different element, e.g. a link or button. */
  render?: React.ReactElement | ((props: React.HTMLAttributes<HTMLDivElement>) => React.ReactElement);
}

const markerToneText: Record<MarkerTone, string> = {
  neutral: "",
  success: "",
  warning: "",
  error: "text-destructive/90",
  info: "",
};

function Marker({ variant, size, tone = "neutral", render, className, children, ...props }: MarkerProps) {
  const interactive = render != null;
  const context = React.useMemo<MarkerContextValue>(() => ({ tone, size: size ?? "default" }), [tone, size]);
  const provide = (node: React.ReactNode) => (
    <MarkerContext.Provider value={context}>{node}</MarkerContext.Provider>
  );
  if (variant === "separator") {
    const content = (
      <>
        <span
          aria-hidden
          className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border"
        />
        <span
          data-slot="marker-separator-label"
          className={cn(
            "shrink-0 px-1 text-xs font-medium text-muted-foreground/80",
            tone === "error" && "text-destructive/90",
          )}
        >
          {children}
        </span>
        <span
          aria-hidden
          className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border"
        />
      </>
    );
    const separatorProps = {
      "data-slot": "marker",
      "data-variant": variant,
      "data-tone": tone,
      className: cn(markerVariants({ variant, size }), "gap-3", className),
      ...props,
    } as React.HTMLAttributes<HTMLDivElement> & { "data-slot": string };
    if (render && React.isValidElement(render)) {
      const element = render as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      return React.cloneElement(element, {
        ...separatorProps,
        ...element.props,
        className: cn(separatorProps.className, element.props.className),
        children: provide(content),
      });
    }
    if (typeof render === "function") {
      return render({ ...separatorProps, children: provide(content) });
    }
    return <div {...separatorProps}>{provide(content)}</div>;
  }

  const markerProps = {
    "data-slot": "marker",
    "data-variant": variant ?? "default",
    "data-size": size ?? "default",
    "data-tone": tone,
    className: cn(
      markerVariants({ variant, size }),
      markerToneText[tone],
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "motion-reduce:transition-none",
      interactive &&
        "rounded-md -mx-1.5 px-1.5 py-0.5 transition-colors duration-150 ease-out hover:bg-muted/60 hover:text-foreground",
      className,
    ),
    ...props,
  } as React.HTMLAttributes<HTMLDivElement> & { "data-slot": string };
  if (render && React.isValidElement(render)) {
    const element = render as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
    return React.cloneElement(element, {
      ...markerProps,
      ...element.props,
      className: cn(markerProps.className, element.props.className),
      children: provide(children ?? element.props.children),
    });
  }
  if (typeof render === "function") {
    return render({ ...markerProps, children: provide(children) });
  }
  return <div {...markerProps}>{provide(children)}</div>;
}

const markerIconTones: Record<MarkerTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  error: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

function MarkerIcon({ tone, className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: MarkerTone }) {
  const { tone: contextTone } = useMarker();
  const resolved = tone ?? contextTone;
  return (
    <span
      data-slot="marker-icon"
      data-tone={resolved}
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[6px] p-[3px] transition-colors duration-150 ease-out motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-3.5",
        markerIconTones[resolved],
        className,
      )}
      {...props}
    />
  );
}

function MarkerContent({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span data-slot="marker-content" className={cn("min-w-0 truncate", className)} {...props} />
  );
}

const markerDotTones: Record<MarkerTone, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-destructive",
  info: "bg-sky-500",
};

function MarkerDot({
  tone,
  live = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: MarkerTone; live?: boolean }) {
  const { tone: contextTone } = useMarker();
  const resolved = tone ?? contextTone;
  return (
    <span
      data-slot="marker-dot"
      data-tone={resolved}
      aria-hidden
      className={cn("relative flex size-1.5 shrink-0", className)}
      {...props}
    >
      {live && (
        <span
          aria-hidden
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none",
            markerDotTones[resolved],
          )}
        />
      )}
      <span aria-hidden className={cn("relative inline-flex size-1.5 rounded-full", markerDotTones[resolved])} />
    </span>
  );
}

function MarkerTime({ className, ...props }: React.TimeHTMLAttributes<HTMLElement>) {
  return (
    <time
      data-slot="marker-time"
      className={cn(
        "shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground/70 select-none",
        className,
      )}
      {...props}
    />
  );
}

export { Marker, MarkerIcon, MarkerContent, MarkerDot, MarkerTime, markerVariants, useMarker };

export default Marker;
