"use client";

import { Progress } from "@workspace/ui/components/progress";
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
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-sm">
          <Label>With label and value</Label>
          <span className="text-muted-foreground">60%</span>
        </div>
        <Progress value={60} />
      </div>
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
