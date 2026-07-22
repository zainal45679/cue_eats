import React from "react";
import { Head } from "@inertiajs/react";
import { XDataTable } from "@/components/x/table/XDataTable";
import { Badge } from "@/components/shadcn/ui/badge";
import { Check, X } from "lucide-react";
import {
  create,
  search,
} from "@/generated/routes/units-of-measure";
import { Entity } from "@/lib/permissions";
import type { PageProps } from "@/types";

export default function UnitsOfMeasureIndex({
  unitsOfMeasure,
}: PageProps<{ unitsOfMeasure: any[] }>) {
  return (
    <>
      <Head title="Units of Measure" />
      <div className="space-y-6">
        <div className="flex-1 overflow-auto">
          <XDataTable
            titleButtons={[
              {
                label: "Add New Unit",
                link: create.url(),
                type: "create",
              },
            ]}
            columns={[
              {
                accessorKey: "name",
                header: "Unit Name",
              },
              {
                accessorKey: "code",
                header: "Code",
              },
              {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }) => (
                  <Badge variant="outline">{row.original.type}</Badge>
                ),
              },
              {
                accessorKey: "base_unit",
                header: "Base Unit",
                cell: ({ row }) => row.original.base_unit?.name || "-",
              },
              {
                accessorKey: "conversion_factor",
                header: "Conversion",
                cell: ({ row }) => row.original.conversion_factor ? `x ${Number(row.original.conversion_factor)}` : "-",
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
            data={unitsOfMeasure}
            actions={[
              { action: "edit" },
              { action: "delete" },
            ]}
            entity={Entity.UnitsOfMeasure}
            searchRoute={search}
          />
        </div>
      </div>
    </>
  );
}
