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
import { Package, Truck, Factory, FileText, Clock, CheckCircle, ShoppingCart } from "lucide-react";

export default function GoodsReceiptNotesIndex() {
    const { props } = usePage<any>();
    const { grns, stats: serverStats } = props;

    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const currentSourceType = searchParams.get('source_type');
    const activeTab = currentSourceType === 'internal' ? 'internal' : (currentSourceType === 'external' ? 'external' : 'all');

    const handleTabSelect = (tabValue: string) => {
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        
        if (tabValue === 'internal') {
            queryParams.source_type = 'internal';
        } else if (tabValue === 'external') {
            queryParams.source_type = 'external';
        } else {
            delete queryParams.source_type;
        }

        queryParams.page = "1";

        router.get(window.location.pathname, queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const stats = useMemo(() => {
        if (serverStats) {
            return {
                total: Number(serverStats.total || 0),
                draft: Number(serverStats.draft || 0),
                processed: Number(serverStats.completed || 0),
                internal: Number(serverStats.internal || 0),
                external: Number(serverStats.external || 0),
            };
        }
        const rows = grns?.rows || [];
        return {
            total: grns?.meta?.total ?? rows.length,
            draft: rows.filter((grn: any) => grn.status === 'draft').length,
            processed: rows.filter((grn: any) => grn.status === 'completed').length,
            internal: rows.filter((grn: any) => grn.stock_transfer_order).length,
            external: rows.filter((grn: any) => grn.purchase_order).length,
        };
    }, [grns, serverStats]);

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
            id: "source",
            header: "Source / Origin",
            cell: ({ row }: any) => {
                if (row.original.purchase_order) {
                    const supplierName = row.original.purchase_order.supplier?.name || "External Supplier";
                    const poNumber = row.original.purchase_order.po_number || "-";
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">{supplierName}</span>
                            <span className="text-[11px] font-medium text-muted-foreground">PO: {poNumber}</span>
                        </div>
                    );
                }
                if (row.original.stock_transfer_order) {
                    const sendingLocation = row.original.stock_transfer_order.from_location?.location_name || "Sending Location";
                    const stoNumber = row.original.stock_transfer_order.sto_number || "-";
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">{sendingLocation}</span>
                            <span className="text-[11px] font-medium text-muted-foreground">STO: {stoNumber}</span>
                        </div>
                    );
                }
                return <span className="text-muted-foreground">-</span>;
            }
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
            id: "status",
            header: "Status",
            enableColumnFilter: true,
            meta: {
                label: "Status",
                variant: "select",
                options: [
                    { label: "Partially Received", value: "partially_received" },
                    { label: "Received", value: "received" },
                    { label: "Completed", value: "completed" },
                    { label: "Cancelled", value: "cancelled" },
                ],
            },
            cell: ({ row }: any) => {
                const status = row.original.stock_transfer_order?.status
                    || row.original.purchase_order?.status
                    || row.original.status
                    || "completed";
                const colors: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-800",
                    submitted: "bg-blue-100 text-blue-800",
                    pending_approval: "bg-yellow-100 text-yellow-800",
                    pending_fulfillment: "bg-yellow-100 text-yellow-800",
                    pending_dispatch: "bg-yellow-100 text-yellow-800",
                    approved: "bg-blue-100 text-blue-800",
                    dispatched: "bg-blue-100 text-blue-800",
                    partially_received: "bg-amber-100 text-amber-800 border-amber-300",
                    partially_fulfilled: "bg-amber-100 text-amber-800 border-amber-300",
                    received: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    fully_received: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    fulfilled: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    rejected: "bg-red-100 text-red-800 border-red-300",
                    cancelled: "bg-red-100 text-red-800 border-red-300",
                    converted_to_sto: "bg-purple-100 text-purple-800",
                };
                return (
                    <Badge variant="outline" className={colors[status] || "bg-gray-100"}>
                        {status.replace("_", " ").toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            id: "items",
            header: "Items",
            cell: ({ row }: any) => {
                const items = row.original.items || [];
                if (items.length === 0) return <span className="text-muted-foreground">-</span>;
                
                const received = items.reduce((acc: number, item: any) => acc + Number(item.received_quantity || 0), 0);
                const expected = items.reduce((acc: number, item: any) => acc + Number(item.expected_quantity || 0), 0);
                
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-emerald-700">{received} Received</span>
                        <span className="text-[11px] font-medium text-muted-foreground">{expected} Expected</span>
                    </div>
                );
            }
        },
        {
            id: "requestedBy",
            header: "Requested By",
            cell: ({ row }: any) => {
                if (row.original.purchase_order) {
                    return row.original.purchase_order.created_by?.name || "-";
                }
                if (row.original.stock_transfer_order?.internal_request) {
                    return row.original.stock_transfer_order.internal_request.requested_by?.name || "-";
                }
                return "-";
            }
        },
        {
            id: "receivedBy",
            header: "Received By",
            accessorFn: (row: any) => row.received_by?.name || "-",
        },
    ];

    return (
        <XPage title="Receive Stock" className="p-6 max-w-7xl mx-auto">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total GRNs</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.total}</h3>
                        </div>
                        <div className="p-2 bg-slate-500/10 text-slate-500 rounded-lg">
                            <FileText className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Draft / Pending</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.draft}</h3>
                        </div>
                        <div className="p-2 bg-slate-500/10 text-slate-500 rounded-lg">
                            <Clock className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Completed</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.processed}</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <CheckCircle className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">From STO</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.internal}</h3>
                        </div>
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Truck className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">From PO</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.external}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <ShoppingCart className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Filter Tabs & Date Range */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Tabs value={activeTab} onValueChange={handleTabSelect} className="w-full sm:w-auto">
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
                title="Receive Stock"
                entity={Entity.InternalRequests}
                data={grns}
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
