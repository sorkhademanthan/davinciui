import type { DocsContentMap } from "../types";

// Hand-picked related links for pages where same-category neighbours are not
// the most useful next step. Keep entries alphabetical.
export const related = {
  "text-morph": {
    related: [
      { title: "Text Reveal", href: "/docs/components/text-reveal" },
      { title: "Typography", href: "/docs/foundations/typography" },
      { title: "Motion", href: "/docs/foundations/motion" },
    ],
  },
} satisfies DocsContentMap;
