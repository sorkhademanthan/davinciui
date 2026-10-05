import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getComponent } from "@/registry";
import { getDocsImporter, getDocsSlugs } from "@/components/docs/lazy-registry";
import { galleryHrefForSlug } from "@/lib/component-groups";
import { absoluteUrl, siteConfig } from "@/lib/site";

// -----------------------------------------------------------------------------
// PERFORMANCE OPTIMIZATIONS:
// 1. generateStaticParams - Pre-builds ALL component pages at build time
// 2. Lazy imports - Only loads the specific component being viewed
// 3. Suspense - Allows streaming for heavy content
// -----------------------------------------------------------------------------

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export const dynamicParams = true;

/**
 * Pre-generate all component pages at build time.
 * This is THE most important optimization - pages are served as static HTML.
 */
export async function generateStaticParams() {
    const slugs = getDocsSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const component = getComponent(params.slug);

    if (!component) {
        return {};
    }

    const componentUrl = absoluteUrl(`/docs/components/${component.slug}`);
    const ogImageUrl = absoluteUrl(`/docs/components/${component.slug}/opengraph-image`);

    return {
        title: `${component.title} React Component`,
        description: component.description,
        keywords: [
            component.title,
            `${component.title} component`,
            `${component.title} React component`,
            `${component.title} Tailwind component`,
            component.category,
            "DavinciUI",
            "React UI component",
            "animated UI component",
            "copy paste component",
        ],
        alternates: {
            canonical: componentUrl,
        },
        openGraph: {
            title: `${component.title} React Component | DavinciUI`,
            description: component.description,
            url: componentUrl,
            type: "article",
            siteName: siteConfig.name,
            images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${component.title} Component` }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${component.title} React Component | DavinciUI`,
            description: component.description,
            images: [ogImageUrl],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
    };
}

// Loading skeleton for docs page — shadcn single-column rhythm
function DocsPageSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
            <div className="max-w-3xl animate-pulse space-y-8">
                <div className="space-y-3">
                    <div className="h-9 w-2/3 rounded-md bg-muted" />
                    <div className="h-4 w-full rounded bg-muted/70" />
                    <div className="h-4 w-3/5 rounded bg-muted/70" />
                </div>
                <div className="h-[420px] w-full rounded-lg border border-border bg-muted/40" />
                <div className="space-y-3">
                    <div className="h-5 w-32 rounded bg-muted" />
                    <div className="h-12 w-full rounded-lg border border-border bg-muted/40" />
                </div>
                <div className="space-y-3">
                    <div className="h-5 w-24 rounded bg-muted" />
                    <div className="h-48 w-full rounded-lg border border-border bg-muted/40" />
                </div>
            </div>
        </div>
    );
}

// Async component that loads the docs component
async function DocsContent({ slug }: { slug: string }) {
    const importer = getDocsImporter(slug);

    if (!importer) {
        return null;
    }

    // Dynamically import the component
    const docModule = await importer();
    const DocsComponent = "default" in docModule ? docModule.default : null;

    if (!DocsComponent) {
        return null;
    }

    return <DocsComponent />;
}

export default async function ComponentPage(props: PageProps) {
    const params = await props.params;
    const component = getComponent(params.slug);
    const importer = getDocsImporter(params.slug);

    if (!component && !importer) {
        return notFound();
    }

    // If we have a dedicated docs component, render it with Suspense
    if (importer) {
        const isFallback = !component;
        if (isFallback) {
            return (
                <Suspense fallback={<DocsPageSkeleton />}>
                    <DocsContent slug={params.slug} />
                </Suspense>
            );
        }
        const componentUrl = absoluteUrl(`/docs/components/${component.slug}`);
        const componentJsonLd = {
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            name: `${component.title} React Component`,
            description: component.description,
            url: componentUrl,
            codeRepository: siteConfig.repository,
            programmingLanguage: ["TypeScript", "React", "CSS"],
            runtimePlatform: "React",
            applicationCategory: "DeveloperApplication",
            isPartOf: {
                "@type": "SoftwareSourceCode",
                name: siteConfig.name,
                url: siteConfig.url,
            },
            author: {
                "@type": "Person",
                name: siteConfig.author.name,
                url: siteConfig.author.twitter,
            },
            license: "https://opensource.org/licenses/MIT",
            keywords: [
                component.title,
                component.category,
                "React component",
                "Tailwind CSS",
                "Framer Motion",
                "DavinciUI",
            ].join(", "),
        };

        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(componentJsonLd) }}
                />
                <Suspense fallback={<DocsPageSkeleton />}>
                    <DocsContent slug={params.slug} />
                </Suspense>
            </>
        );
    }

    // No dedicated docs page: send users to the live gallery view for this
    // component instead of shipping an empty "coming soon" stub as docs.
    redirect(galleryHrefForSlug(component!.slug, component!.category));
}
