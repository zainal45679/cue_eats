import React, { useState, useMemo } from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { Link, usePage, router } from "@inertiajs/react";
import { Entity } from "@/lib/permissions";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { XDateRangePicker } from "@/components/x/date-picker/XDateRangePicker";
import { Package, Truck, Factory } from "lucide-react";

export default function GoodsReceiptNotesIndex() {
    const { props } = usePage<any>();
    const { grns } = props;

    const [activeTab, setActiveTab] = useState("all");

    const stats = useMemo(() => {
        const rows = grns.rows || [];
        return {
            total: rows.length,
            internal: rows.filter((grn: any) => grn.stock_transfer_order).length,
            external: rows.filter((grn: any) => grn.purchase_order).length,
        };
    }, [grns]);

    const processedData = useMemo(() => {
        let filteredRows = grns.rows || [];
        if (activeTab === "internal") {
            filteredRows = filteredRows.filter((grn: any) => grn.stock_transfer_order);
        } else if (activeTab === "external") {
            filteredRows = filteredRows.filter((grn: any) => grn.purchase_order);
        }
        return { ...grns, rows: filteredRows };
    }, [grns, activeTab]);

    const dateFilterValue = useMemo(() => {
        const filters = grns.filters || [];
        const dateFilter = filters.find((f: any) => f.id === 'created_at');
        if (dateFilter && dateFilter.value && Array.isArray(dateFilter.value)) {
            const parseDate = (val: any) => {
                if (!val) return undefined;
                if (typeof val === 'string') {
                    const [y, m, d] = val.split('-');
                    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                }
                return new Date(val); // fallback
            };
            return {
                from: parseDate(dateFilter.value[0]),
                to: parseDate(dateFilter.value[1])
            };
        }
        return undefined;
    }, [grns.filters]);

    const handleDateSelect = (date: any) => {
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        let filters = grns.filters || [];
        filters = filters.filter((f: any) => f.id !== 'created_at');
        
        if (date?.from || date?.to) {
            const format = (d: Date) => {
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            };
            filters.push({
                id: 'created_at',
                value: [date.from ? format(date.from) : null, date.to ? format(date.to) : (date.from ? format(date.from) : null)]
            });
        }
        
        if (filters.length > 0) {
            queryParams.filters = JSON.stringify(filters);
        } else {
            delete queryParams.filters;
        }
        queryParams.page = "1";
        
        router.get(window.location.pathname, queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns: XDataTableColumn<any>[] = [
        {
            id: "grn_number",
            header: "GRN Number",
            enableColumnFilter: true,
            meta: { label: "GRN Number", variant: "text" },
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
            id: "source_type",
            header: "Source Type",
            accessorFn: (row: any) => row.purchase_order ? "External (PO)" : (row.stock_transfer_order ? "Internal (STO)" : "-"),
            enableColumnFilter: true,
            meta: {
                label: "Source Type",
                variant: "select",
                options: [
                    { label: "Internal (STO)", value: "internal" },
                    { label: "External (PO)", value: "external" },
                ],
            },
            cell: ({ getValue }: any) => {
                const type = getValue() as string;
                return <span className="font-medium text-gray-600">{type}</span>;
            }
        },
        {
            id: "reference",
            header: "Reference",
            cell: ({ row }: any) => {
                const po = row.original.purchase_order;
                const sto = row.original.stock_transfer_order;
                if (po) {
                    return <span className="font-medium">PO: {po.po_number}</span>;
                }
                if (sto) {
                    return <span className="font-medium">STO: {sto.sto_number}</span>;
                }
                return "-";
            }
        },
        {
            id: "status",
            header: "Status",
            enableColumnFilter: true,
            meta: {
                label: "Status",
                variant: "select",
                options: [
                    { label: "Draft", value: "draft" },
                    { label: "Submitted", value: "submitted" },
                ],
            },
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
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-blue-800 mb-1">Total Receipts</p>
                            <h3 className="text-2xl font-bold text-blue-900">{stats.total}</h3>
                        </div>
                        <div className="p-3 bg-blue-100/50 rounded-full text-blue-600">
                            <Package className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-emerald-800 mb-1">Internal (STO)</p>
                            <h3 className="text-2xl font-bold text-emerald-900">{stats.internal}</h3>
                        </div>
                        <div className="p-3 bg-emerald-100/50 rounded-full text-emerald-600">
                            <Factory className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200/50 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-yellow-800 mb-1">External (PO)</p>
                            <h3 className="text-2xl font-bold text-yellow-900">{stats.external}</h3>
                        </div>
                        <div className="p-3 bg-yellow-100/50 rounded-full text-yellow-600">
                            <Truck className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Filter Tabs & Date Range */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="grid w-full sm:w-[500px] grid-cols-3 h-11 bg-muted/50 p-1">
                        <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Receipts</TabsTrigger>
                        <TabsTrigger value="internal" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Internal (STO)</TabsTrigger>
                        <TabsTrigger value="external" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">External (PO)</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            <XDataTable
                title="Goods Receipt Notes"
                entity={Entity.InternalRequests}
                data={processedData}
                columns={columns}
                actions={[
                    {
                        name: "View",
                        action: "custom",
                        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
                        url: (row) => `/purchasing/grns/${row.uuid}`,
                    }
                ]}
            />
        </XPage>
    );
}
