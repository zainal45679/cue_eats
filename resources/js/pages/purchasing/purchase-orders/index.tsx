import React from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { Entity } from "@/lib/permissions";
import { router, Link } from "@inertiajs/react";

export default function PurchaseOrdersIndex({ purchaseOrders }: { purchaseOrders: any }) {
    const columns: XDataTableColumn<any>[] = [
        {
            id: "po_number",
            header: "PO Number",
            cell: ({ row }: any) => (
                <Link href={`/purchasing/purchase-orders/${row.original.uuid}`} className="text-primary hover:underline font-medium">
                    {row.original.po_number}
                </Link>
            ),
        },
        {
            id: "supplier",
            header: "Supplier",
            accessorFn: (row: any) => row.supplier?.name || "-",
        },
        {
            id: "businessLocation",
            header: "Location",
            accessorFn: (row: any) => row.business_location?.location_name || "-",
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }: any) => {
                const status = row.original.status || "draft";
                const colors: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-800",
                    pending_approval: "bg-yellow-100 text-yellow-800",
                    approved: "bg-green-100 text-green-800",
                    rejected: "bg-red-100 text-red-800",
                    fulfilled: "bg-blue-100 text-blue-800",
                };
                return (
                    <Badge variant="outline" className={colors[status] || "bg-gray-100"}>
                        {status.replace("_", " ").toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            id: "grandTotal",
            header: "Total",
            accessorFn: (row: any) => `$${Number(row.grand_total).toFixed(2)}`,
        },
    ];

    return (
        <XPage title="Purchase Orders">
            <XDataTable
                title="Purchase Orders"
                entity={Entity.PurchaseOrders}
                data={purchaseOrders}
                columns={columns}
                actions={[
                    {
                        name: "View",
                        action: "custom",
                        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
                        url: (row) => `/purchasing/purchase-orders/${row.uuid}`,
                    },
                    {
                        action: "edit",
                        url: (row) => `/purchasing/purchase-orders/${row.uuid}/edit`,
                        show: (row) => row.status === 'draft',
                    },
                    {
                        action: "delete",
                        url: (row) => `/purchasing/purchase-orders/${row.uuid}`,
                        show: (row) => row.status === 'draft',
                    }
                ]}
                titleButtons={[
                    {
                        type: "create",
                        label: "Create PO",
                        link: "/purchasing/purchase-orders/create",
                    },
                ]}
            />
        </XPage>
    );
}
