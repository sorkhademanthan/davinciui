import { components } from "@/registry";

import { docsCategoryBySlug } from "./categories";
import { accessibility } from "./sections/accessibility";
import { composition } from "./sections/composition";
import { constraints } from "./sections/constraints";
import { customization } from "./sections/customization";
import { motion } from "./sections/motion";
import { related } from "./sections/related";
import type { DocsContent, DocsLink } from "./types";

const contentBySlug = new Map<string, DocsContent>();

function contentFor(slug: string): DocsContent {
  const existing = contentBySlug.get(slug);
  if (existing) return existing;
  const next: DocsContent = {};
  contentBySlug.set(slug, next);
  return next;
}

for (const [slug, body] of Object.entries(accessibility)) {
  contentFor(slug).accessibility = body;
}

for (const [slug, body] of Object.entries(motion)) {
  contentFor(slug).motion = body;
}

for (const [slug, data] of Object.entries(composition)) {
  if (data.composition) contentFor(slug).composition = data.composition;
}

for (const [slug, data] of Object.entries(customization)) {
  if (data.customization) contentFor(slug).customization = data.customization;
}

for (const [slug, data] of Object.entries(constraints)) {
  if (data.constraints) contentFor(slug).constraints = data.constraints;
}

for (const [slug, data] of Object.entries(related)) {
  if (data.related) contentFor(slug).related = data.related;
}

const ACRONYMS = new Set([
  "api",
  "cms",
  "faq",
  "gsap",
  "otp",
  "ui",
  "url",
  "webgl",
]);

function titleForSlug(slug: string) {
  return (
    components[slug]?.title ??
    slug
      .split("-")
      .map((part) =>
        ACRONYMS.has(part)
          ? part.toUpperCase()
          : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join(" ")
  );
}

export function getDocsContent(slug: string): DocsContent | undefined {
  return contentBySlug.get(slug);
}

export function getDocsCategory(slug: string): string | undefined {
  return docsCategoryBySlug[slug];
}

export function getRelatedComponents(slug: string, limit = 4): DocsLink[] {
  const category = docsCategoryBySlug[slug];
  if (!category) return [];

  return Object.entries(docsCategoryBySlug)
    .filter(([sibling, siblingCategory]) => {
      return siblingCategory === category && sibling !== slug;
    })
    .map(([sibling]) => sibling)
    .sort((a, b) => titleForSlug(a).localeCompare(titleForSlug(b)))
    .slice(0, limit)
    .map((sibling) => ({
      title: titleForSlug(sibling),
      href: `/docs/components/${sibling}`,
    }));
}

export type { DocsContent, DocsLink } from "./types";
