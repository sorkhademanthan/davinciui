import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service — DavinciUI",
  description:
    "The terms governing your use of DavinciUI's website and open-source MIT-licensed components.",
  alternates: {
    canonical: absoluteUrl("/terms-of-service"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
