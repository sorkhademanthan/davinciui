"use client";

import * as React from "react";
import {
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  Printer,
  Redo2,
  Search,
  Settings,
  StickyNote,
  Undo2,
  User,
} from "lucide-react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@workspace/ui/components/menubar";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-5 overflow-auto bg-background p-6">
      <div className="flex w-full max-w-md items-start justify-center">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function MenubarBasicPreview() {
  return (
    <DemoShell readout="hover or arrow-key through File · Edit">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              New Window <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              Print <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Undo <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled>Find in Page</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </DemoShell>
  );
}

export function MenubarCheckboxPreview() {
  const [bookmarks, setBookmarks] = React.useState(true);
  const [urls, setUrls] = React.useState(false);
  return (
    <DemoShell readout={`bookmarks: ${bookmarks ? "on" : "off"} · urls: ${urls ? "on" : "off"}`}>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Appearance</MenubarLabel>
            <MenubarCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
              Show Bookmarks Bar
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={urls} onCheckedChange={setUrls}>
              Show Full URLs
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </DemoShell>
  );
}

export function MenubarRadioPreview() {
  const [profile, setProfile] = React.useState("personal");
  return (
    <DemoShell readout={`profile: ${profile}`}>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Profiles</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Switch profile</MenubarLabel>
            <MenubarRadioGroup value={profile} onValueChange={setProfile}>
              <MenubarRadioItem value="personal">Personal</MenubarRadioItem>
              <MenubarRadioItem value="work">Work</MenubarRadioItem>
              <MenubarRadioItem value="school">School</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </DemoShell>
  );
}

export function MenubarSubmenuPreview() {
  return (
    <DemoShell readout="Share opens a submenu">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <Plus /> New Document
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Share</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>
                  <Mail /> Email
                </MenubarItem>
                <MenubarItem>
                  <MessageSquare /> Message
                </MenubarItem>
                <MenubarItem>
                  <StickyNote /> Notes
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>
              <Printer /> Print <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </DemoShell>
  );
}

export function MenubarIconsPreview() {
  return (
    <DemoShell>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Account</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <User /> Profile <MenubarShortcut>⇧⌘P</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              <Search /> Search <MenubarShortcut>⌘K</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              <Settings /> Settings <MenubarShortcut>⌘,</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive">
              <LogOut /> Log out <MenubarShortcut>⇧⌘Q</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </DemoShell>
  );
}

export function MenubarRtlPreview() {
  const [bookmarks, setBookmarks] = React.useState(true);
  return (
    <DemoShell readout="dir=rtl · submenus and shortcuts mirror">
      <div dir="rtl">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>ملف</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                مستند جديد <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
                إظهار شريط الإشارات
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarItem>
                <Undo2 /> تراجع <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                <Redo2 /> إعادة <MenubarShortcut>⇧⌘Z</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </DemoShell>
  );
}
