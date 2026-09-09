"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const bubbleContentVariants = cva(
  "w-fit max-w-full rounded-2xl px-3.5 py-2.5 text-sm leading-6 break-words transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs",
        secondary: "bg-secondary text-secondary-foreground shadow-xs",
        muted: "bg-muted text-foreground",
        tinted: "bg-primary/10 text-foreground dark:bg-primary/15",
        outline: "border bg-background shadow-xs",
        ghost: "rounded-none bg-transparent px-0 py-0",
        destructive: "bg-destructive text-white shadow-xs dark:bg-destructive/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const bubbleTailBg: Record<Exclude<BubbleVariant, "ghost">, string> = {
  default: "bg-primary",
  secondary: "bg-secondary",
  muted: "bg-muted",
  tinted: "bg-primary/10 dark:bg-primary/15",
  outline: "bg-background",
  destructive: "bg-destructive dark:bg-destructive/60",
};

export type BubbleVariant = NonNullable<VariantProps<typeof bubbleContentVariants>["variant"]>;
export type BubbleAlign = "start" | "end";
export type BubbleReactionSide = "top" | "bottom";
export type BubbleGroupPosition = "only" | "first" | "middle" | "last";

interface BubbleContextValue {
  variant: BubbleVariant;
  align: BubbleAlign;
  groupPosition: BubbleGroupPosition;
}

const BubbleContext = React.createContext<BubbleContextValue>({ variant: "default", align: "start", groupPosition: "only" });

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof bubbleContentVariants> {
  /** Inline alignment of the bubble. @default "start" */
  align?: BubbleAlign;
  /** Directional tail toward the sender side. Skipped on ghost and non-final group rows. @default false */
  tail?: boolean;
  /** Position inside a BubbleGroup. Set automatically — override only standalone. @default "only" */
  groupPosition?: BubbleGroupPosition;
}

function Bubble({ variant = "default", align = "start", tail = false, groupPosition = "only", className, children, ...props }: BubbleProps) {
  const resolvedVariant = variant ?? "default";
  const ghost = resolvedVariant === "ghost";
  // Tails belong on the final row: a grouped bubble shows it only when last.
  const showTail = tail && !ghost && (groupPosition === "only" || groupPosition === "last");
  return (
    <BubbleContext.Provider value={{ variant: resolvedVariant, align, groupPosition }}>
      <div
        data-slot="bubble"
        data-variant={resolvedVariant}
        data-align={align}
        data-group-position={groupPosition}
        data-tail={showTail || undefined}
        className={cn("flex w-full", align === "end" ? "justify-end" : "justify-start", className)}
        {...props}
      >
        <div
          data-slot="bubble-shell"
          className={cn("relative w-fit max-w-[80%]", ghost && "w-full max-w-full")}
        >
          {children}
          {showTail ? (
            <span
              data-slot="bubble-tail"
              aria-hidden
              className={cn(
                "absolute -bottom-1 size-2.5 rotate-45 rounded-[2px]",
                bubbleTailBg[resolvedVariant as Exclude<BubbleVariant, "ghost">],
                align === "end" ? "end-4" : "start-4"
              )}
            />
          ) : null}
        </div>
      </div>
    </BubbleContext.Provider>
  );
}

const bubbleGroupedRadius: Record<BubbleAlign, Record<Exclude<BubbleGroupPosition, "only">, string>> = {
  start: {
    first: "rounded-bl-md",
    middle: "rounded-bl-md rounded-tl-md",
    last: "rounded-tl-md",
  },
  end: {
    first: "rounded-br-md",
    middle: "rounded-br-md rounded-tr-md",
    last: "rounded-tr-md",
  },
};

export interface BubbleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render the content as a different element, e.g. a link or button. */
  render?: React.ReactElement | ((props: React.HTMLAttributes<HTMLDivElement>) => React.ReactElement);
}

function BubbleContent({ render, className, children, ...props }: BubbleContentProps) {
  const { variant, align, groupPosition } = React.useContext(BubbleContext);
  const contentProps = {
    "data-slot": "bubble-content",
    "data-variant": variant,
    "data-align": align,
    className: cn(
      bubbleContentVariants({ variant }),
      variant !== "ghost" && groupPosition !== "only" && bubbleGroupedRadius[align][groupPosition],
      className
    ),
    ...props,
  } as React.HTMLAttributes<HTMLDivElement> & { "data-slot": string };
  if (render) {
    if (React.isValidElement(render)) {
      const element = render as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      return React.cloneElement(element, {
        ...contentProps,
        ...element.props,
        className: cn(contentProps.className, element.props.className),
        children: children ?? element.props.children,
      });
    }
    return render({ ...props, className: cn(bubbleContentVariants({ variant }), className) });
  }
  return <div {...contentProps}>{children}</div>;
}

export interface BubbleReactionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Bubble edge the reactions anchor to. @default "bottom" */
  side?: BubbleReactionSide;
  /** Inline alignment of the reaction row. @default "end" */
  align?: BubbleAlign;
}

function BubbleReactions({ side = "bottom", align = "end", className, ...props }: BubbleReactionsProps) {
  return (
    <div
      data-slot="bubble-reactions"
      data-side={side}
      data-align={align}
      className={cn(
        "absolute z-10 flex w-fit items-center -space-x-1",
        "[&>*]:rounded-full [&>*]:border [&>*]:border-border/60 [&>*]:bg-background [&>*]:px-1.5 [&>*]:py-0.5 [&>*]:text-xs [&>*]:shadow-sm",
        side === "top" ? "-top-3" : "-bottom-3",
        align === "end" ? "end-2" : "start-2",
        className
      )}
      {...props}
    />
  );
}

export type BubbleGroupProps = React.HTMLAttributes<HTMLDivElement>;

function BubbleGroup({ className, children, ...props }: BubbleGroupProps) {
  const items = React.Children.toArray(children);
  const bubbles = items.filter((child) => React.isValidElement(child) && child.type === Bubble);
  const customs = items.filter((child) => !(React.isValidElement(child) && child.type === Bubble));
  const positioned = bubbles.map((child, i) => {
    const position: BubbleGroupPosition =
      bubbles.length <= 1 ? "only" : i === 0 ? "first" : i === bubbles.length - 1 ? "last" : "middle";
    return React.isValidElement<{ groupPosition?: BubbleGroupPosition }>(child)
      ? React.cloneElement(child, { groupPosition: child.props.groupPosition ?? position })
      : child;
  });
  return (
    <div
      data-slot="bubble-group"
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    >
      {positioned}
      {customs}
    </div>
  );
}

export { Bubble, BubbleContent, BubbleReactions, BubbleGroup, bubbleContentVariants };

export default Bubble;
