"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  configEquals,
  usePlaygroundStore,
} from "@/hooks/use-playground-store";
import {
  useGenericPlaygroundConfig,
  useGenericPlaygroundStore,
  type GenericPlaygroundConfig,
  type PlaygroundValue,
} from "@/hooks/use-generic-playground-store";
import {
  PlaygroundColorPicker,
  PlaygroundInput,
  PlaygroundSectionTitle,
  PlaygroundSelect,
  PlaygroundSlider,
  PlaygroundSwitch,
  PlaygroundTextArea,
} from "@/components/playground-primitives";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FieldBase {
  /** Prop name on the component (or arbitrary key when `propsFromConfig`). */
  key: string;
  label: string;
  /** Groups controls under a heading. Defaults to "Options". */
  section?: string;
  /** Hide this field from the generated code snippet. */
  hideInCode?: boolean;
}

export type PlaygroundField =
  | (FieldBase & {
      type: "slider";
      min: number;
      max: number;
      step: number;
      unit?: string;
    })
  | (FieldBase & { type: "switch" })
  | (FieldBase & { type: "color" })
  | (FieldBase & {
      type: "text";
      placeholder?: string;
      maxLength?: number;
    })
  | (FieldBase & { type: "textarea"; placeholder?: string })
  | (FieldBase & {
      type: "select";
      options: { label: string; value: string }[];
    });

export interface PlaygroundPreset<T extends GenericPlaygroundConfig> {
  name: string;
  config: T;
}

export interface PlaygroundDefinition<T extends GenericPlaygroundConfig> {
  slug: string;
  component: React.ComponentType<Record<string, unknown>>;
  /** Imported symbol in the generated usage snippet. */
  componentName: string;
  /** Defaults to `@/components/ui/<slug>`. */
  importPath?: string;
  defaults: T;
  fields: PlaygroundField[];
  presets?: PlaygroundPreset<T>[];
  /** Extra props applied to the component but never edited. */
  fixedProps?: Record<string, unknown>;
  /** Props applied only to the rendered component (not the code snippet). */
  renderProps?: Record<string, unknown>;
  elementClassName?: string;
  stageClassName?: string;
  /** Raw import lines to add above the generated snippet. */
  codeImportExtra?: string;
  /** Raw prop lines to add to the generated snippet. */
  codeExtras?: string;
  /** Child content rendered inside the generated snippet element. */
  codeChildren?: string;
  /** Swatch key used by preset buttons. */
  presetSwatch?: keyof T & string;
  intro?: string;
  /** Full override for the rendered subtree. */
  render?: (config: T, renderVersion: number) => React.ReactNode;
  /** Map live config to component props. Defaults to the config itself. */
  propsFromConfig?: (config: T) => Record<string, unknown>;
  /** Full override for the generated usage snippet. */
  code?: (config: T) => string;
  /** Render the component inside an iframe instead of in-page. */
  iframeSrc?: (config: T) => string;
  /** Accessible title for the iframe preview. */
  iframeTitle?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Code generation
// ─────────────────────────────────────────────────────────────────────────────

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function IframePreview({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const debouncedSrc = useDebouncedValue(src, 250);
  return (
    <iframe
      src={debouncedSrc}
      title={title}
      className="h-full w-full border-0"
    />
  );
}

function formatPropValue(value: PlaygroundValue): string {
  if (typeof value === "string") return JSON.stringify(value);
  return `{${String(value)}}`;
}

function buildDefaultCode<T extends GenericPlaygroundConfig>(
  definition: PlaygroundDefinition<T>,
  config: T,
): string {
  if (definition.code) return definition.code(config);

  const importPath =
    definition.importPath ?? `@/components/ui/${definition.slug}`;
  const props = definition.fields
    .filter((field) => !field.hideInCode)
    .map(
      (field) =>
        `  ${field.key}=${formatPropValue(config[field.key] ?? "")}`,
    );

  const extras = definition.codeExtras?.trim();
  if (extras) props.push(extras);

  if (definition.elementClassName) {
    props.push(`  className=${JSON.stringify(definition.elementClassName)}`);
  }

  const imports = [
    `import { ${definition.componentName} } from "${importPath}"`,
    definition.codeImportExtra?.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  if (props.length === 0 && !definition.codeChildren) {
    return `${imports}

<${definition.componentName} />`;
  }

  if (definition.codeChildren) {
    return `${imports}

<${definition.componentName}
${props.join("\n")}
>
  ${definition.codeChildren}
</${definition.componentName}>`;
  }

  return `${imports}

<${definition.componentName}
${props.join("\n")}
/>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

export function createComponentPlayground<T extends GenericPlaygroundConfig>(
  definition: PlaygroundDefinition<T>,
) {
  const { slug, defaults } = definition;

  useGenericPlaygroundStore
    .getState()
    .registerDefaults(slug, defaults, {
      activePreset: definition.presets?.[0]?.name,
    });

  function Preview({
    extraProps,
    className,
  }: {
    extraProps?: Record<string, unknown>;
    className?: string;
  } = {}) {
    const config = useGenericPlaygroundConfig(slug, defaults);
    const renderVersion = useGenericPlaygroundStore(
      (state) => state.renderVersions[slug] ?? 0,
    );

    React.useEffect(() => {
      const timer = window.setTimeout(() => {
        const api = usePlaygroundStore.getState();
        api.registerPreviewReset(slug, () => {
          useGenericPlaygroundStore.getState().reset(slug);
        });
        api.setPersonalizedCode(
          slug,
          buildDefaultCode(definition, config),
          !configEquals(config, defaults),
        );
      }, 180);
      return () => window.clearTimeout(timer);
    }, [config]);

    const Component = definition.component;
    const mappedProps = definition.propsFromConfig
      ? definition.propsFromConfig(config)
      : ({ ...config } as Record<string, unknown>);

    return (
      <div
        className={cn(
          "relative h-full min-h-[420px] w-full overflow-hidden",
          definition.stageClassName,
          className,
        )}
      >
        {definition.iframeSrc ? (
          <IframePreview
            src={definition.iframeSrc(config)}
            title={definition.iframeTitle ?? definition.componentName}
          />
        ) : definition.render ? (
          definition.render(config, renderVersion)
        ) : (
          <Component
            key={renderVersion}
            {...definition.fixedProps}
            {...definition.renderProps}
            {...extraProps}
            {...mappedProps}
            {...(definition.elementClassName
              ? { className: definition.elementClassName }
              : {})}
          />
        )}
      </div>
    );
  }

  function PersonalizePanel() {
    const config = useGenericPlaygroundConfig(slug, defaults);
    const activePreset = useGenericPlaygroundStore(
      (state) => state.activePresets[slug] ?? "Default",
    );

    const update = React.useCallback(
      (key: string, value: PlaygroundValue) => {
        const store = useGenericPlaygroundStore.getState();
        store.updateConfig(slug, { [key]: value });
        const next = { ...store.configs[slug], [key]: value } as T;
        const matched = definition.presets?.find((preset) =>
          configEquals(preset.config, next),
        );
        store.setActivePreset(slug, matched?.name ?? "Custom");
      },
      [],
    );

    const handlePreset = (preset: PlaygroundPreset<T>) => {
      const store = useGenericPlaygroundStore.getState();
      store.setConfig(slug, { ...preset.config });
      store.setActivePreset(slug, preset.name);
      store.bumpRenderVersion(slug);
    };

    const sections: { title: string; fields: PlaygroundField[] }[] = [];
    for (const field of definition.fields) {
      const title = field.section ?? "Options";
      const existing = sections.find((section) => section.title === title);
      if (existing) existing.fields.push(field);
      else sections.push({ title, fields: [field] });
    }

    return (
      <div className="h-full overflow-auto bg-background [scrollbar-width:thin]">
        <div className="space-y-6 px-4 pb-10 pt-5">
          <header className="space-y-2">
            <p className="text-sm leading-relaxed text-muted-foreground/90">
              {definition.intro ??
                "Personalize this component. Changes update the preview and the usage snippet live."}
            </p>
          </header>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground/90">
              Current preset:{" "}
              <span className="font-mono text-foreground">{activePreset}</span>
            </div>
            <button
              type="button"
              onClick={() => useGenericPlaygroundStore.getState().reset(slug)}
              className="rounded-md border border-border/40 bg-white/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground dark:bg-white/[0.03]"
            >
              Reset
            </button>
          </div>

          {definition.presets?.length ? (
            <div>
              <PlaygroundSectionTitle>Presets</PlaygroundSectionTitle>
              <div className="grid grid-cols-4 gap-1.5">
                {definition.presets.map((preset) => {
                  const swatch = definition.presetSwatch
                    ? String(preset.config[definition.presetSwatch] ?? "")
                    : "";
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handlePreset(preset)}
                      className={cn(
                        "rounded-md border p-1.5 text-center transition-colors",
                        activePreset === preset.name
                          ? "border-zinc-500/70 bg-zinc-100 dark:border-zinc-500/80 dark:bg-zinc-900/70"
                          : "border-border/70 bg-transparent",
                      )}
                    >
                      <div
                        className="mb-1.5 h-4 rounded-sm border border-white/20"
                        style={{
                          background: swatch || "var(--muted)",
                        }}
                      />
                      <span className="block truncate font-mono text-[10px] uppercase tracking-widest text-foreground/90">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {sections.map((section) => (
            <div key={section.title}>
              <PlaygroundSectionTitle>{section.title}</PlaygroundSectionTitle>
              <div className="grid grid-cols-1 gap-4">
                {section.fields.map((field) => (
                  <FieldControl
                    key={field.key}
                    field={field}
                    value={config[field.key]}
                    onChange={(value) => update(field.key, value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return { Preview, PersonalizePanel };
}

// ─────────────────────────────────────────────────────────────────────────────
// Field renderer
// ─────────────────────────────────────────────────────────────────────────────

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: PlaygroundField;
  value: PlaygroundValue | undefined;
  onChange: (value: PlaygroundValue) => void;
}) {
  switch (field.type) {
    case "slider":
      return (
        <PlaygroundSlider
          label={field.label}
          min={field.min}
          max={field.max}
          step={field.step}
          value={typeof value === "number" ? value : field.min}
          onChange={onChange}
          unit={field.unit}
        />
      );
    case "switch":
      return (
        <PlaygroundSwitch
          label={field.label}
          checked={Boolean(value)}
          onChange={onChange}
        />
      );
    case "color":
      return (
        <PlaygroundColorPicker
          label={field.label}
          value={typeof value === "string" ? value : "#000000"}
          onChange={onChange}
        />
      );
    case "select":
      return (
        <PlaygroundSelect
          label={field.label}
          value={typeof value === "string" ? value : field.options[0]?.value ?? ""}
          options={field.options}
          onChange={onChange}
        />
      );
    case "textarea":
      return (
        <PlaygroundTextArea
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
        />
      );
    case "text":
    default:
      return (
        <PlaygroundInput
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          maxLength={field.type === "text" ? field.maxLength : undefined}
        />
      );
  }
}
