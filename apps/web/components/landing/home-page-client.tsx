"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/site-header";
import { HeroButtons } from "@/components/landing/hero-buttons";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import { HeroAtmosphere } from "@/components/landing/hero-atmosphere";
import {
  LandingContent,
  LandingGutter,
} from "@/components/landing/landing-frame";
import { CustomWorkCta } from "@/components/landing/custom-work-cta";
import { FaqSection } from "@/components/landing/faq-section";
import { ComponentWorkbench } from "@/components/landing/component-workbench";
import { DesignSystemWorkbench } from "@/components/landing/design-system-workbench";
import { Footer } from "@/components/footer";

import { VideoPreviewMedia } from "@/components/landing/video-preview-media";

// DavinciUI Previews for Bento — code-split so the hero payload does not
// include every animation runtime; cards mount only when scrolled near.
const CinematicCardCarouselCardPreview = dynamic(
  () =>
    import(
      "@/components/docs/previews/cinematic-card-carousel-card-preview"
    ).then((m) => m.CinematicCardCarouselCardPreview),
  { ssr: false },
);
const HoverCardsCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/hover-cards-card-preview").then(
      (m) => m.HoverCardsCardPreview,
    ),
  { ssr: false },
);
const SunlightEffectCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/sunlight-effect-card-preview").then(
      (m) => m.SunlightEffectCardPreview,
    ),
  { ssr: false },
);
const GeometricTrailCursorCardPreview = dynamic(
  () =>
    import(
      "@/components/docs/previews/geometric-trail-cursor-card-preview"
    ).then((m) => m.GeometricTrailCursorCardPreview),
  { ssr: false },
);
const NeonMeshBGCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/neon-mesh-bg-card-preview").then(
      (m) => m.NeonMeshBGCardPreview,
    ),
  { ssr: false },
);
const TextVideoMaskPlayground = dynamic(
  () =>
    import("@/components/docs/previews/text-video-mask-preview").then(
      (m) => m.TextVideoMaskPlayground,
    ),
  { ssr: false },
);
const GSAPTextCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/gsap-text-card-preview").then(
      (m) => m.GSAPTextCardPreview,
    ),
  { ssr: false },
);
const ScrollRevealImageAutoCardPreview = dynamic(
  () =>
    import(
      "@/components/docs/previews/scroll-reveal-image-auto-card-preview"
    ).then((m) => m.ScrollRevealImageAutoCardPreview),
  { ssr: false },
);
const CurvedInlineTypeCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/curved-inline-type-card-preview").then(
      (m) => m.CurvedInlineTypeCardPreview,
    ),
  { ssr: false },
);
const LensDriftGridCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/lens-drift-grid-card-preview").then(
      (m) => m.LensDriftGridCardPreview,
    ),
  { ssr: false },
);

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
  slug,
  className,
  previewHeightClass,
  children,
}: {
  href: string;
  title: string;
  blurb: string;
  tag: string;
  slug: string;
  className?: string;
  previewHeightClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.055),0_10px_30px_-18px_rgba(0,0,0,0.35)] transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_24px_60px_-24px_rgba(0,0,0,0.5)] dark:bg-[#161616] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_24px_70px_-24px_rgba(0,0,0,0.8)] ${className ?? ""}`}
    >
      <VideoPreviewMedia
        slug={slug}
        title={title}
        tag={tag}
        heightClass={previewHeightClass}
      >
        {children}
      </VideoPreviewMedia>
      <Link
        href={href}
        prefetch={false}
        className="flex items-start justify-between gap-3 rounded-[12px] px-2.5 pb-2 pt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:focus-visible:ring-zinc-400"
      >
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
      </Link>
    </div>
  );
}

export default function Home() {
  const reduceMotion = useHydratedReducedMotion();
  return (
    <div
      data-route-home
      className="relative min-h-screen w-full overflow-x-hidden text-foreground selection:bg-zinc-200 dark:selection:bg-zinc-800"
    >
      <HeroAtmosphere />
      <SiteHeader landingGutter />
      <main id="main-content" className="relative z-10 flex min-h-screen min-w-0 flex-col justify-start overflow-x-clip pt-36 pb-32 sm:pt-44 lg:pt-48">
        <LandingGutter>
          <LandingContent className="pb-0">
            <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.1,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <a
                  href="https://github.com/sorkhademanthan/davinciui"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-zinc-950/[0.08] bg-white/60 py-1 pl-3 pr-2.5 text-[11px] font-medium text-zinc-600 backdrop-blur transition-colors hover:border-zinc-950/[0.16] hover:text-zinc-950 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:border-white/[0.16] dark:hover:text-white sm:text-xs"
                >
                  <span className="relative flex size-1.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Open source · Free forever
                  <ArrowIcon className="size-3.5 transition-transform duration-300 group-hover:rotate-45" />
                </a>
              </motion.div>

              <motion.h1
                initial={
                  reduceMotion ? false : { opacity: 0, y: 30, filter: "blur(8px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="mt-6 max-w-3xl text-balance text-[clamp(1.85rem,9vw,3rem)] font-medium leading-[0.98] tracking-[-0.035em] text-zinc-950 dark:text-white sm:text-5xl md:text-6xl"
              >
                <span>Beautiful Animated UI</span>
                <br className="hidden sm:block" />
                <span>Components for React</span>
              </motion.h1>

              <motion.p
                initial={
                  reduceMotion ? false : { opacity: 0, y: 20, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.6,
                  delay: 0.35,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="mt-5 max-w-2xl text-[clamp(0.9rem,4vw,1rem)] font-normal leading-6 text-zinc-500 dark:text-zinc-400 sm:text-lg sm:leading-7"
              >
                <span className="block sm:hidden">
                  Polished interactions for React projects with styling and animations handled.
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
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
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
                  slug="cinematic-card-carousel"
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
                  href="/experience/components/gsap-text"
                  slug="gsap-text"
                  title="GSAP Text"
                  blurb="Layered 3D kinetic typography in motion"
                  tag="Typography"
                  previewHeightClass="h-[320px] sm:h-[380px]"
                >
                  <div className="absolute inset-0">
                    <GSAPTextCardPreview fontSize={40} />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-3">
                <FeatureCard
                  href="/experience/components/neon-mesh-bg"
                  slug="neon-mesh-bg"
                  title="Neon Mesh BG"
                  blurb="Evolving purple neon mesh backdrop"
                  tag="Background"
                  previewHeightClass="h-[320px] sm:h-[380px]"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <NeonMeshBGCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="sm:col-span-2 lg:col-span-8">
                <FeatureCard
                  href="/experience/components/hover-cards"
                  slug="hover-cards"
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
                  href="/experience/components/text-video-mask"
                  slug="text-video-mask"
                  title="Text video mask"
                  blurb="Video clipped inside bold type"
                  tag="Typography"
                  previewHeightClass="h-[280px] sm:h-[340px]"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <TextVideoMaskPlayground />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-4">
                <FeatureCard
                  href="/experience/components/sunlight-effect"
                  slug="sunlight-effect"
                  title="Sunlight effect"
                  blurb="Light sweep across the surface"
                  tag="Effect"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <SunlightEffectCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-4">
                <FeatureCard
                  href="/experience/components/curved-inline-type"
                  slug="curved-inline-type"
                  title="Curved Inline Type"
                  blurb="Headlines ride an invisible vertical drum"
                  tag="Typography"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <CurvedInlineTypeCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-4">
                <FeatureCard
                  href="/experience/components/scroll-reveal-image"
                  slug="scroll-reveal-image"
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
                  href="/experience/components/lens-drift-grid"
                  slug="lens-drift-grid"
                  title="Lens drift grid"
                  blurb="Fisheye image wall with drag and auto-drift"
                  tag="Gallery"
                  previewHeightClass="h-[260px] sm:h-[300px]"
                >
                  <div className="absolute inset-0">
                    <LensDriftGridCardPreview />
                  </div>
                </FeatureCard>
              </motion.div>

              <motion.div variants={cardVariants} className="lg:col-span-4">
                <FeatureCard
                  href="/experience/components/geometric-trail-cursor"
                  slug="geometric-trail-cursor"
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
          <DesignSystemWorkbench />
        </LandingGutter>
      </main>

      {/* Testimonials hidden pre-launch — content/testimonials.json is still
          AI-generated sample data. Re-enable <Testimonials /> here once we
          have 3–4 real quotes with sourceUrl. */}
      <LandingGutter>
        <FaqSection />
      </LandingGutter>
      <LandingGutter>
        <CustomWorkCta />
      </LandingGutter>
      <Footer />
    </div>
  );
}
