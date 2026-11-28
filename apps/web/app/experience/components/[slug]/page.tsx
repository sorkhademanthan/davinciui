import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getComponent } from "@/registry";
import { isHiddenComponentSlug } from "@/lib/hidden-components";
import { ExperienceFallbackPage, experienceMetadata } from "@/components/experience-component-page";

// Documented components are emitted as static per-slug routes by
// scripts/generate-component-routes.mjs. This dynamic route is only the
// fallback for registry components without a docs page (and hidden slugs).
const SLUG_ALIASES: Record<string, string> = {
    dropdown: "dropdown-menu",
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug: raw } = await params;
    const slug = SLUG_ALIASES[raw] ?? raw;

    if (isHiddenComponentSlug(slug)) {
        return { title: "Components — DavinciUI" };
    }
    if (!getComponent(slug)) {
        return {};
    }

    return experienceMetadata(slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const alias = SLUG_ALIASES[slug];
    if (alias) {
        redirect(`/experience/components/${alias}`);
    }

    if (isHiddenComponentSlug(slug)) {
        redirect("/experience/components");
    }

    const component = getComponent(slug);
    if (!component) {
        return notFound();
    }

    return <ExperienceFallbackPage slug={slug} />;
}
