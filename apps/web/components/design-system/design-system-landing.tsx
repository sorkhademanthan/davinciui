"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  FolderOpen,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import type { DesignSystemConfig } from "@/lib/design-system/domain";
import { browserDesignSystems } from "@/lib/design-system/repository";

export function DesignSystemLanding() {
  const [systems, setSystems] = useState<DesignSystemConfig[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DesignSystemConfig | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSystems(browserDesignSystems.list());
    return browserDesignSystems.subscribe(() => setSystems(browserDesignSystems.list()));
  }, []);

  const duplicate = (system: DesignSystemConfig) => {
    const result = browserDesignSystems.duplicate(system.id);
    if (result.ok) setSystems(browserDesignSystems.list());
  };

  const requestRemove = (system: DesignSystemConfig) => {
    setDeleteError(null);
    setDeleteNotice(null);
    setDeleteTarget(system);
  };

  const confirmRemove = () => {
    if (!deleteTarget) return;

    const removedName = deleteTarget.meta.name;
    const result = browserDesignSystems.remove(deleteTarget.id);
    setDeleteTarget(null);

    if (!result.removed) {
      setDeleteError(
        `${removedName} could not be deleted. Reload the page and try again.`,
      );
      setSystems(browserDesignSystems.list());
      return;
    }

    setSystems(browserDesignSystems.list());
    setDeleteError(null);
    setDeleteNotice(`${removedName} was deleted from this browser.`);
  };

  const handleImportFile = (file: File | undefined) => {
    if (!file || importing) return;
    setImporting(true);
    setImportMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = browserDesignSystems.importRaw(reader.result);
        setSystems(browserDesignSystems.list());
        if (result.imported > 0) {
          const extras = [
            result.skipped > 0 ? `${result.skipped} skipped` : null,
            result.incompatible > 0 ? `${result.incompatible} incompatible` : null,
          ].filter(Boolean);
          setImportMessage({
            ok: true,
            text: `Imported ${result.imported} system${result.imported === 1 ? "" : "s"}${extras.length > 0 ? ` (${extras.join(", ")})` : ""}. ${result.warnings[0] ?? "It appears below."}`,
          });
        } else {
          setImportMessage({
            ok: false,
            text: result.warnings[0] ?? "That file does not contain an importable design system.",
          });
        }
      } catch {
        setImportMessage({ ok: false, text: "Could not read that file. Export a fresh Tokens JSON and try again." });
      } finally {
        setImporting(false);
      }
    };
    reader.onerror = () => {
      setImportMessage({ ok: false, text: "Could not read that file. Export a fresh Tokens JSON and try again." });
      setImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <main className="min-h-[calc(100svh-4.5rem)] min-w-0 px-[15px] py-[29px] sm:px-[27px] sm:py-[37px] lg:px-[35px]">
      <div className="w-full">
        <header>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            <Link
              href="/"
              className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Home
            </Link>
            <ChevronRight aria-hidden="true" className="size-3.5" />
            <span className="text-foreground">Design System</span>
          </nav>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Design systems
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Define the foundations, tokens, and themes behind your product.
              </p>
            </div>
            {systems.length > 0 && (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                >
                  <Upload aria-hidden="true" className="size-4" />
                  {importing ? "Importing…" : "Import"}
                </button>
                <Link
                  href="/design-system/new"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  New system
                </Link>
              </div>
            )}
          </div>
        </header>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          aria-label="Import a design system JSON file"
          className="sr-only"
          onChange={(event) => {
            handleImportFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {importMessage && (
          <p
            role={importMessage.ok ? "status" : "alert"}
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${importMessage.ok ? "border-emerald-500/25 bg-emerald-500/10 text-foreground" : "border-destructive/30 bg-destructive/10 text-destructive"}`}
          >
            {importMessage.text}
          </p>
        )}

        {systems.length > 0 ? (
          <SystemsSection
            systems={systems}
            duplicate={duplicate}
            remove={requestRemove}
            deleteError={deleteError}
            deleteNotice={deleteNotice}
          />
        ) : (
          <EmptyState onImport={() => fileInputRef.current?.click()} importing={importing} />
        )}
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="mx-4 w-[calc(100%-2rem)] max-w-md rounded-2xl p-0">
          <AlertDialogHeader className="space-y-0 p-6 text-left">
            <span className="mb-4 grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 aria-hidden="true" className="size-5" />
            </span>
            <AlertDialogTitle className="text-xl tracking-[-0.02em]">
              Delete {deleteTarget?.meta.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 leading-6">
              This permanently removes the design system and its saved
              foundations from this browser. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 border-t border-border bg-muted/30 p-4 sm:space-x-0">
            <AlertDialogCancel
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="min-h-11"
            >
              Keep system
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={confirmRemove}
              className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete system
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function EmptyState({ onImport, importing }: { onImport: () => void; importing: boolean }) {
  return (
    <section
      className="mt-9 rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-14 text-center sm:px-8 sm:py-20"
      aria-labelledby="start-heading"
    >
      <div className="mx-auto max-w-md">
        <span className="mx-auto grid size-11 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
          <FolderOpen aria-hidden="true" className="size-5" />
        </span>
        <h2
          id="start-heading"
          className="mt-5 text-balance text-2xl font-semibold tracking-[-0.03em]"
        >
          No design systems yet
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Name a system, choose Blank or Minimal, and begin directly with its
          foundations. Systems stay in this browser.
        </p>
        <Link
          href="/design-system/new"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Create design system
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <div className="mt-3">
          <button
            type="button"
            onClick={onImport}
            disabled={importing}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
          >
            <Upload aria-hidden="true" className="size-4" />
            {importing ? "Importing…" : "or import a Tokens JSON"}
          </button>
        </div>
      </div>
    </section>
  );
}

function SystemsSection({
  systems,
  duplicate,
  remove,
  deleteError,
  deleteNotice,
}: {
  systems: DesignSystemConfig[];
  duplicate: (system: DesignSystemConfig) => void;
  remove: (system: DesignSystemConfig) => void;
  deleteError: string | null;
  deleteNotice: string | null;
}) {
  return (
    <section className="mt-9" aria-labelledby="systems-heading">
      <div className="flex items-end justify-between border-b border-border pb-4">
        <div>
          <h2
            id="systems-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Your systems
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stored locally in this browser.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {systems.length} total
        </span>
      </div>
      {deleteError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {deleteError}
        </p>
      )}
      {deleteNotice && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-foreground"
        >
          {deleteNotice}
        </p>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {systems.map((system) => (
          <article
            key={system.id}
            className="rounded-xl border border-border p-5 transition-colors hover:border-foreground/40"
          >
            <div className="flex items-start justify-between">
              <span
                className="size-9 rounded-lg border border-white/10"
                style={{ background: system.foundations.colors.palettes[0]?.base }}
              />
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Check aria-hidden="true" className="size-3 text-emerald-500" />
                Draft
              </span>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              {system.meta.brand || "DavinciUI"}
            </p>
            <h3 className="mt-1 font-medium">{system.meta.name}</h3>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
              {system.meta.description ||
                "A configurable visual language for your product."}
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
              <Link
                href={`/design-system/${system.id}/colors`}
                className="inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FolderOpen aria-hidden="true" className="size-4" />
                Open system
              </Link>
              <span className="flex gap-1">
                <button
                  type="button"
                  aria-label={`Duplicate ${system.meta.name}`}
                  onClick={() => duplicate(system)}
                  className="grid size-10 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Copy aria-hidden="true" className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${system.meta.name}`}
                  onClick={() => remove(system)}
                  className="grid size-10 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
