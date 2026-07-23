import React from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { usePage } from "@inertiajs/react";
import { Entity } from "@/lib/permissions";

export default function InventoryLedgerIndex() {
    const { props } = usePage<any>();
    const { ledgers } = props;

    const columns: XDataTableColumn<any>[] = [
        {
            id: "created_at",
            header: "Date/Time",
            accessorFn: (row: any) => new Date(row.created_at).toLocaleString(),
        },
        {
            id: "location",
            header: "Location",
            accessorFn: (row: any) => row.location?.location_name || "-",
        },
        {
            id: "ingredient",
            header: "Ingredient",
            accessorFn: (row: any) => row.ingredient?.name || "-",
        },
        {
            id: "transaction_type",
            header: "Type",
            cell: ({ row }: any) => {
                const type = row.original.transaction_type;
                const isPositive = ['transfer_in', 'po_receipt', 'adjustment_up'].includes(type);
                const isNegative = ['transfer_out', 'consumption', 'adjustment_down'].includes(type);
                
                let colorClass = "bg-gray-100";
                if (isPositive) colorClass = "bg-emerald-100 text-emerald-800";
                if (isNegative) colorClass = "bg-red-100 text-red-800";

                return (
                    <Badge variant="outline" className={colorClass}>
                        {type.replace("_", " ").toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            id: "reference",
            header: "Reference",
            cell: ({ row }: any) => {
                if (!row.original.reference_type) return "-";
                const typeName = row.original.reference_type.split("\\").pop();
                return <span className="text-muted-foreground text-xs font-mono">{typeName} #{row.original.reference_id}</span>;
            },
        },
        {
            id: "quantity",
            header: "Qty",
            cell: ({ row }: any) => {
                const qty = Number(row.original.quantity);
                const isPositive = qty > 0;
                const isNegative = qty < 0;
                
                return (
                    <span className={`font-bold ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : ''}`}>
                        {isPositive ? '+' : ''}{qty.toFixed(2)}
                    </span>
                );
            },
        },
        {
            id: "running_balance",
            header: "Balance",
            cell: ({ row }: any) => (
                <span className="font-semibold text-gray-700">
                    {Number(row.original.running_balance).toFixed(2)}
                </span>
            ),
        },
        {
            id: "createdBy",
            header: "User",
            accessorFn: (row: any) => row.created_by?.name || "-",
        },
    ];

    return (
        <XPage title="Inventory Ledger (Transactions)">
            <XDataTable
                title="Inventory Transactions"
                entity={Entity.InventoryBalances}
                data={ledgers}
                columns={columns}
                actions={[]}
            />
        </XPage>
    );
}
