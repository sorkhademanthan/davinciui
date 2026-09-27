"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { HeroButtons } from "@/components/landing/hero-buttons";
import { HeroAtmosphere } from "@/components/landing/hero-atmosphere";
import {
  LandingContent,
  LandingGutter,
} from "@/components/landing/landing-frame";
import { Testimonials } from "@/components/landing/testimonials";
import { CustomWorkCta } from "@/components/landing/custom-work-cta";
import { ComponentWorkbench } from "@/components/landing/component-workbench";
import { Footer } from "@/components/footer";

// DavinciUI Previews for Bento
import { CinematicCardCarouselCardPreview } from "@/components/docs/previews/cinematic-card-carousel-card-preview";
import { HoverCardsCardPreview } from "@/components/docs/previews/hover-cards-card-preview";
import { SunlightEffectCardPreview } from "@/components/docs/previews/sunlight-effect-card-preview";
import { GeometricTrailCursorCardPreview } from "@/components/docs/previews/geometric-trail-cursor-card-preview";
import { PixelFlowCardPreview } from "@/components/docs/previews/pixel-flow-card-preview";
import { TextVideoMaskPlayground } from "@/components/docs/previews/text-video-mask-preview";
import { PixelWipeCarouselCardPreview } from "@/components/docs/previews/pixel-wipe-carousel-card-preview";
import { ScrollRevealImageAutoCardPreview } from "@/components/docs/previews/scroll-reveal-image-auto-card-preview";
import { GSAPTextCardPreview } from "@/components/docs/previews/gsap-text-card-preview";
import { ScrollSyncGalleryCardPreview } from "@/components/docs/previews/scroll-sync-gallery-card-preview";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
  },
};

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "size-4"}
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function FeatureCard({
  href,
  title,
  blurb,
  tag,
  className,
  previewHeightClass,
  children,
}: {
  href: string;
  title: string;
  blurb: string;
  tag: string;
  className?: string;
  previewHeightClass?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.055),0_10px_30px_-18px_rgba(0,0,0,0.35)] transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_24px_60px_-24px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:bg-[#161616] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_24px_70px_-24px_rgba(0,0,0,0.8)] ${className ?? ""}`}
    >
      <div
        className={`relative w-full overflow-hidden rounded-[14px] bg-zinc-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.045)] dark:bg-background dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)] ${previewHeightClass ?? "h-[240px] sm:h-[260px]"}`}
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]">
          {children}
        </div>
        <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full border border-black/[0.06] bg-white/85 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-zinc-700 backdrop-blur-md dark:border-white/[0.1] dark:bg-black/55 dark:text-zinc-200">
          {tag}
        </span>
        <span className="pointer-events-none absolute inset-0 z-10 rounded-[14px] ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]" />
      </div>
      <div className="flex items-start justify-between gap-3 px-2.5 pb-2 pt-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-[15px]">
            {title}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">
            {blurb}
          </p>
        </div>
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-black/[0.06] text-zinc-500 transition-all duration-300 group-hover:border-black/[0.12] group-hover:bg-zinc-900 group-hover:text-white dark:border-white/[0.1] dark:text-zinc-400 dark:group-hover:bg-white dark:group-hover:text-zinc-900">
          <ArrowIcon className="size-4 transition-transform duration-300 group-hover:rotate-45" />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div
      data-route-home
      className="relative min-h-screen w-full overflow-x-hidden text-foreground selection:bg-zinc-200 dark:selection:bg-zinc-800"
    >
      <HeroAtmosphere />
      <SiteHeader landingGutter />
      <main className="relative z-10 flex min-h-screen min-w-0 flex-col justify-start overflow-x-clip pt-36 pb-32 sm:pt-44 lg:pt-48">
        <LandingGutter>
          <LandingContent className="pb-0">
            <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.1,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <a
                  href="https://vercel.com/open-source-program"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-950/[0.08] px-3 py-1 text-[11px] font-medium text-zinc-600 dark:border-white/[0.08] dark:text-zinc-400 sm:text-xs"
                >
                  Backed by
                  <svg
                    viewBox="0 0 76 65"
                    className="size-4"
                    fill="currentColor"
                  >
                    <path d="M37.59.25l36.95 64H.64z" />
                  </svg>
                  <span className="font-semibold tracking-tight">
                    Vercel OSS
                  </span>
                  Program
                </a>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="mt-6 max-w-3xl text-[clamp(1.85rem,9vw,3rem)] font-medium leading-[0.98] tracking-[-0.035em] text-zinc-950 dark:text-white sm:text-5xl md:text-6xl"
              >
                <span className="whitespace-nowrap">Beautiful Animated UI</span>
                <br />
                <span className="whitespace-nowrap">Components for React</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.6,
                  delay: 0.35,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="mt-5 max-w-2xl text-[clamp(0.9rem,4vw,1rem)] font-normal leading-6 text-zinc-500 dark:text-zinc-400 sm:text-lg sm:leading-7"
              >
                <span className="block whitespace-nowrap sm:hidden">
                  Polished interactions for React projects
                </span>
                <span className="block whitespace-nowrap sm:hidden">
                  with styling and animations handled.
                </span>
                <span className="hidden sm:inline">
                  Effortlessly add polished, production-ready interactions to
                  your projects,
                </span>
                <span className="hidden sm:block">
                  with the styling and animations already handled.
                </span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.5,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="mt-2 flex w-full justify-center"
              >
                <HeroButtons />
              </motion.div>
            </section>
          </LandingContent>

          <LandingContent>
            {/* Single unified grid — first row kept, rest follows same system */}
            <motion.div
              data-home-showcase
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              className="mb-20 mt-10 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:mt-12 lg:grid-cols-12"
            >
              <motion.div
                variants={cardVariants}
                className="sm:col-span-2 lg:col-span-6"
              >
                <FeatureCard
                  href="/experience/components/cinematic-card-carousel"
                  title="Cinematic card carousel"
                  blurb="Depth carousel with a film-like focus pull"
                  tag="Featured"
                  previewHeightClass="h-[320px] sm:h-[380px]"
                >
                  <div className="pointer-events-none absolute inset-0 scale-[1.6]">
                    <CinematicCardCarouselCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="lg:col-span-3"
              >
                <FeatureCard
                  href="/experience/components/pixel-wipe-carousel"
                  title="Pixel wipe carousel"
                  blurb="Pixel-dissolve slide transition"
                  tag="Carousel"
                  previewHeightClass="h-[320px] sm:h-[380px]"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <PixelWipeCarouselCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-3">
                <FeatureCard
                  href="/experience/components/sunlight-effect"
                  title="Sunlight effect"
                  blurb="Light sweep across the surface"
                  tag="Effect"
                  previewHeightClass="h-[320px] sm:h-[380px]"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <SunlightEffectCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="sm:col-span-2 lg:col-span-8">
                <FeatureCard
                  href="/experience/components/hover-cards"
                  title="Hover cards"
                  blurb="Spotlight cards that react to your cursor"
                  tag="Interactive"
                  previewHeightClass="h-[280px] sm:h-[340px]"
                >
                  <div className="absolute inset-0">
                    <HoverCardsCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-4">
                <FeatureCard
                  href="/experience/components/pixel-flow"
                  title="Pixel flow"
                  blurb="Generative particle typography"
                  tag="Generative"
                  previewHeightClass="h-[280px] sm:h-[340px]"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <PixelFlowCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-4">
                <FeatureCard
                  href="/experience/components/gsap-text"
                  title="Type Cascade"
                  blurb="Layered 3D kinetic typography in motion"
                  tag="Typography"
                >
                  <div className="absolute inset-0">
                    <GSAPTextCardPreview fontSize={40} />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-4">
                <FeatureCard
                  href="/experience/components/text-video-mask"
                  title="Text video mask"
                  blurb="Video clipped inside bold type"
                  tag="Typography"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <TextVideoMaskPlayground />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-4">
                <FeatureCard
                  href="/experience/components/scroll-reveal-image"
                  title="Scroll reveal image"
                  blurb="Image unfolds as you scroll"
                  tag="Scroll"
                >
                  <div className="absolute inset-0">
                    <ScrollRevealImageAutoCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="sm:col-span-2 lg:col-span-8">
                <FeatureCard
                  href="/experience/components/scroll-sync-gallery"
                  title="Scroll sync gallery"
                  blurb="Pinned image wall with synced column drift"
                  tag="Gallery"
                  previewHeightClass="h-[260px] sm:h-[300px]"
                >
                  <div className="absolute inset-0">
                    <ScrollSyncGalleryCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-4">
                <FeatureCard
                  href="/experience/components/geometric-trail-cursor"
                  title="Geometric trail cursor"
                  blurb="Cursor that paints as you move"
                  tag="Cursor"
                  previewHeightClass="h-[260px] sm:h-[300px]"
                >
                  <div className="absolute inset-0">
                    <GeometricTrailCursorCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>
            </motion.div>
          </LandingContent>
          <ComponentWorkbench />
        </LandingGutter>
      </main>

      <Testimonials />
      <LandingGutter>
        <CustomWorkCta />
      </LandingGutter>
      <Footer />
    </div>
  );
}
