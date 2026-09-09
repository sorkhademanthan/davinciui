"use client";

import * as React from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Info,
  OctagonX,
  Rocket,
  X,
} from "lucide-react";
import { Alert, AlertAction, AlertBody, AlertDescription, AlertIcon, AlertTitle } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function AlertPreview() {
  return (
    <DemoShell>
      <Alert>
        <AlertIcon>
          <Rocket />
        </AlertIcon>
        <AlertBody>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
        </AlertBody>
      </Alert>
    </DemoShell>
  );
}

export function AlertInfoPreview() {
  return (
    <DemoShell>
      <Alert variant="info">
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertBody>
          <AlertTitle>New feature available</AlertTitle>
          <AlertDescription>We&apos;ve added dark mode support. Enable it in your account settings.</AlertDescription>
        </AlertBody>
      </Alert>
    </DemoShell>
  );
}

export function AlertSuccessPreview() {
  return (
    <DemoShell>
      <Alert variant="success">
        <AlertIcon>
          <CheckCircle2 />
        </AlertIcon>
        <AlertBody>
          <AlertTitle>Payment successful</AlertTitle>
          <AlertDescription>Your payment of $29.99 has been processed. A receipt is on its way.</AlertDescription>
        </AlertBody>
      </Alert>
    </DemoShell>
  );
}

export function AlertWarningPreview() {
  return (
    <DemoShell>
      <Alert variant="warning">
        <AlertIcon>
          <AlertTriangle />
        </AlertIcon>
        <AlertBody>
          <AlertTitle>Subscription expiring</AlertTitle>
          <AlertDescription>Your trial ends in 3 days. Renew now to avoid interruption.</AlertDescription>
        </AlertBody>
      </Alert>
    </DemoShell>
  );
}

export function AlertDestructivePreview() {
  return (
    <DemoShell>
      <Alert variant="destructive">
        <AlertIcon>
          <OctagonX />
        </AlertIcon>
        <AlertBody>
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>Your card was declined. Check the payment method and try again.</AlertDescription>
        </AlertBody>
      </Alert>
    </DemoShell>
  );
}

export function AlertActionPreview() {
  return (
    <DemoShell>
      <Alert>
        <AlertIcon>
          <BellRing />
        </AlertIcon>
        <AlertBody>
          <AlertTitle>Dark mode is now available</AlertTitle>
          <AlertDescription>Enable it under your profile settings to get started.</AlertDescription>
        </AlertBody>
        <AlertAction>
          <Button size="sm">Enable</Button>
        </AlertAction>
      </Alert>
    </DemoShell>
  );
}

export function AlertDismissiblePreview() {
  const [open, setOpen] = React.useState(true);
  return (
    <DemoShell readout={open ? "alert visible" : "alert dismissed — reload preview to restore"}>
      {open ? (
        <Alert variant="info">
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertBody>
            <AlertTitle>Scheduled maintenance</AlertTitle>
            <AlertDescription>Deploys pause Sunday 02:00–03:00 UTC. Plan around the window.</AlertDescription>
          </AlertBody>
          <AlertAction>
            <button
              type="button"
              aria-label="Dismiss announcement"
              onClick={() => setOpen(false)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <X className="size-4" />
            </button>
          </AlertAction>
        </Alert>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-9 w-full rounded-md border bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent"
        >
          Restore announcement
        </button>
      )}
    </DemoShell>
  );
}

export function AlertCustomColorsPreview() {
  return (
    <DemoShell readout="className still wins — tokens compose">
      <Alert className="border-violet-500/25 bg-violet-500/[0.07] dark:bg-violet-400/[0.08]">
        <AlertIcon className="border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Rocket />
        </AlertIcon>
        <AlertBody>
          <AlertTitle>Custom accent</AlertTitle>
          <AlertDescription className="text-violet-900/75 dark:text-violet-100/70">
            Override any tone with utilities — the tile, border, and text all compose.
          </AlertDescription>
        </AlertBody>
      </Alert>
    </DemoShell>
  );
}

export function AlertRtlPreview() {
  return (
    <DemoShell>
      <div dir="rtl" className="flex flex-col gap-3">
        <Alert variant="success">
          <AlertIcon>
            <CheckCircle2 />
          </AlertIcon>
          <AlertBody>
            <AlertTitle>تم الدفع بنجاح</AlertTitle>
            <AlertDescription>تمت معالجة دفعتك البالغة 29.99 دولارًا.</AlertDescription>
          </AlertBody>
        </Alert>
        <Alert variant="destructive">
          <AlertIcon>
            <OctagonX />
          </AlertIcon>
          <AlertBody>
            <AlertTitle>فشل الدفع</AlertTitle>
            <AlertDescription>تعذر معالجة الدفع. تحقق من البطاقة وحاول مجددًا.</AlertDescription>
          </AlertBody>
          <AlertAction>
            <Button size="sm">إعادة المحاولة</Button>
          </AlertAction>
        </Alert>
      </div>
    </DemoShell>
  );
}
