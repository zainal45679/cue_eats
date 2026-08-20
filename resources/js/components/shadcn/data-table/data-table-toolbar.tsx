"use client";

import { router } from "@inertiajs/react";
import type { Column, Table } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Filter, Search, X } from "lucide-react";
import * as React from "react";

import { DataTableDateFilter } from "@/components/shadcn/data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "@/components/shadcn/data-table/data-table-faceted-filter";
import { DataTableSliderFilter } from "@/components/shadcn/data-table/data-table-slider-filter";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  activeFilterCount?: number;
  showFilterToggle?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  activeFilterCount: propActiveFilterCount,
  showFilterToggle = true,
  ...props
}: DataTableToolbarProps<TData>) {
  const [showFilters, setShowFilters] = React.useState(false);
  const genericColumnFilters = table.getState().columnFilters.filter((filter) => filter.id !== "created_at");
  const isFiltered = genericColumnFilters.length > 0;
  const globalFilter = table.getState().globalFilter as string;

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  );

  // Use prop value if provided, otherwise calculate from table state
  const activeFilterCount =
    propActiveFilterCount ??
    genericColumnFilters.filter((filter) => {
      const value = filter.value;
      // Count any filter that has a value (not null, undefined, or empty)
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim() !== "";
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") return Object.keys(value).length > 0;
      return true; // for numbers, booleans, etc.
    }).length;

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
    table.setGlobalFilter("");

    const queryParams = {
      ...Object.fromEntries(new URLSearchParams(window.location.search)),
    };

    if (queryParams.filters) {
      try {
        const parsed = JSON.parse(queryParams.filters);
        const dateFilter = parsed.find((f: any) => f.id === 'created_at');
        if (dateFilter) {
          queryParams.filters = JSON.stringify([dateFilter]);
        } else {
          delete queryParams.filters;
        }
      } catch {
        delete queryParams.filters;
      }
    }

    delete queryParams.search;
    delete queryParams.page;
    delete queryParams.perPage;

    router.get(window.location.pathname, queryParams, {
      preserveState: false,
      preserveScroll: false,
    });
  }, [table]);

  return (
    <div
      aria-orientation="horizontal"
      className={cn("flex w-full flex-col gap-2", className)}
      role="toolbar"
      {...props}
    >
      <div className="flex w-full items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
          <Input
            className="h-9 pr-8 pl-8"
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
          />
          {globalFilter && (
            <button
              className="absolute top-2.5 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={() => table.setGlobalFilter("")}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {children}
          {showFilterToggle && (
            <Button
              className={cn("relative h-8", showFilters && "bg-accent")}
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              variant="outline"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  className="-top-2 -right-2 absolute h-5 border-1 border-zinc-400 bg-background px-1.5 text-foreground text-xs dark:border-zinc-400"
                  variant="destructive"
                >
                  {activeFilterCount}
                </Badge>
              )}
              {showFilters ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )}
          {(isFiltered || globalFilter) && (
            <Button
              aria-label="Reset filters"
              className="h-8 border-dashed"
              onClick={onReset}
              size="sm"
              variant="outline"
            >
              <X className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
          )}
        </div>
      </div>

      {/* Column Filters Row - Only shown when toggle is active */}
      {showFilters && columns.length > 0 && (
        <div className="flex flex-1 flex-wrap items-center gap-2 rounded-md border p-2">
          <p className="text-muted-foreground text-sm">Filter by:</p>
          {columns.map((column) => (
            <DataTableToolbarFilter column={column} key={column.id} />
          ))}
        </div>
      )}
    </div>
  );
}
interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

function DataTableToolbarFilter<TData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  {
    const columnMeta = column.columnDef.meta;

    const onFilterRender = React.useCallback(() => {
      const variant = columnMeta?.variant ?? "text";

      switch (variant) {
        case "text": {
          const textValue = (column.getFilterValue() as string) ?? "";
          return (
            <div className="relative">
              <Input
                className="h-8 w-40 pr-8 lg:w-56"
                onChange={(event) => column.setFilterValue(event.target.value)}
                placeholder={
                  columnMeta?.placeholder ?? columnMeta?.label ?? column.id
                }
                value={textValue}
              />
              {textValue && (
                <button
                  className="absolute top-2 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => column.setFilterValue("")}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        }

        case "number": {
          const numberValue = (column.getFilterValue() as string) ?? "";
          return (
            <div className="relative">
              <Input
                className={cn("h-8 w-[120px] pr-8", columnMeta?.unit && "pr-8")}
                inputMode="numeric"
                onChange={(event) => column.setFilterValue(event.target.value)}
                placeholder={
                  columnMeta?.placeholder ?? columnMeta?.label ?? column.id
                }
                type="number"
                value={numberValue}
              />
              {numberValue && (
                <button
                  className="absolute top-2 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => column.setFilterValue("")}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {columnMeta?.unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {columnMeta.unit}
                </span>
              )}
            </div>
          );
        }

        case "range":
          return (
            <DataTableSliderFilter
              column={column}
              title={columnMeta?.label ?? column.id}
            />
          );

        case "date":
        case "dateRange":
          return (
            <DataTableDateFilter
              column={column}
              multiple={variant === "dateRange"}
              title={columnMeta?.label ?? column.id}
            />
          );

        case "select":
        case "multiSelect":
          return (
            <DataTableFacetedFilter
              column={column}
              multiple={variant === "multiSelect"}
              options={columnMeta?.options ?? []}
              title={columnMeta?.label ?? column.id}
            />
          );

        default: {
          const defaultValue = (column.getFilterValue() as string) ?? "";
          return (
            <div className="relative">
              <Input
                className="h-8 w-40 pr-8 lg:w-56"
                onChange={(event) => column.setFilterValue(event.target.value)}
                placeholder={
                  columnMeta?.placeholder ?? columnMeta?.label ?? column.id
                }
                value={defaultValue}
              />
              {defaultValue && (
                <button
                  className="absolute top-2 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => column.setFilterValue("")}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        }
      }
    }, [column, columnMeta]);

    return onFilterRender();
  }
}
