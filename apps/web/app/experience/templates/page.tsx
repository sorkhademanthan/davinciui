import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Templates — Experience",
  description:
    "Full-page starters are on the way — SaaS, portfolio, docs, blog and dashboard templates. Coming soon to DavinciUI.",
};

const TEASERS = [
  {
    title: "SaaS starter",
    description:
      "Marketing site plus app shell — pricing, auth and dashboard.",
  },
  {
    title: "Portfolio",
    description:
      "Case-study layouts with motion-led project showcases.",
  },
  {
    title: "Documentation",
    description:
      "Searchable docs with navigation, code blocks and theming.",
  },
  {
    title: "Blog",
    description:
      "Editorial reading experience with tags and RSS built in.",
  },
  {
    title: "Dashboard",
    description:
      "Analytics starter with sidebar, charts and data tables.",
  },
  {
    title: "Waitlist",
    description:
      "Launch pages that collect emails before day one.",
  },
];

export default function TemplatesPage() {
  return (
    <div className="w-full max-w-[1280px] px-6 lg:px-8 py-6">
      <Breadcrumbs className="mb-4" />
      <ComingSoon
        badge="Coming soon"
        title="Templates are on the way."
        description="We're assembling full-page starters you can clone and ship — wired with our components, blocks and design tokens. The first batch lands here."
        teasers={TEASERS}
      />
    </div>
  );
}
