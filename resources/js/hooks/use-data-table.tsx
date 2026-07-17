"use client";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import React from "react";

import { DataTableColumnHeader } from "@/components/shadcn/data-table/data-table-column-header";
import type { ExtendedColumnSort } from "@/types/data-table";

export interface UseDataTableProps<TData>
  extends Omit<
      TableOptions<TData>,
      | "state"
      | "pageCount"
      | "getCoreRowModel"
      | "manualFiltering"
      | "manualPagination"
      | "manualSorting"
    >,
    Required<Pick<TableOptions<TData>, "pageCount">> {
  initialState?: Omit<Partial<TableState>, "sorting"> & {
    sorting?: ExtendedColumnSort<TData>[];
  };
  onFilterChange?: (updater: Updater<ColumnFiltersState>) => void;
  onGlobalFilterChange?: (updater: Updater<string>) => void;
  onSortingChange?: (updater: Updater<SortingState>) => void;
  onPaginationChange?: (updater: Updater<PaginationState>) => void;
}

type DataTableState<TData> = {
  rowSelection: RowSelectionState;
  columnVisibility: VisibilityState;
  page: number;
  perPage: number;
  sorting: ExtendedColumnSort<TData>[];
  columnFilters: ColumnFiltersState;
  globalFilter: string;
};

type DataTableAction<TData> =
  | { type: "SET_ROW_SELECTION"; payload: RowSelectionState }
  | { type: "SET_COLUMN_VISIBILITY"; payload: VisibilityState }
  | { type: "SET_PAGINATION"; payload: { page: number; perPage: number } }
  | { type: "SET_SORTING"; payload: ExtendedColumnSort<TData>[] }
  | { type: "SET_COLUMN_FILTERS"; payload: ColumnFiltersState }
  | { type: "SET_GLOBAL_FILTER"; payload: string };

function tableReducer<TData>(
  state: DataTableState<TData>,
  action: DataTableAction<TData>
): DataTableState<TData> {
  switch (action.type) {
    case "SET_ROW_SELECTION":
      return { ...state, rowSelection: action.payload };
    case "SET_COLUMN_VISIBILITY":
      return { ...state, columnVisibility: action.payload };
    case "SET_PAGINATION":
      return {
        ...state,
        page: action.payload.page,
        perPage: action.payload.perPage,
      };
    case "SET_SORTING":
      return { ...state, sorting: action.payload };
    case "SET_COLUMN_FILTERS":
      return { ...state, columnFilters: action.payload, page: 1 };
    case "SET_GLOBAL_FILTER":
      return { ...state, globalFilter: action.payload, page: 1 };
    default:
      return state;
  }
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const {
    columns,
    pageCount = -1,
    initialState,
    onFilterChange: customOnFilterChange,
    onGlobalFilterChange: customOnGlobalFilterChange,
    onSortingChange: customOnSortingChange,
    onPaginationChange: customOnPaginationChange,
    ...tableProps
  } = props;

  const initialTableState: DataTableState<TData> = {
    rowSelection: initialState?.rowSelection ?? {},
    columnVisibility: initialState?.columnVisibility ?? {},
    page: initialState?.pagination?.pageIndex
      ? initialState.pagination.pageIndex + 1
      : 1,
    perPage: initialState?.pagination?.pageSize ?? 10,
    sorting: initialState?.sorting ?? [],
    columnFilters: initialState?.columnFilters ?? [],
    globalFilter: initialState?.globalFilter ?? "",
  };

  const [state, dispatch] = React.useReducer(
    tableReducer<TData>,
    initialTableState
  );

  const pagination: PaginationState = React.useMemo(
    () => ({
      pageIndex: state.page - 1,
      pageSize: state.perPage,
    }),
    [state.page, state.perPage]
  );
  const onPaginationChange = React.useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const currentPagination = {
        pageIndex: state.page - 1,
        pageSize: state.perPage,
      };
      let newPagination: PaginationState;
      if (typeof updaterOrValue === "function") {
        newPagination = updaterOrValue(currentPagination);
      } else {
        newPagination = updaterOrValue;
      }
      dispatch({
        type: "SET_PAGINATION",
        payload: {
          page: newPagination.pageIndex + 1,
          perPage: newPagination.pageSize,
        },
      });
      if (customOnPaginationChangeRef.current) {
        customOnPaginationChangeRef.current(updaterOrValue);
      }
    },
    [state.page, state.perPage]
  );

  const onSortingChange = React.useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      let newSorting: SortingState;
      if (typeof updaterOrValue === "function") {
        newSorting = updaterOrValue(state.sorting);
      } else {
        newSorting = updaterOrValue;
      }
      dispatch({
        type: "SET_SORTING",
        payload: newSorting as ExtendedColumnSort<TData>[],
      });
      if (customOnSortingChangeRef.current) {
        customOnSortingChangeRef.current(updaterOrValue);
      }
    },
    [state.sorting]
  );

  const customOnFilterChangeRef = React.useRef(customOnFilterChange);
  customOnFilterChangeRef.current = customOnFilterChange;

  const customOnGlobalFilterChangeRef = React.useRef(
    customOnGlobalFilterChange
  );
  customOnGlobalFilterChangeRef.current = customOnGlobalFilterChange;

  const customOnSortingChangeRef = React.useRef(customOnSortingChange);
  customOnSortingChangeRef.current = customOnSortingChange;

  const customOnPaginationChangeRef = React.useRef(customOnPaginationChange);
  customOnPaginationChangeRef.current = customOnPaginationChange;

  const onColumnFiltersChange = React.useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(state.columnFilters)
          : updaterOrValue;
      dispatch({ type: "SET_COLUMN_FILTERS", payload: next });
      if (customOnFilterChangeRef.current) {
        customOnFilterChangeRef.current(updaterOrValue);
      }
    },
    [state.columnFilters]
  );

  const onGlobalFilterChange = React.useCallback(
    (updaterOrValue: Updater<string>) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(state.globalFilter)
          : updaterOrValue;
      dispatch({ type: "SET_GLOBAL_FILTER", payload: next });
      if (customOnGlobalFilterChangeRef.current) {
        customOnGlobalFilterChangeRef.current(updaterOrValue);
      }
    },
    [state.globalFilter]
  );

  const onRowSelectionChange = React.useCallback(
    (updaterOrValue: Updater<RowSelectionState>) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(state.rowSelection)
          : updaterOrValue;
      dispatch({ type: "SET_ROW_SELECTION", payload: next });
    },
    [state.rowSelection]
  );

  const onColumnVisibilityChange = React.useCallback(
    (updaterOrValue: Updater<VisibilityState>) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(state.columnVisibility)
          : updaterOrValue;
      dispatch({ type: "SET_COLUMN_VISIBILITY", payload: next });
    },
    [state.columnVisibility]
  );

  const table = useReactTable({
    ...tableProps,
    columns,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting: state.sorting,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
      columnFilters: state.columnFilters,
      globalFilter: state.globalFilter,
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: true,
      enableSorting: false,
      header: ({ column, header }) => {
        const title = typeof header === "string" ? header : column.id;
        return <DataTableColumnHeader column={column} title={title} />;
      },
    },
    enableRowSelection: true,
    onRowSelectionChange,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return { table };
}
