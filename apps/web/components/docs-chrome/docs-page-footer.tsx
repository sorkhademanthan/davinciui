"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, ArrowRight, Github, Linkedin } from "lucide-react"

import { getDocsNavForTab, type DocsNavGroup } from "@/config/docs"

import { getActiveDocsTab } from "./docs-tabs"

type FlatItem = { title: string; href: string }

function flatten(groups: DocsNavGroup[]): FlatItem[] {
  const flat: FlatItem[] = []
  for (const group of groups) {
    for (const item of group.items) {
      if (item.items?.length) {
        for (const child of item.items) {
          flat.push({ title: child.title, href: child.href })
        }
      } else {
        flat.push({ title: item.title, href: item.href })
      }
    }
  }
  return flat
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  )
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

const socials = [
  { label: "X", href: "https://x.com/ManthanSorkhade", icon: XIcon },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/manthansorkhade/",
    icon: Linkedin,
  },
  { label: "Discord", href: "https://discord.gg/davinciui", icon: DiscordIcon },
  {
    label: "GitHub",
    href: "https://github.com/sorkhademanthan/davinciui",
    icon: Github,
  },
] as const

export function DocsPageFooter() {
  const pathname = usePathname()
  const tab = getActiveDocsTab(pathname)
  const items = flatten(getDocsNavForTab(tab))
  const index = items.findIndex((item) => item.href === pathname)
  const previous = index > 0 ? items[index - 1] : undefined
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : undefined

  return (
    <>
      <div className="mt-16 space-y-10">
        <nav aria-label="Page navigation" className="grid gap-4 sm:grid-cols-2">
          {previous ? (
            <Link
              href={previous.href}
              className="group flex min-h-[74px] flex-col justify-center rounded-[14px] border border-border px-4 py-3 transition-colors hover:border-foreground/25"
            >
              <span className="text-base font-medium text-foreground">
                {previous.title}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Previous
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group flex min-h-[74px] flex-col items-end justify-center rounded-[14px] border border-border px-4 py-3 text-right transition-colors hover:border-foreground/25"
            >
              <span className="text-base font-medium text-foreground">
                {next.title}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                Next
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          ) : null}
        </nav>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-10 pb-4">
          <div className="flex items-center gap-6">
            {socials.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="size-5" />
                </a>
              )
            })}
          </div>
          <p className="text-sm text-muted-foreground">© DavinciUI</p>
        </footer>
      </div>
    </>
  )
}
