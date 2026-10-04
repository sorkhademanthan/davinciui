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
  cover: { backgroundColor: INK, color: PAPER, paddingTop: 44, paddingBottom: 42, paddingHorizontal: 48 },
  coverRail: { position: "absolute", left: 0, top: 0, bottom: 0, width: 7 },
  coverTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  coverMark: { fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 1.8 },
  coverEdition: { color: QUIET, fontSize: 7, letterSpacing: 0.65 },
  coverBody: { flexGrow: 1 },
  coverHero: { marginTop: 92, maxWidth: 455 },
  coverKicker: { color: QUIET, fontSize: 7.5, letterSpacing: 0.75, marginBottom: 15 },
  coverTitle: { fontSize: 46, lineHeight: 0.94, fontFamily: "Helvetica-Bold", letterSpacing: -2.1 },
  coverTitleRule: { width: 72, height: 4, marginTop: 21, marginBottom: 18 },
  coverDescription: { color: "#d4d4d8", fontSize: 11, lineHeight: 1.55, maxWidth: 360 },
  coverProfile: { marginTop: 68, minHeight: 168, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#3f3f46", paddingVertical: 20, flexDirection: "row" },
  coverProfileColumn: { paddingHorizontal: 20, borderRightWidth: 1, borderRightColor: "#3f3f46" },
  coverProfileLabel: { color: QUIET, fontSize: 6.5, letterSpacing: 0.7, marginBottom: 12 },
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
  semanticGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  semanticCard: { width: "50%", padding: 4 },
  semanticCardInner: { minHeight: 64, borderWidth: 1, borderColor: LINE_COLOR, borderRadius: 4, padding: 9 },
  semanticSwatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: LINE_COLOR },
  semanticTableHead: { flexDirection: "row", minHeight: 22, alignItems: "center", backgroundColor: SOFT, borderTopWidth: 1, borderBottomWidth: 1, borderColor: LINE_COLOR },
  semanticTableRow: { flexDirection: "row", minHeight: 18, alignItems: "center", borderBottomWidth: 1, borderBottomColor: LINE_COLOR },
  semanticCell: { paddingVertical: 4, paddingHorizontal: 5 },
  semanticThemeCell: { flexDirection: "row", alignItems: "center" },
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

const ESSENTIAL_SEMANTIC_TOKEN_IDS = [
  "background.canvas",
  "surface.default",
  "text.primary",
  "border.default",
  "action.primary.background",
  "focus.ring",
] as const

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
    <View style={styles.coverProfile}>
      <View style={[styles.coverProfileColumn, { width: "27%", paddingLeft: 0 }]}>
        <Text style={styles.coverProfileLabel}>TYPE</Text>
        <Text style={{ fontSize: 39, lineHeight: 0.9, fontFamily: "Helvetica-Bold" }}>Aa</Text>
        <Text style={{ color: "#d4d4d8", fontSize: 8, marginTop: 10 }}>{text(system.foundations.typography.primary)}</Text>
        <Text style={{ color: QUIET, fontSize: 6.5, marginTop: 4 }}>{system.foundations.typography.styles.length} text styles</Text>
      </View>
      <View style={[styles.coverProfileColumn, { width: "46%" }]}>
        <Text style={styles.coverProfileLabel}>COLOUR AND SHAPE</Text>
        <View style={{ flexDirection: "row", marginBottom: 22 }}>
          {palettes.map((palette) => <View key={palette.id} style={{ width: 27, height: 27, marginRight: 7, borderRadius: 14, backgroundColor: safeHex(palette.base, accent) }} />)}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {radii.map((radius) => <View key={radius.id} style={{ width: 31, height: 31, marginRight: 8, borderWidth: 1, borderColor: "#71717a", borderRadius: Math.min(numberFrom(radius.value), 15) }} />)}
        </View>
      </View>
      <View style={{ width: "27%", paddingLeft: 20 }}>
        <Text style={styles.coverProfileLabel}>SYSTEM</Text>
        {[
          [String(system.semanticTokens.length), "semantic roles"],
          [String(system.themes.length), "themes"],
          [String(system.foundations.breakpoints.scale.length), "breakpoints"],
        ].map(([value, label]) => <View key={label} style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 12 }}><Text style={{ width: 30, color: accent, fontSize: 15, fontFamily: "Helvetica-Bold" }}>{value}</Text><Text style={{ color: "#d4d4d8", fontSize: 7 }}>{label}</Text></View>)}
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

function resolvedSemanticValue(model: DesignSystemExportModel, token: SemanticToken, themeId: string): string {
  const result = resolveToken(model.system, token.id, themeId)
  return result.status === "resolved" ? result.value : "Unresolved"
}

function semanticCategoryLabel(category: string): string {
  return category
    .split(/[.-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ")
}

function SemanticRoleCard({ model, token }: { model: DesignSystemExportModel; token: SemanticToken }) {
  const lightValue = resolvedSemanticValue(model, token, "light")
  const darkValue = resolvedSemanticValue(model, token, "dark")
  return (
    <View style={styles.semanticCard} wrap={false}>
      <View style={styles.semanticCardInner}>
        <View style={styles.rowBetween}>
          <View style={{ width: "68%" }}><Text style={styles.h3}>{text(token.label)}</Text><Text style={styles.code}>{text(token.id)}</Text></View>
          <Text style={styles.pill}>{text(semanticCategoryLabel(token.category))}</Text>
        </View>
        <View style={[styles.row, { marginTop: 10 }]}>
          <View style={[styles.semanticThemeCell, { width: "50%" }]}><View style={[styles.semanticSwatch, { backgroundColor: safeHex(lightValue) }]} /><View style={{ marginLeft: 6 }}><Text style={styles.label}>LIGHT</Text><Text style={styles.code}>{text(lightValue)}</Text></View></View>
          <View style={[styles.semanticThemeCell, { width: "50%" }]}><View style={[styles.semanticSwatch, { backgroundColor: safeHex(darkValue, INK) }]} /><View style={{ marginLeft: 6 }}><Text style={styles.label}>DARK</Text><Text style={styles.code}>{text(darkValue)}</Text></View></View>
        </View>
      </View>
    </View>
  )
}

function SemanticReferenceTable({ model, tokens }: { model: DesignSystemExportModel; tokens: SemanticToken[] }) {
  return (
    <View style={[styles.table, { marginTop: 16 }]}>
      <View style={styles.semanticTableHead} fixed>
        <Text style={[styles.cell, styles.cellStrong, { width: "14%" }]}>Category</Text>
        <Text style={[styles.cell, styles.cellStrong, { width: "31%" }]}>Role</Text>
        <Text style={[styles.cell, styles.cellStrong, { width: "15%" }]}>Light</Text>
        <Text style={[styles.cell, styles.cellStrong, { width: "15%" }]}>Dark</Text>
        <Text style={[styles.cell, styles.cellStrong, { width: "25%" }]}>Source</Text>
      </View>
      {tokens.map((token, index) => {
        const lightValue = resolvedSemanticValue(model, token, "light")
        const darkValue = resolvedSemanticValue(model, token, "dark")
        const startsCategory = index === 0 || tokens[index - 1]?.category !== token.category
        return <View key={token.id} style={[styles.semanticTableRow, startsCategory ? { borderTopWidth: 1, borderTopColor: INK } : {}]} wrap={false}>
          <Text style={[styles.cell, styles.semanticCell, startsCategory ? styles.cellStrong : styles.cellMuted, { width: "14%", fontSize: 5.8 }]}>{startsCategory ? text(semanticCategoryLabel(token.category)) : ""}</Text>
          <Text style={[styles.cell, styles.semanticCell, styles.codeStrong, { width: "31%", fontSize: 6.1 }]}>{text(token.id)}</Text>
          <View style={[styles.cell, styles.semanticCell, styles.semanticThemeCell, { width: "15%" }]}><View style={[styles.semanticSwatch, { width: 9, height: 9, borderRadius: 5, backgroundColor: safeHex(lightValue) }]} /><Text style={[styles.code, { fontSize: 5.4, marginLeft: 3 }]}>{text(lightValue)}</Text></View>
          <View style={[styles.cell, styles.semanticCell, styles.semanticThemeCell, { width: "15%" }]}><View style={[styles.semanticSwatch, { width: 9, height: 9, borderRadius: 5, backgroundColor: safeHex(darkValue, INK) }]} /><Text style={[styles.code, { fontSize: 5.4, marginLeft: 3 }]}>{text(darkValue)}</Text></View>
          <Text style={[styles.cell, styles.semanticCell, styles.code, { width: "25%", fontSize: 5.4 }]}>{text(token.value)}</Text>
        </View>
      })}
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
  const groupRows = model.report.groups.map((group) => ({ label: group.title }))
  return (
    <>
      <View style={[styles.rowBetween, { marginBottom: 22 }]}>
        <View style={[styles.healthMetric, { borderTopColor: SUCCESS }]}><Text style={[styles.healthValue, { color: SUCCESS }]}>{model.report.summary.passed}</Text><Text style={styles.healthLabel}>Checks passed</Text></View>
        <View style={[styles.healthMetric, { borderTopColor: INK }]}><Text style={styles.healthValue}>{model.report.groups.length}</Text><Text style={styles.healthLabel}>Areas reviewed</Text></View>
        <View style={[styles.healthMetric, { borderTopColor: DANGER }]}><Text style={[styles.healthValue, { color: DANGER }]}>0</Text><Text style={styles.healthLabel}>Blocking errors</Text></View>
      </View>
      <Text style={styles.h2}>Coverage included</Text>
      {groupRows.map((row) => (
        <View key={row.label} style={styles.coverageRow}>
          <Text style={styles.coverageLabel}>{text(row.label)}</Text>
          <View style={styles.coverageTrack}><View style={{ width: "100%", height: 7, backgroundColor: SUCCESS }} /></View>
          <Text style={styles.coverageValue}>Checked</Text>
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
  const semanticTokensForReference = semanticGroups.flatMap((category) =>
    system.semanticTokens.filter((token) => token.category === category),
  )
  const semanticReferencePageCount = Math.ceil(semanticTokensForReference.length / 18)
  const semanticReferencePageSize = Math.ceil(semanticTokensForReference.length / Math.max(semanticReferencePageCount, 1))
  const semanticReferencePages = Array.from(
    { length: semanticReferencePageCount },
    (_, index) => semanticTokensForReference.slice(index * semanticReferencePageSize, index * semanticReferencePageSize + semanticReferencePageSize),
  )
  const essentialSemanticTokens = ESSENTIAL_SEMANTIC_TOKEN_IDS
    .map((id) => system.semanticTokens.find((token) => token.id === id))
    .filter((token): token is SemanticToken => Boolean(token))
  const enabledPalettes = system.foundations.colors.palettes.filter((palette) => palette.enabled)
  const durations = system.foundations.motion.durations.filter((item) => item.enabled !== false)
  const easings = system.foundations.motion.easings.filter((item) => item.enabled !== false)
  const coverTitleSize = system.meta.name.length > 26 ? 34 : system.meta.name.length > 18 ? 39 : 46
  const coreComponents = includedEntries(system, "core")
  const componentGroups = COMPONENT_FAMILY_ORDER.map((family) => ({
    family,
    entries: coreComponents.filter((entry) => entry.family === family),
  })).filter((group) => group.entries.length > 0)
  return (
    <Document title={`${text(system.meta.name)} design system`} author={text(system.meta.team || system.meta.brand || "DavinciUI")} subject="Design-system handbook and technical reference" creator="DavinciUI Design System Builder">
      <Page size="A4" style={styles.cover} bookmark="Cover">
        <View style={[styles.coverRail, { backgroundColor: accent }]} fixed />
        <View style={styles.coverTop}><Text style={styles.coverMark}>DAVINCIUI</Text><Text style={styles.coverEdition}>DESIGN SYSTEM HANDBOOK / {text(system.meta.version)}</Text></View>
        <View style={styles.coverBody}>
          <View style={styles.coverHero}>
            <Text style={styles.coverKicker}>PRODUCT FOUNDATION / {displayDate(model.generatedAt).toUpperCase()}</Text>
            <Text style={[styles.coverTitle, { fontSize: coverTitleSize }]}>{text(system.meta.name)}</Text>
            <Text style={[styles.coverTitle, { fontSize: coverTitleSize }]}>Design system</Text>
            <View style={[styles.coverTitleRule, { backgroundColor: accent }]} />
            <Text style={styles.coverDescription}>{text(system.meta.description || "A practical foundation for building consistent, accessible, and recognizable digital experiences.")}</Text>
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
        <View style={[styles.row, { marginTop: 8, marginBottom: 2 }]}><Text style={styles.pill}>{system.semanticTokens.length} roles</Text><Text style={[styles.pill, { marginLeft: 6 }]}>{semanticGroups.length} categories</Text><Text style={[styles.pill, { marginLeft: 6 }]}>{system.themes.length} themes</Text></View>
        <Text style={styles.h2}>Essential interface roles</Text>
        <Text style={styles.paragraph}>Start here. These shared roles establish the page, surface, text, border, primary action, and keyboard-focus language used throughout the product.</Text>
        <View style={styles.semanticGrid}>{essentialSemanticTokens.map((token) => <SemanticRoleCard key={token.id} model={model} token={token} />)}</View>
      </Page>}

      {semanticReferencePages.map((tokens, index) => <Page key={`semantic-reference-${index}`} size="A4" style={styles.page} wrap bookmark={index === 0 ? "Semantic token reference" : undefined}>
        <PageChrome model={model} section="Semantic tokens / Reference" />
        <Text style={styles.h1}>{index === 0 ? "Semantic token reference" : `Semantic token reference / ${index + 1}`}</Text>
        <Text style={styles.intro}>{index === 0 ? "Roles are grouped by purpose. Use the stable role id in product code; Light and Dark show the final resolved colour, while Source identifies the stored foundation reference or alias." : "Continued reference values, kept in the same category-first order for fast implementation lookup."}</Text>
        <SemanticReferenceTable model={model} tokens={tokens} />
      </Page>)}

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
        <Metrics accent={accent} items={[["Basic components", String(coreComponents.length)], ["Families", String(componentGroups.length)], ["Maturity", "Production-ready"], ["System link", "Token-driven"]]} />
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
        <Text style={styles.h2}>Accessibility review</Text>
        <View style={[styles.callout, { borderLeftColor: SUCCESS, backgroundColor: SUCCESS_SOFT }]}><Text style={[styles.h3, { color: SUCCESS }]}>Manual verification remains essential</Text><Text style={styles.paragraph}>Test the finished product with assistive technology, browser zoom, keyboard navigation, real content, and every supported theme.</Text></View>
        <Text style={styles.h2}>Manual quality checklist</Text>
        {["Keyboard navigation and visible focus", "Screen readers and browser zoom", "Contrast with real production content", "Reduced-motion behaviour", "Phone, tablet, laptop, and wide-screen layouts"].map((item) => <Text key={item} style={styles.paragraph}>• {item}</Text>)}
      </Page>

    </Document>
  )
}
