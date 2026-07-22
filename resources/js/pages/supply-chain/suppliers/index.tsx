import React from "react";
import { Head } from "@inertiajs/react";
import { XDataTable } from "@/components/x/table/XDataTable";
import { Check, X } from "lucide-react";
import {
  create,
  edit,
  destroy,
  search,
} from "@/generated/routes/suppliers";
import { Entity } from "@/lib/permissions";
import type { PageProps } from "@/types";

export default function SuppliersIndex({
  suppliers,
}: PageProps<{ suppliers: any[] }>) {
  return (
    <>
      <Head title="Suppliers" />
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
                header: "Supplier Name",
              },
              {
                accessorKey: "contact_name",
                header: "Contact",
                cell: ({ row }) => row.original.contact_name || "-",
              },
              {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => row.original.email || "-",
              },
              {
                accessorKey: "phone",
                header: "Phone",
                cell: ({ row }) => row.original.phone || "-",
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
            data={suppliers}
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
            entity={Entity.Suppliers}
            searchRoute={search}
          />
        </div>
      </div>
    </>
  );
}
