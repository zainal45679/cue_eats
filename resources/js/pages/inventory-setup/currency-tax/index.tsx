import React from "react";
import { Head, Link } from "@inertiajs/react";
import { XDataTable } from "@/components/x/table/XDataTable";
import { Badge } from "@/components/shadcn/ui/badge";
import { Check, X } from "lucide-react";
import {
  create,
  edit,
  destroy,
  search,
} from "@/generated/routes/currency-tax";
import { Entity } from "@/lib/permissions";
import type { PageProps } from "@/types";

export default function CurrencyTaxIndex({
  currencyTaxes,
}: PageProps<{ currencyTaxes: any[] }>) {
  return (
    <>
      <Head title="Currency & Tax" />
      <div className="space-y-6">
        <div className="flex-1 overflow-auto">
          <XDataTable
            titleButtons={[
              {
                label: "Add",
                link: create.url(),
                type: "create",
              },
            ]}
            columns={[
              {
                accessorKey: "currency",
                header: "Currency",
              },
              {
                accessorKey: "tax_type",
                header: "Tax Type",
                cell: ({ row }) => (
                  <Badge variant="outline">{row.original.tax_type}</Badge>
                ),
              },
              {
                accessorKey: "tax_percentage",
                header: "Tax Percentage",
                cell: ({ row }) =>
                  row.original.tax_percentage
                    ? `${row.original.tax_percentage}%`
                    : "-",
              },
              {
                accessorKey: "country_name",
                header: "Country",
                cell: ({ row }) => row.original.country?.name || "-",
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                  <div className="flex items-center">
                    {row.original.status ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ),
              },
            ]}
            data={currencyTaxes}
            actions={[
              { action: "edit" },
              { action: "delete" },
            ]}
            entity={Entity.CurrencyTax}
            searchRoute={search}
          />
        </div>
      </div>
    </>
  );
}
