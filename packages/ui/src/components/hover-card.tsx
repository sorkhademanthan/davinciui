"use client";

import { cn } from "@workspace/ui/lib/utils";
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Design notes — same premium system as the menus, tuned for
// passive previews: the intent delays are the whole feel
// (openDelay filters passing cursors, closeDelay + the safe
// polygon carry the pointer onto the card). Built on Base UI's
// Preview Card primitive: portal, collision flipping, safe
// polygon bridging, focus-open for keyboard, Escape dismissal.
// ─────────────────────────────────────────────────────────────

export type HoverCardSide = "top" | "right" | "bottom" | "left";
export type HoverCardAlign = "start" | "center" | "end";

export interface HoverCardProps extends Omit<
  React.ComponentProps<typeof PreviewCardPrimitive.Root>,
  "onOpenChange" | "children"
> {
  children?: React.ReactNode;
  /** Fires when the card opens or closes. */
  onOpenChange?: (open: boolean, details?: { reason?: string }) => void;
  /** Hover intent delay before opening, in ms. @default 500 */
  openDelay?: number;
  /** Grace delay before closing, in ms. @default 250 */
  closeDelay?: number;
  /** Panel side relative to the trigger. @default "top" */
  side?: HoverCardSide;
  /** Panel alignment along the side. @default "center" */
  align?: HoverCardAlign;
  /** Gap between trigger and panel in px. @default 8 */
  sideOffset?: number;
  /** Connector arrow pointing at the trigger. @default true */
  showArrow?: boolean;
  /** Text direction. @default "ltr" */
  dir?: "ltr" | "rtl";
  /** Extra classes for the wrapper. */
  className?: string;
}

interface HoverCardContextValue {
  side: HoverCardSide;
  align: HoverCardAlign;
  sideOffset: number;
  openDelay: number;
  closeDelay: number;
  showArrow: boolean;
}

const HoverCardContext = React.createContext<HoverCardContextValue>({
  side: "top",
  align: "center",
  sideOffset: 8,
  openDelay: 500,
  closeDelay: 250,
  showArrow: true,
});

function useHoverCard() {
  return React.useContext(HoverCardContext);
}

function HoverCard({
  children,
  onOpenChange,
  openDelay = 500,
  closeDelay = 250,
  side = "top",
  align = "center",
  sideOffset = 8,
  showArrow = true,
  dir = "ltr",
  className,
  ...props
}: HoverCardProps) {
  const value = React.useMemo(
    () => ({ side, align, sideOffset, openDelay, closeDelay, showArrow }),
    [side, align, sideOffset, openDelay, closeDelay, showArrow],
  );
  return (
    <PreviewCardPrimitive.Root
      data-slot="hover-card"
      onOpenChange={(open, details) => onOpenChange?.(open, { reason: details?.reason })}
      {...props}
    >
      <HoverCardContext.Provider value={value}>
        <span dir={dir} data-slot="hover-card-dir" className={cn("inline-block", className)}>
          {children}
        </span>
      </HoverCardContext.Provider>
    </PreviewCardPrimitive.Root>
  );
}

export interface HoverCardTriggerProps extends Omit<
  React.ComponentProps<typeof PreviewCardPrimitive.Trigger>,
  "render" | "delay" | "closeDelay"
> {
  /** Render into the child element instead of an anchor. */
  asChild?: boolean;
}

function HoverCardTrigger({ asChild, children, className, ...props }: HoverCardTriggerProps) {
  const { openDelay, closeDelay } = useHoverCard();
  if (asChild && React.isValidElement(children)) {
    return (
      <PreviewCardPrimitive.Trigger
        data-slot="hover-card-trigger"
        delay={openDelay}
        closeDelay={closeDelay}
        render={children as React.ReactElement<Record<string, unknown>>}
        {...props}
      />
    );
  }
  return (
    <PreviewCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      delay={openDelay}
      closeDelay={closeDelay}
      className={cn(
        "inline-block cursor-default rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {children}
    </PreviewCardPrimitive.Trigger>
  );
}

export interface HoverCardContentProps extends React.ComponentProps<typeof PreviewCardPrimitive.Popup> {
  /** Safe-area padding for collision flipping. @default 8 */
  collisionPadding?: number | Record<string, number>;
}

function HoverCardContent({ className, children, collisionPadding = 8, ...props }: HoverCardContentProps) {
  const { side, align, sideOffset, showArrow } = useHoverCard();
  return (
    <PreviewCardPrimitive.Portal data-slot="hover-card-portal">
      <PreviewCardPrimitive.Positioner
        data-slot="hover-card-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        sticky
        className="z-50"
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          role="dialog"
          aria-label="Preview"
          className={cn(
            "relative z-50 w-64 overflow-hidden rounded-xl border border-border/70 bg-popover/95 p-4 text-popover-foreground",
            "shadow-[0_0_0_1px_rgb(0_0_0/0.02),0_2px_6px_rgb(0_0_0/0.06),0_16px_40px_-12px_rgb(0_0_0/0.22)]",
            "bg-clip-padding backdrop-blur-xl backdrop-saturate-150",
            "dark:border-white/[0.08] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.04),0_2px_8px_rgb(0_0_0/0.4),0_24px_56px_-12px_rgb(0_0_0/0.65)]",
            "origin-[var(--transform-origin)] transition-[opacity,scale,translate] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform",
            "data-[starting-style]:translate-y-1 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0",
            "text-[13px] leading-5 outline-none",
            "motion-reduce:transition-none motion-reduce:data-[starting-style]:translate-y-0 motion-reduce:data-[starting-style]:scale-100",
            className,
          )}
          {...props}
        >
          {children}
          {showArrow && (
            <PreviewCardPrimitive.Arrow
              data-slot="hover-card-arrow"
              aria-hidden
              className={cn(
                "size-2 rotate-45 border border-border/70 bg-popover",
                // Hide the two edges facing away from the trigger per side.
                "data-[side=top]:rounded-b-none data-[side=top]:border-t-0 data-[side=top]:border-s-0",
                "data-[side=bottom]:rounded-t-none data-[side=bottom]:border-b-0 data-[side=bottom]:border-e-0",
                "data-[side=left]:rounded-e-none data-[side=left]:border-b-0 data-[side=left]:border-s-0",
                "data-[side=right]:rounded-s-none data-[side=right]:border-e-0 data-[side=right]:border-t-0",
              )}
            />
          )}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };

export default HoverCard;
