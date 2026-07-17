"use client";

import { router } from "@inertiajs/react";
import React from "react";
import type { ExtendedColumnFilter } from "@/types/data-table";

export interface UseFiltersReturn<TData> {
  filters: ExtendedColumnFilter<TData>[];
  setFilters: (filters: ExtendedColumnFilter<TData>[]) => void;
  addFilter: (filter: ExtendedColumnFilter<TData>) => void;
  removeFilter: (filterId: string) => void;
  updateFilter: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "id">>
  ) => void;
  clearFilters: () => void;
}

export function useFilters<TData>(
  initialFilters: ExtendedColumnFilter<TData>[] = []
): UseFiltersReturn<TData> {
  // Use initialFilters with local state management
  const [filters, setFiltersState] =
    React.useState<ExtendedColumnFilter<TData>[]>(initialFilters);

  const setFilters = (newFilters: ExtendedColumnFilter<TData>[]) => {
    // Check if filters actually changed
    const currentFiltersJson = JSON.stringify(
      filters
        .map((f) => ({ id: f.id, value: f.value }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );
    const newFiltersJson = JSON.stringify(
      newFilters
        .map((f) => ({ id: f.id, value: f.value }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );

    if (currentFiltersJson === newFiltersJson) {
      return; // No change, don't update
    }

    setFiltersState(newFilters);

    const queryParams = {
      ...Object.fromEntries(new URLSearchParams(window.location.search)),
    };

    // Check if the URL already has the correct filters
    const currentFiltersParam = queryParams.filters;
    const newFiltersParam =
      newFilters.length > 0
        ? JSON.stringify(
            newFilters.map((f) => ({
              id: f.id,
              value: f.value,
            }))
          )
        : undefined;

    if (currentFiltersParam === newFiltersParam) {
      return; // URL already correct, don't update
    }

    if (newFilters.length > 0) {
      // Serialize filters for URL
      queryParams.filters = newFiltersParam!;
    } else {
      delete queryParams.filters;
    }

    queryParams.page = "1";

    router.get(window.location.pathname, queryParams, {
      preserveState: true, // Preserve component state
      preserveScroll: true, // Preserve scroll position
    });
  };

  const addFilter = (filter: ExtendedColumnFilter<TData>) => {
    setFilters([...filters, filter]);
  };

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter((f) => f.id !== filterId));
  };

  const updateFilter = (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "id">>
  ) => {
    setFilters(
      filters.map((f) =>
        f.id === filterId
          ? ({ ...f, ...updates } as ExtendedColumnFilter<TData>)
          : f
      )
    );
  };

  const clearFilters = () => {
    setFilters([]);
  };

  return {
    filters,
    setFilters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
  };
}
