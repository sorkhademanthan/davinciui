import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getComponent } from "@/registry";
import { absoluteUrl } from "@/lib/site";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ComponentDetailShell } from "@/components/component-detail-shell";
import { ExperienceSidebarNav } from "@/components/experience-sidebar-nav";
import { NavDrawer } from "@/components/nav-drawer";
import { isHiddenComponentSlug } from "@/lib/hidden-components";

export function experienceMetadata(slug: string): Metadata {
    if (isHiddenComponentSlug(slug)) {
        return { title: "Components — DavinciUI" };
    }

    const component = getComponent(slug);
    if (!component) {
        return { title: `${slug} — DavinciUI`, description: `${slug} component` };
    }

    return {
        title: `${component.title} — Experience`,
        description: component.description,
        alternates: { canonical: absoluteUrl(`/experience/components/${slug}`) },
    };
}

interface ExperienceComponentPageProps {
    slug: string;
    DocsComponent: () => ReactNode | Promise<ReactNode>;
}

export async function ExperienceComponentPage({ slug, DocsComponent }: ExperienceComponentPageProps) {
    if (isHiddenComponentSlug(slug)) {
        redirect("/experience/components");
    }

    const content = await DocsComponent();

    return (
        <ComponentDetailShell
            nav={<ExperienceSidebarNav />}
            drawer={
                <NavDrawer label="Components">
                    <ExperienceSidebarNav />
                </NavDrawer>
            }
            homeHref="/experience/components"
            homeLabel="Components"
            hideMobileRow
        >
            {content}
        </ComponentDetailShell>
    );
}

export function ExperienceFallbackPage({ slug }: { slug: string }) {
    if (isHiddenComponentSlug(slug)) {
        redirect("/experience/components");
    }

    const component = getComponent(slug);
    if (!component) {
        notFound();
    }

    const crumbs = [
        { label: "Home", href: "/" },
        { label: "Components", href: "/experience/components" },
        { label: component.title },
    ];

    return (
        <ComponentDetailShell
            nav={<ExperienceSidebarNav />}
            drawer={
                <NavDrawer label="Components">
                    <ExperienceSidebarNav />
                </NavDrawer>
            }
            homeHref="/experience/components"
            homeLabel="Components"
            hideMobileRow
        >
            <div className="w-full max-w-none min-w-0 px-6 py-6">
                <Breadcrumbs className="mb-4" items={crumbs} />
                <h1 className="text-2xl font-semibold">{component.title}</h1>
                <p className="text-sm text-muted-foreground">{component.description}</p>
            </div>
        </ComponentDetailShell>
    );
}
