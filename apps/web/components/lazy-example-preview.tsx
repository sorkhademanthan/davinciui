"use client";

import * as React from "react";
import { useInViewport } from "@/hooks/use-in-viewport";
import { DocsPreviewWrapper } from "@/components/docs-preview-wrapper";

/**
 * Below-fold example sections mount their preview only while near the
 * viewport — the same example already exists as a tab in the main preview,
 * so keeping every section mounted multiplies canvases, animation loops, and
 * toolbars for no benefit. Headings/anchors/SEO markup always render; only
 * the heavy preview subtree is deferred. Placeholder preserves layout so
 * scroll position never jumps.
 */
export function LazyExamplePreview({
  unstyledPreview,
  children,
}: {
  unstyledPreview?: boolean;
  children: React.ReactNode;
}) {
  const { ref, inView } = useInViewport({ rootMargin: "300px 0px" });

  return (
    <div
      ref={ref}
      className="grid min-h-[280px] w-full overflow-hidden"
    >
      {inView ? (
        <DocsPreviewWrapper
          unstyledPreview={unstyledPreview}
          hideDefaultVariant
          variants={[]}
        >
          {children}
        </DocsPreviewWrapper>
      ) : (
        <div
          data-lazy-placeholder
          aria-hidden="true"
          className="min-h-[280px] w-full"
        />
      )}
    </div>
  );
}
