"use client";

import { router } from "@inertiajs/react";
import React from "react";

export type UseSearchReturn = {
  search: string;
  setSearch: (search: string) => void;
  clearSearch: () => void;
};

export function useSearch(initialSearch = ""): UseSearchReturn {
  const urlSearch = initialSearch;

  const initializedRef = React.useRef(false);

  const [search, setSearchState] = React.useState<string>(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return urlSearch;
    }
    return initialSearch;
  });

  const setSearch = React.useCallback((newSearch: string) => {
    setSearchState(newSearch);

    const queryParams = {
      ...Object.fromEntries(new URLSearchParams(window.location.search)),
    };

    if (newSearch.trim()) {
      queryParams.search = newSearch.trim();
    } else {
      delete queryParams.search;
    }

    router.get(window.location.pathname, queryParams, {
      preserveState: true,
      preserveScroll: true,
    });
  }, []);

  const clearSearch = React.useCallback(() => {
    setSearch("");
  }, [setSearch]);

  return {
    search,
    setSearch,
    clearSearch,
  };
}
