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
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, SlidersHorizontal } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";

// Column header — sortable
export function DataTableColumnHeader<TData, TValue>({ column, title, className }: { column: import("@tanstack/react-table").Column<TData, TValue>; title: string } & React.HTMLAttributes<HTMLDivElement>) {
  if (!column.getCanSort()) return <span className={className}>{title}</span>;
  const sorted = column.getIsSorted();
  return (
    <button onClick={() => column.toggleSorting(sorted === "asc")} className={cn("inline-flex items-center gap-1.5 hover:text-foreground transition-colors", className)}>
      {title}
      {sorted === "desc" ? <ArrowDown className="size-3.5" /> : sorted === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowUpDown className="size-3.5 opacity-40" />}
    </button>
  );
}

// Pagination — compact pill
export function DataTablePagination<TData>({ table }: { table: import("@tanstack/react-table").Table<TData> }) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-muted-foreground tabular-nums">
        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected
      </span>
      <div className="flex items-center gap-3">
        <label className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          Rows
          <select value={table.getState().pagination.pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))} className="h-7 rounded-lg border bg-background px-1.5 text-xs">
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <span className="text-xs text-muted-foreground">p.{table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}</span>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="size-7 rounded-lg" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="size-3.5" /></Button>
          <Button variant="outline" size="icon" className="size-7 rounded-lg" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="size-3.5" /></Button>
          <Button variant="outline" size="icon" className="size-7 rounded-lg" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="size-3.5" /></Button>
          <Button variant="outline" size="icon" className="size-7 rounded-lg" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="size-3.5" /></Button>
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

// Row actions
export function DataTableRowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7 rounded-lg"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(location.href)}>Copy link</DropdownMenuItem>
        <DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={onDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  onRowDelete?: (row: TData) => void;
}

export function DataTable<TData, TValue>({ columns, data, filterKey, filterPlaceholder = "Search…", className, dir, onRowDelete }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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

  return (
    <div dir={dir} data-slot="data-table" className={cn("w-full space-y-3", className)}>
      <div className="flex items-center gap-2">
        {filterKey ? <Input placeholder={filterPlaceholder} value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""} onChange={(e) => table.getColumn(filterKey)?.setFilterValue(e.target.value)} className="h-8 max-w-sm rounded-lg" /> : <span className="text-xs text-muted-foreground">{table.getFilteredRowModel().rows.length} records</span>}
        <div className="ml-auto"><DataTableViewOptions table={table} /></div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 [&_tr]:border-b">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="h-9 px-3 text-left align-middle text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/80 [&:has([role=checkbox])]:pr-0">
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="[&_tr:last-child]:border-0 divide-y divide-border/50">
              {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
                <tr key={row.id} data-state={row.getIsSelected() && "selected"} className="group border-b last:border-0 hover:bg-muted/40 data-[state=selected]:bg-muted/60 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 align-middle text-[13px] leading-5 [&:has([role=checkbox])]:pr-0">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              )) : (
                <tr><td colSpan={columns.length} className="py-16 text-center"><div className="mx-auto max-w-xs space-y-1"><p className="text-sm font-medium">No results</p><p className="text-xs text-muted-foreground">Try adjusting filters or column visibility.</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DataTablePagination table={table} />
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
