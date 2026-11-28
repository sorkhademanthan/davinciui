import type { Metadata } from "next";
import HomePageClient from "@/components/landing/home-page-client";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
