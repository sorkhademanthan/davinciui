import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getComponent } from "@/registry";
import { galleryHrefForSlug } from "@/lib/component-groups";
import { isHiddenComponentSlug } from "@/lib/hidden-components";
import { docsMetadata } from "@/components/docs-component-page";

// Documented components are emitted as static per-slug routes by
// scripts/generate-component-routes.mjs. This dynamic route is only the
// fallback for registry components without a docs page (and hidden slugs).
interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { slug } = await props.params;
    return docsMetadata(slug);
}

export default async function ComponentPage(props: PageProps) {
    const { slug } = await props.params;

    if (isHiddenComponentSlug(slug)) {
        redirect("/docs/components");
    }

    const component = getComponent(slug);
    if (!component) {
        return notFound();
    }

    // No dedicated docs page: send users to the live gallery view for this
    // component instead of shipping an empty "coming soon" stub as docs.
    redirect(galleryHrefForSlug(component.slug, component.category));
}
