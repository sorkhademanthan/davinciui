import type { DesignSystemConfig } from "./domain"

const KEY = "davinciui.design-system.v1"
export interface DesignSystemRepository { list(): DesignSystemConfig[]; get(id: string): DesignSystemConfig | undefined; save(config: DesignSystemConfig): void; remove(id: string): void }
export const browserDesignSystems: DesignSystemRepository = { list() { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(KEY) || "[]") as DesignSystemConfig[] } catch { return [] } }, get(id) { return this.list().find((system) => system.id === id) }, save(config) { const all = this.list().filter((system) => system.id !== config.id); localStorage.setItem(KEY, JSON.stringify([...all, { ...config, meta: { ...config.meta, updatedAt: new Date().toISOString() } }])) }, remove(id) { localStorage.setItem(KEY, JSON.stringify(this.list().filter((system) => system.id !== id))) } }
