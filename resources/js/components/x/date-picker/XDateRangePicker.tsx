"use client";

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

interface XDateRangePickerProps {
  value?: DateRange;
  onChange: (date: DateRange | undefined) => void;
  title?: string;
}

export function XDateRangePicker({
  value,
  onChange,
  title = "Date",
}: XDateRangePickerProps) {
  const onReset = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onChange(undefined);
    },
    [onChange]
  );

  const hasValue = !!(value?.from || value?.to);

  const formatDateRange = React.useCallback((range: DateRange) => {
    if (!(range.from || range.to)) return "";
    if (range.from && range.to) {
      return `${formatDate(range.from)} - ${formatDate(range.to)}`;
    }
    return formatDate(range.from ?? range.to);
  }, []);

  const label = React.useMemo(() => {
    if (!hasValue) return <span className="flex items-center gap-2"><span>{title}</span></span>;

    const dateText = formatDateRange(value!);

    return (
      <span className="flex items-center gap-2">
        <span>{title}</span>
        <Separator
          className="mx-0.5 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <span>{dateText}</span>
      </span>
    );
  }, [value, hasValue, formatDateRange, title]);

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
              <XCircle className="size-4 mr-2" />
            </div>
          ) : (
            <CalendarIcon className="size-4 mr-2" />
          )}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
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
                onChange({ from: today, to: today });
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
                onChange({ from: yesterday, to: yesterday });
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
                onChange({ from: last7Days, to: today });
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
                onChange({ from: last30Days, to: today });
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
            onSelect={onChange}
            selected={value}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
