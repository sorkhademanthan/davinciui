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

// Loading skeleton for docs page
function DocsPageSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row w-full h-full min-h-screen lg:h-screen bg-white dark:bg-background overflow-hidden">
            {/* Left Column: Scrollable Content Skeleton */}
            <div className="w-full lg:basis-1/2 lg:max-w-1/2 h-full flex flex-col relative z-20 bg-white dark:bg-background">
                {/* Gradients */}
                <div className="absolute top-0 left-0 right-0 z-30 h-32 bg-gradient-to-b from-white via-white/95 to-transparent dark:from-background dark:via-background/95 pointer-events-none backdrop-blur-[1px]" />

                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="px-8 lg:px-16 pt-32 lg:pt-48 pb-40 space-y-20 max-w-3xl mx-auto w-full animate-pulse">

                        {/* Header Section */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="h-12 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                                <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800/50 rounded-lg" />
                                <div className="h-6 w-2/3 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg" />
                            </div>
                        </div>

                        {/* Installation Section */}
                        <div className="space-y-6">
                            <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                            <div className="h-16 w-full bg-zinc-200 dark:bg-zinc-800/30 rounded-xl" />
                        </div>

                        {/* Usage Section */}
                        <div className="space-y-6">
                            <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                            <div className="h-48 w-full bg-zinc-200 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-800" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Sticky Preview Skeleton */}
            <div className="flex-1 lg:basis-1/2 lg:max-w-1/2 lg:h-full lg:sticky lg:top-0 order-first lg:order-last bg-white dark:bg-[#121212] flex flex-col z-10">
                <div className="relative w-full h-[400px] lg:h-full p-4 lg:pt-3 lg:pb-3 lg:pr-3 lg:pl-1.5 overflow-hidden bg-white dark:bg-[#121212]">
                    <div className="w-full h-full bg-[#f7f7f7] dark:bg-zinc-800/20 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-pulse" />
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
