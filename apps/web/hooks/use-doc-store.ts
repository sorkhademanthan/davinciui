import * as React from 'react'
import { create } from 'zustand'

interface DocStore {
  activeVariantIndex: number
  setActiveVariantIndex: (index: number) => void
  /**
   * Personalize bridge: the docs preview registers its per-component
   * playground panel here so surfaces outside the preview (e.g. the site
   * header) can offer the same Personalize entry point.
   */
  personalizeContent: React.ReactNode | null
  personalizeContentId: string | null
  registerPersonalizeContent: (id: string, content: React.ReactNode) => void
  clearPersonalizeContent: (id: string) => void
  /** Global open state for the Personalize drawer. */
  personalizeOpen: boolean
  setPersonalizeOpen: (open: boolean) => void
}

export const useDocStore = create<DocStore>((set) => ({
  activeVariantIndex: -1,
  setActiveVariantIndex: (index) => set({ activeVariantIndex: index }),
  personalizeContent: null,
  personalizeContentId: null,
  registerPersonalizeContent: (id, content) =>
    set({ personalizeContentId: id, personalizeContent: content }),
  clearPersonalizeContent: (id) =>
    set((state) =>
      state.personalizeContentId === id
        ? { personalizeContentId: null, personalizeContent: null, personalizeOpen: false }
        : state
    ),
  personalizeOpen: false,
  setPersonalizeOpen: (open) => set({ personalizeOpen: open }),
}))
