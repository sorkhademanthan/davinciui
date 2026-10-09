"use client";

import * as React from "react";
import { useDocStore } from "@/hooks/use-doc-store";
import { PersonalizeDrawer } from "@/components/personalize-drawer";

/**
 * Page-owned personalization controller. Exactly one drawer portal exists
 * per component page, registered under the page slug — preview wrappers no
 * longer render or register their own drawers, so mounted examples can never
 * spawn competing portals. Navigating away (or to a non-personalized page)
 * clears the registration via the effect cleanup.
 */
export function PersonalizeController({
  id,
  content,
}: {
  id: string;
  content: React.ReactNode;
}) {
  const registerPersonalizeContent = useDocStore(
    (state) => state.registerPersonalizeContent,
  );
  const clearPersonalizeContent = useDocStore(
    (state) => state.clearPersonalizeContent,
  );

  React.useEffect(() => {
    if (!content) return;
    registerPersonalizeContent(id, content);
    return () => {
      clearPersonalizeContent(id);
    };
  }, [id, content, registerPersonalizeContent, clearPersonalizeContent]);

  if (!content) return null;
  return <PersonalizeDrawer />;
}
