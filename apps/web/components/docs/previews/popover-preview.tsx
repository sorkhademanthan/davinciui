"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

export function PopoverPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Dimensions</h4>
              <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">Width</Label>
                <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxWidth">Max. width</Label>
                <Input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="height">Height</Label>
                <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxHeight">Max. height</Label>
                <Input id="maxHeight" defaultValue="none" className="col-span-2 h-8" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverBasicPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Basic</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <p className="text-sm">Place content for the popover here.</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverAlignPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-2 p-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Start
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-3" align="start">
          <p className="text-sm">Align start</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Center
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-3" align="center">
          <p className="text-sm">Align center</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            End
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-3" align="end">
          <p className="text-sm">Align end</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverFormPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">With form</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-1">
              <h4 className="font-medium leading-none">Create project</h4>
              <p className="text-sm text-muted-foreground">Add a new project to your workspace.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project">Project name</Label>
              <Input id="project" placeholder="My project" />
            </div>
            <div className="flex justify-end">
              <Button size="sm">Create</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">فتح</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <p className="text-sm">محتوى البوبوفر مع دعم RTL.</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverCompactPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Hint
          </Button>
        </PopoverTrigger>
        <PopoverContent variant="compact">
          <p>
            Billable · <span className="font-medium text-foreground">$48.20</span>
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverWidePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">View profile</Button>
        </PopoverTrigger>
        <PopoverContent variant="wide">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-foreground text-lg font-semibold text-background">
              A
            </div>
            <div className="min-w-0 flex-1">
              <PopoverHeader>
                <PopoverTitle>Ada Lovelace</PopoverTitle>
                <PopoverDescription>Analytical engines · London</PopoverDescription>
              </PopoverHeader>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                First programmer. Writes notes that compile a century later. Currently reviewing your pull
                request line by line.
              </p>
              <div className="mt-4 flex gap-2">
                <Button size="sm">Follow</Button>
                <Button size="sm" variant="outline">
                  Message
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverHeaderPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Structured</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid gap-4">
            <PopoverHeader>
              <PopoverTitle>Notifications</PopoverTitle>
              <PopoverDescription>Choose what pings you and where.</PopoverDescription>
            </PopoverHeader>
            <div className="grid gap-2">
              <Label htmlFor="pop-email">Email digest</Label>
              <Input id="pop-email" defaultValue="daily" className="h-8" />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function PopoverSidesPreview() {
  const sides = ["top", "right", "bottom", "left"] as const;
  return (
    <div className="flex h-full w-full items-center justify-center gap-2 p-8">
      {sides.map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="capitalize">
              {side}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-3" side={side} showArrow>
            <p className="text-sm capitalize">Side: {side}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}

export function PopoverArrowPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">With arrow</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" showArrow>
          <PopoverHeader>
            <PopoverTitle>Anchored note</PopoverTitle>
            <PopoverDescription>The caret points back at the trigger.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </div>
  );
}
