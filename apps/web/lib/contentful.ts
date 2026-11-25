import { CONTENTFUL_PREVIEW_MEDIA } from "@/lib/contentful-preview-media.generated";
import type { HomePreviewOverrides, HomePreviewTheme } from "@/lib/home-preview-media";

type ContentfulLink = {
  sys?: { type?: string; linkType?: string; id?: string };
};

type ContentfulAsset = {
  sys?: { id?: string };
  fields?: { file?: { url?: string } };
};

type ContentfulEntry = {
  fields?: {
    slug?: string;
    previewLight?: ContentfulLink;
    previewDark?: ContentfulLink;
  };
};

type ContentfulResponse = {
  items?: ContentfulEntry[];
  includes?: { Asset?: ContentfulAsset[] };
};

function assetUrl(link: ContentfulLink | undefined, assets: Map<string, ContentfulAsset>) {
  if (link?.sys?.type !== "Link" || link.sys.linkType !== "Asset" || !link.sys.id) {
    return undefined;
  }
  const url = assets.get(link.sys.id)?.fields?.file?.url;
  return typeof url === "string" && url.length > 0 ? url : undefined;
}

function mergePreviewMedia(
  base: HomePreviewOverrides,
  next: HomePreviewOverrides,
): HomePreviewOverrides {
  const merged: HomePreviewOverrides = { ...base };
  for (const [slug, themes] of Object.entries(next)) {
    merged[slug] = { ...merged[slug], ...themes };
  }
  return merged;
}

/**
 * Fetches published `component` entries from the Contentful Delivery API and
 * merges them over the generated published asset URLs. The generated map keeps
 * CMS-owned previews working when delivery credentials are unavailable.
 */
export async function getHomePreviewMedia(): Promise<HomePreviewOverrides> {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

  if (!space || !accessToken) return CONTENTFUL_PREVIEW_MEDIA;

  const params = new URLSearchParams({
    content_type: "component",
    include: "2",
    limit: "500",
  });
  const url = `https://cdn.contentful.com/spaces/${space}/environments/${environment}/entries?${params}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 300 },
    });
    if (!response.ok) return CONTENTFUL_PREVIEW_MEDIA;

    const body = (await response.json()) as ContentfulResponse;
    const assets = new Map(
      (body.includes?.Asset ?? [])
        .filter((asset) => Boolean(asset.sys?.id))
        .map((asset) => [asset.sys!.id!, asset]),
    );

    const overrides: HomePreviewOverrides = {};
    for (const item of body.items ?? []) {
      const slug = item.fields?.slug;
      if (!slug) continue;

      const themes: [HomePreviewTheme, string | undefined][] = [
        ["light", assetUrl(item.fields?.previewLight, assets)],
        ["dark", assetUrl(item.fields?.previewDark, assets)],
      ];
      for (const [theme, value] of themes) {
        if (value) overrides[slug] = { ...overrides[slug], [theme]: value };
      }
    }
    return mergePreviewMedia(CONTENTFUL_PREVIEW_MEDIA, overrides);
  } catch {
    return CONTENTFUL_PREVIEW_MEDIA;
  }
}
