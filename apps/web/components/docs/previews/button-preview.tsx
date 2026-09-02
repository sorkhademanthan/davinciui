"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowRight, Loader2, Star } from "lucide-react";

export function ButtonPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button>Default Button</Button>
    </div>
  );
}

export function ButtonCursorPreview() {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-4 p-8">
      <Button>Pointer</Button>
      <Button disabled className="cursor-not-allowed">
        Disabled
      </Button>
    </div>
  );
}

export function ButtonSizesPreview() {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-4 p-8">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Icon">
        ★
      </Button>
    </div>
  );
}

export function ButtonDefaultPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button>Default</Button>
    </div>
  );
}

export function ButtonOutlinePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button variant="outline">Outline</Button>
    </div>
  );
}

export function ButtonSecondaryPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button variant="secondary">Secondary</Button>
    </div>
  );
}

export function ButtonGhostPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}

export function ButtonDestructivePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button variant="destructive">Destructive</Button>
    </div>
  );
}

export function ButtonLinkPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button variant="link">Link</Button>
    </div>
  );
}

export function ButtonIconPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button size="icon" aria-label="Star">
        <Star className="size-4" />
      </Button>
    </div>
  );
}

export function ButtonWithIconPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button>
        <Star className="size-4" />
        With Icon
      </Button>
    </div>
  );
}

export function ButtonRoundedPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button className="rounded-full">Rounded</Button>
    </div>
  );
}

export function ButtonSpinnerPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button disabled>
        <Loader2 className="size-4 animate-spin" />
        Loading
      </Button>
    </div>
  );
}

export function ButtonGroupPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="inline-flex -space-x-px rounded-md shadow-sm">
        <Button variant="outline" className="rounded-r-none">
          Left
        </Button>
        <Button variant="outline" className="rounded-none border-l-0">
          Middle
        </Button>
        <Button variant="outline" className="rounded-l-none border-l-0">
          Right
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function ButtonAsLinkPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Button asChild>
        <a href="#">As Link</a>
      </Button>
    </div>
  );
}

export function ButtonRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Button>
        <ArrowRight className="size-4" />
        RTL
      </Button>
    </div>
  );
}
