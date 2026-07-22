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
} from "@/generated/routes/storage-locations";
import { Entity } from "@/lib/permissions";
import type { PageProps } from "@/types";

export default function StorageLocationsIndex({
  storageLocations,
}: PageProps<{ storageLocations: any[] }>) {
  return (
    <>
      <Head title="Storage Locations" />
      <div className="space-y-6">
        <div className="flex-1 overflow-auto">
          <XDataTable
            titleButtons={[
              {
                label: "Add New Storage Location",
                link: create.url(),
                type: "create",
              },
            ]}
            columns={[
              {
                accessorKey: "storage_name",
                header: "Storage Name",
              },
              {
                accessorKey: "business_location_name",
                header: "Business Location",
                cell: ({ row }) => row.original.business_location?.location_name || "-",
              },
              {
                accessorKey: "storage_type",
                header: "Storage Type",
                cell: ({ row }) => (
                  <Badge variant="outline">{row.original.storage_type}</Badge>
                ),
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
            data={storageLocations}
            actions={[
              { action: "edit" },
              { action: "delete" },
            ]}
            entity={Entity.StorageLocations}
            searchRoute={search}
          />
        </div>
      </div>
    </>
  );
}
