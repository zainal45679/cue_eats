import React from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { Link, usePage } from "@inertiajs/react";
import { Entity } from "@/lib/permissions";

export default function GoodsReceiptNotesIndex() {
    const { props } = usePage<any>();
    const { grns } = props;

    const columns: XDataTableColumn<any>[] = [
        {
            id: "grn_number",
            header: "GRN Number",
            cell: ({ row }: any) => (
                <Link href={`/purchasing/grns/${row.original.uuid}`} className="text-primary hover:underline font-medium">
                    {row.original.grn_number}
                </Link>
            ),
        },
        {
            id: "location",
            header: "Receiving Location",
            accessorFn: (row: any) => row.location?.location_name || "-",
        },
        {
            id: "sto_number",
            header: "Ref STO",
            accessorFn: (row: any) => row.stock_transfer_order?.sto_number || "-",
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }: any) => {
                const status = row.original.status || "submitted";
                const colors: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-800",
                    submitted: "bg-emerald-100 text-emerald-800",
                };
                return (
                    <Badge variant="outline" className={colors[status] || "bg-gray-100"}>
                        {status.replace("_", " ").toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            id: "receivedBy",
            header: "Received By",
            accessorFn: (row: any) => row.received_by?.name || "-",
        },
    ];

    return (
        <XPage title="Goods Receipt Notes (GRN)">
            <XDataTable
                title="Goods Receipt Notes"
                entity={Entity.InternalRequests}
                data={grns}
                columns={columns}
                actions={[
                    {
                        name: "View",
                        action: "custom",
                        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
                        url: (row) => `/purchasing/grns/${row.uuid}`,
                    },
                ]}
            />
        </XPage>
    );
}
