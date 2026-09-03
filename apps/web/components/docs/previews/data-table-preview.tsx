"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableColumnHeader, createSelectColumn, DataTableRowActions } from "@workspace/ui/components/data-table";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

// Shared dataset — Indian payroll
type Staff = {
  id: string;
  name: string;
  email: string;
  dept: "Engineering" | "Design" | "Product" | "Growth";
  band: "associate" | "senior" | "lead" | "principal";
  location: string;
  salary: number;
  status: "active" | "on-leave" | "probation";
};

const FIRST = ["Ishita", "Kavya", "Ananya", "Diya", "Meher", "Aarav", "Kabir", "Arjun", "Rohan", "Advik"];
const LAST = ["Kapoor", "Iyer", "Malhotra", "Chopra", "Rao", "Joshi", "Bhatt", "Menon", "Kulkarni", "Shetty"];
const DEPTS: Staff["dept"][] = ["Engineering", "Design", "Product", "Growth"];
const BANDS: Staff["band"][] = ["associate", "senior", "lead", "principal"];
const CITIES = ["Pune", "Jaipur", "Indore", "Kochi", "Bengaluru"];
const STATUS: Staff["status"][] = ["active", "on-leave", "probation"];

function buildStaff(count: number): Staff[] {
  const out: Staff[] = [];
  for (let i = 0; i < count; i++) {
    const f = FIRST[i % FIRST.length]!;
    const l = LAST[(i * 7) % LAST.length]!;
    out.push({
      id: `st-${i}`,
      name: `${f} ${l}`,
      email: `${f.toLowerCase()}.${l.toLowerCase()}${i}@davinciui.in`,
      dept: DEPTS[(i * 3) % DEPTS.length]!,
      band: BANDS[(i * 2) % BANDS.length]!,
      location: CITIES[(i * 5) % CITIES.length]!,
      salary: 6_00_000 + ((i * 91_000) % 34_00_000),
      status: STATUS[i % STATUS.length]!,
    });
  }
  return out;
}

const BAND_STYLES: Record<Staff["band"], string> = {
  associate: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  senior: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  lead: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  principal: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

// Consistent shell — ensures identical width for all variants
function Shell({ children, rtl }: { children: React.ReactNode; rtl?: boolean }) {
  return (
    <div className="flex h-full w-full items-start justify-center p-6" dir={rtl ? "rtl" : undefined}>
      <div className="w-full max-w-[740px]">{children}</div>
    </div>
  );
}

function columnsBase(handleDelete?: (row: Staff) => void): ColumnDef<Staff>[] {
  return [
    createSelectColumn<Staff>(),
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
      cell: ({ row }) => <span className="font-medium">{row.getValue("name") as string}</span>,
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue("email") as string}</span>,
    },
    {
      accessorKey: "dept",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    },
    {
      accessorKey: "band",
      header: "Band",
      cell: ({ row }) => {
        const b = row.getValue("band") as Staff["band"];
        return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", BAND_STYLES[b])}>{b}</span>;
      },
    },
    {
      accessorKey: "salary",
      header: ({ column }) => <DataTableColumnHeader column={column} title="CTC" />,
      cell: ({ row }) => <span className="tabular-nums font-medium">₹{(row.getValue("salary") as number).toLocaleString("en-IN")}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <DataTableRowActions onEdit={() => console.log("edit", row.original.id)} onDelete={() => handleDelete?.(row.original)} />,
      enableHiding: false,
    },
  ];
}

// Default — full feature (42 rows)
export function DataTablePreview() {
  const data = React.useMemo(() => buildStaff(6), []);
  const cols = React.useMemo(() => columnsBase(), []);
  return (
    <Shell>
      <DataTable columns={cols} data={data} filterKey="name" filterPlaceholder="Search employees…" />
    </Shell>
  );
}

export function DataTableBasicPreview() {
  const data = React.useMemo(() => buildStaff(6), []);
  const cols = React.useMemo<ColumnDef<Staff>[]>(
    () => [
      { accessorKey: "name", header: "Employee" },
      { accessorKey: "dept", header: "Department" },
      { accessorKey: "location", header: "Location" },
    ],
    [],
  );
  return (
    <Shell>
      <DataTable columns={cols} data={data} />
    </Shell>
  );
}

export function DataTableCellFormattingPreview() {
  const data = React.useMemo(() => buildStaff(6), []);
  const cols = React.useMemo<ColumnDef<Staff>[]>(
    () => [
      { accessorKey: "name", header: "Employee", cell: ({ row }) => <span className="font-semibold tracking-tight">{row.getValue("name") as string}</span> },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.getValue("status") as string;
          return <Badge variant={s === "active" ? "default" : s === "on-leave" ? "secondary" : "outline"} className="capitalize">{s}</Badge>;
        },
      },
      {
        accessorKey: "salary",
        header: "CTC",
        cell: ({ row }) => <span className="tabular-nums font-medium text-primary">₹{(row.getValue("salary") as number).toLocaleString("en-IN")}</span>,
      },
    ],
    [],
  );
  return (
    <Shell>
      <DataTable columns={cols} data={data} />
    </Shell>
  );
}

export function DataTablePaginationPreview() {
  const data = React.useMemo(() => buildStaff(6), []);
  const cols = React.useMemo(() => columnsBase().slice(0, 5), []);
  return (
    <Shell>
      <DataTable columns={cols} data={data} />
    </Shell>
  );
}

export function DataTableSortingPreview() {
  const data = React.useMemo(() => buildStaff(6), []);
  const cols = React.useMemo<ColumnDef<Staff>[]>(
    () => [
      { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" /> },
      { accessorKey: "salary", header: ({ column }) => <DataTableColumnHeader column={column} title="CTC" />, cell: ({ row }) => `₹${(row.getValue("salary") as number).toLocaleString("en-IN")}` },
      { accessorKey: "band", header: "Band" },
    ],
    [],
  );
  return (
    <Shell>
      <DataTable columns={cols} data={data} />
    </Shell>
  );
}

export function DataTableFilteringPreview() {
  const data = React.useMemo(() => buildStaff(6), []);
  const cols = React.useMemo<ColumnDef<Staff>[]>(
    () => [
      { accessorKey: "name", header: "Employee" },
      { accessorKey: "dept", header: "Department" },
      { accessorKey: "location", header: "Location" },
    ],
    [],
  );
  return (
    <Shell>
      <DataTable columns={cols} data={data} filterKey="name" filterPlaceholder="Filter by name…" />
    </Shell>
  );
}

export function DataTableVisibilityPreview() {
  const data = React.useMemo(() => buildStaff(6), []);
  const cols = React.useMemo(() => columnsBase(), []);
  return (
    <Shell>
      <DataTable columns={cols} data={data} filterKey="name" />
    </Shell>
  );
}

export function DataTableSelectionPreview() {
  const data = React.useMemo(() => buildStaff(6), []);
  const cols = React.useMemo(() => columnsBase(), []);
  return (
    <Shell>
      <div className="space-y-2">
        <DataTable columns={cols} data={data} />
        <p className="text-xs text-muted-foreground">Tip: use the header checkbox to select all rows on page.</p>
      </div>
    </Shell>
  );
}

export function DataTableRtlPreview() {
  const data = React.useMemo(() => buildStaff(6), []);
  const cols = React.useMemo<ColumnDef<Staff>[]>(
    () => [
      { accessorKey: "name", header: "الموظف" },
      { accessorKey: "dept", header: "القسم" },
      { accessorKey: "salary", header: "الراتب", cell: ({ row }) => `₹${(row.getValue("salary") as number).toLocaleString("en-IN")}` },
    ],
    [],
  );
  return (
    <Shell rtl>
      <DataTable columns={cols} data={data} dir="rtl" />
    </Shell>
  );
}
