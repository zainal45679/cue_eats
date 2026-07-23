import React from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { Entity } from "@/lib/permissions";
import { router, Link, usePage } from "@inertiajs/react";

export default function InternalRequestsIndex({ internalRequests }: { internalRequests: any }) {
    const { auth } = usePage<any>().props;
    const columns: XDataTableColumn<any>[] = [
        {
            id: "request_number",
            header: "Request Number",
            cell: ({ row }: any) => (
                <Link href={`/purchasing/internal-requests/${row.original.uuid}`} className="text-primary hover:underline font-medium">
                    {row.original.request_number}
                </Link>
            ),
        },
        {
            id: "fromLocation",
            header: "From Location",
            accessorFn: (row: any) => row.from_location?.location_name || "-",
        },
        {
            id: "toLocation",
            header: "To Location",
            accessorFn: (row: any) => row.to_location?.location_name || "-",
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }: any) => {
                const status = row.original.status || "draft";
                const colors: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-800",
                    pending_fulfillment: "bg-yellow-100 text-yellow-800",
                    approved: "bg-blue-100 text-blue-800",
                    rejected: "bg-red-100 text-red-800",
                    fulfilled: "bg-amber-100 text-amber-800",
                    received: "bg-emerald-100 text-emerald-800",
                };
                return (
                    <Badge variant="outline" className={colors[status] || "bg-gray-100"}>
                        {status.replace("_", " ").toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            id: "requestedBy",
            header: "Requested By",
            accessorFn: (row: any) => row.requested_by?.name || "-",
        },
    ];

    return (
        <XPage title="Indents (Internal Requests)">
            <XDataTable
                title="Indents"
                entity={Entity.InternalRequests}
                data={internalRequests}
                columns={columns}
                actions={[
                    {
                        name: "View",
                        action: "custom",
                        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
                        url: (row) => `/purchasing/internal-requests/${row.uuid}`,
                    },
                    {
                        action: "edit",
                        url: (row) => `/purchasing/internal-requests/${row.uuid}/edit`,
                        show: (row) => row.status === 'draft' && auth.permissions?.includes('update.internal-requests'),
                    },
                    {
                        action: "delete",
                        url: (row) => `/purchasing/internal-requests/${row.uuid}`,
                        show: (row) => row.status === 'draft' && auth.permissions?.includes('delete.internal-requests'),
                    }
                ]}
                titleButtons={[
                    {
                        type: "create",
                        label: "Create Indent",
                        link: "/purchasing/internal-requests/create",
                    },
                ]}
            />
        </XPage>
    );
}
