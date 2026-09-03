"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Bell, Check, Loader2 } from "lucide-react";

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full w-full flex-wrap items-center justify-center gap-2 p-8">{children}</div>;
}

export function BadgePreview() {
  return (
    <Shell>
      <Badge>Badge</Badge>
    </Shell>
  );
}

export function BadgeVariantsPreview() {
  return (
    <Shell>
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </Shell>
  );
}

export function BadgeIconPreview() {
  return (
    <Shell>
      <Badge variant="secondary">
        <Check /> Verified
      </Badge>
      <Badge>
        <Bell /> 5 new <span className="sr-only">notifications</span>
      </Badge>
    </Shell>
  );
}

export function BadgeSpinnerPreview() {
  return (
    <Shell>
      <Badge variant="secondary">
        <Loader2 className="animate-spin" /> Syncing
      </Badge>
      <Badge>
        <Loader2 className="animate-spin" /> Loading
      </Badge>
    </Shell>
  );
}

export function BadgeLinkPreview() {
  return (
    <Shell>
      <Badge asChild>
        <a href="#badge-link">v2.0 available</a>
      </Badge>
    </Shell>
  );
}

export function BadgeColorsPreview() {
  return (
    <Shell>
      <Badge className="border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
        Custom green
      </Badge>
      <Badge className="border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
        Custom blue
      </Badge>
    </Shell>
  );
}

export function BadgeRtlPreview() {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-2 p-8" dir="rtl">
      <Badge>شارة</Badge>
      <Badge variant="secondary">
        <Bell /> ٥ جديدة
      </Badge>
    </div>
  );
}
