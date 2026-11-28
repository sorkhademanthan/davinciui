import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getComponent } from "@/registry";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { isHiddenComponentSlug } from "@/lib/hidden-components";

export function docsMetadata(slug: string): Metadata {
    if (isHiddenComponentSlug(slug)) {
        return { title: "Components — DavinciUI" };
    }

    const component = getComponent(slug);
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
            card: "summary_large_image",
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

interface DocsComponentPageProps {
    slug: string;
    DocsComponent: () => ReactNode | Promise<ReactNode>;
}

export async function DocsComponentPage({ slug, DocsComponent }: DocsComponentPageProps) {
    if (isHiddenComponentSlug(slug)) {
        redirect("/docs/components");
    }

    const component = getComponent(slug);
    const content = await DocsComponent();

    if (!component) {
        return <>{content}</>;
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
            {content}
        </>
    );
}
