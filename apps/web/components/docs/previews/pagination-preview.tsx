"use client";

import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  type PaginationLinkVariant,
} from "@workspace/ui/components/pagination";

/** Windowed page items: 1 … p-1 p p+1 … total */
function pageItems(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const window = [page - 1, page, page + 1].filter((p) => p > 1 && p < total);
  const items: (number | "…")[] = [1];
  if (Math.min(...window) > 2) items.push("…");
  items.push(...window);
  if (Math.max(...window) < total - 1) items.push("…");
  items.push(total);
  return items;
}

function NumberedPages({ page, total, variant, onChange }: { page: number; total: number; variant?: PaginationLinkVariant; onChange: (p: number) => void }) {
  return (
    <>
      {pageItems(page, total).map((item, i) =>
        item === "…" ? (
          <PaginationItem key={`gap-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        ) : (
          <PaginationItem key={item}>
            <PaginationLink variant={variant} isActive={item === page} onClick={() => onChange(item)}>
              {item}
            </PaginationLink>
          </PaginationItem>
        )
      )}
    </>
  );
}

export function PaginationPreview() {
  const [page, setPage] = React.useState(2);
  const total = 10;
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          </PaginationItem>
          <NumberedPages page={page} total={total} onChange={setPage} />
          <PaginationItem>
            <PaginationNext disabled={page === total} onClick={() => setPage((p) => Math.min(total, p + 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function PaginationTreatmentsPreview() {
  const [page, setPage] = React.useState(2);
  const [variant, setVariant] = React.useState<PaginationLinkVariant>("solid");
  const total = 5;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-8">
      <div className="flex items-center gap-1 rounded-full border p-1" role="group" aria-label="Active treatment">
        {(["outline", "solid", "ghost"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            aria-pressed={variant === v}
            className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground capitalize transition-colors hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {v}
          </button>
        ))}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious showText={false} disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          </PaginationItem>
          <NumberedPages page={page} total={total} variant={variant} onChange={setPage} />
          <PaginationItem>
            <PaginationNext showText={false} disabled={page === total} onClick={() => setPage((p) => Math.min(total, p + 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function PaginationPillPreview() {
  const [page, setPage] = React.useState(3);
  const total = 7;
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Pagination variant="pill">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious showText={false} disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          </PaginationItem>
          <NumberedPages page={page} total={total} variant="solid" onChange={setPage} />
          <PaginationItem>
            <PaginationNext showText={false} disabled={page === total} onClick={() => setPage((p) => Math.min(total, p + 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function PaginationFirstLastPreview() {
  const [page, setPage] = React.useState(4);
  const total = 8;
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirst disabled={page === 1} onClick={() => setPage(1)} />
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          </PaginationItem>
          <NumberedPages page={page} total={total} onChange={setPage} />
          <PaginationItem>
            <PaginationNext disabled={page === total} onClick={() => setPage((p) => Math.min(total, p + 1))} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLast disabled={page === total} onClick={() => setPage(total)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function PaginationCompactPreview() {
  const [page, setPage] = React.useState(3);
  const total = 10;
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          </PaginationItem>
          <PaginationItem>
            <span className="px-2 text-sm tabular-nums text-muted-foreground" aria-live="polite">
              {page} / {total}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext disabled={page === total} onClick={() => setPage((p) => Math.min(total, p + 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function PaginationSizesPreview() {
  const [page, setPage] = React.useState(2);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8">
      <Pagination>
        <PaginationContent>
          {[1, 2, 3].map((n) => (
            <PaginationItem key={n}>
              <PaginationLink size="icon-sm" isActive={n === page} onClick={() => setPage(n)}>
                {n}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
      </Pagination>
      <Pagination>
        <PaginationContent>
          {[1, 2, 3].map((n) => (
            <PaginationItem key={n}>
              <PaginationLink isActive={n === page} onClick={() => setPage(n)}>
                {n}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function PaginationSimplePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>2</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function PaginationIconsOnlyPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious showText={false} />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext showText={false} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function PaginationRtlPreview() {
  const [page, setPage] = React.useState(2);
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          </PaginationItem>
          {[1, 2, 3].map((n) => (
            <PaginationItem key={n}>
              <PaginationLink isActive={n === page} onClick={() => setPage(n)}>
                {n}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext disabled={page === 3} onClick={() => setPage((p) => Math.min(3, p + 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
