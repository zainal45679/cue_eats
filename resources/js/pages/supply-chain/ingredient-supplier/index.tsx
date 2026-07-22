import React from "react";
import { Head } from "@inertiajs/react";
import { XDataTable } from "@/components/x/table/XDataTable";
import { Check, X, Star } from "lucide-react";
import {
  create,
  edit,
  destroy,
  search,
} from "@/generated/routes/ingredient-suppliers";
import { Entity } from "@/lib/permissions";
import type { PageProps } from "@/types";
import { Badge } from "@/components/shadcn/ui/badge";

export default function IngredientSupplierIndex({
  mappings,
}: PageProps<{ mappings: any[] }>) {
  return (
    <>
      <Head title="Ingredient-Supplier Mapping" />
      <div className="space-y-6">
        <div className="flex-1 overflow-auto">
          <XDataTable
            titleButtons={[
              {
                label: "Add Mapping",
                link: create.url(),
                type: "create",
              },
            ]}
            columns={[
              {
                accessorKey: "ingredient",
                header: "Ingredient",
                cell: ({ row }) => (
                  <div>
                    <div className="font-medium">{row.original.ingredient?.name}</div>
                    <div className="text-xs text-muted-foreground">{row.original.ingredient?.code}</div>
                  </div>
                ),
              },
              {
                accessorKey: "supplier",
                header: "Supplier",
                cell: ({ row }) => (
                  <div className="flex items-center gap-2">
                    {row.original.supplier?.name}
                    {row.original.is_preferred && (
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                ),
              },
              {
                accessorKey: "purchaseUom",
                header: "Purch. UOM",
                cell: ({ row }) => row.original.purchase_uom?.name || "-",
              },
              {
                accessorKey: "moq",
                header: "MOQ",
                cell: ({ row }) => row.original.moq,
              },
              {
                accessorKey: "price",
                header: "Price",
                cell: ({ row }) => {
                  const curr = row.original.currency_tax?.currency || "";
                  return `${curr} ${row.original.price}`;
                },
              },
              {
                accessorKey: "lead_time_days",
                header: "Lead Time",
                cell: ({ row }) => `${row.original.lead_time_days} days`,
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
            data={mappings}
            actions={[
              { 
                action: "edit",
                url: (row) => edit.url(row.uuid)
              },
              { 
                action: "delete",
                url: (row) => destroy.url(row.uuid)
              },
            ]}
            entity={Entity.IngredientSuppliers}
            searchRoute={search}
          />
        </div>
      </div>
    </>
  );
}
