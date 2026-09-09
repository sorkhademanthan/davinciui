"use client";

import { Button } from "@workspace/ui/components/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@workspace/ui/components/button-group";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Italic,
  Search,
  Star,
  Underline,
} from "lucide-react";

export function ButtonGroupPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ButtonGroup>
        <Button variant="outline">Left</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Right</Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupSegmentedPreview() {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-6 p-8">
      <ButtonGroup variant="segmented" aria-label="Range">
        <Button variant="ghost" size="sm">
          Day
        </Button>
        <Button variant="ghost" size="sm">
          Week
        </Button>
        <Button variant="ghost" size="sm">
          Month
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="segmented" aria-label="Plan">
        <Button size="sm">Monthly</Button>
        <Button variant="ghost" size="sm">
          Yearly
        </Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupToolbarPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ButtonGroup variant="segmented" aria-label="Formatting">
        <Button variant="ghost" size="icon-sm" aria-label="Bold">
          <Bold className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Italic">
          <Italic className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Underline">
          <Underline className="size-4" />
        </Button>
        <ButtonGroupSeparator orientation="vertical" />
        <Button variant="ghost" size="icon-sm" aria-label="Align left">
          <AlignLeft className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Align center">
          <AlignCenter className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Align right">
          <AlignRight className="size-4" />
        </Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupOrientationPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-8 p-8">
      <ButtonGroup>
        <Button variant="outline" size="sm">H1</Button>
        <Button variant="outline" size="sm">H2</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical">
        <Button variant="outline" size="sm">V1</Button>
        <Button variant="outline" size="sm">V2</Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupSizePreview() {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-4 p-8">
      <ButtonGroup>
        <Button variant="outline" size="sm">Small</Button>
        <Button variant="outline" size="sm">Small</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Default</Button>
        <Button variant="outline">Default</Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupNestedPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ButtonGroup>
        <Button variant="outline">One</Button>
        <ButtonGroup>
          <Button variant="outline">Nested A</Button>
          <Button variant="outline">Nested B</Button>
        </ButtonGroup>
        <Button variant="outline">Two</Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupSeparatorPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ButtonGroup>
        <Button variant="outline">Left</Button>
        <ButtonGroupSeparator orientation="vertical" />
        <Button variant="outline">Right</Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupSplitPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ButtonGroup>
        <Button>Action</Button>
        <Button size="icon" aria-label="More options">
          <ChevronDown className="size-4" />
        </Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupInputPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ButtonGroup>
        <input className="h-9 w-32 rounded-s-[10px] border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Search" />
        <Button>Go</Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupInputGroupPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ButtonGroup>
        <ButtonGroupText>
          <Search className="size-4" />
        </ButtonGroupText>
        <input className="h-9 w-32 border-y bg-background px-3 text-sm focus:outline-none" placeholder="Input Group" />
        <Button>Submit</Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupDropdownPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ButtonGroup>
        <Button variant="outline">Dropdown</Button>
        <Button variant="outline" size="icon" aria-label="Open">
          <ChevronDown className="size-4" />
        </Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupSelectPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ButtonGroup>
        <select className="h-9 rounded-s-[10px] border bg-background px-3 text-sm">
          <option>Select</option>
          <option>Option A</option>
        </select>
        <Button>Apply</Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupPopoverPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ButtonGroup>
        <Button variant="outline">Popover Trigger</Button>
        <Button variant="outline" size="icon" aria-label="Info">
          <Star className="size-4" />
        </Button>
      </ButtonGroup>
    </div>
  );
}

export function ButtonGroupRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <ButtonGroup>
        <Button variant="outline">يمين</Button>
        <Button variant="outline">يسار</Button>
      </ButtonGroup>
    </div>
  );
}
