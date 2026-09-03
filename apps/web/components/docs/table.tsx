import { DocsPageLayout } from "@/components/docs-page-layout";
import { TableAsyncPreview, TableEditablePreview, TablePreview } from "@/components/docs/previews/table-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Table, type TableColumn } from "@/components/ui/table"`;

const defaultCode = `import { Table, type TableColumn } from "@/components/ui/table"

type Member = { id: string; name: string; email: string; city: string; band: string; ctc: number }

const columns: TableColumn<Member>[] = [
  { key: "name", header: "Employee", sortable: true, width: "1.4fr" },
  { key: "email", header: "Contact", width: "1.9fr" },
  { key: "city", header: "Location", width: "122px" },
  { key: "band", header: "Band", width: "128px" },
  { key: "ctc", header: "CTC", sortable: true, align: "right", width: "132px" },
]

<Table
  data={data}
  columns={columns}
  selectable
  resizable
  reorderable
  defaultSort={{ key: "ctc", direction: "desc" }}
  height={440}
  rowHeight={54}
/>`;

export async function TableDocs() {
  const sourceCode = (await readComponentSource("table")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Table"
      description="Virtualized data table that stays smooth at 100+ rows, with sortable headers, row selection, column resize and reorder, and a sticky header. Minimal, reduced-motion-safe motion."
      preview={<TablePreview />}
      previewCode={defaultCode}
      installPackageName="table"
      installDependencies="@tanstack/react-virtual"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/table.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        {
          title: "Editable",
          preview: <TableEditablePreview />,
          code: `import { Table, type TableColumn } from "@/components/ui/table"

<Table
  data={rows}
  columns={columns}
  onCellEdit={(rowId, key, value) => update(rowId, key, value)}
  onInsertRow={(index, pos) => insertRow(index, pos)}
  onDeleteRow={(id) => deleteRow(id)}
  onInsertColumn={(index, pos) => insertColumn(index, pos)}
  onDeleteColumn={(key) => deleteColumn(key)}
/>`,
        },
        {
          title: "Async / Infinite",
          preview: <TableAsyncPreview />,
          code: `import { Table } from "@/components/ui/table"

<Table
  data={rows}
  columns={columns}
  onEndReached={loadMore}
  loading={loading}
  height={420}
/>`,
        },
      ]}
      props={[
        { name: "data", type: "T[]", description: "Row data." },
        { name: "columns", type: "TableColumn<T>[]", description: "Column definitions." },
        { name: "getRowId", type: "(row: T, index: number) => string", description: "Stable id per row. Defaults to row.id or index." },
        { name: "selectable", type: "boolean", default: "false", description: "Render leading checkbox column with select-all." },
        { name: "selectedRowIds", type: "string[]", description: "Controlled selection." },
        { name: "onSelectionChange", type: "(ids: string[]) => void", description: "Selection change handler." },
        { name: "sort", type: "SortState | null", description: "Controlled sort state." },
        { name: "defaultSort", type: "SortState | null", default: "null", description: "Initial sort." },
        { name: "onSortChange", type: "(sort: SortState | null) => void", description: "Sort change handler." },
        { name: "resizable", type: "boolean", default: "false", description: "Allow dragging header edge to resize." },
        { name: "reorderable", type: "boolean", default: "false", description: "Allow dragging header to reorder." },
        { name: "onCellEdit", type: "(rowId: string, columnKey: string, value: string) => void", description: "Editable cell change." },
        { name: "rowHeight", type: "number", default: "48", description: "Fixed row height for virtualization." },
        { name: "height", type: "number", default: "440", description: "Scroll viewport height." },
        { name: "onEndReached", type: "() => void", description: "Fires near bottom — load next page." },
        { name: "loading", type: "boolean", default: "false", description: "Shows skeleton rows and pauses onEndReached." },
        { name: "emptyState", type: "ReactNode", default: "No data", description: "Rendered when data is empty." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
