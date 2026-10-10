import type React from "react";
import type { Metadata, Viewport } from "next";
import {
  Geist,
  JetBrains_Mono,
  Instrument_Serif,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { SkipToContent } from "@/components/skip-to-content";
import { CookieConsent } from "@/components/cookie-consent";
import { JsonLd } from "@/components/seo/json-ld";
import { RouteScrollbarController } from "@/components/route-scrollbar-controller";
import { siteConfig } from "@/lib/site";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});



export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1A61EC" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | DavinciUI - Design System",
  },
  description: siteConfig.description,
  keywords: [
    "DavinciUI",
    "DavinciUI",
    "davinciui.com",
    "UI component library",
    "React components",
    "React UI library",
    "UI components",
    "component library",
    "Tailwind CSS components",
    "TypeScript components",
    "Framer Motion",
    "Next.js components",
    "animated components",
    "copy paste components",
    "free UI components",
    "open source components",
    "modern UI",
    "web components",
    "frontend components",
    "design system",
    "React developer",
    "frontend developer",
    "shadcn alternative",
    "radix ui",
    "beautiful UI",
    "premium components",
    "handcrafted components",
  ],
  authors: [
    { name: siteConfig.author.name, url: siteConfig.author.twitter },
    { name: siteConfig.author.name, url: siteConfig.author.github },
  ],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Note: no sitewide canonical here — every indexable route sets its own
  // self-referencing canonical, otherwise all pages would canonical to "/".
  // Note: no explicit OG/Twitter images here either — file-convention
  // opengraph-image.tsx routes supply per-section cards, and explicit
  // metadata images would suppress them sitewide.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "DavinciUI - Premium React UI Component Library",
    description: siteConfig.description,
    creator: siteConfig.author.handle,
    site: siteConfig.author.handle,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/logo/logo-dark-64.png",
    shortcut: "/images/logo/logo-dark-64.png",
    apple: "/images/logo/logo-dark-180.png",
  },
  manifest: "/manifest.json",
  category: "technology",
  classification: "Design System",
  other: {
    "msapplication-TileImage": "/opengraph-image.png",
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
      "google-site-verification":
        process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    // NOTE: no hardcoded style on <html> — a blocking script in <head>
    // resolves the theme (stored pref → system → default dark) and sets the
    // class + colorScheme before first paint, so neither dark nor light
    // users see a cold-start flash. `suppressHydrationWarning` is required
    // because that pre-hydration class mutation is intentional.
    <html lang="en" suppressHydrationWarning>
      <Analytics />
      <head>
        <script
          // Blocking (no async/defer): must run before CSS paint.
          // Mirrors the NextThemesProvider config in providers.tsx:
          // storageKey "theme", defaultTheme "dark", enableSystem.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var s=null;try{s=localStorage.getItem("theme")}catch(e){}var r=s||"dark";if(r==="system"){try{r=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){r="dark"}}var t=r==="light"?"light":"dark";d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t;}catch(e){}}})();`,
          }}
        />
        <JsonLd />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} relative font-sans antialiased`}
        style={
          { "--font-heading": "var(--font-sans)" } as React.CSSProperties
        }
      >
        <div className="isolate relative flex min-h-svh flex-col">
          <SkipToContent />
          <RouteScrollbarController />
          <Providers>{children}</Providers>
        </div>
        <SpeedInsights />
        <CookieConsent />
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="26f17963-74a5-48ce-8d5c-6cebb2ca2baa"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
