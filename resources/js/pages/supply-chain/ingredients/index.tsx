import React from "react";
import { Head } from "@inertiajs/react";
import { XDataTable } from "@/components/x/table/XDataTable";
import { Badge } from "@/components/shadcn/ui/badge";
import { Check, X } from "lucide-react";
import {
  create,
  edit,
  destroy,
  search,
} from "@/generated/routes/ingredients";
import { Entity } from "@/lib/permissions";
import type { PageProps } from "@/types";

export default function IngredientsIndex({
  ingredients,
}: PageProps<{ ingredients: any[] }>) {
  return (
    <>
      <Head title="Ingredients (Item Master)" />
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
                accessorKey: "name",
                header: "Name",
              },
              {
                accessorKey: "code",
                header: "Item Code",
                cell: ({ row }) => row.original.code || "-",
              },
              {
                accessorKey: "category_name",
                header: "Category",
                cell: ({ row }) => row.original.category?.name || "-",
              },
              {
                accessorKey: "base_uom",
                header: "Base UOM",
                cell: ({ row }) => row.original.base_uom?.code || "-",
              },
              {
                accessorKey: "flags",
                header: "Flags",
                cell: ({ row }) => (
                  <div className="flex gap-1 flex-wrap">
                    {row.original.is_inventory_item && <Badge variant="outline" className="text-xs">INV</Badge>}
                    {row.original.is_purchasable && <Badge variant="outline" className="text-xs">PUR</Badge>}
                    {row.original.is_recipe_item && <Badge variant="outline" className="text-xs">REC</Badge>}
                  </div>
                ),
              },
              {
                accessorKey: "shelf_life",
                header: "Shelf Life",
                cell: ({ row }) => {
                  if (row.original.is_perishable) {
                    return (
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 text-[11px] font-medium">
                          ⏳ {row.original.shelf_life_days ? `${row.original.shelf_life_days}d` : 'Perishable'}
                        </Badge>
                        {row.original.storage_condition && (
                          <span className="text-[10px] text-muted-foreground capitalize">
                            ({row.original.storage_condition})
                          </span>
                        )}
                      </div>
                    );
                  }
                  return <span className="text-xs text-muted-foreground">Standard</span>;
                },
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
            data={ingredients}
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
            entity={Entity.Ingredients}
            searchRoute={search}
          />
        </div>
      </div>
    </>
  );
}
