"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { docsConfig } from "@/config/docs";
import { components, isNewComponent } from "@/registry";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────
// shadcn-style sidebar: flat groups, quiet labels, muted active.
// No pills, no motion accordion, no gradient dividers — the content
// starts flush against the sidebar border like shadcn/ui docs.
// ────────────────────────────────────────────────────────────

function SidebarLink({
  title,
  href,
  active,
  onNavigate,
}: {
  title: string;
  href: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  const slug = href.split("/").pop();
  const comp = slug ? components[slug as keyof typeof components] : undefined;
  const isNew = comp ? isNewComponent(comp) : false;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex h-8 items-center justify-between gap-2 rounded-md px-2 text-sm transition-colors",
        active
          ? "bg-muted font-medium text-foreground"
          : "font-normal text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="truncate">{title}</span>
      {isNew ? (
        <span className="shrink-0 rounded border border-emerald-600/20 bg-emerald-500/10 px-1 py-px text-[10px] font-medium leading-none text-emerald-600 dark:text-emerald-400">
          New
        </span>
      ) : null}
    </Link>
  );
}

export function DocsSidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void;
  onHoverItem?: (item: { title: string; href: string }, e: React.MouseEvent<HTMLAnchorElement>) => void;
  onHoverMove?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onHoverLeave?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 flex-col">
      <nav aria-label="Docs navigation" className="flex flex-col gap-7 pb-8">
        {docsConfig.nav.map((group, idx) => {
          const hasNested = group.items.some((i) => i.items && i.items.length > 0);
          // Strip emoji prefixes ("🎨 FOUNDATIONS" → "Foundations") for the shadcn look.
          const label = group.title.replace(/^[^\w]+/, "").trim() || group.title;
          const pretty =
            label.toLowerCase() === label.toUpperCase()
              ? label.charAt(0) + label.slice(1).toLowerCase()
              : label;

          return (
            <div key={idx}>
              <p className="mb-1 px-2 py-1 text-sm text-muted-foreground">
                {pretty}
              </p>

              {hasNested ? (
                <div className="flex flex-col gap-5">
                  {group.items.map((subGroup, sIdx) => {
                    if (subGroup.items?.length) {
                      return (
                        <div key={sIdx}>
                          <Link
                            href={subGroup.href}
                            onClick={onNavigate}
                            className="mb-1 block px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {subGroup.title}
                          </Link>
                          <div className="grid grid-flow-row auto-rows-max gap-px text-sm">
                            {subGroup.items.map((item) => (
                              <SidebarLink
                                key={item.href}
                                title={item.title}
                                href={item.href}
                                active={pathname === item.href}
                                onNavigate={onNavigate}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={sIdx} className="grid grid-flow-row auto-rows-max gap-px text-sm">
                        <SidebarLink
                          title={subGroup.title}
                          href={subGroup.href}
                          active={pathname === subGroup.href}
                          onNavigate={onNavigate}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-flow-row auto-rows-max gap-px text-sm">
                  {group.items.map((item) => (
                    <SidebarLink
                      key={item.href}
                      title={item.title}
                      href={item.href}
                      active={pathname === item.href}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
