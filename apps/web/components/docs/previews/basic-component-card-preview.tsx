"use client";

import * as React from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Inbox,
  Info,
  PackageOpen,
  Settings,
  X,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import { Alert, AlertBody, AlertDescription, AlertIcon, AlertTitle } from "@workspace/ui/components/alert";
import { Attachment, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "@workspace/ui/components/attachment";
import { Avatar, AvatarFallback, AvatarGroup } from "@workspace/ui/components/avatar";
import { Badge, BadgeDot } from "@workspace/ui/components/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@workspace/ui/components/breadcrumb";
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble";
import { Button } from "@workspace/ui/components/button";
import { ButtonGroup } from "@workspace/ui/components/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Checkbox, CheckboxField, CheckboxLabel } from "@workspace/ui/components/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Field, FieldDescription, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/ui/components/input-group";
import { Label } from "@workspace/ui/components/label";
import { InputOTP } from "@workspace/ui/components/input-otp";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Marker, MarkerContent, MarkerIcon } from "@workspace/ui/components/marker";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@workspace/ui/components/menubar";
import { Message, MessageAvatar, MessageContent } from "@workspace/ui/components/message";
import { NativeSelect, NativeSelectOption } from "@workspace/ui/components/native-select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination";
import { Progress, ProgressLabel, ProgressValue } from "@workspace/ui/components/progress";
import { Radio, RadioGroup } from "@workspace/ui/components/radio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { Slider } from "@workspace/ui/components/slider";
import { Switch } from "@workspace/ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import { Toggle } from "@workspace/ui/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";

/* ------------------------------------------------------------------ */
/* slug registry                                                       */
/* ------------------------------------------------------------------ */

import type { BasicPreviewSlug } from "@/components/docs/previews/basic-component-card-slugs";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

/** Centered stage for most miniatures. Clicks are fully contained so
 *  playing with controls never navigates the parent card link:
 *  stopPropagation blocks Next.js routing, preventDefault blocks the
 *  anchor's native follow. Native-state controls (checkbox/radio) are
 *  driven via onClick state below, so preventDefault is safe. */
function stopCardNav(e: React.SyntheticEvent) {
  e.stopPropagation();
  e.preventDefault();
}

function Stage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-full cursor-default items-center justify-center overflow-hidden bg-background p-3 ${className ?? ""}`}
      onClick={stopCardNav}
    >
      {children}
    </div>
  );
}

function StillStage({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none relative flex h-full w-full items-center justify-center overflow-hidden bg-background ${
        padded ? "p-3" : ""
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

const MINI_CALENDAR_DAYS = [
  ["26", "27", "28", "29", "30", "31", "1"],
  ["2", "3", "4", "5", "6", "7", "8"],
  ["9", "10", "11", "12", "13", "14", "15"],
  ["16", "17", "18", "19", "20", "21", "22"],
  ["23", "24", "25", "26", "27", "28", "29"],
  ["30", "31", "1", "2", "3", "4", "5"],
] as const;

function MiniCalendar({ className }: { className?: string }) {
  return (
    <div className={`w-44 rounded-md border bg-popover p-2 text-[9px] text-popover-foreground shadow-sm ${className ?? ""}`}>
      <div className="mb-1 flex items-center justify-between px-1">
        <ChevronLeft className="size-3 text-muted-foreground" />
        <span className="text-[10px] font-semibold">August 2026</span>
        <ChevronRight className="size-3 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="mt-0.5 grid grid-cols-7 gap-0.5 text-center">
        {MINI_CALENDAR_DAYS.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const muted =
              (weekIndex === 0 && dayIndex < 6) ||
              (weekIndex === 5 && dayIndex > 1);
            const selected = weekIndex === 2 && day === "14";
            return (
              <span
                key={`${weekIndex}-${dayIndex}-${day}`}
                className={`flex size-4 items-center justify-center rounded-full ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : muted
                      ? "text-muted-foreground/50"
                      : "text-foreground"
                }`}
              >
                {day}
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}

/** Controlled via onClick so the card-level preventDefault (which stops
 *  anchor navigation) never freezes the native toggle. */
function CheckboxMini() {
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(false);
  return (
    <Stage>
      <div className="flex flex-col gap-2 text-xs">
        <CheckboxField>
          <Checkbox id="bcp-cb1" checked={a} readOnly onClick={() => setA((v) => !v)} />
          <CheckboxLabel htmlFor="bcp-cb1">Email notifications</CheckboxLabel>
        </CheckboxField>
        <CheckboxField>
          <Checkbox id="bcp-cb2" checked={b} readOnly onClick={() => setB((v) => !v)} />
          <CheckboxLabel htmlFor="bcp-cb2">Weekly digest</CheckboxLabel>
        </CheckboxField>
      </div>
    </Stage>
  );
}

function RadioMini() {
  const [plan, setPlan] = React.useState("Pro");
  return (
    <Stage>
      <RadioGroup className="gap-2 text-xs">
        <Radio
          name="bcp-plan"
          value="Starter"
          checked={plan === "Starter"}
          readOnly
          onClick={() => setPlan("Starter")}
        />
        <Radio
          name="bcp-plan"
          value="Pro"
          checked={plan === "Pro"}
          readOnly
          onClick={() => setPlan("Pro")}
        />
      </RadioGroup>
    </Stage>
  );
}

/** Hand-drawn mini bars — keeps the heavy chart engine out of the gallery chunk. */
function ChartMini() {
  const bars = [34, 52, 44, 68, 58, 82, 74, 96, 64, 88, 70, 60];
  return (
    <StillStage>
      <div className="w-full max-w-55 px-2">
        <div className="flex h-24 items-end gap-1">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${i === 7 ? "bg-primary" : "bg-primary/30"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-1.5 h-px w-full bg-border" />
        <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
          <span>Jan</span>
          <span>Jun</span>
          <span>Dec</span>
        </div>
      </div>
    </StillStage>
  );
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */

export function BasicComponentCardPreview({ slug }: { slug: BasicPreviewSlug }) {
  switch (slug) {
    /* ------------------------------- Actions ------------------------------ */
    case "button":
      return (
        <Stage>
          <div className="flex items-center gap-1.5">
            <Button size="sm">Default</Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
          </div>
        </Stage>
      );
    case "button-group":
      return (
        <Stage>
          <ButtonGroup>
            <Button size="sm" variant="outline">
              Left
            </Button>
            <Button size="sm" variant="outline">
              Middle
            </Button>
            <Button size="sm" variant="outline">
              Right
            </Button>
          </ButtonGroup>
        </Stage>
      );
    case "toggle":
      return (
        <Stage>
          <div className="flex items-center gap-1.5">
            <Toggle variant="outline" defaultPressed aria-label="Bold">
              Bold
            </Toggle>
            <Toggle variant="outline" aria-label="Italic">
              Italic
            </Toggle>
          </div>
        </Stage>
      );
    case "toggle-group":
      return (
        <Stage>
          <ToggleGroup type="single" variant="outline" defaultValue="center" aria-label="Align">
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="center">Center</ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
        </Stage>
      );
    case "link":
      return (
        <StillStage>
          <div className="flex flex-col items-center gap-1.5 text-sm">
            <span className="font-medium text-primary underline underline-offset-4">Documentation</span>
            <span className="font-medium text-muted-foreground underline underline-offset-4">Changelog</span>
          </div>
        </StillStage>
      );

    /* -------------------------------- Forms ------------------------------- */
    case "input":
      return (
        <Stage>
          <Input className="w-44" placeholder="Enter text" defaultValue="Hello" />
        </Stage>
      );
    case "label":
      return (
        <Stage>
          <div className="w-44 space-y-1.5">
            <Label htmlFor="card-label-demo">Email</Label>
            <Input id="card-label-demo" className="h-9 text-xs" placeholder="you@example.com" />
          </div>
        </Stage>
      );
    case "textarea":
      return (
        <Stage>
          <Textarea className="w-44 text-xs" placeholder="Type your message" rows={2} />
        </Stage>
      );
    case "select":
      return (
        <Stage>
          <Select defaultValue="apple">
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Pick a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectContent>
          </Select>
        </Stage>
      );
    case "checkbox":
      return <CheckboxMini />;
    case "radio":
      return <RadioMini />;
    case "switch":
      return (
        <Stage>
          <div className="flex items-center gap-2 text-xs">
            <Switch defaultChecked aria-label="Airplane mode" />
            <span>Airplane mode</span>
          </div>
        </Stage>
      );
    case "form":
      return (
        <StillStage>
          <div className="w-44 space-y-2">
            <p className="text-xs font-medium">Email</p>
            <div className="flex h-8 items-center rounded-md border bg-background px-2 text-[10px] text-muted-foreground">
              email@example.com
            </div>
            <div className="rounded-md bg-primary px-2 py-1.5 text-center text-[10px] font-medium text-primary-foreground">
              Submit
            </div>
          </div>
        </StillStage>
      );
    case "questionnaire":
      return (
        <StillStage>
          <div className="w-full max-w-56 rounded-lg border bg-background p-3 text-xs">
            <p className="font-semibold">Start now?</p>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 rounded-md border border-primary bg-primary/5 px-2 py-1.5">
                <span className="flex size-3 items-center justify-center rounded-full border border-primary bg-primary">
                  <span className="size-1 rounded-full bg-primary-foreground" />
                </span>
                Yes
              </div>
              <div className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                <span className="size-3 rounded-full border" />
                No
              </div>
            </div>
            <div className="mt-2 rounded-md bg-primary px-2 py-1 text-center text-[10px] font-medium text-primary-foreground">
              Submit
            </div>
          </div>
        </StillStage>
      );
    case "calendar":
      return (
        <StillStage>
          <div className="origin-center scale-[0.85]">
            <MiniCalendar />
          </div>
        </StillStage>
      );
    case "combobox":
      return (
        <StillStage>
          <div className="w-44 space-y-1">
            <div className="flex h-8 items-center justify-between rounded-md border bg-background px-2 text-[10px] text-muted-foreground">
              Pick a framework…
              <ChevronDown className="size-3" />
            </div>
            <div className="rounded-md border bg-popover p-1 shadow-sm">
              <div className="rounded-sm bg-accent px-2 py-1 text-[10px] text-accent-foreground">React</div>
              <div className="px-2 py-1 text-[10px]">Vue</div>
            </div>
          </div>
        </StillStage>
      );
    case "date-picker":
      return (
        <StillStage>
          <div className="flex w-full max-w-52 flex-col items-center gap-1.5">
            <div className="flex h-8 w-44 items-center justify-between rounded-md border bg-background px-2 text-[10px]">
              Aug 14, 2026
              <CalendarDays className="size-3 text-muted-foreground" />
            </div>
            <div className="h-[108px] origin-top scale-[0.72]">
              <MiniCalendar />
            </div>
          </div>
        </StillStage>
      );
    case "field":
      return (
        <Stage>
          <Field className="w-44">
            <FieldLabel>Name</FieldLabel>
            <Input className="h-8 text-xs" placeholder="Ada Lovelace" />
            <FieldDescription>Your display name.</FieldDescription>
          </Field>
        </Stage>
      );
    case "input-group":
      return (
        <Stage>
          <InputGroup className="w-44">
            <InputGroupAddon align="inline-start">@</InputGroupAddon>
            <InputGroupInput placeholder="Username" />
          </InputGroup>
        </Stage>
      );
    case "input-otp":
      return (
        <Stage>
          <InputOTP length={4} defaultValue="1234" inputMode="numeric" />
        </Stage>
      );
    case "native-select":
      return (
        <Stage>
          <NativeSelect className="w-44" defaultValue="react">
            <NativeSelectOption value="react">React</NativeSelectOption>
            <NativeSelectOption value="vue">Vue</NativeSelectOption>
          </NativeSelect>
        </Stage>
      );
    case "slider":
      return (
        <Stage>
          <Slider className="w-44" defaultValue={60} ariaLabel="Volume" />
        </Stage>
      );

    /* ------------------------------ Feedback ------------------------------ */
    case "alert":
      return (
        <Stage>
          <Alert variant="info" className="max-w-60">
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertBody>
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>Dark mode is now available.</AlertDescription>
            </AlertBody>
          </Alert>
        </Stage>
      );
    case "toast":
      return (
        <StillStage>
          <div className="relative w-48">
            <div className="absolute inset-x-2 -top-2 h-12 rounded-lg border bg-background/70 shadow-sm" />
            <div className="absolute inset-x-1 -top-1 h-12 rounded-lg border bg-background/85 shadow-sm" />
            <div className="relative flex items-start gap-2 rounded-lg border bg-background p-2.5 shadow-md">
              <div className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold">Deployed</p>
                <p className="text-[10px] text-muted-foreground">Your site is live.</p>
              </div>
              <X className="size-3 text-muted-foreground" />
            </div>
          </div>
        </StillStage>
      );
    case "progress":
      return (
        <StillStage>
          <Progress value={65} variant="primary" className="w-full max-w-52 [&_[data-slot=progress-indicator]]:transition-none">
            <div className="flex justify-between text-[10px]">
              <ProgressLabel>Upload</ProgressLabel>
              <ProgressValue />
            </div>
          </Progress>
        </StillStage>
      );
    case "spinner":
      return (
        <StillStage>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-6 rounded-full border-2 border-muted-foreground/25 border-t-muted-foreground" />
            Loading…
          </div>
        </StillStage>
      );
    case "skeleton":
      return (
        <StillStage>
          <div className="w-full max-w-52 space-y-1.5">
            <div className="h-3 w-full rounded-md bg-muted" />
            <div className="h-3 w-4/5 rounded-md bg-muted" />
            <div className="h-3 w-3/5 rounded-md bg-muted" />
          </div>
        </StillStage>
      );
    case "empty":
      return (
        <Stage>
          <div className="scale-90">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageOpen />
                </EmptyMedia>
                <EmptyTitle>No projects</EmptyTitle>
                <EmptyDescription>Create your first project.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        </Stage>
      );

    /* ------------------------------ Navigation ---------------------------- */
    case "tabs":
      return (
        <Stage>
          <Tabs defaultValue="account" className="w-full max-w-56">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="text-xs">
              Account settings live here.
            </TabsContent>
          </Tabs>
        </Stage>
      );
    case "breadcrumb":
      return (
        <StillStage>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <span>Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <span>Docs</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Alert</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </StillStage>
      );
    case "pagination":
      return (
        <Stage>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious showText={false} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext showText={false} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Stage>
      );
    case "sidebar":
      return (
        <StillStage padded={false}>
          <div className="flex h-full w-full">
            <div className="h-full w-[9.5rem] shrink-0 border-r bg-sidebar p-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 rounded-md bg-sidebar-accent px-2 py-1 text-[10px] font-medium text-sidebar-accent-foreground">
                  <Home className="size-3" />
                  Home
                </div>
                <div className="flex items-center gap-2 rounded-md px-2 py-1 text-[10px] text-muted-foreground">
                  <Inbox className="size-3" />
                  Inbox
                </div>
                <div className="flex items-center gap-2 rounded-md px-2 py-1 text-[10px] text-muted-foreground">
                  <Settings className="size-3" />
                  Settings
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 p-3">
              <div className="h-3 w-2/3 rounded bg-foreground/80" />
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-5/6 rounded bg-muted" />
              <div className="h-2 w-4/6 rounded bg-muted" />
            </div>
          </div>
        </StillStage>
      );
    case "navigation-menu":
      return (
        <StillStage>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border bg-background/80 px-2 py-1 text-[10px] shadow-xs backdrop-blur">
              <span className="flex items-center gap-1 rounded-full bg-accent/60 px-2 py-0.5">
                Docs
                <ChevronDown className="size-3" />
              </span>
              <span className="px-2 py-0.5 text-muted-foreground">About</span>
            </div>
            <div className="rounded-md border bg-popover px-3 py-1.5 text-[10px] shadow-sm">Getting started</div>
          </div>
        </StillStage>
      );
    case "menubar":
      return (
        <Stage>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>New Tab</MenubarItem>
                <MenubarItem>Print</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Undo</MenubarItem>
                <MenubarItem>Redo</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </Stage>
      );

    /* ------------------------------- Overlays ----------------------------- */
    case "dialog":
      return (
        <StillStage>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
          <div className="relative w-40 rounded-xl border bg-popover p-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold">Sure?</p>
                <p className="mt-1 text-[10px] text-muted-foreground">This cannot be undone.</p>
              </div>
              <X className="size-3 text-muted-foreground" />
            </div>
          </div>
        </StillStage>
      );
    case "alert-dialog":
      return (
        <StillStage>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
          <div className="relative w-44 rounded-xl border bg-popover p-3 shadow-lg">
            <p className="text-xs font-semibold">Are you sure?</p>
            <p className="mt-1 text-[10px] text-muted-foreground">This action cannot be undone.</p>
            <div className="mt-3 flex justify-end gap-1.5 text-[10px]">
              <span className="rounded-md border px-2 py-1">Cancel</span>
              <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground">Continue</span>
            </div>
          </div>
        </StillStage>
      );
    case "aspect-ratio":
      return (
        <Stage>
          <AspectRatio ratio={16 / 9} className="w-44 overflow-hidden rounded-md border border-border bg-muted">
            <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground">
              16 / 9
            </div>
          </AspectRatio>
        </Stage>
      );
    case "drawer":
      return (
        <StillStage>
          <div className="absolute inset-0 bg-background/50" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-xl border-t bg-background p-3 shadow-lg">
            <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-muted-foreground/30" />
            <p className="text-xs font-semibold">Confirm</p>
            <p className="text-[10px] text-muted-foreground">This cannot be undone.</p>
          </div>
        </StillStage>
      );
    case "popover":
      return (
        <StillStage>
          <div className="flex w-full max-w-52 flex-col items-center gap-2">
            <div className="rounded-md border bg-popover px-3 py-1.5 text-[10px] shadow-sm">Billable · $48.20</div>
            <span className="inline-flex h-7 items-center rounded-md border bg-background px-2 text-[10px]">Open Popover</span>
          </div>
        </StillStage>
      );
    case "tooltip":
      return (
        <StillStage>
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-md bg-foreground px-2 py-1 text-[10px] text-background shadow-sm">Add to library</div>
            <span className="inline-flex h-7 items-center rounded-md border bg-background px-2 text-[10px]">Hover me</span>
          </div>
        </StillStage>
      );
    case "dropdown-menu":
      return (
        <StillStage>
          <div className="flex flex-col items-center gap-1.5">
            <span className="inline-flex h-7 items-center rounded-md border bg-background px-2 text-[10px]">Open Menu</span>
            <div className="w-32 rounded-md border bg-popover p-1 shadow-sm">
              <div className="rounded-sm bg-accent px-2 py-1 text-[10px] text-accent-foreground">Profile</div>
              <div className="px-2 py-1 text-[10px]">Settings</div>
            </div>
          </div>
        </StillStage>
      );
    case "context-menu":
      return (
        <StillStage>
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-dashed px-3 py-2 text-[10px] text-muted-foreground">Right-click here</div>
            <div className="w-28 rounded-md border bg-popover p-1 shadow-sm">
              <div className="rounded-sm bg-accent px-2 py-1 text-[10px] text-accent-foreground">Copy</div>
              <div className="px-2 py-1 text-[10px]">Paste</div>
            </div>
          </div>
        </StillStage>
      );
    case "hover-card":
      return (
        <StillStage>
          <div className="flex items-center gap-2">
            <span className="text-sm underline underline-offset-4">@ada</span>
            <div className="w-32 rounded-md border bg-popover p-2 text-[10px] shadow-sm">Ada — first programmer.</div>
          </div>
        </StillStage>
      );
    case "sheet":
      return (
        <StillStage>
          <div className="absolute inset-0 bg-background/50" />
          <div className="absolute inset-y-0 right-0 w-2/5 rounded-l-xl border-l bg-background p-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold">Panel</p>
                <p className="mt-1 text-[10px] text-muted-foreground">3 unread messages.</p>
              </div>
              <X className="size-3 text-muted-foreground" />
            </div>
          </div>
        </StillStage>
      );

    /* ----------------------------- Data Display --------------------------- */
    case "card":
      return (
        <Stage>
          <Card className="w-full max-w-56">
            <CardHeader>
              <CardTitle>Deploy ready</CardTitle>
              <CardDescription>Ship with confidence</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Small body copy here.</p>
            </CardContent>
          </Card>
        </Stage>
      );
    case "badge":
      return (
        <Stage>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Badge>New</Badge>
            <Badge variant="success">
              <BadgeDot /> Live
            </Badge>
            <Badge variant="outline">Beta</Badge>
          </div>
        </Stage>
      );
    case "avatar":
      return (
        <Stage>
          <AvatarGroup max={3}>
            <Avatar>
              <AvatarFallback name="Aarav Sharma" />
            </Avatar>
            <Avatar>
              <AvatarFallback name="Mira Chen" />
            </Avatar>
            <Avatar>
              <AvatarFallback name="Jonas Weber" />
            </Avatar>
            <Avatar>
              <AvatarFallback name="Ada Lovelace" />
            </Avatar>
          </AvatarGroup>
        </Stage>
      );
    case "separator":
      return (
        <Stage>
          <div className="flex w-full max-w-52 flex-col gap-1.5 text-center">
            <p className="text-xs font-medium">DavinciUI</p>
            <Separator />
            <p className="text-[10px] text-muted-foreground">Blog · Docs · Source</p>
          </div>
        </Stage>
      );
    case "bubble":
      return (
        <Stage>
          <div className="flex w-full max-w-52 flex-col gap-1.5 text-xs">
            <Bubble variant="secondary">
              <BubbleContent>Hey, need a hand?</BubbleContent>
            </Bubble>
            <Bubble align="end" tail>
              <BubbleContent>Sure — ship it.</BubbleContent>
            </Bubble>
          </div>
        </Stage>
      );
    case "attachment":
      return (
        <Stage>
          <Attachment className="w-full max-w-52">
            <AttachmentMedia variant="icon">
              <FileText />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>brief.pdf</AttachmentTitle>
              <AttachmentDescription>PDF · 1.4 MB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </Stage>
      );
    case "chart":
      return <ChartMini />;
    case "item":
      return (
        <Stage>
          <Item variant="outline" size="sm" className="w-full max-w-52">
            <ItemMedia variant="icon">
              <Inbox />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Inbox</ItemTitle>
              <ItemDescription>3 unread threads</ItemDescription>
            </ItemContent>
          </Item>
        </Stage>
      );
    case "message-scroller":
      return (
        <StillStage>
          <div className="relative h-28 w-full max-w-52 overflow-hidden rounded-lg border bg-background p-2 pr-4 text-[10px]">
            <div className="space-y-1.5">
              <p className="w-fit rounded-md bg-muted px-2 py-1">Hello!</p>
              <p className="ml-8 w-fit rounded-md bg-primary px-2 py-1 text-primary-foreground">Hi back.</p>
              <p className="w-fit rounded-md bg-muted px-2 py-1">Shipped it.</p>
              <p className="opacity-35">…</p>
            </div>
            <div className="absolute bottom-1 right-1 top-1 w-1.5 rounded-full bg-muted">
              <div className="ml-auto h-7 w-full rounded-full bg-border" />
            </div>
          </div>
        </StillStage>
      );
    case "message":
      return (
        <Stage>
          <Message className="w-full max-w-56">
            <MessageAvatar>
              <Avatar className="size-7">
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <Bubble variant="secondary">
                <BubbleContent>How can I help?</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </Stage>
      );
    case "marker":
      return (
        <Stage>
          <div className="flex w-full max-w-52 flex-col gap-1.5">
            <Marker tone="success">
              <MarkerIcon>
                <Check />
              </MarkerIcon>
              <MarkerContent>Tests passed in 12s</MarkerContent>
            </Marker>
            <Marker tone="info">
              <MarkerIcon>
                <Bell />
              </MarkerIcon>
              <MarkerContent>Deploy scheduled</MarkerContent>
            </Marker>
          </div>
        </Stage>
      );
    /* -------------------------------- Layout ------------------------------ */
    case "accordion":
      return (
        <Stage>
          <Accordion defaultValue="a" className="w-full max-w-56 text-xs">
            <AccordionItem value="a">
              <AccordionTrigger>Reset password?</AccordionTrigger>
              <AccordionContent>Link expires in 24 hours.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Change email?</AccordionTrigger>
              <AccordionContent>Verify the new address first.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Stage>
      );
    case "carousel":
      return (
        <StillStage>
          <div className="relative w-full max-w-52">
            <div className="rounded-lg border bg-muted/40 p-6 text-center text-sm font-semibold">1</div>
            <span className="absolute left-1 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border bg-background">
              <ChevronLeft className="size-3" />
            </span>
            <span className="absolute right-1 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border bg-background">
              <ChevronRight className="size-3" />
            </span>
          </div>
        </StillStage>
      );
    case "collapsible":
      return (
        <Stage>
          <Collapsible defaultOpen className="w-full max-w-52">
            <CollapsibleTrigger className="text-xs font-medium">Details</CollapsibleTrigger>
            <CollapsibleContent>
              <p className="text-xs text-muted-foreground">Hidden notes live here.</p>
            </CollapsibleContent>
          </Collapsible>
        </Stage>
      );
    case "scroll-area":
      return (
        <StillStage>
          <div className="relative h-28 w-full max-w-52 overflow-hidden rounded-md border">
            <div className="space-y-1.5 p-2.5 pr-4 text-[10px]">
              {Array.from({ length: 8 }).map((_, i) => (
                <p key={i} className="rounded bg-muted px-1.5 py-1">
                  Row {i + 1} — scroll for more
                </p>
              ))}
            </div>
            <div className="absolute bottom-1 right-1 top-1 w-1.5 rounded-full bg-muted">
              <div className="h-6 w-full rounded-full bg-border" />
            </div>
          </div>
        </StillStage>
      );
    default:
      return null;
  }
}
