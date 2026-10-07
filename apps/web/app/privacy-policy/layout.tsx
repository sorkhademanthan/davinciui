import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — DavinciUI",
  description:
    "How DavinciUI collects, uses, and safeguards your information, including PostHog analytics and locally stored design systems.",
  alternates: {
    canonical: absoluteUrl("/privacy-policy"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
