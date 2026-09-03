"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowUp, ArrowDown, ArrowUpDown, GripVertical, Plus, Trash2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";
export type SortState = { key: string; direction: SortDirection };
export type InsertPosition = "before" | "after";

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string | number;
  minWidth?: number;
  align?: "left" | "center" | "right";
  cell?: (row: T, index: number) => React.ReactNode;
  editable?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  getRowId?: (row: T, index: number) => string;
  selectable?: boolean;
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  resizable?: boolean;
  minColumnWidth?: number;
  onColumnResize?: (key: string, width: number) => void;
  reorderable?: boolean;
  onColumnOrderChange?: (keys: string[]) => void;
  onCellEdit?: (rowId: string, columnKey: string, value: string) => void;
  onColumnRename?: (columnKey: string, value: string) => void;
  onInsertRow?: (index: number, position: InsertPosition) => void;
  onDeleteRow?: (rowId: string, index: number) => void;
  onInsertColumn?: (index: number, position: InsertPosition) => void;
  onDeleteColumn?: (columnKey: string, index: number) => void;
  rowHeight?: number;
  height?: number;
  overscan?: number;
  onEndReached?: () => void;
  loading?: boolean;
  skeletonRows?: number;
  emptyState?: React.ReactNode;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseWidth(value: string | number | undefined, fallback: number): number {
  if (value == null) return fallback;
  if (typeof value === "number") return value;
  if (value.endsWith("px")) return parseFloat(value);
  if (value.endsWith("fr")) return fallback * parseFloat(value);
  const n = parseFloat(value);
  return Number.isNaN(n) ? fallback : n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function Table<T extends Record<string, unknown>>({
  data,
  columns: columnsProp,
  getRowId,
  selectable,
  selectedRowIds: controlledSelected,
  defaultSelectedRowIds = [],
  onSelectionChange,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  resizable,
  minColumnWidth = 64,
  onColumnResize,
  reorderable,
  onColumnOrderChange,
  onCellEdit,
  onColumnRename,
  onInsertRow,
  onDeleteRow,
  onInsertColumn,
  onDeleteColumn,
  rowHeight = 48,
  height = 440,
  overscan = 10,
  onEndReached,
  loading,
  skeletonRows = 3,
  emptyState,
  className,
}: TableProps<T>) {
  const [internalSort, setInternalSort] = React.useState<SortState | null>(defaultSort);
  const sort = controlledSort !== undefined ? controlledSort : internalSort;

  const [internalSelected, setInternalSelected] = React.useState<string[]>(defaultSelectedRowIds);
  const selectedIds = controlledSelected !== undefined ? controlledSelected : internalSelected;

  const [columnOrder, setColumnOrder] = React.useState<string[]>(() => columnsProp.map((c) => c.key));
  const [widths, setWidths] = React.useState<Record<string, number>>({});
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; key: string } | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [renamingKey, setRenamingKey] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [dragKey, setDragKey] = React.useState<string | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync order when columns prop changes
  React.useEffect(() => {
    setColumnOrder((prev) => {
      const keys = columnsProp.map((c) => c.key);
      const missing = keys.filter((k) => !prev.includes(k));
      const extra = prev.filter((k) => !keys.includes(k));
      if (missing.length || extra.length) return keys;
      return prev;
    });
  }, [columnsProp]);

  const columnMap = React.useMemo(() => {
    const m = new Map<string, TableColumn<T>>();
    for (const c of columnsProp) m.set(c.key, c);
    return m;
  }, [columnsProp]);

  const orderedColumns = React.useMemo(
    () => columnOrder.map((k) => columnMap.get(k)).filter(Boolean) as TableColumn<T>[],
    [columnOrder, columnMap],
  );

  const getId = React.useCallback(
    (row: T, idx: number) => (getRowId ? getRowId(row, idx) : String((row as { id?: string }).id ?? idx)),
    [getRowId],
  );

  // Sorting
  const sortedData = React.useMemo(() => {
    if (!sort) return data;
    const col = columnMap.get(sort.key);
    if (!col) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return sort.direction === "asc" ? av - bv : bv - av;
      const as = String(av);
      const bs = String(bv);
      return sort.direction === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return copy;
  }, [data, sort, columnMap]);

  const handleSort = (key: string) => {
    const col = columnMap.get(key);
    if (!col?.sortable) return;
    let next: SortState | null = null;
    if (!sort || sort.key !== key) next = { key, direction: "asc" };
    else if (sort.direction === "asc") next = { key, direction: "desc" };
    else next = null;
    if (controlledSort === undefined) setInternalSort(next);
    onSortChange?.(next);
  };

  // Selection
  const allIds = React.useMemo(() => sortedData.map((r, i) => getId(r, i)), [sortedData, getId]);
  const allSelected = selectable && allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const someSelected = selectable && selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    const next = allSelected ? [] : [...allIds];
    if (controlledSelected === undefined) setInternalSelected(next);
    onSelectionChange?.(next);
  };
  const toggleOne = (id: string) => {
    const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    if (controlledSelected === undefined) setInternalSelected(next);
    onSelectionChange?.(next);
  };

  // Virtualizer
  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  // Infinite scroll
  const handleScroll = React.useCallback(() => {
    if (!onEndReached || loading) return;
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - rowHeight * 2;
    if (nearBottom) onEndReached();
  }, [onEndReached, loading, rowHeight]);

  // Resize
  const onResizeStart = (e: React.PointerEvent, key: string) => {
    if (!resizable) return;
    const startX = e.clientX;
    const startW = widths[key] ?? parseWidth(columnMap.get(key)?.width, 160);
    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      const next = Math.max(minColumnWidth, startW + delta);
      setWidths((p) => ({ ...p, [key]: next }));
    };
    const onUp = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      const next = Math.max(minColumnWidth, startW + delta);
      onColumnResize?.(key, next);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Reorder
  const handleDragStart = (key: string) => setDragKey(key);
  const handleDragOver = (e: React.DragEvent, overKey: string) => {
    e.preventDefault();
    if (!dragKey || dragKey === overKey) return;
    setColumnOrder((prev) => {
      const from = prev.indexOf(dragKey);
      const to = prev.indexOf(overKey);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, dragKey);
      return next;
    });
  };
  const handleDragEnd = () => {
    if (dragKey) {
      onColumnOrderChange?.(columnOrder);
      setDragKey(null);
    }
  };

  // Editing
  const startEdit = (rowId: string, key: string, value: string) => {
    if (!onCellEdit) return;
    setEditingCell({ rowId, key });
    setEditValue(value);
  };
  const commitEdit = () => {
    if (!editingCell) return;
    onCellEdit?.(editingCell.rowId, editingCell.key, editValue);
    setEditingCell(null);
  };

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={containerRef}
      data-slot="table"
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border bg-card text-sm",
        "supports-[backdrop-filter]:bg-card",
        className,
      )}
      style={{ height }}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
      >
        {/* Header - sticky */}
        <div
          className="sticky top-0 z-10 flex border-b bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/60"
          style={{ minWidth: "max-content" }}
        >
          {selectable ? (
            <div className="flex h-10 shrink-0 items-center justify-center border-r bg-muted/60 px-2" style={{ width: 44 }}>
              <input
                type="checkbox"
                checked={!!allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = !!someSelected;
                }}
                onChange={toggleAll}
                aria-label="Select all"
                className="size-4 rounded border-input accent-primary"
              />
            </div>
          ) : null}
          {orderedColumns.map((col) => {
            const w = widths[col.key] ?? parseWidth(col.width, 160);
            const isSorted = sort?.key === col.key;
            const align = col.align ?? "left";
            return (
              <div
                key={col.key}
                draggable={!!reorderable}
                onDragStart={() => handleDragStart(col.key)}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group/header relative flex h-10 shrink-0 items-center gap-1.5 border-r px-3 text-xs font-medium text-muted-foreground last:border-r-0",
                  col.sortable && "cursor-pointer select-none hover:text-foreground",
                  dragKey === col.key && "opacity-50",
                )}
                style={{ width: w, minWidth: col.minWidth ?? minColumnWidth }}
                onClick={() => handleSort(col.key)}
              >
                {reorderable ? (
                  <GripVertical className="size-3 shrink-0 opacity-40 group-hover/header:opacity-100" />
                ) : null}
                {onColumnRename && renamingKey === col.key ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => {
                      onColumnRename(col.key, renameValue);
                      setRenamingKey(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onColumnRename(col.key, renameValue);
                        setRenamingKey(null);
                      }
                      if (e.key === "Escape") setRenamingKey(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-full rounded border bg-background px-1 text-xs text-foreground outline-none"
                  />
                ) : (
                  <span
                    className={cn(
                      "truncate",
                      align === "center" && "mx-auto",
                      align === "right" && "ml-auto",
                    )}
                    onDoubleClick={(e) => {
                      if (onColumnRename && !col.sortable) {
                        e.stopPropagation();
                        setRenamingKey(col.key);
                        setRenameValue(col.header);
                      } else if (onColumnRename) {
                        setRenamingKey(col.key);
                        setRenameValue(col.header);
                      }
                    }}
                  >
                    {col.header}
                  </span>
                )}
                {col.sortable ? (
                  <span className="ml-1 shrink-0">
                    {!isSorted ? (
                      <ArrowUpDown className="size-3 opacity-40" />
                    ) : sort.direction === "asc" ? (
                      <ArrowUp className="size-3" />
                    ) : (
                      <ArrowDown className="size-3" />
                    )}
                  </span>
                ) : null}
                {/* Column actions */}
                {(onInsertColumn || onDeleteColumn) && (
                  <span className="ml-auto hidden items-center gap-0.5 group-hover/header:flex">
                    {onInsertColumn ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const idx = orderedColumns.findIndex((c) => c.key === col.key);
                            onInsertColumn(idx, "before");
                          }}
                          className="rounded p-0.5 hover:bg-accent"
                          aria-label="Insert column before"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const idx = orderedColumns.findIndex((c) => c.key === col.key);
                            onInsertColumn(idx, "after");
                          }}
                          className="rounded p-0.5 hover:bg-accent"
                          aria-label="Insert column after"
                        >
                          <Plus className="size-3 rotate-90" />
                        </button>
                      </>
                    ) : null}
                    {onDeleteColumn ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const idx = orderedColumns.findIndex((c) => c.key === col.key);
                          onDeleteColumn(col.key, idx);
                        }}
                        className="rounded p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                        aria-label="Delete column"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    ) : null}
                  </span>
                )}
                {/* Resize handle */}
                {resizable ? (
                  <span
                    onPointerDown={(e) => onResizeStart(e, col.key)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize touch-none select-none"
                    aria-hidden
                  >
                    <span className="absolute right-0.5 top-0 h-full w-px bg-border opacity-0 group-hover/header:opacity-100" />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Virtual rows */}
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", minWidth: "max-content" }}>
          {sortedData.length === 0 && !loading ? (
            <div className="flex h-32 items-center justify-center p-8 text-sm text-muted-foreground">
              {emptyState ?? "No data"}
            </div>
          ) : (
            <>
              {items.map((virtualRow) => {
                const row = sortedData[virtualRow.index]!;
                const rowId = getId(row, virtualRow.index);
                const isSelected = selectedIds.includes(rowId);
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className={cn(
                      "absolute left-0 top-0 flex w-full border-b last:border-0 hover:bg-muted/40",
                      isSelected && "bg-muted/60",
                    )}
                    style={{ transform: `translateY(${virtualRow.start}px)`, height: rowHeight }}
                  >
                    {selectable ? (
                      <div className="flex h-full shrink-0 items-center justify-center border-r px-2" style={{ width: 44 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(rowId)}
                          aria-label={`Select row ${rowId}`}
                          className="size-4 rounded border-input accent-primary"
                        />
                      </div>
                    ) : null}
                    {orderedColumns.map((col) => {
                      const w = widths[col.key] ?? parseWidth(col.width, 160);
                      const raw = row[col.key];
                      const value = raw == null ? "" : String(raw);
                      const align = col.align ?? "left";
                      const isEditing = editingCell?.rowId === rowId && editingCell?.key === col.key;
                      return (
                        <div
                          key={col.key}
                          className={cn(
                            "flex h-full shrink-0 items-center border-r px-3 last:border-r-0",
                            align === "center" && "justify-center",
                            align === "right" && "justify-end",
                            col.editable && onCellEdit && "cursor-text",
                          )}
                          style={{ width: w, minWidth: col.minWidth ?? minColumnWidth }}
                          onDoubleClick={() => col.editable && startEdit(rowId, col.key, value)}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEdit();
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              className="h-7 w-full rounded border bg-background px-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                            />
                          ) : col.cell ? (
                            <span className="truncate">{col.cell(row, virtualRow.index)}</span>
                          ) : (
                            <span className="truncate">{value}</span>
                          )}
                        </div>
                      );
                    })}
                    {/* Row actions (hover) */}
                    {(onInsertRow || onDeleteRow) && (
                      <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full border bg-background p-0.5 shadow-sm group-hover:flex hover:flex peer-hover:flex">
                        {onInsertRow ? (
                          <>
                            <button
                              onClick={() => onInsertRow(virtualRow.index, "before")}
                              className="rounded-full p-1 hover:bg-accent"
                              aria-label="Insert row before"
                            >
                              <Plus className="size-3" />
                            </button>
                            <button
                              onClick={() => onInsertRow(virtualRow.index, "after")}
                              className="rounded-full p-1 hover:bg-accent"
                              aria-label="Insert row after"
                            >
                              <Plus className="size-3 rotate-90" />
                            </button>
                          </>
                        ) : null}
                        {onDeleteRow ? (
                          <button
                            onClick={() => onDeleteRow(rowId, virtualRow.index)}
                            className="rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground"
                            aria-label="Delete row"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Skeleton rows while loading */}
              {loading
                ? Array.from({ length: skeletonRows }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="absolute left-0 flex w-full animate-pulse items-center border-b"
                      style={{ top: virtualizer.getTotalSize() + i * rowHeight, height: rowHeight }}
                    >
                      {selectable ? <div className="h-full w-[44px] shrink-0 border-r bg-muted/20" /> : null}
                      {orderedColumns.map((col) => {
                        const w = widths[col.key] ?? parseWidth(col.width, 160);
                        return <div key={col.key} className="h-full shrink-0 border-r bg-muted/20" style={{ width: w }} />;
                      })}
                    </div>
                  ))
                : null}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      {(onEndReached || loading) && sortedData.length > 0 ? (
        <div className="flex items-center justify-center border-t bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          {loading ? <span className="animate-pulse">Loading…</span> : <span>Scroll for more</span>}
        </div>
      ) : null}
    </div>
  );
}
