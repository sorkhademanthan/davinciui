import {
  Circle,
  Document,
  Line,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer"
import {
  resolveToken,
  type DesignSystemConfig,
  type SemanticToken,
} from "@/lib/design-system/domain"
import type { DesignSystemExportModel, ExportChapter } from "@/lib/design-system/export"
import { gridExportSummary } from "@/lib/design-system/grid"
import { iconExportSummary } from "@/lib/design-system/icons"
import { themeHandoffSummary } from "@/lib/design-system/themes"
import { includedEntries } from "@/lib/design-system/component-curation"
import type { ComponentFamily } from "@/lib/design-system/component-manifest"

const INK = "#18181b"
const MUTED = "#71717a"
const QUIET = "#a1a1aa"
const LINE_COLOR = "#e4e4e7"
const SOFT = "#f4f4f5"
const PAPER = "#ffffff"
const SUCCESS = "#047857"
const SUCCESS_SOFT = "#ecfdf5"
const WARNING = "#a16207"
const WARNING_SOFT = "#fffbeb"
const DANGER = "#b91c1c"

const styles = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    color: INK,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    lineHeight: 1.48,
    paddingTop: 58,
    paddingBottom: 50,
    paddingHorizontal: 46,
  },
  cover: { backgroundColor: INK, color: PAPER, padding: 48 },
  coverTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  coverMark: { fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 1.6 },
  coverEdition: { color: "#a1a1aa", fontSize: 7 },
  coverBody: { flexGrow: 1, flexDirection: "row", alignItems: "center" },
  coverCopy: { width: "55%", paddingRight: 24 },
  coverKicker: { color: "#a1a1aa", fontSize: 8, marginBottom: 12 },
  coverTitle: { fontSize: 38, lineHeight: 0.98, fontFamily: "Helvetica-Bold", letterSpacing: -1.6 },
  coverDescription: { marginTop: 18, color: "#d4d4d8", fontSize: 10.5, lineHeight: 1.55, maxWidth: 275 },
  coverMeta: { borderTopWidth: 1, borderTopColor: "#3f3f46", paddingTop: 15, flexDirection: "row", justifyContent: "space-between" },
  metaLabel: { color: QUIET, fontSize: 6.5, marginBottom: 3 },
  metaValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  header: { position: "absolute", left: 46, right: 46, top: 24, height: 18, flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: LINE_COLOR, paddingBottom: 7, color: MUTED, fontSize: 6.8, lineHeight: 1 },
  // Fixed footer dimensions avoid the React PDF/Yoga bottom-anchor overflow
  // that can occur when long documents paginate a fixed auto-height view.
  footer: { position: "absolute", left: 46, right: 46, top: 805, height: 18, borderTopWidth: 1, borderTopColor: LINE_COLOR, paddingTop: 7, color: MUTED, fontSize: 6.8, lineHeight: 1 },
  footerPage: { position: "absolute", left: 46, right: 46, top: 812, color: MUTED, fontSize: 6.8, textAlign: "right" },
  chapterBand: { marginHorizontal: -46, marginTop: -16, marginBottom: 24, paddingHorizontal: 46, paddingTop: 28, paddingBottom: 24, backgroundColor: "#fafafa", borderBottomWidth: 1, borderBottomColor: LINE_COLOR },
  chapterNumber: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 9 },
  h1: { fontSize: 25, lineHeight: 1.08, fontFamily: "Helvetica-Bold", letterSpacing: -0.65, marginBottom: 8 },
  intro: { color: MUTED, fontSize: 9.5, lineHeight: 1.55, maxWidth: 420 },
  h2: { fontSize: 13, lineHeight: 1.2, fontFamily: "Helvetica-Bold", marginTop: 18, marginBottom: 8 },
  h3: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  paragraph: { color: MUTED, marginBottom: 7 },
  code: { fontFamily: "Courier", fontSize: 6.8, color: MUTED },
  codeStrong: { fontFamily: "Courier-Bold", fontSize: 7.2, color: INK },
  label: { color: MUTED, fontSize: 6.5, marginBottom: 4 },
  rule: { height: 1, backgroundColor: LINE_COLOR, marginVertical: 12 },
  row: { flexDirection: "row" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  factGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4, marginBottom: 8 },
  fact: { width: "25%", padding: 4 },
  factInner: { borderTopWidth: 2, borderTopColor: INK, paddingTop: 8, minHeight: 50 },
  factValue: { fontSize: 18, fontFamily: "Helvetica-Bold", lineHeight: 1 },
  factLabel: { color: MUTED, fontSize: 6.7, marginTop: 5 },
  tocItem: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LINE_COLOR, paddingVertical: 11, color: INK, textDecoration: "none" },
  tocNumber: { width: 38, fontSize: 11, fontFamily: "Helvetica-Bold" },
  tocCopy: { flexGrow: 1 },
  tocTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  tocDescription: { color: MUTED, fontSize: 7.7 },
  table: { borderTopWidth: 1, borderTopColor: INK, marginBottom: 12 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LINE_COLOR, minHeight: 25, alignItems: "center" },
  tableHead: { backgroundColor: SOFT },
  cell: { paddingVertical: 6, paddingHorizontal: 6, overflow: "hidden" },
  cellStrong: { fontFamily: "Helvetica-Bold" },
  cellMuted: { color: MUTED },
  panel: { borderWidth: 1, borderColor: LINE_COLOR, borderRadius: 5, padding: 11, marginBottom: 10 },
  panelSoft: { backgroundColor: "#fafafa" },
  palette: { borderTopWidth: 1, borderTopColor: INK, paddingTop: 9, marginBottom: 16 },
  paletteHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 9 },
  swatchRow: { flexDirection: "row" },
  swatchBlock: { flexGrow: 1 },
  swatch: { height: 42, borderRightWidth: 1, borderRightColor: PAPER },
  swatchMeta: { paddingTop: 4, fontSize: 5.7, color: MUTED },
  typeSpecimen: { borderTopWidth: 1, borderTopColor: LINE_COLOR, paddingTop: 10, marginBottom: 13 },
  typeSampleDisplay: { fontFamily: "Helvetica-Bold", fontSize: 25, lineHeight: 1.12, letterSpacing: -0.7, marginBottom: 7 },
  typeSampleHeading: { fontFamily: "Helvetica-Bold", fontSize: 17, lineHeight: 1.2, marginBottom: 7 },
  typeSampleBody: { fontSize: 10, lineHeight: 1.55, marginBottom: 7, maxWidth: 430 },
  typeSampleLabel: { fontFamily: "Helvetica-Bold", fontSize: 8, marginBottom: 7 },
  spacingRow: { flexDirection: "row", alignItems: "center", minHeight: 27, borderBottomWidth: 1, borderBottomColor: LINE_COLOR },
  spacingName: { width: 76, fontFamily: "Courier-Bold", fontSize: 7 },
  spacingTrack: { width: 260, height: 8, backgroundColor: SOFT },
  spacingBar: { height: 8 },
  spacingValue: { width: 80, textAlign: "right", color: MUTED, fontSize: 7 },
  specimenGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  specimenCell: { width: "25%", padding: 4 },
  radiusShape: { height: 48, borderWidth: 1.5, marginBottom: 7 },
  elevationStage: { height: 62, backgroundColor: "#fafafa", position: "relative", marginBottom: 7 },
  elevationShadow: { position: "absolute", left: 16, right: 8, top: 16, height: 34, backgroundColor: "#d4d4d8" },
  elevationCard: { position: "absolute", left: 8, right: 16, top: 8, height: 34, backgroundColor: PAPER, borderWidth: 1, borderColor: LINE_COLOR },
  durationTrack: { width: 270, height: 4, backgroundColor: LINE_COLOR, marginTop: 8 },
  durationFill: { height: 4 },
  tokenCard: { borderTopWidth: 1, borderTopColor: INK, paddingTop: 8, marginBottom: 12 },
  tokenValues: { flexDirection: "row", marginTop: 8 },
  tokenTheme: { width: "50%", paddingRight: 8 },
  colorSample: { height: 29, borderWidth: 1, borderColor: LINE_COLOR, marginBottom: 5 },
  pill: { borderRadius: 9, backgroundColor: SOFT, color: MUTED, fontSize: 6.5, paddingVertical: 3, paddingHorizontal: 7 },
  callout: { borderLeftWidth: 3, padding: 10, marginVertical: 10 },
  themeCanvas: { width: "49%", minHeight: 180, borderRadius: 5, borderWidth: 1, padding: 12 },
  healthMetric: { width: "32%", borderTopWidth: 3, paddingTop: 9 },
  healthValue: { fontSize: 24, fontFamily: "Helvetica-Bold", lineHeight: 1 },
  healthLabel: { color: MUTED, fontSize: 7, marginTop: 5 },
  coverageRow: { flexDirection: "row", alignItems: "center", minHeight: 24 },
  coverageLabel: { width: 105, fontSize: 7.5 },
  coverageTrack: { flexGrow: 1, height: 7, backgroundColor: SOFT },
  coverageValue: { width: 62, textAlign: "right", fontSize: 7, color: MUTED },
  warningBox: { borderTopWidth: 1, borderTopColor: LINE_COLOR, paddingTop: 8, marginBottom: 10 },
})

function text(value: unknown): string {
  return String(value ?? "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00a0/g, " ")
}

function displayDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return text(value)
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(date)
}

function safeHex(value: string | null | undefined, fallback = PAPER): string {
  return /^#[0-9a-f]{6}$/i.test(value ?? "") ? value! : fallback
}

function numberFrom(value: string, fallback = 0): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function chapter(model: DesignSystemExportModel, id: ExportChapter["id"]): ExportChapter {
  return model.chapters.find((entry) => entry.id === id)!
}

const COMPONENT_FAMILY_ORDER: readonly ComponentFamily[] = [
  "inputs",
  "actions",
  "navigation",
  "feedback",
  "overlays",
  "data-display",
  "layout",
]

function componentFamilyLabel(family: string): string {
  const labels: Record<string, string> = {
    inputs: "Inputs",
    actions: "Actions",
    navigation: "Navigation",
    feedback: "Feedback",
    overlays: "Overlays",
    "data-display": "Data display",
    layout: "Layout",
  }
  return labels[family] ?? family
}

function componentSlots(slots: Array<{ slot: string }>): string {
  if (slots.length === 0) return "Token-driven"
  return slots.map((slot) => slot.slot).join(" · ")
}

function documentAccent(system: DesignSystemConfig): string {
  const palette = system.foundations.colors.palettes.find((entry) => entry.enabled && entry.role === "brand")
    ?? system.foundations.colors.palettes.find((entry) => entry.enabled)
  return safeHex(palette?.base, "#0f766e")
}

function PageChrome({ model, section }: { model: DesignSystemExportModel; section: string }) {
  return (
    <>
      <View style={styles.header} fixed>
        <Text>DAVINCIUI / DESIGN SYSTEM</Text>
        <Text>{text(section)}</Text>
      </View>
      <View style={styles.footer} fixed>
        <Text>v{text(model.system.meta.version)} / {displayDate(model.generatedAt)}</Text>
      </View>
      <Text style={styles.footerPage} fixed render={({ pageNumber }) => String(pageNumber).padStart(2, "0")} />
    </>
  )
}

function ChapterHero({ entry, accent }: { entry: ExportChapter; accent: string }) {
  return (
    <View id={entry.id} style={[styles.chapterBand, { borderTopWidth: 4, borderTopColor: accent }]}>
      <Text style={[styles.chapterNumber, { color: accent }]}>{entry.number}</Text>
      <Text style={styles.h1}>{text(entry.title)}</Text>
      <Text style={styles.intro}>{text(entry.description)}</Text>
    </View>
  )
}

function Metrics({ items, accent = INK }: { items: Array<[string, string]>; accent?: string }) {
  return (
    <View style={styles.factGrid}>
      {items.map(([label, value]) => (
        <View key={label} style={styles.fact} wrap={false}>
          <View style={[styles.factInner, { borderTopColor: accent }]}>
            <Text style={styles.factValue}>{text(value)}</Text>
            <Text style={styles.factLabel}>{text(label)}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

interface Column<Row> { key: string; label: string; width: string; value: (row: Row) => string }

function ReferenceTable<Row>({ rows, columns }: { rows: Row[]; columns: Array<Column<Row>> }) {
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHead]} fixed>
        {columns.map((column) => <Text key={column.key} style={[styles.cell, styles.cellStrong, { width: column.width }]}>{text(column.label)}</Text>)}
      </View>
      {rows.map((row, index) => (
        <View key={index} style={styles.tableRow} wrap={false}>
          {columns.map((column, columnIndex) => (
            <Text key={column.key} style={[styles.cell, columnIndex === 0 ? styles.cellStrong : styles.cellMuted, { width: column.width }]}>{text(column.value(row))}</Text>
          ))}
        </View>
      ))}
    </View>
  )
}

function SystemFingerprint({ system, accent }: { system: DesignSystemConfig; accent: string }) {
  const palettes = system.foundations.colors.palettes.filter((item) => item.enabled).slice(0, 5)
  const radii = system.foundations.radius.scale.slice(0, 4)
  return (
    <View style={{ width: "45%", height: 300, borderWidth: 1, borderColor: "#3f3f46", padding: 18, justifyContent: "space-between" }}>
      <View>
        <Text style={{ color: QUIET, fontSize: 7 }}>SYSTEM FINGERPRINT</Text>
        <Text style={{ fontSize: 42, fontFamily: "Helvetica-Bold", marginTop: 14 }}>Aa</Text>
        <Text style={{ color: QUIET, fontSize: 7, marginTop: 4 }}>{text(system.foundations.typography.primary)}</Text>
      </View>
      <View>
        <View style={{ flexDirection: "row", marginBottom: 15 }}>
          {palettes.map((palette) => <View key={palette.id} style={{ width: 28, height: 28, marginRight: 6, borderRadius: 14, backgroundColor: safeHex(palette.base, accent) }} />)}
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 55 }}>
          {[4, 8, 12, 16, 24, 32].map((value) => <View key={value} style={{ width: 10, height: value, backgroundColor: value === 24 ? accent : "#52525b", marginRight: 6 }} />)}
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {radii.map((radius) => <View key={radius.id} style={{ width: 35, height: 35, borderWidth: 1, borderColor: "#71717a", borderRadius: Math.min(numberFrom(radius.value), 16) }} />)}
      </View>
    </View>
  )
}

function SpacingSpecimen({ system, accent }: { system: DesignSystemConfig; accent: string }) {
  const tokens = system.foundations.spacing.scale
  const max = Math.max(...tokens.map((token) => numberFrom(token.value)), 1)
  return (
    <View style={styles.panel}>
      {tokens.map((token) => {
        const aliases = tokens.filter((candidate) => candidate.value === token.value && candidate.id !== token.id).map((candidate) => candidate.id)
        return (
          <View key={token.id} style={styles.spacingRow} wrap={false}>
            <Text style={styles.spacingName}>{text(token.id)}</Text>
            <View style={styles.spacingTrack}><View style={[styles.spacingBar, { width: `${Math.max(3, (numberFrom(token.value) / max) * 100)}%`, backgroundColor: accent }]} /></View>
            <Text style={styles.spacingValue}>{text(token.value)}{aliases.length ? ` / alias ${aliases.join(", ")}` : ""}</Text>
          </View>
        )
      })}
    </View>
  )
}

function RadiusSpecimens({ system, accent }: { system: DesignSystemConfig; accent: string }) {
  return (
    <View style={styles.specimenGrid}>
      {system.foundations.radius.scale.map((token) => (
        <View key={token.id} style={styles.specimenCell} wrap={false}>
          <View style={[styles.radiusShape, { borderColor: accent, borderRadius: Math.min(numberFrom(token.value), 24) }]} />
          <Text style={styles.h3}>{text(token.label)}</Text>
          <Text style={styles.code}>{text(token.id)} / {text(token.value)}</Text>
        </View>
      ))}
    </View>
  )
}

function ElevationSpecimens({ system }: { system: DesignSystemConfig }) {
  return (
    <View style={styles.specimenGrid}>
      {system.foundations.shadows.tokens.filter((item) => item.enabled !== false).map((token, index) => (
        <View key={token.id} style={styles.specimenCell} wrap={false}>
          <View style={styles.elevationStage}>
            {index > 0 && <View style={[styles.elevationShadow, { left: 15 + Math.min(index, 5), top: 14 + Math.min(index * 2, 12) }]} />}
            <View style={styles.elevationCard} />
          </View>
          <Text style={styles.h3}>{text(token.label)}</Text>
          <Text style={styles.code}>{text(token.id)}</Text>
          <Text style={[styles.code, { marginTop: 2 }]}>{text(token.value)}</Text>
        </View>
      ))}
    </View>
  )
}

function MotionCurve({ value, accent }: { value: string; accent: string }) {
  const match = value.match(/cubic-bezier\(([^)]+)\)/)
  const points = match?.[1]?.split(",").map((part) => Number.parseFloat(part.trim()))
  const curve = points?.length === 4 && points.every(Number.isFinite) ? points : [0, 0, 1, 1]
  const x1 = curve[0] ?? 0
  const y1 = curve[1] ?? 0
  const x2 = curve[2] ?? 1
  const y2 = curve[3] ?? 1
  const sx1 = 8 + x1 * 70
  const sy1 = 48 - y1 * 40
  const sx2 = 8 + x2 * 70
  const sy2 = 48 - y2 * 40
  return (
    <Svg width="86" height="56" viewBox="0 0 86 56">
      <Line x1="8" y1="48" x2="78" y2="8" stroke={LINE_COLOR} strokeWidth="1" />
      <Path d={`M 8 48 C ${sx1} ${sy1}, ${sx2} ${sy2}, 78 8`} stroke={accent} strokeWidth="2" fill="none" />
      <Circle cx="8" cy="48" r="2" fill={INK} />
      <Circle cx="78" cy="8" r="2" fill={INK} />
    </Svg>
  )
}

function IconSpecimen({ size, stroke, accent }: { size: number; stroke: number; accent: string }) {
  const inset = 4
  return (
    <Svg width={Math.max(size, 18)} height={Math.max(size, 18)} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={Math.max(2, size / 2 - inset)} stroke={accent} strokeWidth={stroke} fill="none" />
      <Line x1={size / 2} y1={inset + 2} x2={size / 2} y2={size - inset - 2} stroke={accent} strokeWidth={stroke} />
      <Line x1={inset + 2} y1={size / 2} x2={size - inset - 2} y2={size / 2} stroke={accent} strokeWidth={stroke} />
    </Svg>
  )
}

function GridDiagram({ columns, label, width, accent }: { columns: number; label: string; width: string; accent: string }) {
  return (
    <View style={[styles.panel, { marginBottom: 8 }]} wrap={false}>
      <View style={styles.rowBetween}><Text style={styles.h3}>{text(label)}</Text><Text style={styles.code}>{text(width)} / {columns} columns</Text></View>
      <View style={{ height: 54, flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10, backgroundColor: SOFT, marginTop: 8 }}>
        {Array.from({ length: columns }, (_, index) => <View key={index} style={{ flexGrow: 1, marginHorizontal: 1.5, backgroundColor: accent, opacity: 0.22 }} />)}
      </View>
      <View style={styles.rowBetween}><Text style={styles.label}>PAGE EDGE</Text><Text style={styles.label}>COLUMN GAP</Text></View>
    </View>
  )
}

function TokenCard({ model, token }: { model: DesignSystemExportModel; token: SemanticToken }) {
  const light = resolveToken(model.system, token.id, "light")
  const dark = resolveToken(model.system, token.id, "dark")
  const lightValue = light.status === "resolved" ? light.value : "Unresolved"
  const darkValue = dark.status === "resolved" ? dark.value : "Unresolved"
  return (
    <View style={styles.tokenCard} wrap={false}>
      <View style={styles.rowBetween}>
        <View><Text style={styles.codeStrong}>{text(token.id)}</Text><Text style={[styles.paragraph, { marginTop: 3 }]}>{text(token.label)}</Text></View>
        <Text style={styles.pill}>{text(token.category)}</Text>
      </View>
      <View style={styles.tokenValues}>
        <View style={styles.tokenTheme}><View style={[styles.colorSample, { backgroundColor: safeHex(lightValue) }]} /><Text style={styles.code}>LIGHT / {text(lightValue)}</Text></View>
        <View style={styles.tokenTheme}><View style={[styles.colorSample, { backgroundColor: safeHex(darkValue, INK) }]} /><Text style={styles.code}>DARK / {text(darkValue)}</Text></View>
      </View>
      <Text style={[styles.code, { marginTop: 6 }]}>Source: {text(token.value)}</Text>
    </View>
  )
}

function TokenArchitecture({ model, accent }: { model: DesignSystemExportModel; accent: string }) {
  const action = model.system.semanticTokens.find((token) => token.id === "action.primary.background")
  const resolved = action ? resolveToken(model.system, action.id, "light") : null
  return (
    <View style={[styles.panel, styles.panelSoft]} wrap={false}>
      <Text style={styles.h3}>From decision to interface</Text>
      <Text style={styles.paragraph}>Foundation values feed stable semantic roles. Components consume the role, so themes can change without rewriting component styles.</Text>
      <View style={[styles.row, { alignItems: "center", marginTop: 8 }]}>
        {["FOUNDATION\nbrand.600", "SEMANTIC\naction.primary.background", "COMPONENT\nbutton.primary.background"].map((item, index) => (
          <View key={item} style={{ flexDirection: "row", alignItems: "center", flexGrow: 1 }}>
            <View style={{ flexGrow: 1, borderTopWidth: 2, borderTopColor: index === 1 ? accent : INK, paddingTop: 7 }}><Text style={styles.code}>{item}</Text></View>
            {index < 2 && <Text style={{ width: 18, textAlign: "center", color: accent }}>›</Text>}
          </View>
        ))}
        <View style={{ width: 90, marginLeft: 9, paddingVertical: 10, borderRadius: 4, backgroundColor: safeHex(resolved?.status === "resolved" ? resolved.value : null, accent) }}><Text style={{ color: PAPER, textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 8 }}>Continue</Text></View>
      </View>
    </View>
  )
}

function ThemeCanvas({ model, themeId, label }: { model: DesignSystemExportModel; themeId: string; label: string }) {
  const resolve = (id: string, fallback: string) => {
    const result = resolveToken(model.system, id, themeId)
    return safeHex(result.status === "resolved" ? result.value : null, fallback)
  }
  const canvas = resolve("background.canvas", themeId === "dark" ? "#09090b" : PAPER)
  const surface = resolve("surface.default", themeId === "dark" ? INK : "#fafafa")
  const primary = resolve("text.primary", themeId === "dark" ? PAPER : INK)
  const muted = resolve("text.muted", themeId === "dark" ? QUIET : MUTED)
  const border = resolve("border.default", themeId === "dark" ? "#3f3f46" : LINE_COLOR)
  const action = resolve("action.primary.background", INK)
  const actionText = resolve("action.primary.foreground", PAPER)
  return (
    <View style={[styles.themeCanvas, { backgroundColor: canvas, borderColor: border }]} wrap={false}>
      <Text style={{ color: muted, fontSize: 7 }}>{text(label)}</Text>
      <Text style={{ color: primary, fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 8 }}>Workspace</Text>
      <View style={{ marginTop: 12, padding: 12, borderRadius: 5, borderWidth: 1, borderColor: border, backgroundColor: surface }}>
        <Text style={{ color: primary, fontFamily: "Helvetica-Bold", fontSize: 9 }}>Project activity</Text>
        <Text style={{ color: muted, fontSize: 7, marginTop: 5 }}>A realistic surface using resolved semantic roles.</Text>
        <View style={{ flexDirection: "row", marginTop: 13 }}>
          <View style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 4, backgroundColor: action }}><Text style={{ color: actionText, fontFamily: "Helvetica-Bold", fontSize: 7 }}>Continue</Text></View>
          <View style={{ width: 9 }} />
          <View style={{ flexGrow: 1, borderBottomWidth: 1, borderBottomColor: border, justifyContent: "center" }}><Text style={{ color: muted, fontSize: 7 }}>Search projects</Text></View>
        </View>
      </View>
    </View>
  )
}

function HealthSummary({ model }: { model: DesignSystemExportModel }) {
  const total = model.report.summary.passed + model.report.summary.warnings + model.report.summary.errors
  const groupRows = model.report.groups.map((group) => {
    const warnings = group.findings.filter((finding) => finding.severity === "warning").length
    return { label: group.title, warnings, passed: Math.max(0, total ? Math.round(model.report.summary.passed / model.report.groups.length) : 0) }
  })
  const maxWarnings = Math.max(...groupRows.map((row) => row.warnings), 1)
  return (
    <>
      <View style={[styles.rowBetween, { marginBottom: 22 }]}>
        <View style={[styles.healthMetric, { borderTopColor: SUCCESS }]}><Text style={[styles.healthValue, { color: SUCCESS }]}>{model.report.summary.passed}</Text><Text style={styles.healthLabel}>Checks passed</Text></View>
        <View style={[styles.healthMetric, { borderTopColor: WARNING }]}><Text style={[styles.healthValue, { color: WARNING }]}>{model.report.summary.warnings}</Text><Text style={styles.healthLabel}>Review notes</Text></View>
        <View style={[styles.healthMetric, { borderTopColor: DANGER }]}><Text style={[styles.healthValue, { color: DANGER }]}>0</Text><Text style={styles.healthLabel}>Blocking errors</Text></View>
      </View>
      <Text style={styles.h2}>Review concentration</Text>
      {groupRows.map((row) => (
        <View key={row.label} style={styles.coverageRow}>
          <Text style={styles.coverageLabel}>{text(row.label)}</Text>
          <View style={styles.coverageTrack}><View style={{ width: `${Math.max(2, (row.warnings / maxWarnings) * 100)}%`, height: 7, backgroundColor: row.warnings ? WARNING : SUCCESS }} /></View>
          <Text style={styles.coverageValue}>{row.warnings ? `${row.warnings} review` : "Clear"}</Text>
        </View>
      ))}
    </>
  )
}

export function DesignSystemExportDocument({ model }: { model: DesignSystemExportModel }) {
  const { system } = model
  const accent = documentAccent(system)
  const icons = iconExportSummary(system)
  const grid = gridExportSummary(system)
  const semanticGroups = [...new Set(system.semanticTokens.map((token) => token.category))]
  const enabledPalettes = system.foundations.colors.palettes.filter((palette) => palette.enabled)
  const durations = system.foundations.motion.durations.filter((item) => item.enabled !== false)
  const easings = system.foundations.motion.easings.filter((item) => item.enabled !== false)
  const coreComponents = includedEntries(system, "core")
  const componentGroups = COMPONENT_FAMILY_ORDER.map((family) => ({
    family,
    entries: coreComponents.filter((entry) => entry.family === family),
  })).filter((group) => group.entries.length > 0)
  const accessibilityWarnings = model.warnings.filter((warning) => warning.group === "accessibility")
  // Appendix hygiene: the export-readiness "N warnings will be listed" note is
  // meta-commentary about the report itself — never list it inside the report.
  // Premium "needs-review" findings share one identical pattern, so group them
  // into a single compact table instead of one box per component.
  const appendixWarnings = model.warnings.filter(
    (warning) => warning.group !== "accessibility" && warning.group !== "export-readiness",
  )
  const componentReviewWarnings = appendixWarnings.filter((warning) => warning.id.includes("premium-needs-review"))
  const individualWarnings = appendixWarnings.filter((warning) => !warning.id.includes("premium-needs-review"))

  function reviewGaps(explanation: string): string {
    const match = explanation.match(/Open gaps:\s*(.+?)\.\s*Review/i)
    if (match?.[1]) return match[1].trim()
    return explanation.replace(/^This premium experience ships as needs-review in the catalog\.\s*/i, "").replace(/\s*Review it before relying on it in production\.\s*/i, "").trim() || "Needs review"
  }

  return (
    <Document title={`${text(system.meta.name)} design system`} author={text(system.meta.team || system.meta.brand || "DavinciUI")} subject="Design-system handbook and technical reference" creator="DavinciUI Design System Builder">
      <Page size="A4" style={styles.cover} bookmark="Cover">
        <View style={styles.coverTop}><Text style={styles.coverMark}>DAVINCIUI</Text><Text style={styles.coverEdition}>DESIGN SYSTEM / {text(system.meta.version)}</Text></View>
        <View style={styles.coverBody}>
          <View style={styles.coverCopy}>
            <Text style={styles.coverKicker}>SPECIFICATION / {displayDate(model.generatedAt).toUpperCase()}</Text>
            <Text style={styles.coverTitle}>{text(system.meta.name)}{`\n`}Design system</Text>
            <Text style={styles.coverDescription}>{text(system.meta.description || "A practical system for building consistent, accessible digital experiences.")}</Text>
          </View>
          <SystemFingerprint system={system} accent={accent} />
        </View>
        <View style={styles.coverMeta}>
          <View><Text style={styles.metaLabel}>VERSION</Text><Text style={styles.metaValue}>{text(system.meta.version)}</Text></View>
          <View><Text style={styles.metaLabel}>STARTING POINT</Text><Text style={styles.metaValue}>{text(system.starter.label)}</Text></View>
          <View><Text style={styles.metaLabel}>GENERATED</Text><Text style={styles.metaValue}>{displayDate(model.generatedAt)}</Text></View>
        </View>
      </Page>

      <Page size="A4" style={styles.page} bookmark="System at a glance">
        <PageChrome model={model} section="System at a glance" />
        <Text style={styles.h1}>System at a glance</Text>
        <Text style={styles.intro}>The core decisions contained in this edition, summarized before the full specification.</Text>
        <View style={{ marginTop: 22 }}>
          <Metrics accent={accent} items={[
            ["Colour palettes", String(enabledPalettes.length)],
            ["Semantic roles", String(system.semanticTokens.length)],
            ["Text styles", String(system.foundations.typography.styles.length)],
            ["Themes", String(system.themes.length)],
            ["Components", String(coreComponents.length)],
            ["Breakpoints", String(system.foundations.breakpoints.scale.length)],
            ["Motion durations", String(durations.length)],
            ["Spacing tokens", String(system.foundations.spacing.scale.length)],
            ["Icon sizes", String(icons.sizes.length)],
          ]} />
        </View>
        <View style={[styles.callout, { borderLeftColor: accent, backgroundColor: "#fafafa", marginTop: 20 }]}>
          <Text style={styles.h3}>Built for designers and developers</Text>
          <Text style={styles.paragraph}>Visual specimens communicate intent. Compact reference tables preserve exact implementation values. Use semantic roles in product code and foundation tokens when defining new shared roles.</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page} bookmark="Contents">
        <PageChrome model={model} section="Contents" />
        <Text style={styles.h1}>Contents</Text>
        <Text style={styles.intro}>Chapters follow the path from foundational decisions to interface meaning, themes, and system health.</Text>
        <View style={{ marginTop: 12 }}>
          {model.chapters.map((entry) => (
            <Link key={entry.id} src={`#${entry.id}`} style={styles.tocItem}>
              <Text style={[styles.tocNumber, { color: accent }]}>{entry.number}</Text>
              <View style={styles.tocCopy}><Text style={styles.tocTitle}>{text(entry.title)}</Text><Text style={styles.tocDescription}>{text(entry.description)}</Text></View>
            </Link>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page} wrap bookmark={`${chapter(model, "overview").number} System overview`}>
        <PageChrome model={model} section="System overview" />
        <ChapterHero entry={chapter(model, "overview")} accent={accent} />
        <Metrics accent={accent} items={[["Starting point", system.starter.label], ["Density", system.foundations.density], ["Primary typeface", system.foundations.typography.primary], ["Schema", `v${system.schemaVersion}`]]} />
        <Text style={styles.h2}>How to use this handbook</Text>
        <View style={[styles.callout, { borderLeftColor: accent, backgroundColor: "#fafafa" }]}><Text>Start with the visual specimen to understand intent. Use the reference values beneath it for implementation. Check the theme and health chapters before introducing new raw values.</Text></View>
        {(system.meta.team || system.meta.brand) && <ReferenceTable rows={([[
          "Team", system.meta.team || "Not specified",
        ], [
          "Brand", system.meta.brand || "Not specified",
        ], [
          "Updated", displayDate(system.meta.updatedAt),
        ]] as Array<[string, string]>)} columns={[{ key: "label", label: "Identity", width: "35%", value: (row) => row[0] }, { key: "value", label: "Saved value", width: "65%", value: (row) => row[1] }]} />}
      </Page>

      {enabledPalettes.length > 0 && <Page size="A4" style={styles.page} wrap bookmark={`${chapter(model, "colors").number} Colour foundations`}>
        <PageChrome model={model} section="Colour foundations" />
        <ChapterHero entry={chapter(model, "colors")} accent={accent} />
        {enabledPalettes.map((palette) => (
          <View key={palette.id} style={styles.palette} wrap={false}>
            <View style={styles.paletteHead}>
              <View><Text style={styles.h3}>{text(palette.label)}</Text><Text style={styles.code}>{text(palette.id)} / {text(palette.role)} / base {text(palette.base)}</Text></View>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: safeHex(palette.base) }} />
            </View>
            <View style={styles.swatchRow}>
              {Object.entries(palette.shades).map(([shade, value]) => <View key={shade} style={styles.swatchBlock}><View style={[styles.swatch, { backgroundColor: safeHex(value) }]} /><Text style={styles.swatchMeta}>{text(shade)}{`\n`}{text(value)}</Text></View>)}
            </View>
          </View>
        ))}
      </Page>}

      <Page size="A4" style={styles.page} wrap bookmark={`${chapter(model, "typography").number} Typography`}>
        <PageChrome model={model} section="Typography" />
        <ChapterHero entry={chapter(model, "typography")} accent={accent} />
        {(["display", "heading", "body", "label"] as const).map((role) => {
          const spec = system.foundations.typography.roles[role]
          const sampleStyle = role === "display" ? styles.typeSampleDisplay : role === "heading" ? styles.typeSampleHeading : role === "body" ? styles.typeSampleBody : styles.typeSampleLabel
          const sample = role === "display" ? "Design should feel inevitable." : role === "heading" ? "Building better interfaces" : role === "body" ? "A shared language helps designers and developers make consistent decisions without slowing the product team down." : "BUTTONS, INPUTS AND METADATA"
          return <View key={role} style={styles.typeSpecimen} wrap={false}><Text style={styles.label}>{role.toUpperCase()}</Text><Text style={sampleStyle}>{sample}</Text><Text style={styles.code}>{text(spec.fontFamily)} / {spec.weight} / {text(spec.size)} / {text(spec.lineHeight)} / {text(spec.letterSpacing)}</Text></View>
        })}
      </Page>

      <Page size="A4" style={styles.page} wrap bookmark="Typography reference">
        <PageChrome model={model} section="Typography / Reference" />
        <Text style={styles.h1}>Typography reference</Text>
        <Text style={styles.intro}>Exact family, weight, size, and line-height values for handoff. Ordinary reading uses the selected sans or serif roles; monospace is reserved for code and technical values.</Text>
        <Text style={styles.h2}>Shared roles</Text>
        <ReferenceTable rows={Object.entries(system.foundations.typography.roles).map(([role, spec]) => ({ role, ...spec }))} columns={[{ key: "role", label: "Role", width: "16%", value: (row) => row.role }, { key: "family", label: "Family", width: "27%", value: (row) => row.fontFamily }, { key: "weight", label: "Weight", width: "12%", value: (row) => String(row.weight) }, { key: "size", label: "Size", width: "14%", value: (row) => row.size }, { key: "line", label: "Line", width: "15%", value: (row) => String(row.lineHeight) }, { key: "tracking", label: "Tracking", width: "16%", value: (row) => row.letterSpacing }]} />
        <Text style={styles.h2}>Individual text styles</Text>
        <ReferenceTable rows={system.foundations.typography.styles} columns={[{ key: "style", label: "Style", width: "22%", value: (row) => row.label }, { key: "role", label: "Role", width: "14%", value: (row) => row.role }, { key: "family", label: "Family", width: "25%", value: (row) => row.fontFamily }, { key: "weight", label: "Weight", width: "12%", value: (row) => String(row.weight) }, { key: "size", label: "Size / line", width: "27%", value: (row) => `${row.size} / ${row.lineHeight}` }]} />
      </Page>

      <Page size="A4" style={styles.page} wrap bookmark={`${chapter(model, "layout-foundations").number} Spacing and surfaces`}>
        <PageChrome model={model} section="Spacing and surfaces" />
        <ChapterHero entry={chapter(model, "layout-foundations")} accent={accent} />
        <Text style={styles.h2}>Spacing rhythm</Text>
        <Text style={styles.paragraph}>Bar length represents the saved value. Repeated values are shown as intentional aliases rather than hidden duplicates.</Text>
        <SpacingSpecimen system={system} accent={accent} />
        <Text style={styles.h2}>Corner radius</Text>
        <RadiusSpecimens system={system} accent={accent} />
        <Text style={styles.h2}>Border recipes</Text>
        <ReferenceTable rows={system.foundations.borders.tokens.filter((item) => item.enabled !== false)} columns={[{ key: "label", label: "Recipe", width: "26%", value: (row) => row.label }, { key: "width", label: "Width", width: "22%", value: (row) => `${row.width} / ${system.foundations.borders.widths[row.width] ?? row.width}` }, { key: "style", label: "Style", width: "18%", value: (row) => row.style }, { key: "color", label: "Colour role", width: "34%", value: (row) => row.color }]} />
      </Page>

      <Page size="A4" style={styles.page} wrap bookmark="Elevation reference">
        <PageChrome model={model} section="Spacing and surfaces / Elevation" />
        <Text style={styles.h1}>Elevation</Text><Text style={styles.intro}>Named recipes create a coherent sense of depth. The specimen shows relative elevation; the CSS value remains the implementation source.</Text>
        <View style={{ marginTop: 20 }}><ElevationSpecimens system={system} /></View>
        <Text style={styles.h2}>Sizing reference</Text>
        <ReferenceTable rows={system.foundations.sizing.tokens} columns={[{ key: "id", label: "Token", width: "45%", value: (row) => row.id }, { key: "value", label: "Value", width: "55%", value: (row) => row.value }]} />
      </Page>

      <Page size="A4" style={styles.page} wrap bookmark={`${chapter(model, "motion-icons").number} Motion and icons`}>
        <PageChrome model={model} section="Motion" />
        <ChapterHero entry={chapter(model, "motion-icons")} accent={accent} />
        <Metrics accent={accent} items={[["Reduced motion", system.foundations.motion.reducedMotion], ["Durations", String(durations.length)], ["Easings", String(easings.length)], ["Icon source", icons.source.label]]} />
        <Text style={styles.h2}>Duration scale</Text>
        {durations.map((duration) => {
          const milliseconds = numberFrom(duration.value)
          const max = Math.max(...durations.map((item) => numberFrom(item.value)), 1)
          return <View key={duration.id} style={[styles.panel, { flexDirection: "row", alignItems: "center" }]} wrap={false}><View style={{ width: 95 }}><Text style={styles.h3}>{text(duration.label)}</Text><Text style={styles.code}>{text(duration.value)}</Text></View><View><Text style={styles.paragraph}>{text(duration.description || "Custom duration")}</Text><View style={styles.durationTrack}><View style={[styles.durationFill, { width: `${Math.max(1, (milliseconds / max) * 100)}%`, backgroundColor: accent }]} /></View></View></View>
        })}
        <Text style={styles.h2}>Easing curves</Text>
        <View style={styles.specimenGrid} wrap={false}>{easings.map((easing) => <View key={easing.id} style={{ width: `${100 / Math.max(easings.length, 1)}%`, padding: 4 }}><MotionCurve value={easing.value} accent={accent} /><Text style={styles.h3}>{text(easing.label)}</Text><Text style={styles.code}>{text(easing.value)}</Text></View>)}</View>
      </Page>

      <Page size="A4" style={styles.page} wrap bookmark="Icon specification">
        <PageChrome model={model} section="Icons" />
        <Text style={styles.h1}>Icon specification</Text><Text style={styles.intro}>Use one source, a deliberate size scale, and consistent stroke treatment. Individual glyphs do not need separate token entries.</Text>
        <View style={[styles.panel, styles.panelSoft, { marginTop: 18 }]}><View style={[styles.rowBetween, { alignItems: "flex-end" }]}>{icons.sizes.map((size) => <View key={size.id} style={{ width: `${100 / icons.sizes.length}%`, alignItems: "center" }}><IconSpecimen size={Math.max(12, numberFrom(size.value, 20))} stroke={icons.stroke.width} accent={accent} /><Text style={[styles.h3, { marginTop: 8 }]}>{text(size.label)}</Text><Text style={styles.code}>{text(size.id)} / {text(size.value)}</Text></View>)}</View></View>
        <Text style={styles.h2}>Stroke treatment</Text>
        <View style={styles.rowBetween}>{[1, 1.5, 2, 2.5].map((stroke) => <View key={stroke} style={[styles.panel, { width: "23%", alignItems: "center", borderColor: stroke === icons.stroke.width ? accent : LINE_COLOR }]}><IconSpecimen size={28} stroke={stroke} accent={stroke === icons.stroke.width ? accent : MUTED} /><Text style={[styles.code, { marginTop: 7 }]}>{stroke}px{stroke === icons.stroke.width ? " / selected" : ""}</Text></View>)}</View>
        <ReferenceTable rows={icons.sizes} columns={[{ key: "label", label: "Size", width: "24%", value: (row) => row.label }, { key: "token", label: "Token", width: "24%", value: (row) => row.id }, { key: "value", label: "Value", width: "18%", value: (row) => row.value }, { key: "usage", label: "Recommended use", width: "34%", value: (row) => row.usage }]} />
      </Page>

      <Page size="A4" style={styles.page} wrap bookmark={`${chapter(model, "responsive-layout").number} Responsive layout`}>
        <PageChrome model={model} section="Responsive layout" />
        <ChapterHero entry={chapter(model, "responsive-layout")} accent={accent} />
        {grid.profiles.filter((_, index) => index === 0 || index === Math.floor(grid.profiles.length / 2) || index === grid.profiles.length - 1).map((profile) => <GridDiagram key={profile.breakpointId} columns={profile.columns} label={profile.breakpointId} width={profile.threshold} accent={accent} />)}
        <View style={[styles.callout, { borderLeftColor: accent, backgroundColor: "#fafafa" }]}><Text>The page grid defines the shared container and alignment. A product-card grid may still use 2 columns on phone and tablet, then 4 on desktop, inside this structure.</Text></View>
      </Page>

      <Page size="A4" style={styles.page} wrap bookmark="Responsive reference">
        <PageChrome model={model} section="Responsive layout / Reference" />
        <Text style={styles.h1}>Responsive reference</Text>
        <Text style={styles.intro}>Use these shared thresholds, page edges, and gaps for consistent layout handoff. Component-specific column rules remain free to change within them.</Text>
        <Text style={styles.h2}>Content widths</Text>
        <ReferenceTable rows={grid.containers} columns={[{ key: "label", label: "Container", width: "25%", value: (row) => row.label }, { key: "token", label: "Token", width: "25%", value: (row) => row.id }, { key: "value", label: "Width", width: "18%", value: (row) => row.value }, { key: "usage", label: "Use", width: "32%", value: (row) => row.description ?? "Custom content width" }]} />
        <Text style={styles.h2}>Responsive reference</Text>
        <ReferenceTable rows={grid.profiles} columns={[{ key: "breakpoint", label: "From", width: "18%", value: (row) => `${row.breakpointId} / ${row.threshold}` }, { key: "columns", label: "Columns", width: "14%", value: (row) => String(row.columns) }, { key: "gutter", label: "Page edge", width: "23%", value: (row) => `${row.gutter.token} / ${row.gutter.value ?? "unresolved"}` }, { key: "column", label: "Column gap", width: "23%", value: (row) => `${row.columnGap.token} / ${row.columnGap.value ?? "unresolved"}` }, { key: "row", label: "Row gap", width: "22%", value: (row) => `${row.rowGap.token} / ${row.rowGap.value ?? "unresolved"}` }]} />
      </Page>

      {system.semanticTokens.length > 0 && <Page size="A4" style={styles.page} wrap bookmark={`${chapter(model, "semantic-tokens").number} Semantic tokens`}>
        <PageChrome model={model} section="Semantic tokens" />
        <ChapterHero entry={chapter(model, "semantic-tokens")} accent={accent} />
        <TokenArchitecture model={model} accent={accent} />
        {semanticGroups.map((category) => <View key={category}><Text style={styles.h2}>{text(category[0]?.toUpperCase() + category.slice(1))}</Text><View style={styles.specimenGrid}>{system.semanticTokens.filter((token) => token.category === category).map((token) => <View key={token.id} style={{ width: "50%", paddingHorizontal: 4 }}><TokenCard model={model} token={token} /></View>)}</View></View>)}
      </Page>}

      {system.themes.length > 0 && <Page size="A4" style={styles.page} wrap bookmark={`${chapter(model, "themes").number} Themes`}>
        <PageChrome model={model} section="Themes" />
        <ChapterHero entry={chapter(model, "themes")} accent={accent} />
        <View style={[styles.rowBetween, { marginBottom: 18 }]}>{system.themes.slice(0, 2).map((theme) => <ThemeCanvas key={theme.id} model={model} themeId={theme.id} label={`${theme.label} / ${theme.mode}`} />)}</View>
        <Text style={styles.h2}>Resolved role differences</Text>
        {system.themes.map((theme) => {
          const summary = themeHandoffSummary(system, theme.id)
          if (!summary) return null
          return <View key={theme.id} wrap={false}><View style={styles.rowBetween}><Text style={styles.h3}>{text(theme.label)}</Text><Text style={styles.pill}>{summary.overridden} overrides</Text></View><ReferenceTable rows={summary.roles} columns={[{ key: "role", label: "Role", width: "34%", value: (row) => row.id }, { key: "source", label: "Source", width: "30%", value: (row) => `${row.source}: ${row.reference}` }, { key: "value", label: "Resolved", width: "36%", value: (row) => row.value ?? "Unresolved" }]} /></View>
        })}
      </Page>}

      {coreComponents.length > 0 && model.chapters.some((entry) => entry.id === "components") && <Page size="A4" style={styles.page} wrap bookmark={`${chapter(model, "components").number} Components`}>
        <PageChrome model={model} section="Components" />
        <ChapterHero entry={chapter(model, "components")} accent={accent} />
        <Metrics accent={accent} items={[["Basic components", String(coreComponents.length)], ["Families", String(componentGroups.length)], ["Maturity", "Production-ready"], ["Warnings", "None"]]} />
        <Text style={styles.h2}>What is included</Text>
        <Text style={styles.paragraph}>Every component below follows shared semantic roles, so Light and Dark themes apply without rewriting component styles. Use the slots column when wiring product code to system tokens.</Text>
        {componentGroups.map((group) => (
          <View key={group.family}>
            <Text style={styles.h2}>{text(componentFamilyLabel(group.family))} ({group.entries.length})</Text>
            <ReferenceTable
              rows={group.entries}
              columns={[
                { key: "name", label: "Component", width: "28%", value: (row) => row.name },
                { key: "id", label: "Token id", width: "24%", value: (row) => row.id },
                { key: "slots", label: "Token slots", width: "48%", value: (row) => componentSlots(row.slots) },
              ]}
            />
          </View>
        ))}
      </Page>}

      <Page size="A4" style={styles.page} wrap bookmark={`${chapter(model, "system-health").number} System health`}>
        <PageChrome model={model} section="System health" />
        <ChapterHero entry={chapter(model, "system-health")} accent={accent} />
        <HealthSummary model={model} />
        <Text style={styles.h2}>Accessibility health</Text>
        {accessibilityWarnings.length ? accessibilityWarnings.map((warning) => <View key={warning.id} style={[styles.callout, { borderLeftColor: WARNING, backgroundColor: WARNING_SOFT }]} wrap={false}><Text style={[styles.h3, { color: WARNING }]}>{text(warning.title)}</Text><Text style={styles.paragraph}>{text(warning.explanation)}</Text><Text style={styles.code}>Affected: {text(warning.affected)}</Text></View>) : <View style={[styles.callout, { borderLeftColor: SUCCESS, backgroundColor: SUCCESS_SOFT }]}><Text style={[styles.h3, { color: SUCCESS }]}>No automated contrast warnings</Text><Text style={styles.paragraph}>Manual assistive-technology, zoom, keyboard, and real-content testing is still required.</Text></View>}
        <Text style={styles.h2}>Manual quality checklist</Text>
        {["Keyboard navigation and visible focus", "Screen readers and browser zoom", "Contrast with real production content", "Reduced-motion behaviour", "Phone, tablet, laptop, and wide-screen layouts"].map((item) => <Text key={item} style={styles.paragraph}>• {item}</Text>)}
      </Page>

      {appendixWarnings.length > 0 && <Page size="A4" style={styles.page} wrap bookmark="Appendix A / Validation report">
        <PageChrome model={model} section="Appendix / Validation report" />
        <Text style={styles.h1}>Appendix A{`\n`}Validation report</Text>
        <Text style={styles.intro}>Complete non-blocking findings are kept here so the main handbook remains useful as a design reference. Warnings do not prevent export.</Text>
        <View style={{ marginTop: 16 }}>
          {componentReviewWarnings.length > 0 && (
            <View wrap={false}>
              <Text style={styles.h2}>Included experiences needing review ({componentReviewWarnings.length})</Text>
              <Text style={styles.paragraph}>These premium experiences ship as needs-review in the catalog. Review them before relying on them in production. Full per-component detail lives in Review / Components.</Text>
              <ReferenceTable
                rows={componentReviewWarnings}
                columns={[
                  { key: "component", label: "Experience", width: "32%", value: (row) => row.affected },
                  { key: "gaps", label: "Open gaps", width: "68%", value: (row) => reviewGaps(row.explanation) },
                ]}
              />
            </View>
          )}
          {individualWarnings.map((warning, index) => <View key={warning.id} style={styles.warningBox} wrap={false}><View style={styles.rowBetween}><Text style={[styles.codeStrong, { color: WARNING }]}>{String(index + 1).padStart(2, "0")} / {text(warning.group)}</Text><Text style={styles.code}>{text(warning.affected)}</Text></View><Text style={[styles.h3, { marginTop: 5 }]}>{text(warning.title)}</Text><Text style={styles.paragraph}>{text(warning.explanation)}</Text><Text style={styles.code}>Path: {text(warning.path)}</Text></View>)}
        </View>
      </Page>}
    </Document>
  )
}
