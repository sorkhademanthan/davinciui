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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Bell, Settings } from "lucide-react";

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
              <Input id="card-demo-name" placeholder="My project" />
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Card Content — the main body of the card goes here.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">Card Footer</p>
          <Button size="sm" className="ml-auto">
            Save
          </Button>
        </CardFooter>
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
              <Bell className="size-4" />
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
          <Button size="sm" className="ml-auto">
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
            className="-mx-(--card-spacing) h-36 w-[calc(100%+calc(var(--card-spacing)*2))] max-w-none object-cover"
          />
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">Footer stays aligned</p>
          <Button size="sm" variant="outline" className="ml-auto">
            <Settings className="size-4" /> Manage
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
          <Button size="sm" className="ml-auto">
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
            <Button size="sm" className="mr-auto">
              حفظ
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
