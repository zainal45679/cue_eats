"use client";

import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/shadcn/ui/button";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.ComponentProps<"div"> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  const canSort = column.getCanSort();
  const isSorted = column.getIsSorted();

  if (!canSort) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <Button
        className="-ml-3 h-8 px-3 font-medium"
        onClick={() => {
          if (isSorted === "asc") {
            column.toggleSorting(true); // desc
          } else if (isSorted === "desc") {
            column.clearSorting(); // none
          } else {
            column.toggleSorting(false); // asc
          }
        }}
        size="sm"
        variant="ghost"
      >
        {title}
        {isSorted === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : isSorted === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
