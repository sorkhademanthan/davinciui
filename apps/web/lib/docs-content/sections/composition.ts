import type { DocsContentMap } from "../types";

// Only compound components belong here. The tree mirrors the exported parts
// in packages/ui/src/components/<slug>.tsx and the structure used in the docs
// examples. Keep entries alphabetical.
export const composition = {
  accordion: {
    composition: {
      tree: `Accordion
└── AccordionItem
    ├── AccordionTrigger
    └── AccordionContent`,
    },
  },
  alert: {
    composition: {
      tree: `Alert
├── AlertIcon
├── AlertBody
│   ├── AlertTitle
│   └── AlertDescription
└── AlertAction`,
    },
  },
  "alert-dialog": {
    composition: {
      tree: `AlertDialog
├── AlertDialogTrigger
└── AlertDialogContent
    ├── AlertDialogHeader
    │   ├── AlertDialogTitle
    │   └── AlertDialogDescription
    └── AlertDialogFooter
        ├── AlertDialogCancel
        └── AlertDialogAction`,
    },
  },
  attachment: {
    composition: {
      tree: `AttachmentGroup
└── Attachment
    ├── AttachmentMedia
    ├── AttachmentContent
    │   ├── AttachmentTitle
    │   └── AttachmentDescription
    └── AttachmentActions
        ├── AttachmentAction
        └── AttachmentTrigger`,
    },
  },
  avatar: {
    composition: {
      tree: `AvatarGroup
├── Avatar
│   ├── AvatarImage
│   ├── AvatarFallback
│   └── AvatarBadge
└── AvatarGroupCount`,
    },
  },
  breadcrumb: {
    composition: {
      tree: `Breadcrumb
└── BreadcrumbList
    ├── BreadcrumbItem
    │   ├── BreadcrumbLink
    │   └── BreadcrumbPage
    ├── BreadcrumbSeparator
    └── BreadcrumbEllipsis`,
    },
  },
  bubble: {
    composition: {
      tree: `BubbleGroup
└── Bubble
    ├── BubbleContent
    └── BubbleReactions`,
    },
  },
  "button-group": {
    composition: {
      tree: `ButtonGroup
├── Button
├── Input / Select
├── ButtonGroupSeparator
└── ButtonGroupText`,
    },
  },
  card: {
    composition: {
      tree: `Card
├── CardHeader
│   ├── CardEyebrow
│   ├── CardTitle
│   ├── CardDescription
│   └── CardAction
├── CardMedia
├── CardContent
├── CardMetric
└── CardFooter`,
    },
  },
  carousel: {
    composition: {
      tree: `Carousel
├── CarouselContent
│   └── CarouselItem
├── CarouselPrevious
├── CarouselNext
├── CarouselDots
├── CarouselCounter
├── CarouselProgress
└── CarouselPlayButton`,
    },
  },
  chart: {
    composition: {
      description:
        "ChartContainer wraps the Recharts chart and exposes shared theme tokens to the tooltip and legend parts:",
      tree: `ChartContainer
├── Recharts <BarChart /> / <LineChart /> / <AreaChart />
├── ChartTooltip
│   └── ChartTooltipContent
└── ChartLegend
    └── ChartLegendContent`,
    },
  },
  collapsible: {
    composition: {
      tree: `Collapsible
├── CollapsibleTrigger
└── CollapsibleContent`,
    },
  },
  "context-menu": {
    composition: {
      tree: `ContextMenu
└── ContextMenuTrigger
    └── ContextMenuContent
        ├── ContextMenuGroup
        │   ├── ContextMenuLabel
        │   ├── ContextMenuItem
        │   ├── ContextMenuCheckboxItem
        │   └── ContextMenuRadioGroup
        │       └── ContextMenuRadioItem
        ├── ContextMenuSeparator
        └── ContextMenuSub
            ├── ContextMenuSubTrigger
            └── ContextMenuSubContent`,
    },
  },
  "date-picker": {
    composition: {
      tree: `Popover
├── PopoverTrigger
│   └── Button
└── PopoverContent
    └── Calendar`,
    },
  },
  dialog: {
    composition: {
      tree: `Dialog
├── DialogTrigger
└── DialogContent
    ├── DialogHeader
    │   ├── DialogTitle
    │   └── DialogDescription
    ├── DialogBody
    └── DialogFooter`,
    },
  },
  drawer: {
    composition: {
      tree: `Drawer
├── DrawerTrigger
└── DrawerContent
    ├── DrawerHandle
    ├── DrawerHeader
    │   ├── DrawerTitle
    │   └── DrawerDescription
    ├── DrawerBody
    └── DrawerFooter`,
    },
  },
  "dropdown-menu": {
    composition: {
      tree: `DropdownMenu
├── DropdownMenuTrigger
└── DropdownMenuContent
    ├── DropdownMenuLabel
    ├── DropdownMenuItem (+ Shortcut)
    ├── DropdownMenuCheckboxItem
    ├── DropdownMenuRadioGroup
    │   └── DropdownMenuRadioItem
    ├── DropdownMenuSeparator
    └── DropdownMenuSub
        ├── DropdownMenuSubTrigger
        └── DropdownMenuSubContent`,
    },
  },
  empty: {
    composition: {
      tree: `Empty
├── EmptyHeader
│   ├── EmptyMedia
│   ├── EmptyTitle
│   └── EmptyDescription
└── EmptyContent`,
    },
  },
  field: {
    composition: {
      tree: `FieldSet
├── FieldLegend
└── FieldGroup
    └── Field
        ├── FieldLabel
        ├── FieldContent
        │   ├── FieldControl
        │   └── FieldDescription
        └── FieldError`,
    },
  },
  form: {
    composition: {
      tree: `Form
└── FormItem
    ├── FormLabel
    ├── FormControl
    ├── FormDescription
    └── FormMessage`,
    },
  },
  "hover-card": {
    composition: {
      tree: `HoverCard
├── HoverCardTrigger
└── HoverCardContent`,
    },
  },
  "input-group": {
    composition: {
      tree: `InputGroup
├── InputGroupAddon
│   ├── InputGroupButton
│   └── InputGroupText
├── InputGroupInput
└── InputGroupTextarea`,
    },
  },
  item: {
    composition: {
      tree: `ItemGroup
└── Item
    ├── ItemHeader
    ├── ItemMedia
    ├── ItemContent
    │   ├── ItemTitle
    │   └── ItemDescription
    ├── ItemActions
    └── ItemFooter`,
    },
  },
  marker: {
    composition: {
      tree: `Marker
├── MarkerIcon
├── MarkerContent
│   └── MarkerDot
└── MarkerTime`,
    },
  },
  menubar: {
    composition: {
      tree: `Menubar
└── MenubarMenu
    ├── MenubarTrigger
    └── MenubarContent
        ├── MenubarLabel
        ├── MenubarItem
        ├── MenubarCheckboxItem
        ├── MenubarRadioGroup
        │   └── MenubarRadioItem
        ├── MenubarSeparator
        └── MenubarSub
            ├── MenubarSubTrigger
            └── MenubarSubContent`,
    },
  },
  message: {
    composition: {
      tree: `MessageGroup
└── Message
    ├── MessageAvatar
    ├── MessageContent
    │   ├── MessageHeader
    │   └── MessageFooter
    ├── MessageActions
    └── MessageTime`,
    },
  },
  "message-scroller": {
    composition: {
      tree: `MessageScrollerProvider
└── MessageScroller
    └── MessageScrollerViewport
        └── MessageScrollerContent
            └── MessageScrollerItem
                └── Message`,
    },
  },
  "navigation-menu": {
    composition: {
      tree: `NavigationMenu
├── NavigationMenuList
│   └── NavigationMenuItem
│       ├── NavigationMenuTrigger
│       └── NavigationMenuContent
│           └── NavigationMenuLink
├── NavigationMenuViewport
└── NavigationMenuIndicator`,
    },
  },
  pagination: {
    composition: {
      tree: `Pagination
└── PaginationContent
    ├── PaginationItem
    │   ├── PaginationFirst
    │   ├── PaginationPrevious
    │   ├── PaginationLink
    │   ├── PaginationNext
    │   └── PaginationLast
    └── PaginationEllipsis`,
    },
  },
  popover: {
    composition: {
      tree: `Popover
├── PopoverAnchor
├── PopoverTrigger
└── PopoverContent
    ├── PopoverHeader
    │   ├── PopoverTitle
    │   └── PopoverDescription
    └── PopoverClose`,
    },
  },
  questionnaire: {
    composition: {
      tree: `Questionnaire
├── QuestionnaireProgress
├── QuestionnaireItem
│   ├── QuestionnaireTitle
│   ├── QuestionnaireDescription
│   ├── QuestionnaireChoices
│   │   └── QuestionnaireChoice
│   │       └── QuestionnaireChoiceLabel
│   ├── QuestionnaireInput
│   └── QuestionnaireError
└── QuestionnaireActions
    ├── QuestionnairePrevious
    ├── QuestionnaireSkip
    ├── QuestionnaireNext
    └── QuestionnaireSubmit`,
    },
  },
  radio: {
    composition: {
      tree: `RadioGroup
└── Radio`,
    },
  },
  "scroll-area": {
    composition: {
      tree: `ScrollArea
└── ScrollBar`,
    },
  },
  select: {
    composition: {
      tree: `Select
├── SelectTrigger
│   └── SelectValue
└── SelectContent
    ├── SelectGroup
    │   └── SelectGroupLabel
    ├── SelectLabel
    ├── SelectItem
    └── SelectSeparator`,
    },
  },
  sheet: {
    composition: {
      tree: `Sheet
├── SheetTrigger
└── SheetContent
    ├── SheetHeader
    │   ├── SheetTitle
    │   └── SheetDescription
    ├── SheetFooter
    └── SheetClose`,
    },
  },
  sidebar: {
    composition: {
      tree: `SidebarProvider
├── Sidebar
│   ├── SidebarHeader
│   ├── SidebarContent
│   │   └── SidebarGroup
│   │       ├── SidebarGroupLabel
│   │       └── SidebarGroupContent
│   │           └── SidebarMenu
│   │               └── SidebarMenuItem
│   │                   └── SidebarMenuButton
│   └── SidebarFooter
└── SidebarInset`,
    },
  },
  tabs: {
    composition: {
      tree: `Tabs
├── TabsList
│   └── TabsTrigger
└── TabsContent`,
    },
  },
  "toggle-group": {
    composition: {
      tree: `ToggleGroup
└── ToggleGroupItem`,
    },
  },
  tooltip: {
    composition: {
      tree: `TooltipProvider
└── Tooltip
    ├── TooltipTrigger
    └── TooltipContent`,
    },
  },
} satisfies DocsContentMap;
