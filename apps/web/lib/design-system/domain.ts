export const DESIGN_SYSTEM_VERSION = 1 as const

export type Palette = { id: string; name: string; base: string; shades: Record<string, string>; enabled: boolean }
export type SemanticToken = { id: string; reference: string; label: string }
export type DesignSystemConfig = {
  schemaVersion: typeof DESIGN_SYSTEM_VERSION
  id: string
  meta: { name: string; brand?: string; description?: string; version: string; createdAt: string; updatedAt: string }
  foundation: { colors: Palette[]; fontFamily: string; spacingBase: number; radius: number; density: "compact" | "comfortable" }
  semantic: SemanticToken[]
  themes: { light: Record<string, string>; dark: Record<string, string> }
  components: string[]
}

const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))
export function paletteFrom(base: string, id = "brand", name = "Primary"): Palette {
  const valid = /^#[0-9a-fA-F]{6}$/.test(base) ? base : "#635bff"
  const rgb = [1, 3, 5].map((start) => Number.parseInt(valid.slice(start, start + 2), 16))
  const tint = (target: number, amount: number) => `#${rgb.map((channel) => clamp(channel + (target - channel) * amount).toString(16).padStart(2, "0")).join("")}`
  return { id, name, base: valid, enabled: true, shades: { "50": tint(255, .92), "100": tint(255, .83), "200": tint(255, .68), "300": tint(255, .5), "400": tint(255, .25), "500": valid, "600": tint(0, .12), "700": tint(0, .26), "800": tint(0, .43), "900": tint(0, .6), "950": tint(0, .78) } }
}

export const presets = [
  { id: "blank", name: "Blank", description: "Minimal defaults, ready to validate.", color: "#635bff", font: "Inter", spacing: 4, radius: 8, density: "comfortable" as const },
  { id: "minimal", name: "Minimal", description: "Neutral palette and subtle elevation.", color: "#18181b", font: "Inter", spacing: 4, radius: 8, density: "comfortable" as const },
  { id: "saas", name: "SaaS", description: "Balanced product-interface defaults.", color: "#635bff", font: "Inter", spacing: 4, radius: 10, density: "comfortable" as const },
  { id: "enterprise", name: "Enterprise", description: "Dense, data-oriented defaults.", color: "#0f766e", font: "Inter", spacing: 4, radius: 6, density: "compact" as const },
  { id: "editorial", name: "Editorial", description: "Expressive type and measured space.", color: "#a16207", font: "Georgia", spacing: 4, radius: 4, density: "comfortable" as const },
  { id: "ecommerce", name: "E-commerce", description: "Clear product and action hierarchy.", color: "#db2777", font: "Inter", spacing: 4, radius: 10, density: "comfortable" as const },
  { id: "dark-first", name: "Dark-first", description: "Dark-led palette with contrast defaults.", color: "#8b5cf6", font: "Inter", spacing: 4, radius: 10, density: "comfortable" as const },
] as const

export function createDesignSystem(input: { name: string; brand?: string; description?: string; presetId: string; color: string; font: string; density: "compact" | "comfortable" }) {
  const preset = presets.find((item) => item.id === input.presetId) ?? presets[0]!
  const now = new Date().toISOString(); const id = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "design-system"}-${crypto.randomUUID().slice(0, 6)}`
  const primary = paletteFrom(input.color || preset.color)
  return { schemaVersion: DESIGN_SYSTEM_VERSION, id, meta: { name: input.name, brand: input.brand, description: input.description, version: "1.0", createdAt: now, updatedAt: now }, foundation: { colors: [primary, paletteFrom("#71717a", "neutral", "Neutral")], fontFamily: input.font || preset.font, spacingBase: preset.spacing, radius: preset.radius, density: input.density }, semantic: [{ id: "action.primary.background", label: "Primary action background", reference: "brand.500" }, { id: "action.primary.foreground", label: "Primary action foreground", reference: "#ffffff" }], themes: { light: { "background.canvas": "#ffffff", "text.primary": "#18181b" }, dark: { "background.canvas": "#09090b", "text.primary": "#fafafa" } }, components: [] } satisfies DesignSystemConfig
}

export function resolveToken(config: DesignSystemConfig, reference: string) { const [palette, shade] = reference.split("."); return config.foundation.colors.find((item) => item.id === palette)?.shades[shade || ""] ?? reference }
export function validateDesignSystem(config: DesignSystemConfig) { const issues: string[] = []; if (!config.meta.name.trim()) issues.push("A design-system name is required."); if (!/^#[\da-f]{6}$/i.test(config.foundation.colors[0]?.base || "")) issues.push("Primary color must be a six-digit hex value."); for (const token of config.semantic) if (!resolveToken(config, token.reference)) issues.push(`${token.id} has an unresolved reference.`); return issues }
