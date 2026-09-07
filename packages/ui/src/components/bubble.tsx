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

export type BubbleVariant = NonNullable<VariantProps<typeof bubbleContentVariants>["variant"]>;
export type BubbleAlign = "start" | "end";
export type BubbleReactionSide = "top" | "bottom";

interface BubbleContextValue {
  variant: BubbleVariant;
  align: BubbleAlign;
}

const BubbleContext = React.createContext<BubbleContextValue>({ variant: "default", align: "start" });

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof bubbleContentVariants> {
  /** Inline alignment of the bubble. @default "start" */
  align?: BubbleAlign;
}

function Bubble({ variant = "default", align = "start", className, children, ...props }: BubbleProps) {
  const resolvedVariant = variant ?? "default";
  const ghost = resolvedVariant === "ghost";
  return (
    <BubbleContext.Provider value={{ variant: resolvedVariant, align }}>
      <div
        data-slot="bubble"
        data-variant={resolvedVariant}
        data-align={align}
        className={cn("flex w-full", align === "end" ? "justify-end" : "justify-start", className)}
        {...props}
      >
        <div
          data-slot="bubble-shell"
          className={cn("relative w-fit max-w-[80%]", ghost && "w-full max-w-full")}
        >
          {children}
        </div>
      </div>
    </BubbleContext.Provider>
  );
}

export interface BubbleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render the content as a different element, e.g. a link or button. */
  render?: React.ReactElement | ((props: React.HTMLAttributes<HTMLDivElement>) => React.ReactElement);
}

function BubbleContent({ render, className, children, ...props }: BubbleContentProps) {
  const { variant, align } = React.useContext(BubbleContext);
  const contentProps = {
    "data-slot": "bubble-content",
    "data-variant": variant,
    "data-align": align,
    className: cn(bubbleContentVariants({ variant }), className),
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
        "absolute z-10 flex w-fit items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs shadow-sm",
        side === "top" ? "-top-3.5" : "-bottom-3.5",
        align === "end" ? "end-3" : "start-3",
        className
      )}
      {...props}
    />
  );
}

function BubbleGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="bubble-group"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    />
  );
}

export { Bubble, BubbleContent, BubbleReactions, BubbleGroup, bubbleContentVariants };

export default Bubble;
