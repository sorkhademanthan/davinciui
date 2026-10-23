export interface DocsLink {
  title: string;
  href: string;
}

export interface DocsToken {
  name: string;
  default?: string;
  description: string;
}

export interface DocsCustomization {
  note?: string;
  cssVars?: DocsToken[];
  dataAttrs?: DocsToken[];
  slots?: string[];
}

export interface DocsComposition {
  description?: string;
  tree: string;
}

export interface DocsChangelogEntry {
  version: string;
  date: string;
  change: string;
}

export interface DocsContent {
  composition?: DocsComposition;
  accessibility?: string;
  motion?: string;
  customization?: DocsCustomization;
  constraints?: string[];
  related?: DocsLink[];
  changelog?: DocsChangelogEntry[];
}

export type DocsContentMap = Record<string, DocsContent>;
