import { Link, router } from "@inertiajs/react";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { Edit, Eye, Plus, Trash2, X } from "lucide-react";
import React, { useMemo } from "react";
import { DataTable } from "@/components/shadcn/data-table/data-table";
import { DataTableActionBar } from "@/components/shadcn/data-table/data-table-action-bar";
import { DataTableColumnHeader } from "@/components/shadcn/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/shadcn/data-table/data-table-toolbar";
import { DataTableViewOptions } from "@/components/shadcn/data-table/data-table-view-options";
import { Button } from "@/components/shadcn/ui/button";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { Separator } from "@/components/shadcn/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { useAbility } from "@/hooks/use-ability";
import {
  type UseDataTableProps as UseDataTableOptions,
  useDataTable,
} from "@/hooks/use-data-table";
import { useFilters } from "@/hooks/use-filters";
import { usePagination } from "@/hooks/use-pagination";
import { useSorting } from "@/hooks/use-sorting";
import type { ExtendedColumnFilter } from "@/types/data-table";
import type { XDataTableProps } from "./XDataTableType";

export function XDataTable<T extends { id: string | number }>({
  data,
  columns,
  filters: initialFilters = [],
  sort: defaultSort,
  actionBarButtons = [],
  actions,
  entity,
  title,
  titleButtons = [],
}: XDataTableProps<T>) {
  const isSelectable = actionBarButtons.length > 0;

  const ability = useAbility(entity);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteUrl, setDeleteUrl] = React.useState<string | null>(null);

  const [actionDialogOpen, setActionDialogOpen] = React.useState(false);
  const [actionDialogData, setActionDialogData] = React.useState<{
    button: (typeof actionBarButtons)[0];
    selectedRows: T[];
  } | null>(null);

  const filtersFromQuery = data.filters;
  const sortBy = data.sortBy as string | undefined;
  const sortDesc = data.sortDesc as boolean | undefined;
  const search = data.search as string | undefined;

  const { rows: initRows, meta } = data;
  const { currentPage, perPage, lastPage } = meta;

  const processedInitialFilters = React.useMemo(() => {
    const queryFilters = filtersFromQuery
      ? filtersFromQuery.map((f) => ({
          id: f.id,
          value: f.value,
        }))
      : [];

    return [...initialFilters, ...queryFilters];
  }, [filtersFromQuery, initialFilters]);

  const processedDefaultSort = React.useMemo(() => {
    if (defaultSort) {
      return defaultSort;
    }
    if (sortBy) {
      return { id: sortBy, desc: !!sortDesc };
    }
    return;
  }, [defaultSort, sortBy, sortDesc]);

  const processedColumns = React.useMemo(() => {
    const checkboxColumn: ColumnDef<T, unknown> | null = isSelectable
      ? {
          id: "select",
          size: 20,
          header: ({ table: tableData }) => (
            <div className="flex items-center justify-start">
              <Checkbox
                aria-label="Select all"
                checked={
                  tableData.getIsAllPageRowsSelected() ||
                  (tableData.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                  tableData.toggleAllPageRowsSelected(!!value)
                }
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-start">
              <Checkbox
                aria-label="Select row"
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
          enableColumnFilter: false,
        }
      : null;

    const processedUserColumns = columns.map((column) => {
      const col = column as ColumnDef<T, unknown> & {
        accessorKey?: string;
        meta?: { label?: string };
      };
      const originalHeader = col.header;

      if (typeof originalHeader === "string" && !col.meta?.label) {
        col.meta = { ...col.meta, label: originalHeader };
      }

      if (typeof originalHeader === "function") {
        return {
          ...col,
          enableSorting: false,
        };
      }

      const shouldEnableSorting = col.enableSorting === true;

      return {
        ...col,
        accessorKey: col.accessorKey || col.id,
        enableColumnFilter: col.enableColumnFilter ?? false,
        enableSorting: shouldEnableSorting,

        // biome-ignore lint/suspicious/noExplicitAny: Will be addressed later
        header: ({ column: c }: any) => {
          const colTitle =
            typeof originalHeader === "string" ? originalHeader : c.id;

          // if (shouldEnableSorting) {
          return <DataTableColumnHeader column={c} title={colTitle} />;
          // }

          // return title;
        },
      };
    });

    const actionsColumn = actions
      ? ({
          id: "actions",
          header: "Actions",
          enableSorting: false,
          enableColumnFilter: false,
          cell: ({ row }: { row: { original: T } }) => (
            <TooltipProvider>
              <div className="flex items-center space-x-2">
                {actions.map((action) => {
                  if (
                    (action.action === "edit" && !ability.canUpdate) ||
                    (action.action === "delete" && !ability.canDelete) ||
                    (action.show && !action.show(row))
                  ) {
                    return null;
                  }

                  const defaultName =
                    action.action === "edit"
                      ? "Edit"
                      : action.action === "delete"
                        ? "Delete"
                        : action.action === "view"
                          ? "View"
                          : undefined;
                  const defaultIcon =
                    action.action === "edit" ? (
                      <Edit className="h-4 w-4" />
                    ) : action.action === "delete" ? (
                      <Trash2 className="h-4 w-4" />
                    ) : action.action === "view" ? (
                      <Eye className="h-4 w-4" />
                    ) : undefined;
                  const defaultUrl =
                    action.action === "edit"
                      ? (row: T) => `${window.location.pathname}/${row.id}/edit`
                      : action.action === "delete"
                        ? (row: T) => `${window.location.pathname}/${row.id}`
                        : action.action === "view"
                          ? (row: T) => `${window.location.pathname}/${row.id}`
                          : undefined;

                  const name = action.name || defaultName || action.action;
                  const icon = action.icon || defaultIcon;

                  if (action.onClick !== undefined) {
                    return (
                      <Tooltip
                        delayDuration={500}
                        key={action.action + action.name}
                      >
                        <TooltipTrigger asChild>
                          <Button
                            asChild
                            onClick={() => action.onClick?.(row.original)}
                            size="sm"
                            variant="ghost"
                          >
                            <Button
                              className="text-foreground hover:text-foreground/70"
                              variant="ghost"
                            >
                              {icon || action.action}
                            </Button>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{name}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  const urlFn = action.url || defaultUrl;

                  if (!urlFn) {
                    return null;
                  }

                  const url = urlFn(row.original);
                  if (action.action === "delete") {
                    return (
                      <Tooltip
                        delayDuration={500}
                        key={action.action + action.name}
                      >
                        <TooltipTrigger asChild>
                          <Button
                            className="text-red-600 hover:bg-red-50 hover:text-red-800"
                            onClick={() => {
                              setDeleteUrl(url);
                              setDeleteDialogOpen(true);
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            {icon || "Delete"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{name}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <Tooltip
                      delayDuration={500}
                      key={action.action + action.name}
                    >
                      <TooltipTrigger asChild>
                        <Button asChild size="sm" variant="ghost">
                          <Link
                            className="text-foreground hover:text-foreground/70"
                            href={url}
                          >
                            {icon || action.action}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{name}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          ),
        } as ColumnDef<T, unknown>)
      : null;

    return [checkboxColumn, ...processedUserColumns, actionsColumn].filter(
      Boolean
    );
  }, [
    columns,
    isSelectable,
    actions,
    ability.canDelete,
    ability.canUpdate,
    title,
  ]);

  const pagination = usePagination(currentPage, perPage);

  const sorting = useSorting(
    processedDefaultSort ? [processedDefaultSort] : []
  );

  const filters = useFilters<T>(
    processedInitialFilters as ExtendedColumnFilter<T>[]
  );

  // Convert sorting to table format
  const tableSorting = sorting.sorting.map((s) => ({
    id: s.id as Extract<keyof T, string>,
    desc: s.desc,
  }));

  // Convert filters to table format
  const tableFilters = filters.filters.map((f) => ({
    id: f.id,
    value: f.value,
  }));

  const onFilterChange = React.useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      const newFilters =
        typeof updater === "function" ? updater(tableFilters) : updater;
      const extendedFilters = newFilters.map((f) => {
        const existing = filters.filters.find((ef) => ef.id === f.id);
        if (existing) {
          return {
            ...existing,
            value: f.value as string | string[],
          };
        }
        return {
          id: f.id as Extract<keyof T, string>,
          value: f.value as string | string[],
        };
      });
      filters.setFilters(extendedFilters);
    },
    [filters, tableFilters]
  );

  const onPaginationChange = React.useCallback(
    (updater: Updater<PaginationState>) => {
      const newPagination =
        typeof updater === "function"
          ? updater({
              pageIndex: pagination.page - 1,
              pageSize: pagination.perPage,
            })
          : updater;
      pagination.updatePagination({
        page: newPagination.pageIndex + 1,
        perPage: newPagination.pageSize,
      });
    },
    [pagination]
  );

  const onSortingChange = React.useCallback(
    (updater: Updater<SortingState>) => {
      const newSorting =
        typeof updater === "function" ? updater(tableSorting) : updater;
      sorting.setSorting(newSorting.map((s) => ({ id: s.id, desc: s.desc })));
    },
    [sorting, tableSorting]
  );

  const onGlobalFilterChange = React.useCallback((updater: Updater<string>) => {
    const newSearch = typeof updater === "function" ? updater("") : updater;

    const queryParams = {
      ...Object.fromEntries(new URLSearchParams(window.location.search)),
    };

    if (newSearch?.trim()) {
      queryParams.search = newSearch.trim();
    } else {
      delete queryParams.search;
    }

    queryParams.page = "1";

    router.get(window.location.pathname, queryParams, {
      preserveState: true,
      preserveScroll: true,
    });
  }, []);

  const { table } = useDataTable({
    data: initRows,
    columns: processedColumns,
    pageCount: lastPage,
    initialState: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.perPage,
      },
      sorting: tableSorting,
      columnFilters: tableFilters,
      globalFilter: search || "",
    },
    onPaginationChange,
    onSortingChange,
    onFilterChange,
    onGlobalFilterChange,
    getRowId: (row) => String(row.id),
  } as UseDataTableOptions<T>);

  // Calculate active filter count from the filters hook
  const activeFilterCount = React.useMemo(
    () =>
      filters.filters.filter((filter) => {
        const value = filter.value;
        if (value === null || value === undefined) {
          return false;
        }
        if (typeof value === "string") {
          return value.trim() !== "";
        }
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        if (typeof value === "object") {
          return Object.keys(value).length > 0;
        }
        return true;
      }).length,
    [filters.filters]
  );

  const actionBar = useMemo(() => {
    if (actionBarButtons.length === 0) {
      return;
    }
    return (
      <DataTableActionBar
        className="rounded-xl bg-background/95 backdrop-blur-lg transition-transform duration-200 hover:scale-105 supports-backdrop-filter:bg-background/40"
        table={table}
      >
        <TooltipProvider>
          <div className="flex items-center space-x-2">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <>
                <Tooltip delayDuration={500}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => table.toggleAllPageRowsSelected(false)}
                      size="icon"
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear Selection</p>
                  </TooltipContent>
                </Tooltip>

                <Separator className="h-6!" orientation="vertical" />

                <span className="font-medium text-foreground text-sm">
                  {table.getFilteredSelectedRowModel().rows.length} Items
                  Selected
                </span>

                <Separator className="h-6!" orientation="vertical" />
              </>
            )}
          </div>

          {actionBarButtons.map((button) => {
            if (
              button.permission &&
              !ability.can(button.permission.action, button.permission.entity)
            ) {
              return null;
            }

            return (
              <Tooltip delayDuration={500} key={button.label}>
                <TooltipTrigger asChild>
                  <Button
                    className={button.className}
                    onClick={() => {
                      const selected = table
                        .getFilteredSelectedRowModel()
                        .rows.map((r) => r.original);
                      if (button.type === "dialog") {
                        setActionDialogData({ button, selectedRows: selected });
                        setActionDialogOpen(true);
                      } else {
                        button.onAction(selected);
                      }
                    }}
                    size="icon"
                    variant={button.variant}
                  >
                    {button.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{button.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </DataTableActionBar>
    );
  }, [table, actionBarButtons, ability]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div>
          {title && <h1 className="mb-3 font-bold text-2xl">{title}</h1>}
        </div>
        <div className="mb-3 flex space-x-2">
          {titleButtons.map((button) => {
            if (button.type === "create" && !ability.canCreate) {
              return null;
            }

            const icon =
              button.icon ||
              (button.type === "create" ? (
                <Plus className="h-4 w-4" />
              ) : undefined);

            const label =
              button.label || (button.type === "create" ? "Create" : "Button");

            const link =
              button.link ||
              (button.type === "create"
                ? `${window.location.pathname}/create`
                : "");

            if (button.onClick) {
              return (
                <Button
                  className={button.className}
                  onClick={button.onClick}
                  size={"default"}
                  variant={button.variant}
                >
                  {icon && <span className="">{icon}</span>}
                  {label}
                </Button>
              );
            }

            return (
              <Link href={link} key={label}>
                <Button
                  className={button.className}
                  size={"default"}
                  variant={button.variant}
                >
                  {icon && <span className="">{icon}</span>}
                  {label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <DataTable
        actionBar={actionBar}
        isSelectable={isSelectable}
        table={table}
        totalCount={data.meta.total}
      >
        <DataTableToolbar activeFilterCount={activeFilterCount} table={table}>
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTable>

      <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              <p>Are you sure you want to delete this item?</p>
              <p className="mt-2">
                <strong>This action cannot be undone.</strong>
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deleteUrl) {
                  router.visit(deleteUrl, { method: "delete" });
                }
                setDeleteDialogOpen(false);
              }}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setActionDialogOpen} open={actionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialogData?.button.dialog?.title ?? "Confirm Action"}
            </DialogTitle>
            <DialogDescription>
              {actionDialogData?.button.dialog?.description ??
                "Are you sure you want to proceed with this action?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setActionDialogOpen(false)}
              variant="outline"
            >
              {actionDialogData?.button.dialog?.cancelLabel || "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (actionDialogData) {
                  actionDialogData.button.onAction(
                    actionDialogData.selectedRows
                  );
                  setActionDialogOpen(false);
                }
              }}
            >
              {actionDialogData?.button.dialog?.actionLabel || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
