"use client";

import * as React from "react";
import {
  Bell,
  Check,
  FileText,
  Home,
  Inbox,
  Info,
  PackageOpen,
  Settings,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@workspace/ui/components/alert-dialog";
import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import { Alert, AlertBody, AlertDescription, AlertIcon, AlertTitle } from "@workspace/ui/components/alert";
import { Attachment, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "@workspace/ui/components/attachment";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { AvatarGroup } from "@workspace/ui/components/avatar";
import { Badge, BadgeDot } from "@workspace/ui/components/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@workspace/ui/components/breadcrumb";
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble";
import { Button } from "@workspace/ui/components/button";
import { ButtonGroup } from "@workspace/ui/components/button-group";
import { Calendar } from "@workspace/ui/components/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@workspace/ui/components/carousel";
import { Checkbox, CheckboxField, CheckboxLabel } from "@workspace/ui/components/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible";
import { Combobox } from "@workspace/ui/components/combobox";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@workspace/ui/components/context-menu";
import { DatePicker } from "@workspace/ui/components/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@workspace/ui/components/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty";
import { Field, FieldDescription, FieldLabel } from "@workspace/ui/components/field";
import { Form, FormControl, FormItem, FormLabel } from "@workspace/ui/components/form";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@workspace/ui/components/hover-card";
import { Input } from "@workspace/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/ui/components/input-group";
import { Label } from "@workspace/ui/components/label";
import { InputOTP } from "@workspace/ui/components/input-otp";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@workspace/ui/components/item";
import { Link } from "@workspace/ui/components/link";
import { Marker, MarkerContent, MarkerIcon } from "@workspace/ui/components/marker";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@workspace/ui/components/menubar";
import { Message, MessageAvatar, MessageContent } from "@workspace/ui/components/message";
import { MessageScroller, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport } from "@workspace/ui/components/message-scroller";
import { NativeSelect, NativeSelectOption } from "@workspace/ui/components/native-select";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@workspace/ui/components/navigation-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@workspace/ui/components/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Progress, ProgressLabel, ProgressValue } from "@workspace/ui/components/progress";
import { Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoices, QuestionnaireItem, QuestionnaireSubmit, QuestionnaireTitle } from "@workspace/ui/components/questionnaire";
import { Radio, RadioGroup } from "@workspace/ui/components/radio";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@workspace/ui/components/sidebar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Slider } from "@workspace/ui/components/slider";
import { Spinner } from "@workspace/ui/components/spinner";
import { Switch } from "@workspace/ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import { Toaster, toast } from "@workspace/ui/components/toast";
import { Toggle } from "@workspace/ui/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";

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

function ToastMini() {
  const fired = React.useRef(false);
  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const t = window.setTimeout(() => {
      toast.success("Deployed", { description: "Your site is live." });
    }, 500);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <Stage>
      <Toaster />
      <Button size="sm" variant="outline" onClick={() => toast.success("Deployed", { description: "Your site is live." })}>
        <Bell className="size-3.5" /> Show toast
      </Button>
    </Stage>
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
    <Stage>
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
    </Stage>
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
        <Stage>
          <div className="flex flex-col items-center gap-1.5 text-sm">
            <Link href="#">Documentation</Link>
            <Link href="#" variant="muted">
              Changelog
            </Link>
          </div>
        </Stage>
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
        <Stage>
          <Form className="w-44 space-y-2">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input className="h-8 text-xs" placeholder="email@example.com" />
              </FormControl>
            </FormItem>
            <Button type="submit" size="sm" className="w-full">
              Submit
            </Button>
          </Form>
        </Stage>
      );
    case "questionnaire":
      return (
        <Stage>
          <Questionnaire className="w-full max-w-56">
            <QuestionnaireItem name="bcp-q1" required>
              <QuestionnaireTitle>Start now?</QuestionnaireTitle>
              <QuestionnaireChoices>
                <QuestionnaireChoice value="yes">Yes</QuestionnaireChoice>
                <QuestionnaireChoice value="no">No</QuestionnaireChoice>
              </QuestionnaireChoices>
            </QuestionnaireItem>
            <QuestionnaireActions>
              <QuestionnaireSubmit>Submit</QuestionnaireSubmit>
            </QuestionnaireActions>
          </Questionnaire>
        </Stage>
      );
    case "calendar":
      return (
        <div
          className="flex h-full w-full cursor-default items-center justify-center overflow-hidden bg-background p-1"
          onClick={stopCardNav}
        >
          <div className="origin-center scale-[0.8] [&_div.text-\[11px\]]:text-[8px] [&_div.text-\[11px\]]:tracking-normal">
            <Calendar
              defaultMonth={new Date(2026, 7, 1, 12)}
              defaultSelected={new Date(2026, 7, 14, 12)}
              cellSize={24}
            />
          </div>
        </div>
      );
    case "combobox":
      return (
        <Stage>
          <Combobox
            className="w-44"
            placeholder="Pick a framework…"
            items={[
              { value: "react", label: "React" },
              { value: "vue", label: "Vue" },
            ]}
          />
        </Stage>
      );
    case "date-picker":
      return (
        <Stage>
          <DatePicker defaultValue={new Date(2026, 7, 14, 12)} />
        </Stage>
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
      return <ToastMini />;
    case "progress":
      return (
        <Stage>
          <Progress value={60} variant="primary" className="w-full max-w-52">
            <div className="flex justify-between text-[10px]">
              <ProgressLabel>Upload</ProgressLabel>
              <ProgressValue />
            </div>
          </Progress>
        </Stage>
      );
    case "spinner":
      return (
        <Stage>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner />
            Loading…
          </div>
        </Stage>
      );
    case "skeleton":
      return (
        <Stage>
          <div className="w-full max-w-52 space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </Stage>
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
        <Stage>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Docs</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Alert</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Stage>
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
        <div
          className="h-full w-full cursor-default overflow-hidden bg-background"
          onClick={stopCardNav}
        >
          <div className="flex h-full w-full">
            <div className="h-full w-[9.5rem] shrink-0 overflow-hidden">
              <SidebarProvider defaultOpen>
                <Sidebar
                  collapsible="none"
                  className="h-full border-r"
                  style={{ "--sidebar-width": "9.5rem" } as React.CSSProperties}
                >
                  <SidebarContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton icon={<Home />} isActive>
                          Home
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton icon={<Inbox />}>Inbox</SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton icon={<Settings />}>Settings</SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarContent>
                </Sidebar>
              </SidebarProvider>
            </div>
            <div className="flex-1 space-y-1.5 p-3">
              <div className="h-3 w-2/3 rounded bg-foreground/80" />
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-5/6 rounded bg-muted" />
              <div className="h-2 w-4/6 rounded bg-muted" />
            </div>
          </div>
        </div>
      );
    case "navigation-menu":
      return (
        <Stage>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul>
                    <li>Getting started</li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">About</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </Stage>
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
        <Stage>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Open Dialog
              </Button>
            </DialogTrigger>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Sure?</DialogTitle>
                <DialogDescription>This cannot be undone.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </Stage>
      );
    case "alert-dialog":
      return (
        <Stage>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">
                Show Dialog
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Stage>
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
        <Stage>
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="sm" variant="outline">
                Open Drawer
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Confirm</DrawerTitle>
                <DrawerDescription>This cannot be undone.</DrawerDescription>
              </DrawerHeader>
            </DrawerContent>
          </Drawer>
        </Stage>
      );
    case "popover":
      return (
        <Stage>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                Open Popover
              </Button>
            </PopoverTrigger>
            <PopoverContent variant="compact" side="bottom">
              <p className="text-xs">Billable · $48.20</p>
            </PopoverContent>
          </Popover>
        </Stage>
      );
    case "tooltip":
      return (
        <Stage>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline">
                Hover me
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Add to library</TooltipContent>
          </Tooltip>
        </Stage>
      );
    case "dropdown-menu":
      return (
        <Stage>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                Open Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Stage>
      );
    case "context-menu":
      return (
        <Stage>
          <ContextMenu>
            <ContextMenuTrigger>
              <div className="rounded-md border border-dashed px-6 py-4 text-xs text-muted-foreground">
                Right-click here
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Copy</ContextMenuItem>
              <ContextMenuItem>Paste</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </Stage>
      );
    case "hover-card":
      return (
        <Stage>
          <HoverCard openDelay={0}>
            <HoverCardTrigger>
              <span className="cursor-pointer text-sm underline underline-offset-4">@ada</span>
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="text-xs">Ada — first programmer.</p>
            </HoverCardContent>
          </HoverCard>
        </Stage>
      );
    case "sheet":
      return (
        <Stage>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">
                Open Sheet
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Panel</SheetTitle>
                <SheetDescription>3 unread messages.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Stage>
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
        <div
          className="h-full w-full cursor-default overflow-hidden bg-background p-3"
          onClick={stopCardNav}
        >
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="h-full rounded-lg border">
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-1.5 p-2 text-xs">
                  <MessageScrollerItem messageId="bcp-m1">
                    <p>Hello!</p>
                  </MessageScrollerItem>
                  <MessageScrollerItem messageId="bcp-m2" scrollAnchor>
                    <p>Hi back.</p>
                  </MessageScrollerItem>
                  <MessageScrollerItem messageId="bcp-m3">
                    <p>Shipped it.</p>
                  </MessageScrollerItem>
                </MessageScrollerContent>
              </MessageScrollerViewport>
            </MessageScroller>
          </MessageScrollerProvider>
        </div>
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
        <Stage>
          <Carousel opts={{ loop: true }} className="w-full max-w-52">
            <CarouselContent>
              {[1, 2, 3].map((n) => (
                <CarouselItem key={n}>
                  <div className="rounded-lg border bg-muted/40 p-6 text-center text-sm font-semibold">
                    {n}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </Stage>
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
        <Stage>
          <ScrollArea className="h-28 w-full max-w-52 rounded-md border">
            <div className="space-y-1.5 p-2.5 text-[10px]">
              {Array.from({ length: 8 }).map((_, i) => (
                <p key={i} className="rounded bg-muted px-1.5 py-1">
                  Row {i + 1} — scroll for more
                </p>
              ))}
            </div>
          </ScrollArea>
        </Stage>
      );
    default:
      return null;
  }
}
