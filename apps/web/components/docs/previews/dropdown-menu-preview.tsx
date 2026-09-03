"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Bold,
  ChevronDown,
  Copy,
  CreditCard,
  Italic,
  LogOut,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Underline,
  User,
  UserPlus,
} from "lucide-react";

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full w-full items-center justify-center p-8">{children}</div>;
}

export function DropdownMenuPreview() {
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Open <ChevronDown className="size-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuBasicPreview() {
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Basic</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem>New file</DropdownMenuItem>
          <DropdownMenuItem>Open file</DropdownMenuItem>
          <DropdownMenuItem>Save</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuSubmenuPreview() {
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Submenu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>New Tab</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuItem>Email link</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-44">
                  <DropdownMenuItem>Embed</DropdownMenuItem>
                  <DropdownMenuItem>QR code</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Print</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuShortcutsPreview() {
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Shortcuts</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60">
          <DropdownMenuItem>
            New file <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Save <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Save as <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Close window <DropdownMenuShortcut>⌘W</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuIconsPreview() {
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Icons</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>
            <User /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard /> Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuCheckboxesPreview() {
  const [showStatusBar, setShowStatusBar] = React.useState(true);
  const [showActivityBar, setShowActivityBar] = React.useState(false);
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Checkboxes</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
            Status Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar}>
            Activity Bar
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuCheckboxesIconsPreview() {
  const [bold, setBold] = React.useState(true);
  const [italic, setItalic] = React.useState(false);
  const [underline, setUnderline] = React.useState(false);
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Checkboxes Icons</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Formatting</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={bold} onCheckedChange={setBold}>
            <Bold /> Bold
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={italic} onCheckedChange={setItalic}>
            <Italic /> Italic
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={underline} onCheckedChange={setUnderline}>
            <Underline /> Underline
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuRadioGroupPreview() {
  const [position, setPosition] = React.useState("bottom");
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Radio Group</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Panel position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuRadioIconsPreview() {
  const [align, setAlign] = React.useState("left");
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Radio Icons</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Text align</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={align} onValueChange={setAlign}>
            <DropdownMenuRadioItem value="left">
              <Mail /> Left aligned
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="center">
              <MessageSquare /> Centered
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">
              <Pencil /> Right aligned
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuDestructivePreview() {
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Destructive</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>
            <Pencil /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuAvatarPreview() {
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              M
            </span>
            Manthan
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60">
          <DropdownMenuLabel>
            <span className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                M
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">manthan</span>
                <span className="text-xs text-muted-foreground">m@example.com</span>
              </span>
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <UserPlus /> Invite members
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Plus /> New team
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuComplexPreview() {
  const [notifications, setNotifications] = React.useState(true);
  const [theme, setTheme] = React.useState("system");
  return (
    <Shell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Complex</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User /> Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard /> Billing <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings /> Settings
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-52">
                <DropdownMenuCheckboxItem checked={notifications} onCheckedChange={setNotifications}>
                  Notifications
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserPlus /> Invite users
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            <Trash2 /> Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Shell>
  );
}

export function DropdownMenuRtlPreview() {
  return (
    <Shell>
      <div dir="rtl">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">فتح القائمة</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem>الإعدادات</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>تسجيل الخروج</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Shell>
  );
}
