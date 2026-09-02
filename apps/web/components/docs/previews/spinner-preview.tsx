"use client";

import { Spinner } from "@workspace/ui/components/spinner";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";

export function SpinnerPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Spinner />
    </div>
  );
}

export function SpinnerCustomizationPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Spinner className="text-primary" />
    </div>
  );
}

export function SpinnerSizePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 p-8">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
    </div>
  );
}

export function SpinnerButtonPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button disabled>
        <Spinner size="sm" className="mr-2" />
        Loading
      </Button>
    </div>
  );
}

export function SpinnerBadgePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Badge className="gap-2">
        <Spinner size="sm" className="size-3" />
        Badge
      </Badge>
    </div>
  );
}

export function SpinnerInputGroupPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="relative max-w-sm w-full">
        <Input placeholder="Input Group" className="pr-8" />
        <Spinner size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 size-4" />
      </div>
    </div>
  );
}

export function SpinnerEmptyPreview() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8">
      <Spinner size="lg" className="text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">Empty state</p>
    </div>
  );
}

export function SpinnerRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Spinner />
    </div>
  );
}
