"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@workspace/ui/components/navigation-menu";
import { BookOpen, Component, LifeBuoy, Sparkles } from "lucide-react";

function ListItem({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <NavigationMenuLink
        href={href}
        className="block select-none rounded-lg p-3 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
      </NavigationMenuLink>
    </li>
  );
}

export function NavigationMenuPreview() {
  return (
    <div className="flex h-full w-full items-start justify-center p-8 pt-10">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 p-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink
                    href="/"
                    className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-b from-muted/40 to-muted p-6 no-underline outline-none focus:shadow-md"
                  >
                    <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-foreground text-background">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="mb-2 text-lg font-medium">DavinciUI</div>
                    <p className="text-sm leading-tight text-muted-foreground">Beautiful, fast, and modern UI components. Open source.</p>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/docs" title="Introduction">
                  Re-usable components built with Base UI and Tailwind CSS.
                </ListItem>
                <ListItem href="/docs/installation" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="/docs/components" title="Typography">
                  Styles for headings, paragraphs, lists and more.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-2 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <ListItem href="/docs/components/alert" title="Alert">
                  Displays a callout for user attention.
                </ListItem>
                <ListItem href="/docs/components/dialog" title="Dialog">
                  A window overlaid on the primary window.
                </ListItem>
                <ListItem href="/docs/components/navigation-menu" title="Navigation Menu">
                  A collection of links for navigating websites.
                </ListItem>
                <ListItem href="/docs/components/tabs" title="Tabs">
                  A set of layered sections of content.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink href="/docs" className={navigationMenuTriggerStyle()}>
              Docs
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

export function NavigationMenuWithIconPreview() {
  return (
    <div className="flex h-full w-full items-start justify-center p-8 pt-10">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <BookOpen className="mr-1.5 size-4" />
              Docs
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[300px] gap-1 p-2">
                <ListItem href="/docs" title="Getting started">
                  Introduction and quick start.
                </ListItem>
                <ListItem href="/docs/components" title="Components">
                  Browse all components.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Component className="mr-1.5 size-4" />
              Components
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[280px] gap-1 p-2">
                <ListItem href="/docs/components/button" title="Button">
                  Displays a button.
                </ListItem>
                <ListItem href="/docs/components/input" title="Input">
                  A text input field.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink href="/docs" className={navigationMenuTriggerStyle()}>
              <LifeBuoy className="mr-1.5 size-4" />
              Support
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

export function NavigationMenuLinkPreview() {
  return (
    <div className="flex h-full w-full items-start justify-center p-8 pt-10">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={<Link href="/docs" />}
              className={navigationMenuTriggerStyle()}
            >
              Documentation
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={<Link href="/docs/components/navigation-menu" />}
              className={navigationMenuTriggerStyle()}
            >
              Navigation Menu
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

export function NavigationMenuRtlPreview() {
  return (
    <div className="flex h-full w-full items-start justify-center p-8 pt-10" dir="rtl">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>البدء</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[260px] gap-1 p-2">
                <ListItem href="/docs" title="المقدمة">
                  مكونات واجهة مستخدم جميلة وسريعة.
                </ListItem>
                <ListItem href="/docs/installation" title="التثبيت">
                  كيفية تثبيت الاعتمادات.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>المكونات</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[240px] gap-1 p-2">
                <ListItem href="/docs/components/button" title="زر">
                  عرض زر.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink href="/docs" className={navigationMenuTriggerStyle()}>
              الوثائق
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
