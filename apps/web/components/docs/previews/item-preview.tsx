"use client";

import * as React from "react";
import { BadgeCheck, ChevronRight, ExternalLink, Inbox, Plus, ShieldAlert } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@workspace/ui/components/item";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { NativeSelect, NativeSelectOption } from "@workspace/ui/components/native-select";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function ItemBasicPreview() {
  return (
    <DemoShell>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Basic Item</ItemTitle>
          <ItemDescription>A simple item with title and description.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm">Action</Button>
        </ItemActions>
      </Item>
    </DemoShell>
  );
}

export function ItemVariantsPreview() {
  return (
    <DemoShell readout="default · outline · muted">
      <div className="flex flex-col gap-2">
        <Item>
          <ItemMedia variant="icon">
            <Inbox />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Default Variant</ItemTitle>
            <ItemDescription>Transparent background with no border.</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Inbox />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Outline Variant</ItemTitle>
            <ItemDescription>Outlined style with a visible border.</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="muted">
          <ItemMedia variant="icon">
            <Inbox />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Muted Variant</ItemTitle>
            <ItemDescription>Muted background for secondary content.</ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </DemoShell>
  );
}

export function ItemSizesPreview() {
  return (
    <DemoShell readout="default · sm · xs">
      <div className="flex flex-col gap-2">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Inbox />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Default Size</ItemTitle>
            <ItemDescription>The standard size for most use cases.</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline" size="sm">
          <ItemMedia variant="icon">
            <Inbox />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Small Size</ItemTitle>
            <ItemDescription>A compact size for dense layouts.</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline" size="xs">
          <ItemMedia variant="icon">
            <Inbox />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Extra Small Size</ItemTitle>
            <ItemDescription>The most compact size available.</ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </DemoShell>
  );
}

export function ItemIconPreview() {
  return (
    <DemoShell>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <ShieldAlert />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Security Alert</ItemTitle>
          <ItemDescription>New login detected from unknown device.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Review
          </Button>
        </ItemActions>
      </Item>
    </DemoShell>
  );
}

export function ItemAvatarPreview() {
  return (
    <DemoShell>
      <ItemGroup>
        <Item variant="outline" size="sm">
          <ItemMedia>
            <Avatar className="size-8">
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Evil Rabbit</ItemTitle>
            <ItemDescription>Last seen 5 months ago</ItemDescription>
          </ItemContent>
          <ItemActions>
            <BadgeCheck className="size-4 text-muted-foreground" />
          </ItemActions>
        </Item>
        <Item variant="outline" size="sm">
          <ItemMedia>
            <Avatar className="size-8">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>No Team Members</ItemTitle>
            <ItemDescription>Invite your team to collaborate on this project.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm">
              <Plus className="size-3.5" /> Invite
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>
    </DemoShell>
  );
}

const TRACKS = [
  { title: "Midnight City Lights", artist: "Neon Dreams", length: "3:45" },
  { title: "Coffee Shop Conversations", artist: "The Morning Brew", length: "4:05" },
  { title: "Digital Rain", artist: "Cyber Symphony", length: "3:30" },
];

export function ItemImagePreview() {
  return (
    <DemoShell>
      <ItemGroup>
        {TRACKS.map((track) => (
          <Item key={track.title} variant="outline" size="sm" render={<a href="#item" onClick={(e) => e.preventDefault()} />}>
            <ItemMedia variant="image">
              <img src={`https://avatar.vercel.sh/${encodeURIComponent(track.title)}?w=64`} alt="" loading="lazy" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{track.title}</ItemTitle>
              <ItemDescription>{track.artist}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <span className="font-mono text-xs text-muted-foreground">{track.length}</span>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </DemoShell>
  );
}

const PEOPLE = [
  { initials: "S", name: "shadcn", email: "shadcn@vercel.com" },
  { initials: "M", name: "maxleiter", email: "maxleiter@vercel.com" },
  { initials: "E", name: "evilrabbit", email: "evilrabbit@vercel.com" },
];

export function ItemGroupPreview() {
  return (
    <DemoShell>
      <ItemGroup>
        {PEOPLE.map((person, i) => (
          <React.Fragment key={person.email}>
            {i > 0 ? <ItemSeparator /> : null}
            <Item size="sm">
              <ItemMedia>
                <Avatar className="size-8">
                  <AvatarFallback>{person.initials}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{person.name}</ItemTitle>
                <ItemDescription>{person.email}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4 text-muted-foreground" />
              </ItemActions>
            </Item>
          </React.Fragment>
        ))}
      </ItemGroup>
    </DemoShell>
  );
}

export function ItemHeaderPreview() {
  const models = [
    {
      src: "https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop",
      title: "v0-1.5-sm",
      desc: "Everyday tasks and UI generation.",
    },
    {
      src: "https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop",
      title: "v0-1.5-lg",
      desc: "Advanced thinking or reasoning.",
    },
  ];
  return (
    <DemoShell>
      <div className="grid grid-cols-2 gap-3">
        {models.map((model) => (
          <Item key={model.title} variant="outline" className="p-0">
            <ItemHeader>
              <img src={model.src} alt={model.title} loading="lazy" />
            </ItemHeader>
            <ItemContent className="p-4 pb-0">
              <ItemTitle>{model.title}</ItemTitle>
              <ItemDescription>{model.desc}</ItemDescription>
            </ItemContent>
            <ItemFooter className="p-4 pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Select
              </Button>
            </ItemFooter>
          </Item>
        ))}
      </div>
    </DemoShell>
  );
}

export function ItemLinkPreview() {
  return (
    <DemoShell>
      <div className="flex flex-col gap-2">
        <Item variant="outline" render={<a href="#item" onClick={(e) => e.preventDefault()} />}>
          <ItemContent>
            <ItemTitle>Visit our documentation</ItemTitle>
            <ItemDescription>Learn how to get started with our components.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4 text-muted-foreground" />
          </ItemActions>
        </Item>
        <Item
          variant="outline"
          render={<a href="https://ui.shadcn.com" target="_blank" rel="noreferrer" />}
        >
          <ItemContent>
            <ItemTitle>External resource</ItemTitle>
            <ItemDescription>Opens in a new tab with security attributes.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <ExternalLink className="size-4 text-muted-foreground" />
          </ItemActions>
        </Item>
      </div>
    </DemoShell>
  );
}

export function ItemDropdownPreview() {
  const [framework, setFramework] = React.useState("next");
  return (
    <DemoShell readout={`framework: ${framework}`}>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Framework</ItemTitle>
          <ItemDescription>Pick the stack for the new project.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <NativeSelect value={framework} onChange={(e) => setFramework(e.target.value)} aria-label="Framework" className="w-32">
            <NativeSelectOption value="next">Next.js</NativeSelectOption>
            <NativeSelectOption value="vite">Vite</NativeSelectOption>
            <NativeSelectOption value="astro">Astro</NativeSelectOption>
          </NativeSelect>
        </ItemActions>
      </Item>
    </DemoShell>
  );
}

export function ItemRtlPreview() {
  return (
    <DemoShell>
      <div dir="rtl" className="flex flex-col gap-2">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>عنصر أساسي</ItemTitle>
            <ItemDescription>عنصر بسيط يحتوي على عنوان ووصف.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm">إجراء</Button>
          </ItemActions>
        </Item>
        <Item variant="outline" render={<a href="#item" onClick={(e) => e.preventDefault()} />}>
          <ItemMedia variant="icon">
            <BadgeCheck />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>تم التحقق من ملفك الشخصي</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
          </ItemActions>
        </Item>
      </div>
    </DemoShell>
  );
}
