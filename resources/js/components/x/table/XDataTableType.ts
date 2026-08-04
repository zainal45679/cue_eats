import type { ColumnDef } from "@tanstack/react-table";
import type { Action, Entity } from "@/lib/permissions";

export type XDataTableFilterCondition = {
  id: string;
  value: string | string[];
};

export type TXDataTableData<T> = {
  rows: T[];
  meta: {
    currentPage: number;
    perPage: number;
    lastPage: number;
    total: number;
  };
  filters: XDataTableFilterCondition[];
  sortBy: string | null;
  sortDesc: boolean;
  search: string | null;
};

export type XDataTableColumn<T> = ColumnDef<T, unknown> & {
  meta?: {
    label?: string;
    placeholder?: string;
    variant?:
      | "text"
      | "number"
      | "multiSelect"
      | "select"
      | "date"
      | "range"
      | "dateRange";
    options?: { label: string; value: string }[];
  };
  enableColumnFilter?: boolean;
  enableSorting?: boolean;
};

export type XDataTableProps<T extends { id: string | number }> = {
  data: TXDataTableData<T>;
  columns: XDataTableColumn<T>[];
  filters?: XDataTableFilterCondition[];
  sort?: { id: string; desc: boolean };
  entity?: Entity;
  title?: string;
  titleButtons?: {
    type?: "create" | "custom";
    label?: string;
    link?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    className?: string;
  }[];

  actionBarButtons?: {
    label: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
    className?: string;
    icon?: React.ReactNode;
    type?: "dialog" | "custom";
    dialog?: {
      title: string;
      description?: string;
      actionLabel?: string;
      cancelLabel?: string;
      icon?: React.ReactNode;
    };
    permission?: {
      entity: Entity;
      action: Action;
    };
    onAction: (selectedRows: T[]) => void;
  }[];

  actions?: {
    action: "edit" | "delete" | "view" | "custom";
    url?: (row: T) => string;
    icon?: React.ReactNode;
    name?: string;
    onClick?: (row: T) => void;
    show?: (row: T) => boolean;
  }[];

  renderMobileCard?: (row: T) => React.ReactNode;
};
