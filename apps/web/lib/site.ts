export const siteConfig = {
  name: "DavinciUI",
  url: "https://davinciui.com",
  title: "DavinciUI — Beautiful Animated UI Components for React",
  description:
    "Beautiful, animated React UI components with styling and motion already handled. Built with Tailwind CSS, TypeScript, and Framer Motion.",
  author: {
    name: "Manthan Sorkhade",
    twitter: "https://x.com/ManthanSorkhade",
    github: "https://github.com/sorkhademanthan",
    handle: "@ManthanSorkhade",
  },
  repository: "https://github.com/sorkhademanthan/davinciui",
} as const;

export function absoluteUrl(path = "") {
  if (!path) return siteConfig.url;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
