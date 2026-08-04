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
import { Button } from "@/components/shadcn/ui/button";
import { cn } from "@/lib/utils";

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
        } else if (activeTab === "approved") {
            filteredRows = filteredRows.filter((po: any) => po.status === 'approved');
        } else if (activeTab === "partially_received") {
            filteredRows = filteredRows.filter((po: any) => po.status === 'partially_received');
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
            {!type && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-slate-500" />
                        <CardContent className="p-3 pl-3.5 sm:pl-5 flex flex-col justify-between h-full gap-2">
                            <div className="flex justify-between items-start gap-1">
                                <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">Total POs</p>
                                <div className="p-1 sm:p-2 bg-slate-500/10 text-slate-500 rounded-md sm:rounded-lg shrink-0">
                                    <FileText className="size-3.5 sm:size-5" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold leading-none">{stats.total}</h3>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-amber-500" />
                        <CardContent className="p-3 pl-3.5 sm:pl-5 flex flex-col justify-between h-full gap-2">
                            <div className="flex justify-between items-start gap-1">
                                <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">Draft / Pending</p>
                                <div className="p-1 sm:p-2 bg-amber-500/10 text-amber-500 rounded-md sm:rounded-lg shrink-0">
                                    <Clock className="size-3.5 sm:size-5" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold leading-none">{stats.pendingApproval}</h3>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-blue-500" />
                        <CardContent className="p-3 pl-3.5 sm:pl-5 flex flex-col justify-between h-full gap-2">
                            <div className="flex justify-between items-start gap-1">
                                <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">Approved</p>
                                <div className="p-1 sm:p-2 bg-blue-500/10 text-blue-500 rounded-md sm:rounded-lg shrink-0">
                                    <CheckCircle className="size-3.5 sm:size-5" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold leading-none">{stats.approved}</h3>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-indigo-500" />
                        <CardContent className="p-3 pl-3.5 sm:pl-5 flex flex-col justify-between h-full gap-2">
                            <div className="flex justify-between items-start gap-1">
                                <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">Partially Received</p>
                                <div className="p-1 sm:p-2 bg-indigo-500/10 text-indigo-500 rounded-md sm:rounded-lg shrink-0">
                                    <Package className="size-3.5 sm:size-5" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold leading-none">{stats.partiallyReceived}</h3>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-emerald-500" />
                        <CardContent className="p-3 pl-3.5 sm:pl-5 flex flex-col justify-between h-full gap-2">
                            <div className="flex justify-between items-start gap-1">
                                <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">Fully Received</p>
                                <div className="p-1 sm:p-2 bg-emerald-500/10 text-emerald-500 rounded-md sm:rounded-lg shrink-0">
                                    <CheckCircle className="size-3.5 sm:size-5" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold leading-none">{stats.fullyReceived}</h3>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Filter Tabs & Date Range */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {!type ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="flex w-full sm:w-[500px] bg-muted/60 p-1.5 rounded-xl h-auto gap-1">
                            <TabsTrigger value="all" className="flex-1 rounded-lg font-medium text-xs sm:text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all whitespace-normal text-center leading-tight">All Orders</TabsTrigger>
                            <TabsTrigger value="pending" className="flex-1 rounded-lg font-medium text-xs sm:text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all whitespace-normal text-center leading-tight">Pending Approval</TabsTrigger>
                            <TabsTrigger value="received" className="flex-1 rounded-lg font-medium text-xs sm:text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all whitespace-normal text-center leading-tight">Received</TabsTrigger>
                        </TabsList>
                    </Tabs>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="flex w-full sm:w-[500px] bg-muted/60 p-1.5 rounded-xl h-auto gap-1">
                            <TabsTrigger value="all" className="flex-1 rounded-lg font-medium text-xs sm:text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all whitespace-normal text-center leading-tight">All Incoming</TabsTrigger>
                            <TabsTrigger value="approved" className="flex-1 rounded-lg font-medium text-xs sm:text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all whitespace-normal text-center leading-tight">New (Approved)</TabsTrigger>
                            <TabsTrigger value="partially_received" className="flex-1 rounded-lg font-medium text-xs sm:text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all whitespace-normal text-center leading-tight">Partially Received</TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            <XDataTable
                title={type === 'incoming' ? 'Receive Stock' : 'Purchase Orders'}
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
                titleButtons={type !== 'incoming' ? [
                    {
                        type: "create",
                        label: "Create PO",
                        link: "/purchasing/purchase-orders/create",
                    },
                ] : []}
                renderMobileCard={(row: any) => (
                    <Link href={`/purchasing/purchase-orders/${row.uuid}?workflow=${type || 'manage'}`} className="block bg-card rounded-xl border border-border/50 p-4 active:bg-muted/30 transition-colors shadow-sm mb-3">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-base text-foreground leading-tight mb-1.5 line-clamp-1">{row.supplier?.name || 'Unknown Supplier'}</h3>
                                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground font-medium">
                                    <span>{row.po_number}</span>
                                    <span>•</span>
                                    <span>{new Date(row.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2 shrink-0">
                                <span className="font-bold text-base text-foreground">${Number(row.grand_total).toFixed(2)}</span>
                                <Badge variant="outline" className={cn(
                                    "capitalize text-[10px] font-bold px-1.5 py-0 h-5",
                                    row.status === 'fully_received' || row.status === 'received' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                                    row.status === 'partially_received' ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" :
                                    row.status === 'approved' ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" :
                                    row.status === 'draft' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                                    "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                                )}>
                                    {row.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </div>
                    </Link>
                )}
            />
        </XPage>
    );
}
