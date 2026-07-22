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
} from "@/generated/routes/business-locations";
import { Entity } from "@/lib/permissions";
import type { PageProps } from "@/types";

export default function BusinessLocationsIndex({
  businessLocations,
}: PageProps<{ businessLocations: any[] }>) {
  return (
    <>
      <Head title="Business Locations" />
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
                accessorKey: "location_name",
                header: "Location Name",
              },
              {
                accessorKey: "location_code",
                header: "Location Code",
                cell: ({ row }) => row.original.location_code || "-",
              },
              {
                accessorKey: "location_type",
                header: "Location Type",
                cell: ({ row }) => (
                  <Badge variant="outline">{row.original.location_type}</Badge>
                ),
              },
              {
                accessorKey: "country_name",
                header: "Country",
                cell: ({ row }) => row.original.country?.name || "-",
              },
              {
                accessorKey: "parent_location_name",
                header: "Parent Location",
                cell: ({ row }) => row.original.parent_location?.location_name || "-",
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
            data={businessLocations}
            actions={[
              { action: "edit" },
              { action: "delete" },
            ]}
            entity={Entity.BusinessLocations}
            searchRoute={search}
          />
        </div>
      </div>
    </>
  );
}
