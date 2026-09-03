import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  DataTableBasicPreview,
  DataTableCellFormattingPreview,
  DataTableFilteringPreview,
  DataTablePaginationPreview,
  DataTablePreview,
  DataTableRtlPreview,
  DataTableSelectionPreview,
  DataTableSortingPreview,
  DataTableVisibilityPreview,
} from "@/components/docs/previews/data-table-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { DataTable, DataTableColumnHeader, createSelectColumn } from "@/components/ui/data-table"`;

const basicCode = `import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"

type Staff = { id: string; name: string; dept: string; location: string }

const columns: ColumnDef<Staff>[] = [
  { accessorKey: "name", header: "Employee" },
  { accessorKey: "dept", header: "Department" },
  { accessorKey: "location", header: "Location" },
]

<DataTable columns={columns} data={data} />`;

const columnDefCode = `import { DataTableColumnHeader, createSelectColumn } from "@/components/ui/data-table"

const columns: ColumnDef<Staff>[] = [
  createSelectColumn<Staff>(),
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
  },
  {
    accessorKey: "salary",
    header: "CTC",
    cell: ({ row }) => \`₹\${row.getValue("salary")}\`,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions onDelete={() => deleteRow(row.original)} />,
  },
]`;

const paginationCode = `import { DataTable } from "@/components/ui/data-table"

// Pagination is built-in via getPaginationRowModel.
// Use <DataTablePagination table={table} /> or rely on DataTable's footer.
<DataTable columns={columns} data={data} />`;

const sortingCode = `import { DataTableColumnHeader } from "@/components/ui/data-table"

{
  accessorKey: "salary",
  header: ({ column }) => <DataTableColumnHeader column={column} title="CTC" />,
}`;

const filteringCode = `import { DataTable } from "@/components/ui/data-table"

<DataTable columns={columns} data={data} filterKey="name" filterPlaceholder="Filter by name…" />`;

const visibilityCode = `import { DataTableViewOptions } from "@/components/ui/data-table"

// Inside DataTable toolbar:
<DataTableViewOptions table={table} />`;

const selectionCode = `import { createSelectColumn } from "@/components/ui/data-table"

const columns: ColumnDef<Staff>[] = [
  createSelectColumn<Staff>(),
  { accessorKey: "name", header: "Employee" },
  // ...
]

<DataTable columns={columns} data={data} />
// table.getFilteredSelectedRowModel().rows.length gives count
`;

const rtlCode = `<div dir="rtl">
  <DataTable columns={columns} data={data} dir="rtl" />
</div>`;

export async function DataTableDocs() {
  const sourceCode = (await readComponentSource("data-table")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Data Table"
      description="Feature-rich data table with sorting, filtering, pagination, column visibility, row selection, and RTL support — built on TanStack Table."
      preview={<DataTablePreview />}
      previewCode={basicCode}
      installPackageName="data-table"
      installDependencies="@tanstack/react-table"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/data-table.tsx"
      importCode={importCode}
      usageCode={basicCode}
      hideExamples
      examples={[
        { title: "Column Definitions", preview: <DataTableBasicPreview />, code: columnDefCode },
        { title: "Cell Formatting", preview: <DataTableCellFormattingPreview />, code: columnDefCode },
        {
          title: "Row Actions",
          preview: <DataTablePreview />,
          code: `import { DataTableRowActions } from "@/components/ui/data-table"

{
  id: "actions",
  cell: ({ row }) => <DataTableRowActions onDelete={() => deleteRow(row.original)} />
}`,
        },
        { title: "Pagination", preview: <DataTablePaginationPreview />, code: paginationCode },
        { title: "Sorting", preview: <DataTableSortingPreview />, code: sortingCode },
        { title: "Filtering", preview: <DataTableFilteringPreview />, code: filteringCode },
        { title: "Visibility", preview: <DataTableVisibilityPreview />, code: visibilityCode },
        { title: "Row Selection", preview: <DataTableSelectionPreview />, code: selectionCode },
        { title: "RTL", preview: <DataTableRtlPreview />, code: rtlCode },
      ]}
      props={[
        { name: "columns", type: "ColumnDef<TData, TValue>[]", description: "TanStack column definitions." },
        { name: "data", type: "TData[]", description: "Row data." },
        { name: "filterKey", type: "string", description: "Accessor key to filter on (shows toolbar input)." },
        { name: "filterPlaceholder", type: "string", default: '"Filter…"', description: "Placeholder for filter input." },
        { name: "dir", type: '"ltr" | "rtl"', description: "Direction for RTL support." },
        { name: "className", type: "string", description: "Additional CSS classes." },
        { name: "onRowDelete", type: "(row: TData) => void", description: "Callback for row-actions delete (via meta)." },
      ]}
    />
  );
}
