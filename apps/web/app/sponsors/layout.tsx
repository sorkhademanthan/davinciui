import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sponsor DavinciUI",
  description:
    "Back DavinciUI and keep 140+ free React components independent. Sponsor tiers with logo placement and product visibility.",
  alternates: {
    canonical: absoluteUrl("/sponsors"),
  },
  openGraph: {
    title: "Sponsor DavinciUI",
    description:
      "Support free, open-source React components and get your product in front of builders.",
  },
};

export default function SponsorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
