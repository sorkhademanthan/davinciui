"use client";

import * as React from "react";
import { ArrowUpRight, Bell, Cloud, FolderCode, Search } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Avatar, AvatarFallback, AvatarGroup } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@workspace/ui/components/input-group";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[340px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function EmptyBasicPreview() {
  return (
    <DemoShell>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCode />
          </EmptyMedia>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>You haven&apos;t created any projects yet. Get started by creating your first project.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex items-center gap-2">
            <Button size="sm">Create Project</Button>
            <Button variant="outline" size="sm">
              Import Project
            </Button>
          </div>
          <a href="#empty" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 text-sm">
            Learn More <ArrowUpRight className="size-3.5" />
          </a>
        </EmptyContent>
      </Empty>
    </DemoShell>
  );
}

export function EmptyOutlinePreview() {
  return (
    <DemoShell readout="dashed media tile marks the drop zone">
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="dashed">
            <Cloud />
          </EmptyMedia>
          <EmptyTitle>Cloud Storage Empty</EmptyTitle>
          <EmptyDescription>Upload files to your cloud storage to access them anywhere.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">Upload Files</Button>
        </EmptyContent>
      </Empty>
    </DemoShell>
  );
}

export function EmptyBackgroundPreview() {
  return (
    <DemoShell>
      <Empty className="bg-muted/40 bg-[radial-gradient(circle_at_50%_0%,var(--primary)/8%,transparent_60%)]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Bell />
          </EmptyMedia>
          <EmptyTitle>No Notifications</EmptyTitle>
          <EmptyDescription>You&apos;re all caught up. New notifications will appear here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm">
            Refresh
          </Button>
        </EmptyContent>
      </Empty>
    </DemoShell>
  );
}

export function EmptyAvatarPreview() {
  return (
    <DemoShell>
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Avatar className="size-12">
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
          </EmptyMedia>
          <EmptyTitle>User Offline</EmptyTitle>
          <EmptyDescription>This user is currently offline. You can leave a message to notify them or try again later.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">Leave Message</Button>
        </EmptyContent>
      </Empty>
    </DemoShell>
  );
}

export function EmptyAvatarGroupPreview() {
  return (
    <DemoShell>
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <AvatarGroup>
              <Avatar className="size-10">
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar className="size-10">
                <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <Avatar className="size-10">
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
            </AvatarGroup>
          </EmptyMedia>
          <EmptyTitle>No Team Members</EmptyTitle>
          <EmptyDescription>Invite your team to collaborate on this project.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">Invite Members</Button>
        </EmptyContent>
      </Empty>
    </DemoShell>
  );
}

export function EmptyInputGroupPreview() {
  const [query, setQuery] = React.useState("");
  return (
    <DemoShell readout={query ? `searching: ${query}` : "type to search from the empty state"}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search />
          </EmptyMedia>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>The page you&apos;re looking for doesn&apos;t exist. Try searching for what you need below.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search docs…" aria-label="Search docs" />
              <InputGroupButton type="submit">Search</InputGroupButton>
            </InputGroup>
          </form>
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <a href="#empty" onClick={(e) => e.preventDefault()}>
              Contact support
            </a>
          </p>
        </EmptyContent>
      </Empty>
    </DemoShell>
  );
}

export function EmptyRtlPreview() {
  return (
    <DemoShell>
      <div dir="rtl">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderCode />
            </EmptyMedia>
            <EmptyTitle>لا توجد مشاريع بعد</EmptyTitle>
            <EmptyDescription>لم تقم بإنشاء أي مشاريع بعد. ابدأ بإنشاء مشروعك الأول.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex items-center gap-2">
              <Button size="sm">إنشاء مشروع</Button>
              <Button variant="outline" size="sm">
                استيراد مشروع
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    </DemoShell>
  );
}
