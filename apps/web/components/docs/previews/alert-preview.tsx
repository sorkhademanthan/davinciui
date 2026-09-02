"use client";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Terminal, AlertCircle } from "lucide-react";

export function AlertPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Alert className="max-w-md">
        <Terminal className="size-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
      </Alert>
    </div>
  );
}

export function AlertDestructivePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="size-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
      </Alert>
    </div>
  );
}

export function AlertActionPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Alert className="max-w-md flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <Terminal className="size-4 mt-0.5" />
          <div>
            <AlertTitle>Update available</AlertTitle>
            <AlertDescription>A new version is ready.</AlertDescription>
          </div>
        </div>
        <Button size="sm">Action</Button>
      </Alert>
    </div>
  );
}

export function AlertCustomColorsPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Alert className="max-w-md border-emerald-500/20 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
        <AlertCircle className="size-4 text-emerald-600" />
        <AlertTitle>Custom colors</AlertTitle>
        <AlertDescription>Use className to override border and background.</AlertDescription>
      </Alert>
    </div>
  );
}

export function AlertRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Alert className="max-w-md">
        <AlertCircle className="size-4" />
        <AlertTitle>تنبيه</AlertTitle>
        <AlertDescription>هذا تنبيه باللغة العربية</AlertDescription>
      </Alert>
    </div>
  );
}
