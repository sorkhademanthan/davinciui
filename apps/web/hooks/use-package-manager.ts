"use client"

import { useEffect, useState } from "react"

export const PACKAGE_MANAGERS = ["bun", "npm", "pnpm", "yarn"] as const
export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

const STORAGE_KEY = "davinciui:package-manager"
const EVENT_NAME = "davinciui:package-manager-change"

function isPackageManager(value: string | null): value is PackageManager {
  return value !== null && (PACKAGE_MANAGERS as readonly string[]).includes(value)
}

/**
 * Site-wide package-manager preference. Initial state stays deterministic for
 * hydration; the stored value is applied after mount and shared across every
 * consumer through a custom event.
 */
export function usePackageManager(defaultPm: PackageManager = "pnpm") {
  const [selected, setSelected] = useState<PackageManager>(defaultPm)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (isPackageManager(stored)) setSelected(stored)
    } catch {
      // Storage can be unavailable; keep the default.
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && isPackageManager(event.newValue)) {
        setSelected(event.newValue)
      }
    }
    const onPreference = (event: Event) => {
      const value = (event as CustomEvent<PackageManager>).detail
      if (isPackageManager(value)) setSelected(value)
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(EVENT_NAME, onPreference)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(EVENT_NAME, onPreference)
    }
  }, [])

  const update = (next: PackageManager) => {
    setSelected(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable; the in-memory choice still applies.
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }))
  }

  return [selected, update] as const
}
