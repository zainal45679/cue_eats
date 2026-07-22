import React from "react";
import { Head } from "@inertiajs/react";
import { XDataTable } from "@/components/x/table/XDataTable";
import { Check, X } from "lucide-react";
import {
  create,
  edit,
  destroy,
  search,
} from "@/generated/routes/payment-terms";
import { Entity } from "@/lib/permissions";
import type { PageProps } from "@/types";

export default function PaymentTermsIndex({
  paymentTerms,
}: PageProps<{ paymentTerms: any[] }>) {
  return (
    <>
      <Head title="Payment Terms" />
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
                header: "Term Name",
              },
              {
                accessorKey: "credit_days",
                header: "Credit Days",
              },
              {
                accessorKey: "advance_percentage",
                header: "Advance (%)",
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
            data={paymentTerms}
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
            entity={Entity.PaymentTerms}
            searchRoute={search}
          />
        </div>
      </div>
    </>
  );
}
