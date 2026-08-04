import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import type * as React from "react";

import { DataTablePagination } from "@/components/shadcn/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { getCommonPinningStyles } from "@/lib/data-table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  isSelectable?: boolean;
  totalCount?: number;
  renderMobileCard?: (row: TData) => React.ReactNode;
}

export function DataTable<TData>({
  table,
  actionBar,
  isSelectable = false,
  children,
  className,
  totalCount,
  renderMobileCard,
  ...props
}: DataTableProps<TData>) {
  return (
    <div className={cn("flex w-full min-w-0 max-w-full flex-col gap-2.5", className)} {...props}>
      {children}
      <div className={cn("rounded-md border max-w-full", renderMobileCard ? "hidden sm:block overflow-hidden" : "overflow-hidden")}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    colSpan={header.colSpan}
                    key={header.id}
                    style={{
                      ...getCommonPinningStyles({ column: header.column }),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        ...getCommonPinningStyles({ column: cell.column }),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={table.getAllColumns().length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {renderMobileCard && (
        <div className="sm:hidden flex flex-col gap-4">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div key={row.id}>
                {renderMobileCard(row.original)}
              </div>
            ))
          ) : (
            <div className="h-24 flex items-center justify-center text-center text-muted-foreground border rounded-md bg-card">
              No results.
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        <DataTablePagination
          isSelectable={isSelectable}
          table={table}
          totalCount={totalCount}
        />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
