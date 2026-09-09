"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

import { cn } from "@workspace/ui/lib/utils"

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  asChild,
  children,
  ...props
}: CollapsiblePrimitive.Trigger.Props & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <CollapsiblePrimitive.Trigger
        data-slot="collapsible-trigger"
        render={children as React.ReactElement}
        {...(props as CollapsiblePrimitive.Trigger.Props)}
      />
    )
  }
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props}>
      {children}
    </CollapsiblePrimitive.Trigger>
  )
}

export interface CollapsibleContentProps extends CollapsiblePrimitive.Panel.Props {
  /** Keep the panel mounted when closed (find-in-page support). @default false */
  keepMounted?: boolean
  /** Keep the panel mounted but hidden until found via find-in-page. @default false */
  hiddenUntilFound?: boolean
}

function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        // Height animates through grid rows (no JS measurement). Open eases
        // out long and soft; close snaps back quicker and more linear.
        // NOTE: layout classes (borders, padding, spacing) belong on content
        // *inside* CollapsibleContent — the panel itself collapses to 0fr.
        "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-[closed]:grid-rows-[0fr] data-[closed]:duration-200 data-[closed]:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "data-[open]:grid-rows-[1fr]",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </CollapsiblePrimitive.Panel>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
