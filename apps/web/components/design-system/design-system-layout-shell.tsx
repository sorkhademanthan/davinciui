"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { PanelLeft, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { DesignSystemSidebarNav } from "@/components/design-system-sidebar-nav";

export function DesignSystemLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close the drawer on navigation and return focus to the toggle.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  return (
    <div
      data-route-design-system
      className="min-h-svh flex flex-col bg-background"
    >
      <SiteHeader
        sidebarToggle={
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label={mobileNavOpen ? "Close design system navigation" : "Open design system navigation"}
            aria-expanded={mobileNavOpen}
            aria-controls="ds-mobile-nav"
            className="inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-muted/40"
          >
            <PanelLeft className="size-4" aria-hidden="true" />
          </button>
        }
      />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] pt-14">
        <aside className="hidden md:flex md:flex-col sticky top-14 h-[calc(100vh-3.5rem)] border-r border-sidebar-border bg-sidebar text-sidebar-foreground overflow-hidden">
          <DesignSystemSidebarNav />
        </aside>
        <main className="min-w-0 w-full max-w-none m-0 overflow-hidden bg-background">
          {children}
        </main>
      </div>
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/50 motion-reduce:transition-none"
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            id="ds-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Design system navigation"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-sidebar-border p-2.5">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Design system
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close design system navigation"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <DesignSystemSidebarNav />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
