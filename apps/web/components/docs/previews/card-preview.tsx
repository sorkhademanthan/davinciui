"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardMedia,
  CardMetric,
  CardTitle,
} from "@workspace/ui/components/card";
import { ArrowRight, ArrowUpRight, Bell, Settings, Sparkles, TrendingUp } from "lucide-react";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

export function CardPreview() {
  return (
    <Shell>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm">
              Action
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="card-demo-name">Project name</Label>
              <Input id="card-demo-name" name="project-name" autoComplete="off" placeholder="My project…" />
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Card Content — the main body of the card goes here.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">Card Footer</p>
          <Button size="sm" className="ms-auto">
            Save
          </Button>
        </CardFooter>
      </Card>
    </Shell>
  );
}

export function CardElevatedPreview() {
  return (
    <Shell>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Pro workspace</CardTitle>
          <CardDescription>Hover to feel the lift — depth that deepens.</CardDescription>
          <CardAction>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
              <Sparkles className="size-3" aria-hidden="true" /> Popular
            </span>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight">$24</span>
            <span className="text-sm text-muted-foreground">/ mo</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm" className="w-full">
            Upgrade
          </Button>
        </CardFooter>
      </Card>
    </Shell>
  );
}

export function CardSpotlightPreview() {
  return (
    <Shell>
      <Card spotlight>
        <CardHeader>
          <CardTitle>Move your cursor</CardTitle>
          <CardDescription>A soft light tracks across the surface.</CardDescription>
          <CardAction>
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden="true" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Zero re-renders — the pointer writes two CSS variables and a
            pseudo-element does the rest.
          </p>
        </CardContent>
      </Card>
    </Shell>
  );
}

export function CardGlassPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#7c3aed,#4f46e5_45%,#2563eb)] p-8">
      <div className="w-full max-w-sm">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-white">Floating panel</CardTitle>
            <CardDescription className="text-white/70">
              Frosted surface for overlays and hero sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-white/80">
              Backdrop blur with a specular top edge — the liquid-glass signature.
            </p>
          </CardContent>
          <CardFooter className="border-white/20 bg-white/10">
            <Button size="sm" variant="secondary" className="ms-auto">
              Got it
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function CardOutlinePreview() {
  return (
    <Shell>
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Dense dashboard tile</CardTitle>
          <CardDescription>Hairline only — no shadow, for 30-card grids.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight">98.2%</span>
            <span className="text-sm text-emerald-600">+1.4%</span>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}

export function CardSmallPreview() {
  return (
    <Shell>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Compact card</CardTitle>
          <CardDescription>size=&quot;sm&quot; tightens section spacing.</CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm" aria-label="Notifications">
              <Bell className="size-4" aria-hidden="true" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Small cards use tighter gaps and padding via the shared spacing variable.
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">
            Cancel
          </Button>
          <Button size="sm" className="ms-auto">
            Confirm
          </Button>
        </CardFooter>
      </Card>
    </Shell>
  );
}

export function CardSpacingPreview() {
  return (
    <Shell>
      <Card className="[--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle>Custom spacing</CardTitle>
          <CardDescription>Override with [--card-spacing:--spacing(6)].</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Every section gap and inset follows the variable, so one override
            resizes the whole card consistently.
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">Footer follows too</p>
        </CardFooter>
      </Card>
    </Shell>
  );
}

export function CardEdgeToEdgePreview() {
  return (
    <Shell>
      <Card>
        <CardHeader>
          <CardTitle>Edge to edge</CardTitle>
          <CardDescription>Bleed media with -mx-(--card-spacing).</CardDescription>
        </CardHeader>
        <CardContent className="-mb-(--card-spacing)">
          <img
            src="https://picsum.photos/seed/davinci-card/640/300"
            alt="Edge-to-edge preview"
            width={640}
            height={300}
            loading="lazy"
            className="-mx-(--card-spacing) h-36 w-[calc(100%+calc(var(--card-spacing)*2))] max-w-none object-cover"
          />
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">Footer stays aligned</p>
          <Button size="sm" variant="outline" className="ms-auto">
            <Settings className="size-4" aria-hidden="true" /> Manage
          </Button>
        </CardFooter>
      </Card>
    </Shell>
  );
}

export function CardImagePreview() {
  return (
    <Shell>
      <Card>
        <img
          src="https://picsum.photos/seed/davinci-nova/640/300"
          alt="Card cover"
          width={640}
          height={300}
          loading="lazy"
          className="h-40 w-full object-cover"
        />
        <CardHeader>
          <CardTitle>Card with image</CardTitle>
          <CardDescription>An image before the header becomes the cover.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Leading and trailing images get rounded corners automatically and
            the card drops its top padding.
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">
            Details
          </Button>
          <Button size="sm" className="ms-auto">
            Get started
          </Button>
        </CardFooter>
      </Card>
    </Shell>
  );
}

export function CardRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>عنوان البطاقة</CardTitle>
            <CardDescription>وصف مختصر لمحتوى البطاقة.</CardDescription>
            <CardAction>
              <Button variant="outline" size="sm">
                إجراء
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">محتوى البطاقة الرئيسي يظهر هنا.</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">تذييل البطاقة</p>
            <Button size="sm" className="me-auto">
              حفظ
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function CardInteractivePreview() {
  return (
    <Shell>
      <Card interactive asChild>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <CardHeader>
            <CardEyebrow>Changelog</CardEyebrow>
            <CardTitle>Clickable card keeps its semantics</CardTitle>
            <CardDescription>
              asChild renders a real link — keyboard, screen reader, and
              middle-click all work. Hover to feel the lift.
            </CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </CardAction>
          </CardHeader>
        </a>
      </Card>
    </Shell>
  );
}

export function CardStatusPreview() {
  return (
    <Shell>
      <div className="grid gap-3">
        <Card status="success">
          <CardHeader>
            <CardTitle>Deploy succeeded</CardTitle>
            <CardDescription>Status reads from the top edge — no badge needed.</CardDescription>
          </CardHeader>
        </Card>
        <Card status="warning">
          <CardHeader>
            <CardTitle>Usage at 90%</CardTitle>
            <CardDescription>Amber edge for needs-attention states.</CardDescription>
          </CardHeader>
        </Card>
        <Card status="destructive">
          <CardHeader>
            <CardTitle>Build failed</CardTitle>
            <CardDescription>Red edge for errors with a fix beside it.</CardDescription>
            <CardAction>
              <Button variant="outline" size="sm">
                View logs
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    </Shell>
  );
}

export function CardMetricPreview() {
  return (
    <Shell>
      <Card>
        <CardHeader>
          <CardEyebrow>Monthly recurring revenue</CardEyebrow>
          <CardAction>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3" aria-hidden="true" /> 12.4%
            </span>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardMetric>$48,290</CardMetric>
          <p className="mt-1 text-sm text-muted-foreground">
            Tabular numerals keep the figure steady as it updates.
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
            View report <ArrowRight className="size-3" aria-hidden="true" />
          </Button>
        </CardFooter>
      </Card>
    </Shell>
  );
}

export function CardMediaPreview() {
  return (
    <Shell>
      <Card>
        <CardMedia>
          <img
            src="https://picsum.photos/seed/davinci-media/640/360"
            alt="Product cover"
            width={640}
            height={360}
            loading="lazy"
          />
        </CardMedia>
        <CardHeader>
          <CardEyebrow>Field notes</CardEyebrow>
          <CardTitle>Cover media with a slow zoom</CardTitle>
          <CardDescription>
            CLS-safe aspect box — hover the card and the image leans in.
          </CardDescription>
        </CardHeader>
      </Card>
    </Shell>
  );
}
