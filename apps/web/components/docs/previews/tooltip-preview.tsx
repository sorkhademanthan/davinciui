"use client";

import { Button } from "@workspace/ui/components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { Kbd } from "@workspace/ui/components/kbd";
import { Info } from "lucide-react";

export function TooltipPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add to library</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function TooltipPlacementPreview() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 p-8">
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">Top</Button>
            </TooltipTrigger>
            <TooltipContent side="top">Top placement</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">Bottom</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Bottom placement</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">Left</Button>
            </TooltipTrigger>
            <TooltipContent side="left">Left placement</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">Right</Button>
            </TooltipTrigger>
            <TooltipContent side="right">Right placement</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-xs text-muted-foreground">Hover each trigger to see placement</p>
    </div>
  );
}

export function TooltipShortcutPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Save">
              <Info className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            <span>Save</span>
            <Kbd className="ml-1 bg-white/20 text-white border-white/20">⌘S</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function TooltipDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex" tabIndex={0}>
              <Button variant="outline" disabled className="pointer-events-none">
                Disabled
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>This action is disabled</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function TooltipRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">مرر</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>تلميح بالعربية</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
