"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="flex w-full items-center justify-center">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function AvatarPreview() {
  return (
    <DemoShell>
      <Avatar size="lg">
        <AvatarImage src="https://github.com/shadcn.png" alt="Aarav Sharma" />
        <AvatarFallback name="Aarav Sharma" />
      </Avatar>
    </DemoShell>
  );
}

export function AvatarFallbackPreview() {
  return (
    <DemoShell readout="name → initials + stable generative tint">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback name="Aarav Sharma" />
        </Avatar>
        <Avatar>
          <AvatarFallback name="Vivaan Patel" />
        </Avatar>
        <Avatar>
          <AvatarFallback name="Aditya Rao" />
        </Avatar>
        <Avatar>
          <AvatarFallback name="Meera Nair" />
        </Avatar>
      </div>
    </DemoShell>
  );
}

export function AvatarBadgePreview() {
  return (
    <DemoShell readout="online · busy · away · offline">
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          <AvatarFallback name="Aarav Sharma" />
          <AvatarBadge status="online" />
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback name="Vivaan Patel" />
          <AvatarBadge status="busy" />
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback name="Aditya Rao" />
          <AvatarBadge status="away" />
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback name="Meera Nair" />
          <AvatarBadge status="offline" />
        </Avatar>
      </div>
    </DemoShell>
  );
}

export function AvatarBadgeIconPreview() {
  return (
    <DemoShell readout="badge hosts icons too">
      <Avatar size="lg">
        <AvatarFallback name="Priya Pillai" />
        <AvatarBadge className="flex size-4 items-center justify-center bg-primary text-primary-foreground ring-background">
          <Plus className="size-2.5" />
        </AvatarBadge>
      </Avatar>
    </DemoShell>
  );
}

const TEAM = ["Aarav Sharma", "Vivaan Patel", "Aditya Rao", "Meera Nair", "Arjun Menon", "Diya Iyer"];

export function AvatarGroupPreview() {
  return (
    <DemoShell readout="hover the stack — it fans out">
      <AvatarGroup>
        {TEAM.slice(0, 3).map((name) => (
          <Avatar key={name}>
            <AvatarFallback name={name} />
          </Avatar>
        ))}
      </AvatarGroup>
    </DemoShell>
  );
}

export function AvatarGroupCountPreview() {
  return (
    <DemoShell readout="max auto-collapses the rest into +N">
      <AvatarGroup max={3}>
        {TEAM.map((name) => (
          <Avatar key={name}>
            <AvatarFallback name={name} />
          </Avatar>
        ))}
      </AvatarGroup>
    </DemoShell>
  );
}

export function AvatarGroupIconPreview() {
  return (
    <DemoShell>
      <AvatarGroup max={2}>
        {TEAM.slice(0, 3).map((name) => (
          <Avatar key={name}>
            <AvatarFallback name={name} />
          </Avatar>
        ))}
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Plus className="size-4" />
          </AvatarFallback>
        </Avatar>
      </AvatarGroup>
    </DemoShell>
  );
}

export function AvatarSizesPreview() {
  return (
    <DemoShell readout="xs · sm · default · lg · xl — badge and type scale along">
      <div className="flex items-center gap-5">
        <Avatar size="xs">
          <AvatarFallback name="Aarav Sharma" />
          <AvatarBadge status="online" />
        </Avatar>
        <Avatar size="sm">
          <AvatarFallback name="Aarav Sharma" />
          <AvatarBadge status="online" />
        </Avatar>
        <Avatar>
          <AvatarFallback name="Aarav Sharma" />
          <AvatarBadge status="online" />
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback name="Aarav Sharma" />
          <AvatarBadge status="online" />
        </Avatar>
        <Avatar size="xl">
          <AvatarFallback name="Aarav Sharma" />
          <AvatarBadge status="online" />
        </Avatar>
      </div>
    </DemoShell>
  );
}

export function AvatarDropdownPreview() {
  return (
    <DemoShell readout="avatar works as a menu trigger">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
            <AvatarImage src="https://github.com/shadcn.png" alt="Aarav Sharma" />
            <AvatarFallback name="Aarav Sharma" />
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DemoShell>
  );
}

export function AvatarRtlPreview() {
  return (
    <DemoShell readout="dir=rtl · overlap and badge mirror">
      <div dir="rtl">
        <AvatarGroup max={3}>
          {["ليلى حسن", "عمر فاروق", "نور الهدى", "كريم عادل"].map((name) => (
            <Avatar key={name}>
              <AvatarFallback name={name} />
            </Avatar>
          ))}
        </AvatarGroup>
      </div>
    </DemoShell>
  );
}
