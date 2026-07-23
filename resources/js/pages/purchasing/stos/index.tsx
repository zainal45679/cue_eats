import React from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { Link, usePage } from "@inertiajs/react";
import { Entity } from "@/lib/permissions";

export default function StockTransferOrdersIndex() {
    const { props } = usePage<any>();
    const { stos } = props;

    const columns: XDataTableColumn<any>[] = [
        {
            id: "sto_number",
            header: "STO Number",
            cell: ({ row }: any) => (
                <Link href={`/purchasing/stos/${row.original.uuid}`} className="text-primary hover:underline font-medium">
                    {row.original.sto_number}
                </Link>
            ),
        },
        {
            id: "fromLocation",
            header: "Dispatching Location",
            accessorFn: (row: any) => row.from_location?.location_name || "-",
        },
        {
            id: "toLocation",
            header: "Receiving Location",
            accessorFn: (row: any) => row.to_location?.location_name || "-",
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }: any) => {
                const status = row.original.status || "pending_dispatch";
                const colors: Record<string, string> = {
                    pending_dispatch: "bg-yellow-100 text-yellow-800",
                    dispatched: "bg-blue-100 text-blue-800",
                    partially_received: "bg-purple-100 text-purple-800",
                    received: "bg-emerald-100 text-emerald-800",
                    cancelled: "bg-red-100 text-red-800",
                };
                return (
                    <Badge variant="outline" className={colors[status] || "bg-gray-100"}>
                        {status.replace("_", " ").toUpperCase()}
                    </Badge>
                );
            },
        },
    ];

    return (
        <XPage title="Stock Transfer Orders (STO)">
            <XDataTable
                title="Stock Transfer Orders"
                entity={Entity.InternalRequests}
                data={stos}
                columns={columns}
                actions={[
                    {
                        name: "View",
                        action: "custom",
                        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
                        url: (row) => `/purchasing/stos/${row.uuid}`,
                    },
                ]}
            />
        </XPage>
    );
}
