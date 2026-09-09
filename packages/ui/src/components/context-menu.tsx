"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Design notes
// ─────────────────────────────────────────────────────────────
// Built on Base UI's ContextMenu primitive (floating-ui positioning,
// focus management, roving highlight, type-ahead, submenu pointer
// grace, long-press touch, Shift+F10 / ContextMenu-key trigger).
// This file owns only the premium visual layer + a friendlier API:
// icons, descriptions, kbd hints, destructive states, and motion
// tuned to feel instant with reduced-motion support.
//
// Highlighting is driven by `data-highlighted` (pointer, keyboard,
// type-ahead) — never `:hover` alone — so mouse and keyboard stay
// in sync for sighted users and screen readers alike.
// ─────────────────────────────────────────────────────────────

const POPUP_SHELL = cn(
  // Layout
  "relative z-50 max-h-[min(28rem,var(--available-height,28rem))] min-w-56 overflow-x-hidden overflow-y-auto p-1.5",
  // Surface — translucent + blurred like Linear / Raycast / macOS
  "rounded-xl border border-border/70 bg-popover/95 text-popover-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.02),0_2px_6px_rgb(0_0_0/0.06),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
  "bg-clip-padding backdrop-blur-xl backdrop-saturate-150",
  "dark:border-white/[0.08] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.04),0_2px_8px_rgb(0_0_0/0.4),0_16px_48px_-8px_rgb(0_0_0/0.6)]",
  // Entrance / exit — anchored at the cursor via --transform-origin
  "origin-[var(--transform-origin)] transition-[opacity,scale,translate] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform",
  "data-[starting-style]:translate-y-1 data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0",
  "data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0",
  // Thin, unobtrusive scrollbar for long menus
  "[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
  "text-[13px] outline-none",
  // Reduced motion — appear instantly, no transform
  "motion-reduce:transition-none motion-reduce:data-[starting-style]:translate-y-0 motion-reduce:data-[starting-style]:scale-100",
);

const ITEM_SHELL = cn(
  "group relative flex w-full cursor-default items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium leading-5 outline-none select-none",
  "min-h-8 text-foreground/90",
  // Highlighted (hover / keyboard / type-ahead)
  "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
  // Pressed
  "active:scale-[0.99] active:transition-transform active:duration-75",
  // Keyboard focus — high contrast in both themes
  "focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-inset",
  // Disabled
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
  // Icon normalization
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  // Open submenu parent stays highlighted
  "data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground",
);

function KbdHint({ keys }: { keys: string[] }) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-0.5 pl-6" aria-hidden>
      {keys.map((key) => (
        <kbd
          key={key}
          className="inline-flex min-w-5 items-center justify-center rounded-md border border-border/70 bg-muted/60 px-1 py-px font-mono text-[11px] font-medium text-muted-foreground shadow-[0_1px_0_rgb(0_0_0/0.06)]"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────

export interface ContextMenuProps
  extends Omit<React.ComponentProps<typeof ContextMenuPrimitive.Root>, "onOpenChange" | "children"> {
  children?: React.ReactNode;
  /** Fires when the menu opens or closes. */
  onOpenChange?: (open: boolean, details: { reason?: string }) => void;
  /** Text direction — mirrors submenu sides and chevrons. @default "ltr" */
  dir?: "ltr" | "rtl";
}

function ContextMenu({ dir = "ltr", onOpenChange, children, ...props }: ContextMenuProps) {
  return (
    <ContextMenuPrimitive.Root
      data-slot="context-menu"
      onOpenChange={(open, details) => onOpenChange?.(open, { reason: details?.reason })}
      {...props}
    >
      <span dir={dir} data-slot="context-menu-dir" className="contents">
        {children}
      </span>
    </ContextMenuPrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────────
// Trigger — right-click, Ctrl+click (macOS), long-press (touch),
// Shift+F10 and the ContextMenu key are handled by the primitive.
// ─────────────────────────────────────────────────────────────

export interface ContextMenuTriggerProps extends Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.Trigger>,
  "render"
> {
  /** Render into the child element instead of a wrapper div. */
  asChild?: boolean;
}

function ContextMenuTrigger({ asChild, children, className, ...props }: ContextMenuTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return (
      <ContextMenuPrimitive.Trigger
        data-slot="context-menu-trigger"
        render={children as React.ReactElement<Record<string, unknown>>}
        {...props}
      />
    );
  }
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn(
        "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {children}
    </ContextMenuPrimitive.Trigger>
  );
}

// ─────────────────────────────────────────────────────────────
// Content — portal + collision-aware positioner + popup.
// Flips and shifts to stay inside the viewport; no placement
// props needed for the common case.
// ─────────────────────────────────────────────────────────────

export interface ContextMenuContentProps extends React.ComponentProps<typeof ContextMenuPrimitive.Popup> {
  /** Offset from the cursor along the opening axis. @default 4 */
  sideOffset?: number;
  /** Offset along the alignment axis. @default 0 */
  alignOffset?: number;
  /** Safe-area padding for collision flipping. @default 8 */
  collisionPadding?: number | Record<string, number>;
}

function ContextMenuContent({
  className,
  sideOffset = 4,
  alignOffset = 0,
  collisionPadding = 8,
  children,
  ...props
}: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal">
      <ContextMenuPrimitive.Positioner
        data-slot="context-menu-positioner"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        sticky
        className="z-50"
      >
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          role="menu"
          className={cn(POPUP_SHELL, className)}
          {...props}
        >
          {children}
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

// ─────────────────────────────────────────────────────────────
// Item — icon · label · description · shortcut/kbd · badge
// ─────────────────────────────────────────────────────────────

export interface ContextMenuItemProps extends React.ComponentProps<typeof ContextMenuPrimitive.Item> {
  /** Leading icon (16px, muted → foreground on highlight). */
  icon?: React.ReactNode;
  /** Second line of muted detail text under the label. */
  description?: React.ReactNode;
  /** Right-aligned shortcut hint, e.g. "⌘C". Prefer `kbd` for keycap styling. */
  shortcut?: string;
  /** Keycap-style shortcut, e.g. kbd={["⌘", "C"]}. */
  kbd?: string[];
  /** Trailing badge / count / status pill. */
  badge?: React.ReactNode;
  /** Destructive styling. @default false */
  destructive?: boolean;
  /** Indent to align with checkable items. @default false */
  inset?: boolean;
}

function ContextMenuItem({
  icon,
  description,
  shortcut,
  kbd,
  badge,
  destructive = false,
  inset = false,
  className,
  children,
  ...props
}: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset || undefined}
      data-variant={destructive ? "destructive" : undefined}
      className={cn(
        ITEM_SHELL,
        inset && "pl-9",
        destructive &&
          "text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive focus-visible:ring-destructive/40",
        description && "items-start py-1.5",
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          aria-hidden
          data-slot="context-menu-item-icon"
          className={cn(
            "flex size-4 shrink-0 items-center justify-center text-muted-foreground transition-colors group-data-[highlighted]:text-current",
            description && "mt-0.5",
          )}
        >
          {icon}
        </span>
      )}
      <span data-slot="context-menu-item-text" className="flex min-w-0 flex-1 flex-col items-start gap-px text-start">
        <span className="w-full truncate">{children}</span>
        {description && (
          <span className="w-full truncate text-xs font-normal text-muted-foreground">{description}</span>
        )}
      </span>
      {badge && (
        <span
          data-slot="context-menu-item-badge"
          className="ml-auto inline-flex shrink-0 items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground"
        >
          {badge}
        </span>
      )}
      {kbd ? <KbdHint keys={kbd} /> : shortcut ? <ContextMenuShortcut>{shortcut}</ContextMenuShortcut> : null}
    </ContextMenuPrimitive.Item>
  );
}

// ─────────────────────────────────────────────────────────────
// Label / Separator / Shortcut / Group
// ─────────────────────────────────────────────────────────────

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  // Plain div on purpose: Base UI's GroupLabel requires a Menu.Group
  // ancestor and throws otherwise, but labels are valid anywhere in
  // a menu (e.g. above a RadioGroup or a loose item list).
  return (
    <div
      data-slot="context-menu-label"
      data-inset={inset || undefined}
      aria-hidden
      className={cn(
        "px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/90 uppercase select-none",
        inset && "pl-9",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(
        "-mx-1.5 my-1.5 h-px bg-gradient-to-r from-transparent via-border to-transparent",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="context-menu-shortcut"
      aria-hidden
      className={cn(
        "ml-auto shrink-0 pl-6 font-mono text-[11px] tracking-widest text-muted-foreground/80",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuGroup({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

// ─────────────────────────────────────────────────────────────
// Checkbox item — indicator pops in with a springy scale
// ─────────────────────────────────────────────────────────────

export interface ContextMenuCheckboxItemProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> {
  icon?: React.ReactNode;
  description?: React.ReactNode;
  shortcut?: string;
  kbd?: string[];
}

function ContextMenuCheckboxItem({
  className,
  children,
  icon,
  description,
  shortcut,
  kbd,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(ITEM_SHELL, "pl-2", description && "items-start py-1.5", className)}
      {...props}
    >
      <span aria-hidden className="flex size-5 shrink-0 items-center justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator className="flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] data-[starting-style]:scale-50 data-[ending-style]:scale-50 motion-reduce:transition-none [&_svg]:size-4">
          <Check />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {icon && (
        <span aria-hidden className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col items-start gap-px text-start">
        <span className="w-full truncate">{children}</span>
        {description && (
          <span className="w-full truncate text-xs font-normal text-muted-foreground">{description}</span>
        )}
      </span>
      {kbd ? <KbdHint keys={kbd} /> : shortcut ? <ContextMenuShortcut>{shortcut}</ContextMenuShortcut> : null}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

// ─────────────────────────────────────────────────────────────
// Radio group / item
// ─────────────────────────────────────────────────────────────

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

export interface ContextMenuRadioItemProps extends React.ComponentProps<typeof ContextMenuPrimitive.RadioItem> {
  description?: React.ReactNode;
  shortcut?: string;
}

function ContextMenuRadioItem({ className, children, description, shortcut, ...props }: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(ITEM_SHELL, "pl-2", description && "items-start py-1.5", className)}
      {...props}
    >
      <span aria-hidden className="flex size-5 shrink-0 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator className="flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] data-[starting-style]:scale-50 data-[ending-style]:scale-50 motion-reduce:transition-none [&_svg]:size-2 [&_svg]:fill-current">
          <Circle />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-px text-start">
        <span className="w-full truncate">{children}</span>
        {description && (
          <span className="w-full truncate text-xs font-normal text-muted-foreground">{description}</span>
        )}
      </span>
      {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
    </ContextMenuPrimitive.RadioItem>
  );
}

// ─────────────────────────────────────────────────────────────
// Submenu — headless composition (Root / Trigger / Content)
// plus a declarative `<ContextMenuSub label>` back-compat wrapper.
// Hover intent + pointer grace area come from the primitive.
// ─────────────────────────────────────────────────────────────

function ContextMenuSubRoot({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubmenuRoot>) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />;
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubmenuTrigger> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(ITEM_SHELL, "group/sub", inset && "pl-9", className)}
      {...props}
    >
      {children}
      <ChevronRight
        aria-hidden
        data-slot="context-menu-sub-chevron"
        className="ml-auto size-4 shrink-0 text-muted-foreground/70 transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[highlighted]/sub:translate-x-px group-data-[highlighted]/sub:text-current group-data-[popup-open]/sub:translate-x-px rtl:rotate-180"
      />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

export interface ContextMenuSubContentProps extends React.ComponentProps<typeof ContextMenuPrimitive.Popup> {
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: number | Record<string, number>;
}

function ContextMenuSubContent({
  className,
  sideOffset = 6,
  alignOffset = -4,
  collisionPadding = 8,
  children,
  ...props
}: ContextMenuSubContentProps) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-sub-portal">
      <ContextMenuPrimitive.Positioner
        data-slot="context-menu-sub-positioner"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        sticky
        className="z-50"
      >
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-sub-content"
          role="menu"
          className={cn(POPUP_SHELL, "min-w-48", className)}
          {...props}
        >
          {children}
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

export interface ContextMenuSubProps {
  /** Submenu trigger label. */
  label: React.ReactNode;
  /** Leading icon on the trigger. */
  icon?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Declarative submenu — `<ContextMenuSub label="Share">…</ContextMenuSub>`. */
function ContextMenuSub({ label, icon, disabled = false, children, className }: ContextMenuSubProps) {
  return (
    <ContextMenuSubRoot>
      <ContextMenuSubTrigger disabled={disabled} className={className}>
        {icon && (
          <span aria-hidden className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
            {icon}
          </span>
        )}
        <span className="flex-1 truncate text-start">{label}</span>
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>{children}</ContextMenuSubContent>
    </ContextMenuSubRoot>
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubRoot,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
};

export default ContextMenu;
