"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table, type TableColumn } from "@workspace/ui/components/table";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";

// ─────────────────────────────────────────────────────────────
// Shared helpers — DavinciUI workspace dataset (distinct from beui)
// ─────────────────────────────────────────────────────────────

type Member = {
  id: string;
  name: string;
  email: string;
  city: string;
  band: "associate" | "senior" | "lead" | "principal";
  ctc: number;
};

const FIRST = ["Aarav", "Vivaan", "Aditya", "Arjun", "Reyansh", "Sai", "Ayaan", "Ishaan", "Kabir", "Dhruv"];
const LAST = ["Sharma", "Verma", "Reddy", "Patel", "Singh", "Gupta", "Mehta", "Nair", "Desai", "Joshi"];
const CITIES = ["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai"];
const BANDS: Member["band"][] = ["associate", "senior", "lead", "principal"];

function buildMembers(count: number): Member[] {
  const out: Member[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST[i % FIRST.length]!;
    const last = LAST[(i * 7) % LAST.length]!;
    out.push({
      id: `emp-${i}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@davinciui.in`,
      city: CITIES[(i * 3) % CITIES.length]!,
      band: BANDS[(i * 5 + 1) % BANDS.length]!,
      ctc: 8_50_000 + ((i * 1_13_000) % 42_00_000),
    });
  }
  return out;
}

const BAND_STYLES: Record<Member["band"], string> = {
  associate: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  senior: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  lead: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  principal: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function BandBadge({ band }: { band: Member["band"] }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", BAND_STYLES[band])}>
      {band}
    </span>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full items-start justify-center p-6">
      <div className="w-full max-w-[740px]">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1) Data Table — 100 rows
// ─────────────────────────────────────────────────────────────

export function TablePreview() {
  const data = useMemo(() => buildMembers(6), []);
  const [selected, setSelected] = useState<string[]>([]);

  const columns = useMemo<TableColumn<Member>[]>(
    () => [
      {
        key: "name",
        header: "Employee",
        sortable: true,
        width: "1.4fr",
        cell: (row) => <span className="font-medium tracking-tight">{row.name}</span>,
      },
      { key: "email", header: "Contact", width: "1.9fr" },
      { key: "city", header: "Location", sortable: true, width: "122px" },
      {
        key: "band",
        header: "Band",
        width: "128px",
        cell: (row) => <BandBadge band={row.band} />,
      },
      {
        key: "ctc",
        header: "CTC",
        sortable: true,
        align: "right",
        width: "132px",
        cell: (row) => <span className="tabular-nums font-medium">₹{row.ctc.toLocaleString("en-IN")}</span>,
      },
    ],
    [],
  );

  return (
    <TableShell>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>{data.length.toLocaleString()} employees</span>
          {selected.length > 0 ? <span>{selected.length.toLocaleString()} selected</span> : null}
        </div>
        <Table
          data={data}
          columns={columns}
          selectable
          resizable
          reorderable
          selectedRowIds={selected}
          onSelectionChange={setSelected}
          defaultSort={{ key: "ctc", direction: "desc" }}
          height={440}
          rowHeight={54}
          className="rounded-2xl"
        />
      </div>
    </TableShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 2) Editable — workspace board
// ─────────────────────────────────────────────────────────────

type BoardRow = { id: string; [key: string]: string };

const INITIAL_BOARD: BoardRow[] = [
  { id: "b1", milestone: "Discovery Sprint", owner: "Aarav Sharma", phase: "Research" },
  { id: "b2", milestone: "Design System", owner: "Aditya Patel", phase: "Build" },
  { id: "b3", milestone: "API Hardening", owner: "Ishaan Nair", phase: "Review" },
  { id: "b4", milestone: "Launch Prep", owner: "Kabir Desai", phase: "Release" },
  { id: "b5", milestone: "QA Handover", owner: "Vivaan Desai", phase: "Test" },
  { id: "b6", milestone: "Beta Rollout", owner: "Dhruv Joshi", phase: "Deploy" },
];

export function TableEditablePreview() {
  const [rows, setRows] = useState<BoardRow[]>(INITIAL_BOARD);
  const [keys, setKeys] = useState<string[]>(["milestone", "owner", "phase"]);
  const [labels, setLabels] = useState<Record<string, string>>({
    milestone: "Milestone",
    owner: "Owner",
    phase: "Phase",
  });
  const nextRow = useRef(5);
  const nextCol = useRef(1);
  const [editable, setEditable] = useState(true);

  const onCellEdit = useCallback((rowId: string, key: string, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)));
  }, []);

  const onInsertRow = useCallback((index: number, position: "before" | "after") => {
    const at = position === "after" ? index + 1 : index;
    setRows((prev) => {
      const next = [...prev];
      next.splice(at, 0, { id: `b${nextRow.current}` } as BoardRow);
      return next;
    });
    nextRow.current += 1;
  }, []);

  const onDeleteRow = useCallback((rowId: string) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  }, []);

  const onInsertColumn = useCallback((index: number, position: "before" | "after") => {
    const key = `field${nextCol.current}`;
    const at = position === "after" ? index + 1 : index;
    setLabels((prev) => ({ ...prev, [key]: `Field ${nextCol.current}` }));
    setKeys((prev) => {
      const next = [...prev];
      next.splice(at, 0, key);
      return next;
    });
    setRows((prev) => prev.map((row) => ({ ...row, [key]: "" })));
    nextCol.current += 1;
  }, []);

  const onColumnRename = useCallback((key: string, value: string) => {
    setLabels((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onDeleteColumn = useCallback((key: string) => {
    setKeys((prev) => prev.filter((k) => k !== key));
    setRows((prev) =>
      prev.map((row) => {
        const next = { ...row };
        delete next[key];
        return next;
      }),
    );
  }, []);

  const columns = useMemo<TableColumn<BoardRow>[]>(
    () =>
      keys.map((key, i) => ({
        key,
        header: labels[key] ?? key,
        editable,
        width: i === 0 ? "1.3fr" : "190px",
      })),
    [keys, labels, editable],
  );

  const bodyHeight = Math.min(Math.max(rows.length, 1), 7) * 52;

  return (
    <TableShell>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {editable ? "Double-click to edit. Use handles to insert or delete." : "Read-only board."}
          </p>
          <label className="flex items-center gap-2 text-xs font-medium">
            <Switch checked={editable} onCheckedChange={setEditable} />
            Editable
          </label>
        </div>
        <Table
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          rowHeight={52}
          height={bodyHeight}
          onCellEdit={editable ? onCellEdit : undefined}
          onColumnRename={editable ? onColumnRename : undefined}
          onInsertRow={editable ? onInsertRow : undefined}
          onDeleteRow={editable ? onDeleteRow : undefined}
          onInsertColumn={editable ? onInsertColumn : undefined}
          onDeleteColumn={editable ? onDeleteColumn : undefined}
          emptyState={
            <button
              type="button"
              onClick={() => onInsertRow(0, "before")}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Add first milestone
            </button>
          }
        />
      </div>
    </TableShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 3) Async / infinite — paginated workspace feed
// ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 6;
const MAX_PAGES = 1;

function buildPage(page: number): Member[] {
  const out: Member[] = [];
  const start = page * PAGE_SIZE;
  for (let n = start; n < start + PAGE_SIZE; n++) {
    const first = FIRST[n % FIRST.length]!;
    const last = LAST[(n * 13) % LAST.length]!;
    out.push({
      id: `pg-${n}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${n}@davinciui.in`,
      city: CITIES[(n * 4) % CITIES.length]!,
      band: BANDS[(n * 3) % BANDS.length]!,
      ctc: 9_00_000 + ((n * 1_07_000) % 38_00_000),
    });
  }
  return out;
}

export function TableAsyncPreview() {
  const [rows, setRows] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current || pageRef.current >= MAX_PAGES) return;
    loadingRef.current = true;
    setLoading(true);
    setTimeout(() => {
      const page = pageRef.current;
      setRows((prev) => [...prev, ...buildPage(page)]);
      pageRef.current = page + 1;
      loadingRef.current = false;
      setLoading(false);
    }, 650);
  }, []);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const columns = useMemo<TableColumn<Member>[]>(
    () => [
      {
        key: "name",
        header: "Employee",
        cell: (r) => <span className="font-medium">{r.name}</span>,
      },
      { key: "email", header: "Contact", width: "240px" },
      { key: "city", header: "Location", width: "120px" },
      {
        key: "band",
        header: "Band",
        width: "124px",
        cell: (r) => (
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", BAND_STYLES[r.band])}>
            {r.band}
          </span>
        ),
      },
      {
        key: "ctc",
        header: "CTC",
        align: "right",
        width: "132px",
        cell: (r) => <span className="tabular-nums">₹{r.ctc.toLocaleString("en-IN")}</span>,
      },
    ],
    [],
  );

  const done = pageRef.current >= MAX_PAGES;

  return (
    <TableShell>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>{rows.length.toLocaleString()} loaded</span>
          <span>{loading ? "Loading…" : done ? "All loaded" : "Scroll for more"}</span>
        </div>
        <Table
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          height={440}
          rowHeight={54}
          onEndReached={loadMore}
          loading={loading}
          className="rounded-2xl"
        />
      </div>
    </TableShell>
  );
}
