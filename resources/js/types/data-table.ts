import type { ColumnSort, Row, RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
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
    options?: Option[];
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  }
}

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: Extract<keyof TData, string>;
}

export interface ExtendedColumnFilter<TData> {
  id: Extract<keyof TData, string>;
  value: string | number | (string | number)[] | undefined;
}

export interface DataTableRowAction<TData> {
  row: Row<TData>;
  variant: "update" | "delete";
}
