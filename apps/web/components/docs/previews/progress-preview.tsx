"use client";

import { Progress, ProgressLabel, ProgressValue } from "@workspace/ui/components/progress";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import * as React from "react";

export function ProgressPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Progress value={60} className="max-w-sm w-full" />
    </div>
  );
}

export function ProgressWithLabelValuePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Progress value={60} className="w-full max-w-sm space-y-2">
        <div className="flex items-center justify-between">
          <ProgressLabel>Upload progress</ProgressLabel>
          <ProgressValue />
        </div>
      </Progress>
    </div>
  );
}

export function ProgressLabelPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-2">
        <Label>Label</Label>
        <Progress value={45} />
      </div>
    </div>
  );
}

export function ProgressVariantsPreview() {
  const rows = [
    { variant: "primary" as const, value: 50, label: "Primary" },
    { variant: "default" as const, value: 45, label: "Default" },
    { variant: "success" as const, value: 72, label: "Success" },
    { variant: "warning" as const, value: 38, label: "Warning" },
    { variant: "destructive" as const, value: 88, label: "Destructive" },
  ];
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">{r.value}%</span>
            </div>
            <Progress value={r.value} variant={r.variant} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressSizesPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-4">
        <Progress value={60} size="xs" />
        <Progress value={60} size="sm" />
        <Progress value={60} />
        <Progress value={60} size="lg" />
      </div>
    </div>
  );
}

export function ProgressIndeterminatePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Syncing…</span>
          <span className="text-muted-foreground">Working</span>
        </div>
        <Progress value={null} />
      </div>
    </div>
  );
}

export function ProgressUploadPreview() {
  const [value, setValue] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = React.useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
  }, []);
  const start = React.useCallback(() => {
    if (timer.current) return;
    setRunning(true);
    timer.current = setInterval(() => {
      setValue((v) => {
        if (v >= 100) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          setRunning(false);
          return 100;
        }
        return Math.min(100, v + Math.ceil(Math.random() * 9));
      });
    }, 140);
  }, []);
  React.useEffect(() => stop, [stop]);
  const done = value >= 100;
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-3">
        <Progress value={value} variant={done ? "success" : "primary"} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <ProgressLabel>sales-dashboard.pdf</ProgressLabel>
            <ProgressValue />
          </div>
        </Progress>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => (running ? stop() : done ? (setValue(0), start()) : start())}>
            {running ? "Cancel" : done ? "Upload again" : "Start upload"}
          </Button>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {done ? "Complete" : running ? "Uploading…" : "Ready"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProgressStepsPreview() {
  const [step, setStep] = React.useState(3);
  const total = 5;
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {step} of {total}
          </span>
          <span className="text-muted-foreground">Onboarding</span>
        </div>
        <Progress value={step} min={1} max={total} variant="default" />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={step <= 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>
            Back
          </Button>
          <Button size="sm" variant="outline" disabled={step >= total} onClick={() => setStep((s) => Math.min(total, s + 1))}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProgressControlledPreview() {
  const [v, setV] = React.useState(40);
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-4">
        <Progress value={v} />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setV((s) => Math.max(0, s - 10))}>
            -
          </Button>
          <Button size="sm" variant="outline" onClick={() => setV((s) => Math.min(100, s + 10))}>
            +
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProgressRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Progress value={60} className="max-w-sm w-full" />
    </div>
  );
}
