"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarRail,
  SidebarSeparator,
  SidebarInput,
} from "@workspace/ui/components/sidebar";
import {
  LayoutDashboard,
  Inbox,
  Search,
  Settings2,
  Users,
  FolderKanban,
  FileText,
  ChevronDown,
  Sparkles,
  Command,
  Bell,
  LifeBuoy,
  Send,
  Plus,
} from "lucide-react";

// ───────────────────────────────────────────────────────────
// Main — clean, airy dashboard shell with animated sidebar
// ───────────────────────────────────────────────────────────

export function SidebarPreview() {
  const [active, setActive] = React.useState("Dashboard");
  const [engOpen, setEngOpen] = React.useState(true);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" variant="sidebar" className="bg-sidebar">
          <SidebarHeader className="gap-3">
            {/* Brand — minimal, clean */}
            <div className="flex items-center gap-2.5 px-1 py-1">
              <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="text-sm font-semibold tracking-tight">Acme</span>
                <span className="text-xs text-sidebar-foreground/60">acme.inc</span>
              </div>
            </div>

            {/* Search — subtle, clean input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <SidebarInput placeholder="Search…" className="h-8 rounded-lg bg-muted/40 pl-8 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1" />
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-5">
            <SidebarGroup>
              <SidebarGroupLabel>Overview</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[
                    { id: "Dashboard", icon: <LayoutDashboard className="size-4" />, badge: null },
                    { id: "Inbox", icon: <Inbox className="size-4" />, badge: "8" },
                    { id: "Projects", icon: <FolderKanban className="size-4" />, badge: null },
                    { id: "Team", icon: <Users className="size-4" />, badge: null },
                    { id: "Files", icon: <FileText className="size-4" />, badge: null },
                  ].map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        icon={item.icon}
                        isActive={active === item.id}
                        badge={item.badge ? <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-semibold leading-none text-background">{item.badge}</span> : undefined}
                        onSelect={() => setActive(item.id)}
                      >
                        {item.id}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<Search className="size-4" />} isActive={active === "Search"} onSelect={() => setActive("Search")}>
                      Search
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<FolderKanban className="size-4" />} ariaExpanded={engOpen} onSelect={() => setEngOpen((v) => !v)}>
                      Engineering
                    </SidebarMenuButton>
                    <SidebarMenuSub open={engOpen}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton isActive onSelect={() => setActive("Frontend")}>
                          Frontend
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton onSelect={() => setActive("Backend")}>Backend</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton onSelect={() => setActive("Platform")}>Platform</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<Settings2 className="size-4" />} onSelect={() => setActive("Settings")}>
                      Settings
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<LifeBuoy className="size-4" />}>Support</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<Send className="size-4" />}>Feedback</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="gap-3">
            <SidebarSeparator className="mx-0 bg-sidebar-border/50" />
            <div className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/20 p-2">
              <img src="https://i.pravatar.cc/100?img=12" alt="Alex" className="size-8 rounded-lg object-cover" />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">Alex Morgan</span>
                <span className="truncate text-xs text-muted-foreground">alex@acme.inc</span>
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-[#fcfcfc] dark:bg-zinc-950">
          <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border/40 bg-white px-4 dark:bg-zinc-900">
            <SidebarTrigger className="rounded-lg border border-border/60 bg-white shadow-sm hover:bg-muted" />
            <div className="h-4 w-px bg-border/60" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium tracking-tight">{active}</span>
              <span className="hidden text-muted-foreground sm:inline">· Clean workspace</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>
              <button className="grid size-8 place-items-center rounded-lg border border-border/40 bg-white text-muted-foreground hover:text-foreground dark:bg-zinc-800">
                <Bell className="size-4" />
              </button>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { k: "Revenue", v: "$45,231", d: "+20.1% vs last month" },
                { k: "Active users", v: "2,350", d: "+12% this week" },
                { k: "Tasks", v: "12", d: "3 need review" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-border/60 bg-white p-4 shadow-sm dark:bg-zinc-900">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.k}</div>
                  <div className="mt-1.5 text-[22px] font-semibold tracking-tight">{s.v}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.d}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 bg-white p-8 dark:bg-zinc-900/40">
              <div className="max-w-sm text-center">
                <div className="mx-auto grid size-10 place-items-center rounded-full border border-border/60 bg-muted/30">
                  <Sparkles className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">Content canvas</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Collapse with the rail or press <kbd className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px]">⌘B</kbd> — drawer keeps the same spring on desktop and mobile.
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function SidebarStructurePreview() {
  return <SidebarPreview />;
}

export function SidebarWidthPreview() {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-xl border border-border/60">
      <SidebarProvider style={{ "--sidebar-width": "14rem" } as React.CSSProperties}>
        <Sidebar>
          <SidebarHeader>
            <div className="px-2 py-1 text-sm font-semibold tracking-tight">Narrow — 14rem</div>
            <p className="px-2 text-xs text-muted-foreground">Controlled via --sidebar-width</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<LayoutDashboard className="size-4" />} isActive>
                      Home
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<Settings2 className="size-4" />}>Settings</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="grid place-items-center bg-muted/20 p-6">
          <p className="rounded-full border bg-white px-3 py-1 text-xs shadow-sm dark:bg-zinc-900">
            <code className="font-mono">--sidebar-width: 14rem</code>
          </p>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function SidebarControlledPreview() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-xl border border-border/60">
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <Sidebar collapsible="icon">
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton icon={<LayoutDashboard className="size-4" />}>Home</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton icon={<Inbox className="size-4" />}>Inbox</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="p-6">
          <SidebarTrigger className="border border-border/60 bg-white shadow-sm" />
          <p className="mt-3 text-sm text-muted-foreground">
            State: <span className="font-medium text-foreground">{open ? "expanded" : "icon rail"}</span> — press{" "}
            <kbd className="rounded border bg-muted px-1 text-xs">⌘B</kbd>
          </p>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function SidebarThemingPreview() {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-xl border border-border/60">
      <SidebarProvider>
        <Sidebar collapsible="none" className="border-r bg-zinc-900 text-zinc-100" panelClassName="bg-zinc-900">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-white text-zinc-900">
                <Sparkles className="size-4" />
              </div>
              <div className="grid leading-tight">
                <span className="text-sm font-semibold">Acme Dark</span>
                <span className="text-xs text-zinc-400">Themed sidebar</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-zinc-500">Navigate</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<LayoutDashboard className="size-4" />} isActive className="data-[active=true]:bg-white/10">
                      Home
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<Settings2 className="size-4" />}>Settings</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-white/10">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton icon={<Users className="size-4" />}>Invite team</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-zinc-50 p-6 dark:bg-zinc-950">
          <p className="text-sm font-medium">Token theming</p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
            Override <code className="rounded bg-white px-1 py-0.5">--sidebar</code>,{" "}
            <code className="rounded bg-white px-1 py-0.5">--sidebar-accent</code> for brand tints.
          </p>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function SidebarRtlPreview() {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-xl border border-border/60" dir="rtl">
      <SidebarProvider>
        <Sidebar side="right" collapsible="icon">
          <SidebarHeader>
            <div className="text-sm font-semibold">RTL — اليمين</div>
            <p className="text-xs text-muted-foreground">Sidebar on right</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<LayoutDashboard className="size-4" />} isActive>
                      الرئيسية
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton icon={<Settings2 className="size-4" />}>الإعدادات</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="p-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-sm">محتوى RTL</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function SidebarSkeletonPreview() {
  return (
    <div className="h-[280px] w-full overflow-hidden rounded-xl border border-border/60">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Command className="size-4" />
              </div>
              <div className="grid leading-tight">
                <span className="text-sm font-semibold">Loading…</span>
                <span className="text-xs text-muted-foreground">Please wait</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <div className="flex h-8 items-center gap-2 px-2">
                        <div className="size-4 animate-pulse rounded bg-muted" />
                        <div className="h-3 flex-1 animate-pulse rounded bg-muted" style={{ width: `${55 + ((i * 7) % 20)}%` } as React.CSSProperties} />
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="grid place-items-center bg-muted/20 p-6">
          <p className="text-sm text-muted-foreground">Skeleton for async navigation</p>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
