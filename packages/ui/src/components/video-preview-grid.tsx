"use client";

import { VideoPreviewCard } from "@workspace/ui/components/video-preview-card";
import { Grid, type CellComponentProps } from "react-window";
import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export interface VideoPreviewGridItem {
  id: string;
  href?: string;
  poster: string;
  sources: Array<{ src: string; type?: string }>;
  title?: string;
  meta?: string;
  /** Card aspect ratio for this item; defaults to the grid's default. */
  aspectRatio?: string;
}

export interface VideoPreviewGridProps {
  items: VideoPreviewGridItem[];
  height: number;
  /** Gap between cards in px. @default 12 */
  gap?: number;
  /** Minimum card width used for the responsive column count. @default 250 */
  minCardWidth?: number;
  /** Columns override. When omitted, columns adapt to the container width. */
  columns?: number;
  /** Additional rows rendered outside the viewport. @default 2 */
  overscanCount?: number;
  className?: string;
  /** Touch devices: start playback when cards intersect the viewport. @default false */
  playOnIntersect?: boolean;
}

interface VideoPreviewGridCellData {
  columnCount: number;
  items: VideoPreviewGridItem[];
  playOnIntersect: boolean;
}

type VideoPreviewGridCellProps = CellComponentProps<VideoPreviewGridCellData>;

const DEFAULT_ASPECT_RATIO = "244 / 190";
const DEFAULT_GAP = 12;
const DEFAULT_MIN_CARD_WIDTH = 250;
const DEFAULT_COLUMNS = 4;
const MAX_COLUMNS = 8;

function aspectRatioToNumber(value: string, fallback: number): number {
  const ratio = value.trim().replace(":", "/");
  const [numerator, denominator] = ratio
    .split("/")
    .map((part) => Number.parseFloat(part));
  if (
    numerator !== undefined &&
    denominator !== undefined &&
    Number.isFinite(numerator) &&
    denominator !== 0
  ) {
    return numerator / denominator;
  }
  const parsed = Number.parseFloat(ratio);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function VideoPreviewGridCell({
  columnIndex,
  rowIndex,
  style,
  columnCount,
  items,
  playOnIntersect,
}: VideoPreviewGridCellProps): React.JSX.Element | null {
  const item = items[rowIndex * columnCount + columnIndex];
  if (!item) return null;

  return (
    <VideoPreviewCard
      style={style}
      poster={item.poster}
      sources={item.sources}
      href={item.href ?? "#"}
      aspectRatio={item.aspectRatio ?? DEFAULT_ASPECT_RATIO}
      playOnIntersect={playOnIntersect}
    >
      {(item.title || item.meta) && (
        <div className="flex flex-col gap-1">
          {item.title && (
            <span className="truncate text-xs font-medium text-white/80">
              {item.title}
            </span>
          )}
          {item.meta && (
            <span className="truncate text-[11px] text-white/55">
              {item.meta}
            </span>
          )}
        </div>
      )}
    </VideoPreviewCard>
  );
}

export function VideoPreviewGrid({
  items,
  height,
  gap = DEFAULT_GAP,
  minCardWidth = DEFAULT_MIN_CARD_WIDTH,
  columns,
  overscanCount = 2,
  className,
  playOnIntersect = false,
}: VideoPreviewGridProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const resolvedColumns = React.useMemo(() => {
    if (columns) return Math.max(1, columns);
    if (width > 0) {
      return Math.min(
        Math.max(1, Math.floor(width / minCardWidth)),
        MAX_COLUMNS,
      );
    }
    return DEFAULT_COLUMNS;
  }, [columns, width, minCardWidth]);

  const { columnWidth, rowHeight, rowCount } = React.useMemo(() => {
    const gaps = gap * (resolvedColumns - 1);
    const columnWidth = Math.max(1, (width - gaps) / resolvedColumns);
    const aspect =
      items.length > 0
        ? aspectRatioToNumber(items[0]?.aspectRatio ?? DEFAULT_ASPECT_RATIO, 1)
        : 1;
    const rowHeight = columnWidth / aspect + gap;
    return {
      columnWidth,
      rowHeight,
      rowCount: Math.max(1, Math.ceil(items.length / resolvedColumns)),
    };
  }, [gap, items, resolvedColumns, width]);

  const cellData = React.useMemo<VideoPreviewGridCellData>(
    () => ({
      columnCount: resolvedColumns,
      items,
      playOnIntersect,
    }),
    [items, playOnIntersect, resolvedColumns],
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height }}
    >
      <Grid
        columnCount={resolvedColumns}
        columnWidth={columnWidth}
        rowCount={rowCount}
        rowHeight={rowHeight}
        overscanCount={overscanCount}
        cellComponent={VideoPreviewGridCell}
        cellProps={cellData}
        style={{ width: "100%", height }}
      />
    </div>
  );
}

export default VideoPreviewGrid;
