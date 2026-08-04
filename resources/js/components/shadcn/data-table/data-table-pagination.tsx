import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/shadcn/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  isSelectable?: boolean;
  totalCount?: number;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  isSelectable = false,
  className,
  totalCount,
  ...props
}: DataTablePaginationProps<TData>) {
  return (
    <div
      className={cn(
        "flex w-full flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1",
        className
      )}
      {...props}
    >
      <div className="order-2 sm:order-1 flex flex-1 items-center justify-center sm:justify-start gap-2 whitespace-nowrap text-muted-foreground text-xs sm:text-sm">
        <span>Total {totalCount} item(s)</span>
        {isSelectable &&
          table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              <Separator className="!h-4" orientation="vertical" />
              <span>
                {table.getFilteredSelectedRowModel().rows.length} /{" "}
                {table.getFilteredRowModel().rows.length} selected
              </span>
            </>
          )}
      </div>
      
      <div className="order-1 sm:order-2 flex flex-row items-center justify-between w-full sm:w-auto sm:justify-end gap-2 sm:gap-6">
        <div className="flex items-center space-x-2">
          <p className="hidden sm:block whitespace-nowrap font-medium text-sm text-muted-foreground">
            Rows
          </p>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={`${table.getState().pagination.pageSize}`}
          >
            <SelectTrigger className="h-8 w-[4.5rem] [&[data-size]]:h-8 text-xs sm:text-sm">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center font-medium text-xs sm:text-sm">
          Pg {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>

        <div className="flex items-center space-x-1">
          <Button
            aria-label="Go to first page"
            className="hidden size-8 lg:flex"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            size="icon"
            variant="outline"
          >
            <ChevronsLeft />
          </Button>
          <Button
            aria-label="Go to previous page"
            className="size-8"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon"
            variant="outline"
          >
            <ChevronLeft />
          </Button>
          <Button
            aria-label="Go to next page"
            className="size-8"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon"
            variant="outline"
          >
            <ChevronRight />
          </Button>
          <Button
            aria-label="Go to last page"
            className="hidden size-8 lg:flex"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            size="icon"
            variant="outline"
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
