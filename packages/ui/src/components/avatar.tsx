"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="avatar" className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}

function AvatarImage({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />;
}

function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="avatar-fallback" className={cn("flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium", className)} {...props} />;
}

function AvatarBadge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="avatar-badge" className={cn("absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-emerald-500", className)} {...props} />;
}

function AvatarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="avatar-group" className={cn("flex -space-x-2 *:ring-2 *:ring-background", className)} {...props} />;
}

function AvatarGroupCount({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="avatar-group-count" className={cn("flex size-10 items-center justify-center rounded-full border bg-muted text-xs font-medium", className)} {...props} />;
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount };
