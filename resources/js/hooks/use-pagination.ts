"use client";

import { router } from "@inertiajs/react";

export interface UsePaginationState {
  page: number;
  perPage: number;
}

export interface UsePaginationReturn {
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  updatePagination: (updates: Partial<UsePaginationState>) => void;
}

export function usePagination(
  initialPage = 1,
  initialPerPage = 10
): UsePaginationReturn {
  const page = initialPage;
  const perPage = initialPerPage;

  const setPage = (newPage: number) => {
    router.get(
      window.location.pathname,
      {
        ...Object.fromEntries(new URLSearchParams(window.location.search)),
        page: newPage.toString(),
        perPage: perPage.toString(),
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const setPerPage = (newPerPage: number) => {
    router.get(
      window.location.pathname,
      {
        ...Object.fromEntries(new URLSearchParams(window.location.search)),
        page: "1",
        perPage: newPerPage.toString(),
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const updatePagination = (updates: Partial<UsePaginationState>) => {
    const newPage = updates.page ?? page;
    const newPerPage = updates.perPage ?? perPage;

    router.get(
      window.location.pathname,
      {
        ...Object.fromEntries(new URLSearchParams(window.location.search)),
        page: newPage.toString(),
        perPage: newPerPage.toString(),
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  return {
    page,
    perPage,
    setPage,
    setPerPage,
    updatePagination,
  };
}
