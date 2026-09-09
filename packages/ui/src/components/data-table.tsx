"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Link2, MoreHorizontal, Pencil, Search, SearchX, SlidersHorizontal, Trash2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@workspace/ui/components/context-menu";

// ─────────────────────────────────────────────────────────────
// Layout system
// ─────────────────────────────────────────────────────────────
// Same visual language as the premium Context Menu: rounded-xl
// surfaces, border-border/70 hairlines, tabular numerals, and the
// ease-out-strong motion curve. Cell alignment comes from
// columnDef.meta.align so numbers can sit at the end edge.
// ─────────────────────────────────────────────────────────────

export type DataTableAlign = "start" | "center" | "end";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Horizontal alignment for header + cells. @default "start" */
    align?: DataTableAlign;
  }
}

const ALIGN_TEXT: Record<DataTableAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end tabular-nums",
};

// Scroll-state (sticky-header shadow, edge fades) without re-renders.
// Runs against the relatively-positioned wrap around the scroll area.
function updateScrollState(el: HTMLDivElement) {
  const wrap = (el.parentElement as HTMLElement | null) ?? el;
  const stuck = el.scrollTop > 2;
  el.dataset.stuck = stuck ? "true" : "false";
  const max = el.scrollWidth - el.clientWidth;
  const offset = Math.abs(el.scrollLeft);
  const showStart = max > 2 && offset > 2;
  const showEnd = max > 2 && offset < max - 2;
  wrap.querySelectorAll<HTMLElement>("[data-edge]").forEach((edge) => {
    edge.dataset.visible = edge.dataset.edge === "start" ? String(showStart) : String(showEnd);
  });
}

// Column header — sortable
export function DataTableColumnHeader<TData, TValue>({ column, title, className }: { column: import("@tanstack/react-table").Column<TData, TValue>; title: string } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title">) {
  if (!column.getCanSort()) return <span className={cn("truncate", className)}>{title}</span>;
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      aria-label={`${title}, ${sorted === "asc" ? "sorted ascending, activate to sort descending" : sorted === "desc" ? "sorted descending, activate to clear sorting" : "not sorted, activate to sort ascending"}`}
      className={cn(
        "group/sort -mx-1 inline-flex max-w-full items-center gap-1.5 rounded-md px-1 py-0.5 outline-none transition-colors hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/70",
        className,
      )}
    >
      <span className="truncate">{title}</span>
      <span aria-hidden className="flex shrink-0 items-center text-muted-foreground">
        {sorted === "desc" ? (
          <ArrowDown className="size-3.5 text-foreground" />
        ) : sorted === "asc" ? (
          <ArrowUp className="size-3.5 text-foreground" />
        ) : (
          <ArrowUpDown className="size-3.5 opacity-0 transition-opacity duration-150 group-hover/sort:opacity-60 group-focus-visible/sort:opacity-100" />
        )}
      </span>
    </button>
  );
}

// Pagination — footer bar
export function DataTablePagination<TData>({ table }: { table: import("@tanstack/react-table").Table<TData> }) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount() || 1;
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-muted-foreground tabular-nums">
        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected
      </span>
      <div className="flex items-center gap-3">
        <label className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          Rows
          <span className="relative inline-flex items-center">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              aria-label="Rows per page"
              className="h-7 appearance-none rounded-lg border border-border/70 bg-background py-0 pr-7 pl-2 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/70"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <ChevronRight aria-hidden className="pointer-events-none absolute right-1.5 size-3.5 rotate-90 text-muted-foreground" />
          </span>
        </label>
        <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <div className="flex gap-1" role="group" aria-label="Pagination">
          <Button variant="outline" size="icon" aria-label="First page" className="size-7 rounded-lg" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="size-3.5" /></Button>
          <Button variant="outline" size="icon" aria-label="Previous page" className="size-7 rounded-lg" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="size-3.5" /></Button>
          <Button variant="outline" size="icon" aria-label="Next page" className="size-7 rounded-lg" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="size-3.5" /></Button>
          <Button variant="outline" size="icon" aria-label="Last page" className="size-7 rounded-lg" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="size-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}

// View options — column toggle
export function DataTableViewOptions<TData>({ table }: { table: import("@tanstack/react-table").Table<TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg"><SlidersHorizontal className="size-3.5" />View</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs">Columns</DropdownMenuLabel><DropdownMenuSeparator />
        {table.getAllColumns().filter((c) => c.getCanHide()).map((col) => (
          <DropdownMenuCheckboxItem key={col.id} checked={col.getIsVisible()} onCheckedChange={(v) => col.toggleVisibility(!!v)} className="capitalize">{col.id}</DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Row actions (kebab menu — click path; right-click is handled by the row context menu below)
export function DataTableRowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Row actions" className="size-7 rounded-lg opacity-60 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 group-data-[popup-open]:opacity-100"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(location.href)}>Copy link</DropdownMenuItem>
        <DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={onDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Row context menu — right-click / long-press path using the premium ContextMenu.
// Shares the same actions as the kebab so pointer and keyboard stay consistent.
function DataTableRowContextMenu<TData>({ row, onEdit, onDelete, children }: { row: TData; onEdit?: (row: TData) => void; onDelete?: (row: TData) => void; children: React.ReactElement }) {
  if (!onEdit && !onDelete) return children;
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {onEdit ? (
          <ContextMenuItem icon={<Pencil aria-hidden />} onClick={() => onEdit(row)}>
            Edit row
          </ContextMenuItem>
        ) : null}
        <ContextMenuItem icon={<Link2 aria-hidden />} kbd={["⌘", "L"]} onClick={() => navigator.clipboard.writeText(location.href)}>
          Copy link
        </ContextMenuItem>
        {onDelete ? (
          <React.Fragment>
            <ContextMenuSeparator />
            <ContextMenuItem destructive icon={<Trash2 aria-hidden />} onClick={() => onDelete(row)}>
              Delete row
            </ContextMenuItem>
          </React.Fragment>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Main
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey?: string;
  filterPlaceholder?: string;
  className?: string;
  dir?: "ltr" | "rtl";
  /** Called from the row-actions delete (via meta) and the row context menu. */
  onRowDelete?: (row: TData) => void;
  /** Called from the row context menu (right-click). Kebab edit stays column-defined. */
  onRowEdit?: (row: TData) => void;
}

export function DataTable<TData, TValue>({ columns, data, filterKey, filterPlaceholder = "Search…", className, dir, onRowDelete, onRowEdit }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters, onColumnVisibilityChange: setColumnVisibility, onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  (table.options.meta as Record<string, unknown> | undefined) = { onRowDelete } as unknown as Record<string, unknown>;

  // Initialize scroll-state (sticky shadow, edge fades) once mounted.
  React.useEffect(() => {
    if (scrollRef.current) updateScrollState(scrollRef.current);
  }, [data.length, columnVisibility]);

  return (
    <div dir={dir} data-slot="data-table" className={cn("w-full space-y-3", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {filterKey ? (
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 size-3.5 -translate-y-1/2 start-2.5 text-muted-foreground" />
            <Input placeholder={filterPlaceholder} aria-label={filterPlaceholder} value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""} onChange={(e) => table.getColumn(filterKey)?.setFilterValue(e.target.value)} className="h-8 max-w-sm rounded-lg ps-8" />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground tabular-nums">{table.getFilteredRowModel().rows.length} records</span>
        )}
        <div className="ms-auto"><DataTableViewOptions table={table} /></div>
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.3),0_12px_32px_-12px_rgb(0_0_0/0.5)]">
        <div data-slot="data-table-scroll-wrap" className="relative">
          <div
            ref={scrollRef}
            onScroll={(e) => updateScrollState(e.currentTarget)}
            className="overflow-auto [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&[data-stuck=true]_th]:shadow-[0_1px_0_rgb(0_0_0/0.04),0_12px_20px_-12px_rgb(0_0_0/0.25)]"
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border/70">
                    {hg.headers.map((h, hi) => {
                      const align = h.column.columnDef.meta?.align ?? (h.column.id === "actions" ? "end" : h.column.id === "select" ? "center" : "start");
                      const sorted = h.column.getIsSorted();
                      return (
                        <th
                          key={h.id}
                          scope="col"
                          aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                          data-align={align}
                          className={cn(
                            "h-11",
                            "sticky top-0 z-10 border-b border-border/70 bg-muted/60 px-3 align-middle text-[11px] font-semibold tracking-wider whitespace-nowrap text-muted-foreground/90 uppercase backdrop-blur-md",
                            ALIGN_TEXT[align],
                            h.column.id === "select" && "w-11 px-2",
                            hi === 0 && "ps-4",
                            hi === hg.headers.length - 1 && "pe-4",
                          )}
                        >
                          {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
            <tbody>
              {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => {
                const cells = row.getVisibleCells();
                return (
                  <DataTableRowContextMenu key={row.id} row={row.original} onEdit={onRowEdit} onDelete={onRowDelete}>
                    <tr data-state={row.getIsSelected() && "selected"} className="group border-b border-border/50 transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] last:border-0 hover:bg-muted/40 data-[state=selected]:bg-muted/60 motion-reduce:transition-none">
                      {cells.map((cell, ci) => {
                        const align = cell.column.columnDef.meta?.align ?? (cell.column.id === "actions" ? "end" : cell.column.id === "select" ? "center" : "start");
                        return (
                          <td
                            key={cell.id}
                            data-align={align}
                            className={cn(
                              "px-3 py-2.5",
                              "align-middle text-[13px] leading-5 text-foreground/90",
                              ALIGN_TEXT[align],
                              cell.column.id === "select" && "w-11 px-2",
                              ci === 0 && "ps-4",
                              ci === cells.length - 1 && "pe-4",
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  </DataTableRowContextMenu>
                );
              }) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="mx-auto max-w-xs space-y-2">
                      <span className="mx-auto flex size-10 items-center justify-center rounded-full border border-border/70 bg-muted/50 text-muted-foreground">
                        <SearchX aria-hidden className="size-4" />
                      </span>
                      <p className="text-sm font-medium">No results</p>
                      <p className="text-xs text-muted-foreground">Try adjusting filters or column visibility.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          {/* Horizontal scroll edge fades */}
          <span aria-hidden data-edge="start" data-visible="false" className="pointer-events-none absolute inset-y-0 start-0 z-20 w-8 bg-gradient-to-r from-card to-transparent opacity-0 transition-opacity duration-200 data-[visible=true]:opacity-100 rtl:bg-gradient-to-l" />
          <span aria-hidden data-edge="end" data-visible="false" className="pointer-events-none absolute inset-y-0 end-0 z-20 w-8 bg-gradient-to-l from-card to-transparent opacity-0 transition-opacity duration-200 data-[visible=true]:opacity-100 rtl:bg-gradient-to-r" />
        </div>

        {/* Footer */}
        <div className="border-t border-border/70 bg-muted/30 px-4 py-2.5">
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  );
}

// Select column helper
export function createSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onChange={(e) => table.toggleAllPageRowsSelected((e.target as HTMLInputElement).checked)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onChange={(e) => row.toggleSelected((e.target as HTMLInputElement).checked)} aria-label="Select row" />,
    enableSorting: false, enableHiding: false,
  } as ColumnDef<TData>;
}
