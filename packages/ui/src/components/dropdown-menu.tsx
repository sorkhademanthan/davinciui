"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

// ─────────────────────────────────────────────────────────────
// Design notes — same premium system as the Context Menu:
// translucent blurred surfaces, origin-anchored enter/exit,
// sub-100ms highlight feedback on transform/opacity only, and
// full reduced-motion support. Highlighting is driven by
// `data-highlighted` (pointer, keyboard, type-ahead) — never
// `:hover` alone.
// ─────────────────────────────────────────────────────────────

const POPUP_SHELL = cn(
  // Layout — fluid to the trigger, capped by available space
  "relative z-50 max-h-(--available-height,28rem) min-w-32 overflow-x-hidden overflow-y-auto p-1.5",
  "w-(--anchor-width,auto) max-w-(--available-width)",
  // Surface — translucent + blurred like Linear / Raycast / macOS
  "rounded-xl border border-border/70 bg-popover/95 text-popover-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.02),0_2px_6px_rgb(0_0_0/0.06),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
  "bg-clip-padding backdrop-blur-xl backdrop-saturate-150",
  "dark:border-white/[0.08] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.04),0_2px_8px_rgb(0_0_0/0.4),0_16px_48px_-8px_rgb(0_0_0/0.6)]",
  // Entrance / exit — anchored via --transform-origin
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
  // Pressed — physical, faster than release
  "active:scale-[0.99] active:transition-transform active:duration-75",
  // Keyboard focus — high contrast in both themes
  "focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-inset",
  // Disabled
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
  // Icon normalization (covers both `icon` prop and child svgs)
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  // Legacy pattern compat — bare `<Icon /> Label` children get the same
  // muted → current treatment as the `icon` prop. Scoped to svgs
  // without data-slot so indicators and chevrons keep their styling.
  "[&>svg:not([data-slot])]:text-muted-foreground",
  "group-data-[highlighted]:[&>svg:not([data-slot])]:text-current",
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

function DropdownMenu({ ...props }: React.ComponentProps<typeof MenuPrimitive.Root>) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

// ─────────────────────────────────────────────────────────────
// Trigger
// ─────────────────────────────────────────────────────────────

function DropdownMenuTrigger({
  children,
  asChild,
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Trigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <MenuPrimitive.Trigger
        data-slot="dropdown-menu-trigger"
        render={children as React.ReactElement<Record<string, unknown>>}
        {...props}
      />
    );
  }
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(
        "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Open state hooks for caret rotation etc: group/dropdown-trigger
        "group/dropdown-trigger",
        className,
      )}
      {...props}
    >
      {children}
    </MenuPrimitive.Trigger>
  );
}

// ─────────────────────────────────────────────────────────────
// Portal / Content (Positioner + Popup) — collision-aware,
// flips and shifts to stay inside the viewport.
// ─────────────────────────────────────────────────────────────

interface DropdownMenuContentProps extends React.ComponentProps<typeof MenuPrimitive.Popup> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: number | Record<string, number>;
}

function DropdownMenuContent({
  className,
  align = "center",
  sideOffset = 4,
  alignOffset,
  side,
  collisionPadding = 8,
  children,
  ...props
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal data-slot="dropdown-menu-portal">
      <MenuPrimitive.Positioner
        data-slot="dropdown-menu-positioner"
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        sticky
        className="z-50"
      >
        <MenuPrimitive.Popup data-slot="dropdown-menu-content" className={cn(POPUP_SHELL, className)} {...props}>
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

// ─────────────────────────────────────────────────────────────
// Item — icon · label · description · shortcut/kbd · badge
// ─────────────────────────────────────────────────────────────

export interface DropdownMenuItemProps extends React.ComponentProps<typeof MenuPrimitive.Item> {
  inset?: boolean;
  variant?: "default" | "destructive";
  /** Leading icon (16px, muted → foreground on highlight). */
  icon?: React.ReactNode;
  /** Second line of muted detail text under the label. */
  description?: React.ReactNode;
  /** Right-aligned shortcut hint, e.g. "⌘S". Prefer `kbd` for keycap styling. */
  shortcut?: string;
  /** Keycap-style shortcut, e.g. kbd={["⌘", "S"]}. */
  kbd?: string[];
  /** Trailing badge / count / status pill. */
  badge?: React.ReactNode;
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  icon,
  description,
  shortcut,
  kbd,
  badge,
  children,
  ...props
}: DropdownMenuItemProps) {
  const destructive = variant === "destructive";
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
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
          data-slot="dropdown-menu-item-icon"
          className={cn(
            "flex size-4 shrink-0 items-center justify-center text-muted-foreground transition-colors group-data-[highlighted]:text-current",
            description && "mt-0.5",
          )}
        >
          {icon}
        </span>
      )}
      <span data-slot="dropdown-menu-item-text" className="flex min-w-0 flex-1 flex-col items-start gap-px text-start">
        <span className="flex w-full items-center gap-2">
          <span className="min-w-0 flex-1 truncate">{children}</span>
          {badge && (
            <span
              data-slot="dropdown-menu-item-badge"
              className="inline-flex shrink-0 items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground"
            >
              {badge}
            </span>
          )}
        </span>
        {description && (
          <span className="w-full truncate text-xs font-normal text-muted-foreground">{description}</span>
        )}
      </span>
      {kbd ? <KbdHint keys={kbd} /> : shortcut ? <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut> : null}
    </MenuPrimitive.Item>
  );
}

// ─────────────────────────────────────────────────────────────
// Checkbox Item — indicator pops in with a springy scale.
// `onSelect={(e) => e.preventDefault()}` keeps the menu open.
// ─────────────────────────────────────────────────────────────

export interface DropdownMenuCheckboxItemProps extends React.ComponentProps<typeof MenuPrimitive.CheckboxItem> {
  icon?: React.ReactNode;
  description?: React.ReactNode;
  shortcut?: string;
  kbd?: string[];
}

function DropdownMenuCheckboxItem({
  className,
  children,
  icon,
  description,
  shortcut,
  kbd,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(ITEM_SHELL, "pl-2", description && "items-start py-1.5", className)}
      {...props}
    >
      <span aria-hidden className="flex size-5 shrink-0 items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator className="flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] data-[starting-style]:scale-50 data-[ending-style]:scale-50 motion-reduce:transition-none [&_svg]:size-4">
          <Check />
        </MenuPrimitive.CheckboxItemIndicator>
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
      {kbd ? <KbdHint keys={kbd} /> : shortcut ? <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut> : null}
    </MenuPrimitive.CheckboxItem>
  );
}

// ─────────────────────────────────────────────────────────────
// Radio Group / Radio Item
// ─────────────────────────────────────────────────────────────

function DropdownMenuRadioGroup({ ...props }: React.ComponentProps<typeof MenuPrimitive.RadioGroup>) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

export interface DropdownMenuRadioItemProps extends React.ComponentProps<typeof MenuPrimitive.RadioItem> {
  icon?: React.ReactNode;
  description?: React.ReactNode;
  shortcut?: string;
}

function DropdownMenuRadioItem({ className, children, icon, description, shortcut, ...props }: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(ITEM_SHELL, "pl-2", description && "items-start py-1.5", className)}
      {...props}
    >
      <span aria-hidden className="flex size-5 shrink-0 items-center justify-center">
        <MenuPrimitive.RadioItemIndicator className="flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] data-[starting-style]:scale-50 data-[ending-style]:scale-50 motion-reduce:transition-none [&_svg]:size-2 [&_svg]:fill-current">
          <Circle />
        </MenuPrimitive.RadioItemIndicator>
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
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </MenuPrimitive.RadioItem>
  );
}

// ─────────────────────────────────────────────────────────────
// Label / Separator / Shortcut / Group
// ─────────────────────────────────────────────────────────────

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  inset?: boolean;
}) {
  // Plain div on purpose: Base UI's GroupLabel requires a Menu.Group
  // ancestor and throws otherwise, but labels are valid anywhere in
  // a menu (e.g. directly under content, above a loose item list).
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset}
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

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(
        "-mx-1.5 my-1.5 h-px bg-gradient-to-r from-transparent via-border to-transparent",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      aria-hidden
      className={cn(
        "ml-auto shrink-0 pl-6 font-mono text-[11px] tracking-widest text-muted-foreground/80",
        className,
      )}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Group
// ─────────────────────────────────────────────────────────────

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof MenuPrimitive.Group>) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

// ─────────────────────────────────────────────────────────────
// Submenu — hover intent + pointer grace area from the primitive
// ─────────────────────────────────────────────────────────────

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof MenuPrimitive.SubmenuRoot>) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(ITEM_SHELL, "group/sub", inset && "pl-9", className)}
      {...props}
    >
      {children}
      <ChevronRight
        aria-hidden
        data-slot="dropdown-menu-sub-chevron"
        className="ml-auto size-4 shrink-0 text-muted-foreground/70 transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[highlighted]/sub:translate-x-px group-data-[highlighted]/sub:text-current group-data-[popup-open]/sub:translate-x-px rtl:rotate-180"
      />
    </MenuPrimitive.SubmenuTrigger>
  );
}

interface DropdownMenuSubContentProps extends React.ComponentProps<typeof MenuPrimitive.Popup> {
  alignOffset?: number;
  sideOffset?: number;
  collisionPadding?: number | Record<string, number>;
}

function DropdownMenuSubContent({ className, sideOffset = 6, alignOffset = -4, collisionPadding = 8, ...props }: DropdownMenuSubContentProps) {
  return (
    <MenuPrimitive.Portal data-slot="dropdown-menu-sub-portal">
      <MenuPrimitive.Positioner
        data-slot="dropdown-menu-sub-positioner"
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        sticky
        className="z-50"
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-sub-content"
          data-lenis-prevent
          className={cn(POPUP_SHELL, "w-auto min-w-48", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
