"use client";

import { router } from "@inertiajs/react";

export interface SortState {
  id: string;
  desc: boolean;
}

export interface UseSortingReturn {
  sorting: SortState[];
  setSorting: (sorting: SortState[]) => void;
  toggleSort: (columnId: string) => void;
  clearSorting: () => void;
}

export function useSorting(initialSorting: SortState[] = []): UseSortingReturn {
  const sorting = initialSorting;

  const setSorting = (newSorting: SortState[]) => {
    const sortBy = newSorting.length > 0 ? newSorting[0].id : null;
    const sortDesc = newSorting.length > 0 ? newSorting[0].desc : false;

    const queryParams = {
      ...Object.fromEntries(new URLSearchParams(window.location.search)),
    };

    if (sortBy) {
      queryParams.sortBy = sortBy;
      queryParams.sortDesc = sortDesc.toString();
    } else {
      delete queryParams.sortBy;
      delete queryParams.sortDesc;
    }

    router.get(window.location.pathname, queryParams, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const toggleSort = (columnId: string) => {
    const currentSort = sorting.find((s) => s.id === columnId);
    let newSorting: SortState[];

    if (!currentSort) {
      newSorting = [{ id: columnId, desc: false }];
    } else if (currentSort.desc) {
      newSorting = [];
    } else {
      newSorting = [{ id: columnId, desc: true }];
    }

    setSorting(newSorting);
  };

  const clearSorting = () => {
    setSorting([]);
  };

  return {
    sorting,
    setSorting,
    toggleSort,
    clearSorting,
  };
}
