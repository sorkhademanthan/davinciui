import * as React from 'react'
import { create } from 'zustand'

interface DocStore {
  activeVariantIndex: number
  setActiveVariantIndex: (index: number) => void
  /**
   * Personalize bridge: the docs preview registers its per-component
   * playground panel here so the site header can jump to the inline panel.
   */
  personalizeContent: React.ReactNode | null
  personalizeContentId: string | null
  registerPersonalizeContent: (id: string, content: React.ReactNode) => void
  clearPersonalizeContent: (id: string) => void
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
        ? { personalizeContentId: null, personalizeContent: null }
        : state
    ),
}))
