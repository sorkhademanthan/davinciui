"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export type ToggleGroupVariant = "default" | "outline";
export type ToggleGroupSize = "default" | "sm" | "lg";
export type ToggleGroupSpacing = "none" | "sm" | "lg";
export type ToggleGroupOrientation = "horizontal" | "vertical";

interface ToggleGroupStyle {
  variant: ToggleGroupVariant;
  size: ToggleGroupSize;
  spacing: ToggleGroupSpacing;
  orientation: ToggleGroupOrientation;
}

const ToggleGroupContext = React.createContext<ToggleGroupStyle>({
  variant: "default",
  size: "default",
  spacing: "none",
  orientation: "horizontal",
});

interface ToggleGroupBaseProps {
  /** Visual treatment of the items. @default "default" */
  variant?: ToggleGroupVariant;
  /** Size of the items. @default "default" */
  size?: ToggleGroupSize;
  /** Gap between items. Anything but "none" gives every item full rounding. @default "none" */
  spacing?: ToggleGroupSpacing;
  /** Layout direction. @default "horizontal" */
  orientation?: ToggleGroupOrientation;
  /** Disable the whole group. @default false */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  /** Single-select mode. @default "single" */
  type?: "single";
  /** Controlled pressed value. */
  value?: string;
  /** Uncontrolled initial pressed value. */
  defaultValue?: string;
  /** Fires when the pressed value changes. Empty string means nothing pressed. */
  onValueChange?: (value: string) => void;
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  /** Multi-select mode. */
  type: "multiple";
  /** Controlled pressed values. */
  value?: string[];
  /** Uncontrolled initial pressed values. */
  defaultValue?: string[];
  /** Fires when the pressed values change. */
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

type GroupValueProps = {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
};

function ToggleGroup({
  variant = "default",
  size = "default",
  spacing = "none",
  orientation = "horizontal",
  disabled,
  className,
  children,
  ...props
}: ToggleGroupProps) {
  const { type = "single", value, defaultValue, onValueChange, ...rest } = props as GroupValueProps &
    Record<string, unknown>;
  const multiple = type === "multiple";

  const toArray = (v: string | string[] | undefined): string[] | undefined =>
    v === undefined ? undefined : Array.isArray(v) ? v : v === "" ? [] : [v];

  return (
    <ToggleGroupContext.Provider value={{ variant, size, spacing, orientation }}>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        data-spacing={spacing}
        data-orientation={orientation}
        multiple={multiple}
        disabled={disabled}
        value={toArray(value)}
        defaultValue={toArray(defaultValue)}
        onValueChange={(next) => {
          if (multiple) (onValueChange as ToggleGroupMultipleProps["onValueChange"])?.(next);
          else (onValueChange as ToggleGroupSingleProps["onValueChange"])?.(next[0] ?? "");
        }}
        className={cn(
          "group/toggle-group flex w-fit items-center rounded-md",
          orientation === "vertical" && "flex-col items-stretch",
          spacing === "sm" && "gap-1",
          spacing === "lg" && "gap-2",
          variant === "outline" && "shadow-xs",
          className
        )}
        {...(rest as React.ComponentProps<typeof ToggleGroupPrimitive>)}
      >
        {children}
      </ToggleGroupPrimitive>
    </ToggleGroupContext.Provider>
  );
}

export interface ToggleGroupItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** Unique value identifying this item within the group. */
  value: string;
  /** Visual treatment. Inherits the group variant. */
  variant?: ToggleGroupVariant;
  /** Size. Inherits the group size. */
  size?: ToggleGroupSize;
}

function ToggleGroupItem({
  value,
  variant: variantProp,
  size: sizeProp,
  disabled,
  className,
  children,
  ...props
}: ToggleGroupItemProps) {
  const { variant: groupVariant, size: groupSize, spacing, orientation } = React.useContext(ToggleGroupContext);
  const variant = variantProp ?? groupVariant;
  const size = sizeProp ?? groupSize;
  const segmented = spacing === "none";

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={variant}
      data-size={size}
      value={value}
      disabled={disabled}
      className={cn(
        "inline-flex min-w-0 flex-1 shrink-0 items-center justify-center gap-2 border text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50",
        // Pressed + variant treatments (mirror Toggle).
        variant === "default" &&
          "border-transparent bg-transparent hover:bg-muted data-[pressed]:bg-zinc-900 data-[pressed]:text-white dark:data-[pressed]:bg-white dark:data-[pressed]:text-zinc-900",
        variant === "outline" &&
          "border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground data-[pressed]:bg-accent data-[pressed]:text-accent-foreground",
        // Sizes (mirror Toggle).
        size === "default" && "h-9 min-w-9 px-2.5",
        size === "sm" && "h-8 min-w-8 px-1.5 text-xs",
        size === "lg" && "h-10 min-w-10 px-2.5",
        // Joined segments share borders; logical rounding keeps RTL correct.
        segmented && "rounded-none shadow-none focus:z-10",
        segmented && orientation === "horizontal" && "border-l-0 first:rounded-s-md first:border-s last:rounded-e-md",
        segmented && orientation === "vertical" && "border-t-0 first:rounded-t-md first:border-t last:rounded-b-md",
        // Spaced items are independent pills.
        !segmented && "rounded-md",
        !segmented && variant === "outline" && "shadow-xs",
        className
      )}
      {...(props as React.ComponentProps<typeof TogglePrimitive>)}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };

export default ToggleGroup;
