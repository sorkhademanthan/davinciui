"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { docsConfig } from "@/config/docs";
import { components, isNewComponent } from "@/registry";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────
// Item
// ────────────────────────────────────────────────────────────

type SidebarItemProps = {
  title: string;
  href: string;
  active?: boolean;
  accessory?: React.ReactNode;
  onNavigate?: () => void;
  onHover?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMove?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onLeave?: () => void;
};

const SidebarItem = React.memo(function SidebarItem({
  title,
  href,
  active,
  accessory,
  onNavigate,
  onHover,
  onMove,
  onLeave,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      onMouseEnter={onHover}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "group flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.75 text-[13.5px] leading-5 transition-all duration-150",
        active
          ? "bg-foreground text-background shadow-sm font-[550] dark:bg-white dark:text-zinc-900"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100",
      )}
    >
      <span className="truncate tracking-[-0.01em]">{title}</span>
      {accessory ? <span className="shrink-0">{accessory}</span> : null}
    </Link>
  );
});
SidebarItem.displayName = "SidebarItem";

// ────────────────────────────────────────────────────────────
// Group wrapper
// ────────────────────────────────────────────────────────────

function CollapsibleGroup({
  title,
  defaultOpen = true,
  isActive,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  // keep group open if it contains active page
  React.useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const clean = title.replace(/^[^\w]+/, "").trim() || title;

  return (
    <div className="space-y-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span className="flex-1 truncate text-[11px] font-semibold uppercase tracking-[0.14em]">{clean}</span>
        <span
          className={cn(
            "grid size-5 place-items-center rounded-md transition-colors",
            open ? "bg-muted text-foreground" : "text-muted-foreground/70",
          )}
        >
          <ChevronDown
            className={cn("size-3 transition-transform duration-200", !open && "-rotate-90")}
            aria-hidden="true"
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

export function DocsSidebarNav({
  onNavigate,
  onHoverItem,
  onHoverMove,
  onHoverLeave,
}: {
  onNavigate?: () => void;
  onHoverItem?: (item: { title: string; href: string }, e: React.MouseEvent<HTMLAnchorElement>) => void;
  onHoverMove?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onHoverLeave?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Search — premium, inset */}
      <div className="shrink-0 p-3">
        <button
          type="button"
          aria-label="Search documentation"
          className="group flex w-full items-center gap-2.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 text-left text-[13px] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all hover:border-border hover:bg-background hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-zinc-900/70 dark:shadow-none dark:hover:bg-zinc-900"
        >
          <Search className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span className="flex-1 truncate font-[450] text-muted-foreground group-hover:text-foreground/80">Search docs…</span>
          <kbd className="hidden items-center gap-1 rounded-md border border-border bg-background px-1.5 py-1 font-mono text-[11px] leading-none text-muted-foreground shadow-sm sm:inline-flex dark:bg-zinc-800 dark:text-zinc-400">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="h-px shrink-0 bg-border/40" />

      {/* Scrollable nav — thin, clean, hidden scrollbar */}
      <nav
        aria-label="Docs navigation"
        className="min-h-0 flex-1 overflow-y-auto px-3 py-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="space-y-7">
          {docsConfig.nav.map((group, idx) => {
            const hasNested = group.items.some((i) => i.items && i.items.length > 0);
            const isActiveGroup = group.items.some((i) => {
              if (i.href === pathname) return true;
              return i.items?.some((sub) => sub.href === pathname) ?? false;
            });

            // Elegant divider for foundations
            const isFoundation = group.title === "🎨 FOUNDATIONS";

            return (
              <div key={idx}>
                {isFoundation && (
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Foundation
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                )}

                <CollapsibleGroup title={group.title} isActive={isActiveGroup} defaultOpen>
                  {hasNested ? (
                    <div className="space-y-5">
                      {group.items.map((subGroup, sIdx) => {
                        if (subGroup.items?.length) {
                          return (
                            <div key={sIdx} className="space-y-1.5">
                              <p className="px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
                                {subGroup.title}
                              </p>
                              <div className="space-y-0.5">
                                {subGroup.items.map((item) => {
                                  const slug = item.href.split("/").pop();
                                  const comp = slug ? components[slug] : undefined;
                                  const isNew = comp ? isNewComponent(comp) : false;
                                  return (
                                    <SidebarItem
                                      key={item.href}
                                      title={item.title}
                                      href={item.href}
                                      active={pathname === item.href}
                                      onNavigate={onNavigate}
                                      onHover={onHoverItem ? (e) => onHoverItem(item, e) : undefined}
                                      onMove={onHoverMove}
                                      onLeave={onHoverLeave}
                                      accessory={
                                        isNew ? (
                                          <span className="inline-flex items-center rounded-full bg-foreground px-1.75 py-0.5 text-[10px] font-bold leading-none tracking-wide text-background dark:bg-white dark:text-zinc-900">
                                            NEW
                                          </span>
                                        ) : undefined
                                      }
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        const slug = subGroup.href.split("/").pop();
                        const comp = slug ? components[slug] : undefined;
                        const isNew = comp ? isNewComponent(comp) : false;
                        return (
                          <div key={sIdx} className="space-y-0.5">
                            <SidebarItem
                              title={subGroup.title}
                              href={subGroup.href}
                              active={pathname === subGroup.href}
                              onNavigate={onNavigate}
                              onHover={onHoverItem ? (e) => onHoverItem({ title: subGroup.title, href: subGroup.href }, e) : undefined}
                              onMove={onHoverMove}
                              onLeave={onHoverLeave}
                              accessory={
                                isNew ? (
                                  <span className="inline-flex items-center rounded-full bg-foreground px-1.75 py-0.5 text-[10px] font-bold leading-none tracking-wide text-background dark:bg-white dark:text-zinc-900">
                                    NEW
                                  </span>
                                ) : undefined
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const slug = item.href.split("/").pop();
                        const comp = slug ? components[slug] : undefined;
                        const isNew = comp ? isNewComponent(comp) : false;
                        return (
                          <SidebarItem
                            key={item.href}
                            title={item.title}
                            href={item.href}
                            active={pathname === item.href}
                            onNavigate={onNavigate}
                            onHover={onHoverItem ? (e) => onHoverItem(item, e) : undefined}
                            onMove={onHoverMove}
                            onLeave={onHoverLeave}
                            accessory={
                              isNew ? (
                                <span className="inline-flex items-center rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-bold leading-none text-background dark:bg-white dark:text-zinc-900">
                                  NEW
                                </span>
                              ) : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </CollapsibleGroup>
              </div>
            );
          })}
        </div>

        {/* Footer meta — subtle, clean */}
        <div className="mt-10 rounded-xl border border-border/40 bg-muted/30 p-3 dark:bg-zinc-900/40">
          <p className="text-xs font-medium leading-none tracking-tight">DavinciUI</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Open-source components. Copy, paste, ship.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            MIT • v0.1.0
          </div>
        </div>
      </nav>
    </div>
  );
}
