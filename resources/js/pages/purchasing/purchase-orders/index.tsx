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
import { Clock, FileText, CheckCircle, Package } from "lucide-react";

export default function PurchaseOrdersIndex({ purchaseOrders, type }: { purchaseOrders: any, type?: string }) {
    const [activeTab, setActiveTab] = useState("all");

    const stats = useMemo(() => {
        const rows = purchaseOrders.rows || [];
        return {
            total: rows.length,
            pendingApproval: rows.filter((po: any) => po.status === 'pending_approval').length,
            approved: rows.filter((po: any) => po.status === 'approved').length,
            partiallyReceived: rows.filter((po: any) => po.status === 'partially_received').length,
            fullyReceived: rows.filter((po: any) => po.status === 'received').length,
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
                <Link href={`/purchasing/purchase-orders/${row.original.uuid}?workflow=${type || 'manage'}`} className="text-primary hover:underline font-medium">
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
                    submitted: "bg-blue-100 text-blue-800",
                    pending_approval: "bg-yellow-100 text-yellow-800",
                    pending_fulfillment: "bg-yellow-100 text-yellow-800",
                    pending_dispatch: "bg-yellow-100 text-yellow-800",
                    approved: "bg-blue-100 text-blue-800",
                    dispatched: "bg-blue-100 text-blue-800",
                    partially_received: "bg-amber-100 text-amber-800",
                    partially_fulfilled: "bg-amber-100 text-amber-800",
                    received: "bg-emerald-100 text-emerald-800",
                    fully_received: "bg-emerald-100 text-emerald-800",
                    fulfilled: "bg-emerald-100 text-emerald-800",
                    completed: "bg-emerald-100 text-emerald-800",
                    rejected: "bg-red-100 text-red-800",
                    cancelled: "bg-red-100 text-red-800",
                    converted_to_sto: "bg-purple-100 text-purple-800",
                };
                return (
                    <Badge variant="outline" className={colors[status] || "bg-gray-100 text-gray-800"}>
                        {status.replace("_", " ").toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            id: "createdBy",
            header: "Requested By",
            accessorFn: (row: any) => row.created_by?.name || "-",
        },
        {
            id: "receivedBy",
            header: "Received By",
            cell: ({ row }: any) => {
                if (!row.original.grns || row.original.grns.length === 0) return "-";
                // Get the latest GRN's receiver
                const latestGrn = row.original.grns[row.original.grns.length - 1];
                return latestGrn.received_by?.name || "-";
            }
        },
        {
            id: "grandTotal",
            header: "Total",
            accessorFn: (row: any) => `$${Number(row.grand_total).toFixed(2)}`,
        },
    ];

    return (
        <XPage title={type === 'incoming' ? 'Receive External Stock' : 'Purchase Orders'} className="p-6 max-w-7xl mx-auto">
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total POs</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.total}</h3>
                        </div>
                        <div className="p-2 bg-slate-500/10 text-slate-500 rounded-lg">
                            <FileText className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Draft / Pending</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.pendingApproval}</h3>
                        </div>
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Clock className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Approved</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.approved}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <CheckCircle className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Partially Received</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.partiallyReceived}</h3>
                        </div>
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            <Package className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fully Received</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.fullyReceived}</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <CheckCircle className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Filter Tabs & Date Range */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {!type && (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="grid w-full sm:w-[500px] grid-cols-3 h-11 bg-muted/50 p-1">
                            <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Orders</TabsTrigger>
                            <TabsTrigger value="pending" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Pending Approval</TabsTrigger>
                            <TabsTrigger value="received" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Received</TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}
                {type && <div className="w-full sm:w-auto" />}
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            <XDataTable
                title={type === 'incoming' ? 'Receive External Stock' : 'Purchase Orders'}
                entity={Entity.PurchaseOrders}
                data={processedData}
                columns={columns}
                actions={[
                    {
                        name: type === 'incoming' ? "Receive Items" : "View",
                        action: "custom",
                        icon: type === 'incoming' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package-plus"><path d="M16 16h6"/><path d="M19 13v6"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        ),
                        url: (row) => `/purchasing/purchase-orders/${row.uuid}?workflow=${type || 'manage'}`,
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
