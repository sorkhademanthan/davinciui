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
  CustomizePanel,
  type CustomizeControl,
  type CustomizeControlValue,
} from "@/components/customize-panel";

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

  const controls: CustomizeControl[] = definition.fields.map((field) => {
    const base = {
      key: field.key,
      label: field.label,
      group: field.section,
    };
    switch (field.type) {
      case "slider":
        return {
          ...base,
          type: "slider" as const,
          min: field.min,
          max: field.max,
          step: field.step,
          unit: field.unit,
        };
      case "switch":
        return { ...base, type: "toggle" as const };
      case "color":
        return { ...base, type: "color" as const };
      case "select":
        return { ...base, type: "select" as const, options: field.options };
      case "textarea":
        return {
          ...base,
          type: "textarea" as const,
          placeholder: field.placeholder,
        };
      case "text":
      default:
        return {
          ...base,
          type: "text" as const,
          placeholder: field.placeholder,
          maxLength: field.maxLength,
        };
    }
  });

  function PersonalizePanel() {
    const config = useGenericPlaygroundConfig(slug, defaults);
    const activePreset = useGenericPlaygroundStore(
      (state) => state.activePresets[slug] ?? "Default",
    );

    const update = React.useCallback((key: string, value: CustomizeControlValue) => {
      const store = useGenericPlaygroundStore.getState();
      const next = {
        ...(store.configs[slug] ?? defaults),
        [key]: value,
      } as T;
      store.updateConfig(slug, { [key]: value });
      const matched = definition.presets?.find((preset) =>
        configEquals(preset.config, next),
      );
      store.setActivePreset(slug, matched?.name ?? "Custom");
    }, []);

    const handlePreset = (name: string) => {
      const preset = definition.presets?.find((candidate) => candidate.name === name);
      if (!preset) return;
      const store = useGenericPlaygroundStore.getState();
      store.setConfig(slug, { ...preset.config });
      store.setActivePreset(slug, preset.name);
      store.bumpRenderVersion(slug);
    };

    return (
      <CustomizePanel
        slug={slug}
        controls={controls}
        values={config}
        defaults={defaults}
        onChange={update}
        onReset={() => usePlaygroundStore.getState().resetPreview(slug)}
        presets={definition.presets?.map((preset) => ({
          label: preset.name,
          value: preset.name,
        }))}
        activePreset={activePreset}
        onPresetChange={handlePreset}
      />
    );
  }

  return { Preview, PersonalizePanel };
}
