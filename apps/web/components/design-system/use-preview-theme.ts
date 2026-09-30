"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { DesignSystemConfig, Theme } from "@/lib/design-system/domain"
import { listThemes } from "@/lib/design-system/themes"

/**
 * Pick the system theme that visually belongs with the application chrome.
 * This is intentionally a one-time default: selecting another system theme
 * remains an explicit, local preview choice.
 */
export function preferredPreviewThemeId(themes: readonly Theme[], appIsDark: boolean): string {
  const preferredMode = appIsDark ? "dark" : "light"
  return themes.find((theme) => theme.mode === preferredMode)?.id ?? themes[0]?.id ?? "light"
}

function applicationChromeIsDark(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark")
}

/**
 * Shared selection state for system-aware editor previews.
 *
 * The UI chrome and a design-system preview are deliberately independent. We
 * only use the chrome to choose a comfortable initial system theme, then leave
 * the selector entirely under the user's control.
 */
export function usePreviewTheme(system: DesignSystemConfig) {
  const themeOptions = useMemo(() => listThemes(system), [system])
  const [themeId, setThemeId] = useState(() => preferredPreviewThemeId(themeOptions, false))
  const [appIsDark, setAppIsDark] = useState(false)
  const manuallySelected = useRef(false)

  useEffect(() => {
    const root = document.documentElement
    const syncChromeMode = () => setAppIsDark(applicationChromeIsDark())
    syncChromeMode()

    const observer = new MutationObserver(syncChromeMode)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!manuallySelected.current) {
      setThemeId(preferredPreviewThemeId(themeOptions, appIsDark))
    }
  }, [appIsDark, themeOptions])

  const fallbackThemeId = preferredPreviewThemeId(themeOptions, appIsDark)
  const activeThemeId = themeOptions.some((theme) => theme.id === themeId) ? themeId : fallbackThemeId

  return {
    themeOptions,
    activeThemeId,
    selectTheme(themeId: string) {
      manuallySelected.current = true
      setThemeId(themeId)
    },
  }
}
