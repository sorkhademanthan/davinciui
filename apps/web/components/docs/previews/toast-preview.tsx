"use client";

import { Button } from "@workspace/ui/components/button";
import { Toaster, toast, toastPromise } from "@workspace/ui/components/toast";

export function ToastPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8 gap-4">
      <Toaster />
      <Button onClick={() => toast("Hello!", { description: "This is a toast." })}>Show Toast</Button>
    </div>
  );
}

export function ToastTypesPreview() {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-2 p-8">
      <Toaster />
      <Button variant="outline" onClick={() => toast("Default", { type: "default" })}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success("Deployed to production")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Build failed on step 4 of 9")}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning("2 snapshots need review")}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info("Syncing 38 messages…")}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast.loading("Uploading…")}>
        Loading
      </Button>
    </div>
  );
}

export function ToastActionPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Toaster />
      <Button
        onClick={() =>
          toast("Message deleted", {
            description: "You have 8 seconds to change your mind.",
            action: { label: "Undo", onClick: () => toast.success("Message restored") },
          })
        }
      >
        With Action
      </Button>
    </div>
  );
}

export function ToastPromisePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Toaster />
      <Button
        onClick={() => {
          const p = new Promise<string>((resolve, reject) =>
            setTimeout(() => (Math.random() > 0.4 ? resolve("acme-inc") : reject(new Error("quota exceeded"))), 1400)
          );
          toastPromise(p, {
            loading: "Deploying preview…",
            success: (slug) => `Live at ${slug}.vercel.app`,
            error: (err) => `Deploy failed — ${(err as Error).message}`,
          });
        }}
      >
        Promise
      </Button>
    </div>
  );
}

export function ToastPersistentPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Payment failed", {
            description: "Your card was declined. Update billing to retry.",
            duration: Number.POSITIVE_INFINITY,
            action: { label: "Update billing", onClick: () => toast.info("Opening billing…") },
          })
        }
      >
        Persistent error
      </Button>
    </div>
  );
}

export function ToastStackPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Toaster />
      <Button
        variant="outline"
        onClick={() => {
          for (let i = 1; i <= 8; i++) toast(`Burst ${i}`, { description: "Capped at five, oldest drops." });
        }}
      >
        Fire 8 at once
      </Button>
    </div>
  );
}
