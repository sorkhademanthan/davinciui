"use client";

import * as React from "react";
import {
  NativeSelect,
  NativeSelectGroup,
  NativeSelectOption,
} from "@workspace/ui/components/native-select";
import { Select } from "@workspace/ui/components/select";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      {children}
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

const ROLES = ["Engineer", "Designer", "Founder"];

export function SimpleNativeSelectDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout={value || "—"}>
      <NativeSelect value={value} onChange={(e) => setValue(e.target.value)}>
        <NativeSelectOption value="" disabled hidden>
          Choose a role…
        </NativeSelectOption>
        {ROLES.map((r) => (
          <NativeSelectOption key={r} value={r}>
            {r}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </DemoShell>
  );
}

export function WithGroupsDemo() {
  const [value, setValue] = React.useState("react");
  return (
    <DemoShell readout={value}>
      <NativeSelect value={value} onChange={(e) => setValue(e.target.value)}>
        <NativeSelectGroup label="React ecosystem">
          <NativeSelectOption value="react">React</NativeSelectOption>
          <NativeSelectOption value="next">Next.js</NativeSelectOption>
        </NativeSelectGroup>
        <NativeSelectGroup label="Vue ecosystem">
          <NativeSelectOption value="vue">Vue</NativeSelectOption>
          <NativeSelectOption value="nuxt">Nuxt</NativeSelectOption>
        </NativeSelectGroup>
      </NativeSelect>
    </DemoShell>
  );
}

export function GroupsDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout={value || "—"}>
      <NativeSelect value={value} onChange={(e) => setValue(e.target.value)}>
        <NativeSelectOption value="" disabled hidden>
          Pick a stack…
        </NativeSelectOption>
        <NativeSelectGroup label="Frontend">
          <NativeSelectOption value="react">React</NativeSelectOption>
          <NativeSelectOption value="vue" disabled>
            Vue (sunset)
          </NativeSelectOption>
        </NativeSelectGroup>
        <NativeSelectGroup label="Backend" disabled>
          <NativeSelectOption value="node">Node</NativeSelectOption>
          <NativeSelectOption value="go">Go</NativeSelectOption>
        </NativeSelectGroup>
      </NativeSelect>
    </DemoShell>
  );
}

export function DisabledNativeSelectDemo() {
  return (
    <DemoShell readout="Entire control disabled">
      <NativeSelect disabled defaultValue="react">
        <NativeSelectOption value="react">React</NativeSelectOption>
        <NativeSelectOption value="vue">Vue</NativeSelectOption>
      </NativeSelect>
    </DemoShell>
  );
}

export function InvalidNativeSelectDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell>
      <div className="flex flex-col items-center gap-2">
        <NativeSelect invalid value={value} onChange={(e) => setValue(e.target.value)}>
          <NativeSelectOption value="" disabled hidden>
            Required field…
          </NativeSelectOption>
          <NativeSelectOption value="react">React</NativeSelectOption>
          <NativeSelectOption value="vue">Vue</NativeSelectOption>
        </NativeSelect>
        <p role="alert" className="text-[13px] font-medium text-destructive">
          Pick a framework to continue.
        </p>
      </div>
    </DemoShell>
  );
}

export function VsSelectDemo() {
  return (
    <DemoShell readout="Left: native (OS picker, zero JS) · Right: custom (full styling)">
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <NativeSelect defaultValue="react" aria-label="Native select">
          <NativeSelectOption value="react">React</NativeSelectOption>
          <NativeSelectOption value="vue">Vue</NativeSelectOption>
        </NativeSelect>
        <Select defaultValue="react" aria-label="Custom select" className="w-72">
          <option value="react">React</option>
          <option value="vue">Vue</option>
        </Select>
      </div>
    </DemoShell>
  );
}

const AR_ROLES = ["مهندس", "مصمم", "مؤسس"];

export function RtlNativeSelectDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell>
      <div dir="rtl">
        <NativeSelect value={value} onChange={(e) => setValue(e.target.value)}>
          <NativeSelectOption value="" disabled hidden>
            اختر الدور…
          </NativeSelectOption>
          {AR_ROLES.map((r) => (
            <NativeSelectOption key={r} value={r}>
              {r}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </DemoShell>
  );
}
