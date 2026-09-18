import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Blocks — Experience",
  description:
    "Production-ready page sections are on the way — heroes, pricing, testimonials and more. Coming soon to DavinciUI.",
};

const TEASERS = [
  {
    title: "Hero sections",
    description:
      "Above-the-fold openers with headlines, CTAs and product visuals.",
  },
  {
    title: "Pricing tables",
    description:
      "Tiered plans with feature comparisons and billing toggles.",
  },
  {
    title: "Testimonials",
    description:
      "Customer proof walls, quotes and logo marquees.",
  },
  {
    title: "Feature grids",
    description:
      "Bento layouts and capability showcases that scan fast.",
  },
  {
    title: "CTA + footers",
    description:
      "Closing bands and site footers that convert and orient.",
  },
  {
    title: "Auth forms",
    description:
      "Sign-in, sign-up and onboarding flows with validation.",
  },
];

export default function BlocksPage() {
  return (
    <div className="w-full max-w-[1280px] px-6 lg:px-8 py-6">
      <Breadcrumbs className="mb-4" />
      <ComingSoon
        badge="Coming soon"
        title="Blocks are on the way."
        description="We're crafting a library of production-ready page sections — composed from the same primitives as our components, themed for light and dark out of the box. The first batch lands here."
        teasers={TEASERS}
      />
    </div>
  );
}
