"use client";

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
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSkeleton,
  SidebarInset,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { Home, Settings } from "lucide-react";

export function SidebarPreview() {
  return (
    <div className="h-[400px] w-full border rounded-lg overflow-hidden">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Group</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>Home</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Settings</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>Footer</SidebarFooter>
        </Sidebar>
        <SidebarInset className="p-4">
          <SidebarTrigger />
          <p className="text-sm text-muted-foreground mt-2">Content</p>
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
    <div className="h-[300px] w-full border rounded-lg overflow-hidden">
      <SidebarProvider style={{ "--sidebar-width": "200px" } as any}>
        <Sidebar className="w-[200px]">Width 200px</Sidebar>
        <SidebarInset className="p-4">Content</SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function SidebarControlledPreview() {
  return (
    <div className="h-[300px] w-full border rounded-lg overflow-hidden">
      <SidebarProvider defaultOpen={false}>
        <Sidebar>Controlled (collapsed)</Sidebar>
        <SidebarInset className="p-4">
          <SidebarTrigger /> Controlled
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function SidebarThemingPreview() {
  return (
    <div className="h-[300px] w-full border rounded-lg overflow-hidden">
      <SidebarProvider>
        <Sidebar className="bg-zinc-900 text-white">Theming dark</Sidebar>
        <SidebarInset className="p-4">Theming</SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function SidebarRtlPreview() {
  return (
    <div className="h-[300px] w-full border rounded-lg overflow-hidden" dir="rtl">
      <SidebarProvider>
        <Sidebar>RTL</Sidebar>
        <SidebarInset className="p-4">RTL Content</SidebarInset>
      </SidebarProvider>
    </div>
  );
}
