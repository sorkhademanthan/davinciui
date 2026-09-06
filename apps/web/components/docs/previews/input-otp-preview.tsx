"use client";

import * as React from "react";
import { InputOTP } from "@workspace/ui/components/input-otp";

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

export function PatternDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout={value || "Type digits — letters are rejected"}>
      <InputOTP value={value} onValueChange={setValue} pattern="[0-9]" inputMode="numeric" />
    </DemoShell>
  );
}

export function SeparatorDemo() {
  const [value, setValue] = React.useState("123456");
  return (
    <DemoShell readout={value || "—"}>
      <InputOTP value={value} onValueChange={setValue} separatorAfter={[2]} />
    </DemoShell>
  );
}

export function DisabledDemo() {
  return (
    <DemoShell readout="Entire group disabled">
      <InputOTP defaultValue="123" disabled />
    </DemoShell>
  );
}

export function ControlledDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout={value || "—"}>
      <div className="flex flex-col items-center gap-4">
        <InputOTP value={value} onValueChange={setValue} />
        <button
          type="button"
          onClick={() => setValue("")}
          className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Reset
        </button>
      </div>
    </DemoShell>
  );
}

export function InvalidDemo() {
  const [value, setValue] = React.useState("12");
  return (
    <DemoShell>
      <div className="flex flex-col items-center gap-2">
        <InputOTP value={value} onValueChange={setValue} invalid />
        <p role="alert" className="text-[13px] font-medium text-destructive">
          Enter all 6 digits.
        </p>
      </div>
    </DemoShell>
  );
}

export function FourDigitsDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout={value || "—"}>
      <InputOTP length={4} value={value} onValueChange={setValue} inputMode="numeric" />
    </DemoShell>
  );
}

export function AlphanumericDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout={value || "Letters auto-uppercase"}>
      <InputOTP value={value} onValueChange={setValue} pattern="[A-Za-z0-9]" uppercase inputMode="text" />
    </DemoShell>
  );
}

export function FormDemo() {
  const [value, setValue] = React.useState("");
  const [done, setDone] = React.useState(false);
  const complete = value.length === 6;
  return (
    <DemoShell readout={done ? `Verified ${value}` : undefined}>
      <form
        className="flex flex-col items-center gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (complete) setDone(true);
        }}
      >
        <InputOTP value={value} onValueChange={(v) => { setValue(v); setDone(false); }} onComplete={() => setDone(true)} />
        <button
          type="submit"
          disabled={!complete}
          className="h-10 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
        >
          Verify
        </button>
      </form>
    </DemoShell>
  );
}

export function RtlOtpDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout="dir=rtl · mirrored arrows">
      <div dir="rtl">
        <InputOTP value={value} onValueChange={setValue} />
      </div>
    </DemoShell>
  );
}
