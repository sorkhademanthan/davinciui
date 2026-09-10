"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";

function DemoShell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className={wide ? "w-full max-w-sm" : "w-full max-w-xs"}>{children}</div>
    </div>
  );
}

export function SelectPreview() {
  return (
    <DemoShell>
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectContent>
      </Select>
    </DemoShell>
  );
}

export function SelectCompositionPreview() {
  return (
    <DemoShell>
      <div className="space-y-2">
        <Label>Composition</Label>
        <Select defaultValue="1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DemoShell>
  );
}

export function SelectGroupsPreview() {
  return (
    <DemoShell>
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue placeholder="Pick produce" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>Fruits</SelectGroupLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Vegetables</SelectGroupLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
            <SelectItem value="potato">Potato</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </DemoShell>
  );
}

export function SelectScrollablePreview() {
  return (
    <DemoShell>
      <Select defaultValue="1">
        <SelectTrigger>
          <SelectValue placeholder="Pick an item" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 20 }).map((_, i) => (
            <SelectItem key={i} value={`${i}`}>
              Item {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </DemoShell>
  );
}

export function SelectControlledPreview() {
  const [value, setValue] = React.useState("designer");
  return (
    <DemoShell>
      <div className="space-y-2">
        <Select value={value} onValueChange={(v) => setValue(v as string)}>
          <SelectTrigger>
            <SelectValue placeholder="Pick a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineer">Engineer</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="founder" disabled>
              Founder (filled)
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {value || "—"}
        </p>
      </div>
    </DemoShell>
  );
}

export function SelectSizesPreview() {
  return (
    <DemoShell>
      <div className="space-y-3">
        <Select defaultValue="sm">
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small trigger</SelectItem>
            <SelectItem value="default">Default trigger</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="default">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small trigger</SelectItem>
            <SelectItem value="default">Default trigger</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DemoShell>
  );
}

export function SelectInvalidPreview() {
  return (
    <DemoShell>
      <div className="space-y-2">
        <Select>
          <SelectTrigger invalid>
            <SelectValue placeholder="Required field…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="vue">Vue</SelectItem>
          </SelectContent>
        </Select>
        <p role="alert" className="text-[13px] font-medium text-destructive">
          Pick a framework to continue.
        </p>
      </div>
    </DemoShell>
  );
}

export function SelectDisabledPreview() {
  return (
    <DemoShell>
      <Select disabled defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple (Disabled)</SelectItem>
        </SelectContent>
      </Select>
    </DemoShell>
  );
}

export function SelectAlignPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-xs space-y-3">
        <Select defaultValue="start">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="start">Align Start</SelectItem>
            <SelectItem value="center">Align Center</SelectItem>
            <SelectItem value="end">Align End</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="end">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="start">Align Start</SelectItem>
            <SelectItem value="center">Align Center</SelectItem>
            <SelectItem value="end">Align End</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function SelectRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <div className="w-full max-w-xs">
        <Select defaultValue="apple">
          <SelectTrigger>
            <SelectValue placeholder="اختر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">تفاحة</SelectItem>
            <SelectItem value="banana">موز</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
