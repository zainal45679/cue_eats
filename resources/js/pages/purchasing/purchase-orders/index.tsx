import React, { useState, useMemo } from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { Entity } from "@/lib/permissions";
import { router, Link } from "@inertiajs/react";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { XDateRangePicker } from "@/components/x/date-picker/XDateRangePicker";
import { Clock, FileText, CheckCircle } from "lucide-react";

export default function PurchaseOrdersIndex({ purchaseOrders }: { purchaseOrders: any }) {
    const [activeTab, setActiveTab] = useState("all");

    const stats = useMemo(() => {
        const rows = purchaseOrders.rows || [];
        return {
            pendingApproval: rows.filter((po: any) => po.status === 'pending_approval').length,
            approved: rows.filter((po: any) => po.status === 'approved').length,
            received: rows.filter((po: any) => po.status === 'received' || po.status === 'partially_received').length,
        };
    }, [purchaseOrders]);

    const processedData = useMemo(() => {
        let filteredRows = purchaseOrders.rows || [];
        if (activeTab === "pending") {
            filteredRows = filteredRows.filter((po: any) => po.status === 'pending_approval');
        } else if (activeTab === "received") {
            filteredRows = filteredRows.filter((po: any) => po.status === 'received' || po.status === 'partially_received');
        }
        return { ...purchaseOrders, rows: filteredRows };
    }, [purchaseOrders, activeTab]);

    const dateFilterValue = useMemo(() => {
        const filters = purchaseOrders.filters || [];
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
    }, [purchaseOrders.filters]);

    const handleDateSelect = (date: any) => {
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        let filters = purchaseOrders.filters || [];
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
            id: "po_number",
            header: "PO Number",
            enableColumnFilter: true,
            meta: { label: "PO Number", variant: "text" },
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
            enableColumnFilter: true,
            meta: {
                label: "Status",
                variant: "select",
                options: [
                    { label: "Draft", value: "draft" },
                    { label: "Pending Approval", value: "pending_approval" },
                    { label: "Approved", value: "approved" },
                    { label: "Rejected", value: "rejected" },
                    { label: "Partially Received", value: "partially_received" },
                    { label: "Received", value: "received" },
                ],
            },
            cell: ({ row }: any) => {
                const status = row.original.status || "draft";
                const colors: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-800",
                    pending_approval: "bg-yellow-100 text-yellow-800",
                    approved: "bg-green-100 text-green-800",
                    rejected: "bg-red-100 text-red-800",
                    partially_received: "bg-amber-100 text-amber-800",
                    received: "bg-emerald-100 text-emerald-800",
                };
                return (
                    <Badge variant="outline" className={colors[status] || "bg-gray-100 text-gray-800"}>
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
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200/50 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-yellow-800 mb-1">Pending Approval</p>
                            <h3 className="text-2xl font-bold text-yellow-900">{stats.pendingApproval}</h3>
                        </div>
                        <div className="p-3 bg-yellow-100/50 rounded-full text-yellow-600">
                            <Clock className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-blue-800 mb-1">Approved</p>
                            <h3 className="text-2xl font-bold text-blue-900">{stats.approved}</h3>
                        </div>
                        <div className="p-3 bg-blue-100/50 rounded-full text-blue-600">
                            <FileText className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-emerald-800 mb-1">Received</p>
                            <h3 className="text-2xl font-bold text-emerald-900">{stats.received}</h3>
                        </div>
                        <div className="p-3 bg-emerald-100/50 rounded-full text-emerald-600">
                            <CheckCircle className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Filter Tabs & Date Range */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="grid w-full sm:w-[500px] grid-cols-3 h-11 bg-muted/50 p-1">
                        <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Orders</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Pending Approval</TabsTrigger>
                        <TabsTrigger value="received" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Received</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            <XDataTable
                title="Purchase Orders"
                entity={Entity.PurchaseOrders}
                data={processedData}
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
