"use client"

import * as React from "react"
import Image from "next/image"
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area"

// ---------------------------------------------------------------------------
// Default — vertical
// ---------------------------------------------------------------------------

const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.4.0-beta.${a.length - i}`)

export function ScrollAreaPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
          {tags.map((tag) => (
            <React.Fragment key={tag}>
              <div className="text-sm">{tag}</div>
              <div className="my-2 h-px bg-border" />
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Horizontal
// ---------------------------------------------------------------------------

export function ScrollAreaHorizontalPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
        <div className="flex w-max space-x-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <figure key={i} className="shrink-0">
              <div className="overflow-hidden rounded-md">
                <Image
                  src={`https://picsum.photos/seed/scroll-${i}/300/200`}
                  alt={`Photo ${i + 1}`}
                  width={300}
                  height={200}
                  className="aspect-[3/2] h-[200px] w-[300px] object-cover"
                  unoptimized
                />
              </div>
              <figcaption className="pt-2 text-xs text-muted-foreground">
                Photo by <span className="font-medium text-foreground">Artist {i + 1}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RTL
// ---------------------------------------------------------------------------

export function ScrollAreaRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">العلامات</h4>
          {tags.slice(0, 20).map((tag) => (
            <React.Fragment key={tag}>
              <div className="text-sm">{tag}</div>
              <div className="my-2 h-px bg-border" />
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
