"use client";

import { SiteHeader } from "@/components/site-header";
import { HomeHero } from "@/components/landing/home-hero";
import { LandingGutter } from "@/components/landing/landing-frame";
import { Testimonials } from "@/components/landing/testimonials";
import { CustomWorkCta } from "@/components/landing/custom-work-cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div
      data-route-home
      className="relative min-h-screen w-full overflow-x-hidden text-foreground selection:bg-zinc-200 dark:selection:bg-zinc-800"
    >
      <SiteHeader landingGutter />
      <main className="relative min-w-0">
        <HomeHero />
        <LandingGutter>
          <Testimonials />
          <CustomWorkCta />
        </LandingGutter>
      </main>
      <Footer />
    </div>
  );
}
