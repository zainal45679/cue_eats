"use client";

import type { Column } from "@tanstack/react-table";
import { CalendarIcon, XCircle } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/shadcn/ui/button";
import { Calendar } from "@/components/shadcn/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import { Separator } from "@/components/shadcn/ui/separator";
import { formatDate } from "@/lib/format";

type DateSelection = Date[] | DateRange;

function getIsDateRange(value: DateSelection): value is DateRange {
  return value && typeof value === "object" && !Array.isArray(value);
}

function parseAsDate(timestamp: number | string | undefined): Date | undefined {
  if (!timestamp) return;
  const numericTimestamp =
    typeof timestamp === "string" ? Number(timestamp) : timestamp;
  const date = new Date(numericTimestamp);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseColumnFilterValue(value: unknown) {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "number" || typeof item === "string") {
        return item;
      }
      return;
    });
  }

  if (typeof value === "string" || typeof value === "number") {
    return [value];
  }

  return [];
}

interface DataTableDateFilterProps<TData> {
  column: Column<TData, unknown>;
  title?: string;
  multiple?: boolean;
}

export function DataTableDateFilter<TData>({
  column,
  title,
  multiple,
}: DataTableDateFilterProps<TData>) {
  const columnFilterValue = column.getFilterValue();

  const selectedDates = React.useMemo<DateSelection>(() => {
    if (!columnFilterValue) {
      return multiple ? { from: undefined, to: undefined } : [];
    }

    if (multiple) {
      const timestamps = parseColumnFilterValue(columnFilterValue);
      return {
        from: parseAsDate(timestamps[0]),
        to: parseAsDate(timestamps[1]),
      };
    }

    const timestamps = parseColumnFilterValue(columnFilterValue);
    const date = parseAsDate(timestamps[0]);
    return date ? [date] : [];
  }, [columnFilterValue, multiple]);

  const onSelect = React.useCallback(
    (date: Date | DateRange | undefined) => {
      if (!date) {
        column.setFilterValue(undefined);
        return;
      }

      if (multiple && !("getTime" in date)) {
        const from = date.from?.getTime();
        const to = date.to?.getTime();
        column.setFilterValue(from || to ? [from, to] : undefined);
      } else if (!multiple && "getTime" in date) {
        column.setFilterValue(date.getTime());
      }
    },
    [column, multiple]
  );

  const onReset = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      column.setFilterValue(undefined);
    },
    [column]
  );

  const hasValue = React.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) return false;
      return selectedDates.from || selectedDates.to;
    }
    if (!Array.isArray(selectedDates)) return false;
    return selectedDates.length > 0;
  }, [multiple, selectedDates]);

  const formatDateRange = React.useCallback((range: DateRange) => {
    if (!(range.from || range.to)) return "";
    if (range.from && range.to) {
      return `${formatDate(range.from)} - ${formatDate(range.to)}`;
    }
    return formatDate(range.from ?? range.to);
  }, []);

  const label = React.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) return null;

      const hasSelectedDates = selectedDates.from || selectedDates.to;
      const dateText = hasSelectedDates
        ? formatDateRange(selectedDates)
        : "Select date range";

      return (
        <span className="flex items-center gap-2">
          <span>{title}</span>
          {hasSelectedDates && (
            <>
              <Separator
                className="mx-0.5 data-[orientation=vertical]:h-4"
                orientation="vertical"
              />
              <span>{dateText}</span>
            </>
          )}
        </span>
      );
    }

    if (getIsDateRange(selectedDates)) return null;

    const hasSelectedDate = selectedDates.length > 0;
    const dateText = hasSelectedDate
      ? formatDate(selectedDates[0])
      : "Select date";

    return (
      <span className="flex items-center gap-2">
        <span>{title}</span>
        {hasSelectedDate && (
          <>
            <Separator
              className="mx-0.5 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
            <span>{dateText}</span>
          </>
        )}
      </span>
    );
  }, [selectedDates, multiple, formatDateRange, title]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="border-dashed" size="sm" variant="outline">
          {hasValue ? (
            <div
              aria-label={`Clear ${title} filter`}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onClick={onReset}
              role="button"
              tabIndex={0}
            >
              <XCircle />
            </div>
          ) : (
            <CalendarIcon />
          )}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        {multiple ? (
          <div className="flex">
            <div className="flex flex-col gap-1 p-3 border-r border-border min-w-[140px]">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Quick Select</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start font-normal h-8"
                onClick={() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  onSelect({ from: today, to: today });
                }}
              >
                Today
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start font-normal h-8"
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  yesterday.setHours(0, 0, 0, 0);
                  onSelect({ from: yesterday, to: yesterday });
                }}
              >
                Yesterday
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start font-normal h-8"
                onClick={() => {
                  const today = new Date();
                  const last7Days = new Date();
                  last7Days.setDate(today.getDate() - 7);
                  last7Days.setHours(0, 0, 0, 0);
                  onSelect({ from: last7Days, to: today });
                }}
              >
                Last 7 Days
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start font-normal h-8"
                onClick={() => {
                  const today = new Date();
                  const last30Days = new Date();
                  last30Days.setDate(today.getDate() - 30);
                  last30Days.setHours(0, 0, 0, 0);
                  onSelect({ from: last30Days, to: today });
                }}
              >
                Last 30 Days
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start font-normal h-8 mt-4 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => onReset(e as any)}
              >
                Clear
              </Button>
            </div>
            <Calendar
              captionLayout="dropdown"
              mode="range"
              onSelect={onSelect}
              selected={
                getIsDateRange(selectedDates)
                  ? selectedDates
                  : { from: undefined, to: undefined }
              }
            />
          </div>
        ) : (
          <Calendar
            captionLayout="dropdown"
            mode="single"
            onSelect={onSelect}
            selected={
              getIsDateRange(selectedDates) ? undefined : selectedDates[0]
            }
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
