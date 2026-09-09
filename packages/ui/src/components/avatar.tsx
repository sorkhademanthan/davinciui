"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";

import { cn } from "@workspace/ui/lib/utils";

export type AvatarSize = "xs" | "sm" | "default" | "lg" | "xl";
export type AvatarStatus = "online" | "busy" | "away" | "offline";

const avatarSizes: Record<AvatarSize, string> = {
  xs: "size-6",
  sm: "size-8",
  default: "size-10",
  lg: "size-12",
  xl: "size-16",
};

const avatarFallbackText: Record<AvatarSize, string> = {
  xs: "text-[10px]",
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
  xl: "text-xl",
};

const avatarBadgeSizes: Record<AvatarSize, string> = {
  xs: "size-2",
  sm: "size-2.5",
  default: "size-3",
  lg: "size-3.5",
  xl: "size-4",
};

const avatarStatusTones: Record<AvatarStatus, string> = {
  online: "bg-emerald-500",
  busy: "bg-rose-500",
  away: "bg-amber-400",
  offline: "bg-zinc-400 dark:bg-zinc-600",
};

const AvatarSizeContext = React.createContext<AvatarSize>("default");

export interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  /** Diameter scale. Inherited by badge, fallback, and group count. @default "default" */
  size?: AvatarSize;
}

function Avatar({ size = "default", className, ...props }: AvatarProps) {
  return (
    <AvatarSizeContext.Provider value={size}>
      <AvatarPrimitive.Root
        data-slot="avatar"
        data-size={size}
        // No overflow-hidden here: the badge docks at the corner and must
        // paint outside the circle. Image and fallback clip themselves.
        className={cn(
          "relative flex shrink-0 rounded-full bg-muted ring-1 ring-inset ring-foreground/10",
          avatarSizes[size],
          className
        )}
        {...props}
      />
    </AvatarSizeContext.Provider>
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("size-full rounded-full object-cover", className)}
      {...props}
    />
  );
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function hueOf(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

export interface AvatarFallbackProps extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  /** Full name — renders initials on a stable generative tint. Children win when provided. */
  name?: string;
}

function AvatarFallback({ name, className, children, style, ...props }: AvatarFallbackProps) {
  const size = React.useContext(AvatarSizeContext);
  const label = children ?? (name ? initialsOf(name) : null);
  const hue = name && !children ? hueOf(name) : null;
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
        avatarFallbackText[size],
        hue != null && "bg-[hsl(var(--avatar-hue)_60%_90%)] text-[hsl(var(--avatar-hue)_50%_30%)] dark:bg-[hsl(var(--avatar-hue)_45%_20%)] dark:text-[hsl(var(--avatar-hue)_80%_80%)]",
        className
      )}
      style={hue != null ? ({ "--avatar-hue": hue, ...style }) as unknown as React.CSSProperties : style}
      {...props}
    >
      {label}
    </AvatarPrimitive.Fallback>
  );
}

export interface AvatarBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Presence tone. @default "online" */
  status?: AvatarStatus;
}

function AvatarBadge({ status = "online", className, ...props }: AvatarBadgeProps) {
  const size = React.useContext(AvatarSizeContext);
  return (
    <span
      data-slot="avatar-badge"
      data-status={status}
      className={cn(
        "absolute end-0 bottom-0 rounded-full ring-2 ring-background",
        avatarBadgeSizes[size],
        avatarStatusTones[status],
        className
      )}
      {...props}
    />
  );
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Diameter scale inherited by every avatar and the count. @default "default" */
  size?: AvatarSize;
  /** Collapse beyond this many avatars into a +N count. */
  max?: number;
}

function AvatarGroup({ size = "default", max, className, children, ...props }: AvatarGroupProps) {
  const items = React.Children.toArray(children).filter((child) => React.isValidElement(child));
  const visible = max != null ? items.slice(0, max) : items;
  const remainder = max != null ? items.length - visible.length : 0;
  return (
    <AvatarSizeContext.Provider value={size}>
      <div
        data-slot="avatar-group"
        className={cn(
          "flex w-fit items-center -space-x-2 transition-[margin] hover:-space-x-1 [&>*]:shrink-0 [&>*]:transition-[margin] [&>*]:ring-2 [&>*]:ring-background",
          className
        )}
        {...props}
      >
        {visible}
        {remainder > 0 ? <AvatarGroupCount>+{remainder}</AvatarGroupCount> : null}
      </div>
    </AvatarSizeContext.Provider>
  );
}

function AvatarGroupCount({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const size = React.useContext(AvatarSizeContext);
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted text-xs font-medium text-muted-foreground",
        avatarSizes[size],
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount };

export default Avatar;
