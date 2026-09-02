"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be within SidebarProvider");
  return ctx;
}

function SidebarProvider({ children, defaultOpen = true, open: controlledOpen, onOpenChange, className, style, ...props }: React.HTMLAttributes<HTMLDivElement> & { defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(v);
    onOpenChange?.(v);
  };
  const [openMobile, setOpenMobile] = React.useState(false);
  // simple isMobile detection
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia("(max-width: 768px)");
    const handler = () => setIsMobile(m.matches);
    handler();
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);
  return (
    <SidebarContext.Provider value={{ open, setOpen, openMobile, setOpenMobile, isMobile }}>
      <div data-slot="sidebar-wrapper" style={style as React.CSSProperties} className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useSidebar();
  return (
    <div data-slot="sidebar" data-state={open ? "expanded" : "collapsed"} className={cn("hidden md:flex h-svh w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-all data-[state=collapsed]:w-14", className)} {...props} />
  );
}

function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { open, setOpen } = useSidebar();
  return (
    <Button data-slot="sidebar-trigger" variant="ghost" size="icon" onClick={() => setOpen(!open)} className={cn("size-7", className)} {...props}>
      <PanelLeft className="size-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useSidebar();
  return <button data-slot="sidebar-rail" aria-label="Toggle Sidebar" onClick={() => setOpen(!open)} className={cn("absolute inset-y-0 right-0 w-2 -translate-x-px", className)} {...props} />;
}

function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-content" className={cn("flex flex-1 flex-col gap-2 overflow-auto p-2", className)} {...props} />;
}

function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-group-label" className={cn("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70", className)} {...props} />;
}

function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-group-content" className={cn("w-full text-sm", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul data-slot="sidebar-menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li data-slot="sidebar-menu-item" className={cn("group/menu-item relative", className)} {...props} />;
}

function SidebarMenuButton({ className, isActive, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean }) {
  return <button data-slot="sidebar-menu-button" data-active={isActive} className={cn("flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium", className)} {...props} />;
}

function SidebarMenuAction({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button data-slot="sidebar-menu-action" className={cn("absolute right-1 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded-md hover:bg-sidebar-accent", className)} {...props} />;
}

function SidebarMenuBadge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-menu-badge" className={cn("ml-auto text-xs", className)} {...props} />;
}

function SidebarMenuSub({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul data-slot="sidebar-menu-sub" className={cn("ml-4 flex min-w-0 flex-col gap-1 border-l px-1.5 py-0.5", className)} {...props} />;
}

function SidebarMenuSkeleton({ className, showIcon, ...props }: React.HTMLAttributes<HTMLDivElement> & { showIcon?: boolean }) {
  return (
    <div data-slot="sidebar-menu-skeleton" className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)} {...props}>
      {showIcon && <div className="size-4 rounded bg-muted" />}
      <div className="h-4 flex-1 rounded bg-muted" />
    </div>
  );
}

function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-inset" className={cn("flex flex-1 flex-col", className)} {...props} />;
}

export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarInset,
  useSidebar,
};
