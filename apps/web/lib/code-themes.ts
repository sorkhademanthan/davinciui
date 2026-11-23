import type { ThemeRegistrationRaw } from "shiki"

type CodeThemeColors = {
  bg: string
  fg: string
  keyword: string
  string: string
  comment: string
  constant: string
  fn: string
}

const make = (
  name: string,
  type: "light" | "dark",
  c: CodeThemeColors,
): ThemeRegistrationRaw => ({
  name,
  type,
  colors: {
    "editor.background": c.bg,
    "editor.foreground": c.fg,
  },
  settings: [],
  tokenColors: [
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.operator.logical",
      ],
      settings: { foreground: c.keyword },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "punctuation.definition.string",
      ],
      settings: { foreground: c.string },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: c.comment, fontStyle: "" },
    },
    {
      scope: [
        "constant.language",
        "constant.numeric",
        "constant.language.boolean",
        "support.constant",
        "variable.other.constant",
      ],
      settings: { foreground: c.constant },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call",
        "variable.function",
      ],
      settings: { foreground: c.fn },
    },
    {
      scope: [
        "variable",
        "variable.other",
        "variable.parameter",
        "meta.object-literal.key",
        "punctuation",
        "meta.brace",
        "meta.delimiter",
        "source",
      ],
      settings: { foreground: c.fg },
    },
    {
      scope: ["entity.name.tag", "support.class.component"],
      settings: { foreground: c.keyword },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: c.fn },
    },
  ],
})

export const dvLight = make("dv-light", "light", {
  bg: "#ffffff",
  fg: "#1f2328",
  keyword: "#cf222e",
  string: "#0a3069",
  comment: "#6e7781",
  constant: "#cf222e",
  fn: "#8250df",
})

export const dvDark = make("dv-dark", "dark", {
  bg: "#0b0c0d",
  fg: "#e6e6e6",
  keyword: "#c792ea",
  string: "#e8a07a",
  comment: "#78a05a",
  constant: "#7cb7ff",
  fn: "#82aaff",
})
