import React, { useState, useMemo } from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { Entity } from "@/lib/permissions";
import { router, Link, usePage } from "@inertiajs/react";
import { Store, Factory, FileText, CheckCircle, Clock, Settings, Truck, PackageCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { XDateRangePicker } from "@/components/x/date-picker/XDateRangePicker";

export default function InternalRequestsIndex({ internalRequests, locations }: { internalRequests: any, locations: any[] }) {
    const { auth } = usePage<any>().props;
    const [activeTab, setActiveTab] = useState("all");

    // No tabs needed anymore since we only show requests raised by the user
    const filteredRequests = useMemo(() => {
        return internalRequests;
    }, [internalRequests]);

    // Dashboard metrics
    const stats = useMemo(() => {
        const rows = internalRequests.rows || [];
        return {
            total: rows.length,
            pendingApproval: rows.filter((req: any) => req.status === 'pending_fulfillment' || req.status === 'draft').length,
            processing: rows.filter((req: any) => req.status === 'approved').length,
            inTransit: rows.filter((req: any) => req.status === 'converted_to_sto' || req.status === 'fulfilled').length,
            completed: rows.filter((req: any) => req.status === 'received').length,
        };
    }, [internalRequests]);

    const dateFilterValue = useMemo(() => {
        const filters = internalRequests.filters || [];
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
    }, [internalRequests.filters]);

    const handleDateSelect = (date: any) => {
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        let filters = internalRequests.filters || [];
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

    const locationOptions = (locations || []).map(l => ({ label: l.location_name, value: l.location_name }));

    const LocationIcon = ({ type }: { type: string }) => {
        if (type?.toLowerCase().includes("warehouse")) return <Factory className="mr-2 size-4 text-blue-500 inline" />;
        return <Store className="mr-2 size-4 text-emerald-500 inline" />;
    };

    const columns: XDataTableColumn<any>[] = [
        {
            id: "request_number",
            header: "Request Number",
            enableColumnFilter: true,
            meta: { label: "Request Number", variant: "text" },
            cell: ({ row }: any) => (
                <Link href={`/purchasing/internal-requests/${row.original.uuid}`} className="text-primary hover:underline font-medium">
                    {row.original.request_number}
                </Link>
            ),
        },
        {
            id: "fromLocation",
            header: "From Location",
            enableColumnFilter: true,
            meta: { label: "From Location", variant: "select", options: locationOptions },
            accessorFn: (row: any) => row.from_location?.location_name || "-",
            cell: ({ row }: any) => (
                <div className="flex items-center font-medium">
                    <LocationIcon type={row.original.from_location?.location_type} />
                    {row.original.from_location?.location_name || "-"}
                </div>
            )
        },
        {
            id: "toLocation",
            header: "To Location",
            enableColumnFilter: true,
            meta: { label: "To Location", variant: "select", options: locationOptions },
            accessorFn: (row: any) => row.to_location?.location_name || "-",
            cell: ({ row }: any) => (
                <div className="flex items-center font-medium">
                    <LocationIcon type={row.original.to_location?.location_type} />
                    {row.original.to_location?.location_name || "-"}
                </div>
            )
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
                    { label: "Pending Fulfillment", value: "pending_fulfillment" },
                    { label: "Approved", value: "approved" },
                    { label: "Rejected", value: "rejected" },
                    { label: "Partially Fulfilled", value: "partially_fulfilled" },
                    { label: "Fulfilled", value: "fulfilled" },
                    { label: "Received", value: "received" },
                    { label: "Converted to STO", value: "converted_to_sto" },
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
                        {status === 'partially_rejected' ? 'PARTIALLY SENT' : 
                         status === 'partially_fulfilled' ? 'PENDING FULFILLMENT' : 
                         status.replace("_", " ").toUpperCase()}
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
                
                const requested = items.reduce((acc: number, item: any) => acc + Number(item.quantity || 0), 0);
                const dispatched = items.reduce((acc: number, item: any) => acc + Number(item.dispatched_quantity || 0), 0);
                const rejected = items.reduce((acc: number, item: any) => acc + Number(item.rejected_quantity || 0), 0);
                
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-foreground">{requested} Requested</span>
                        <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-emerald-600 font-semibold">{dispatched} Sent</span>
                            {rejected > 0 && <span className="text-red-500 font-medium">({rejected} Rejected)</span>}
                        </div>
                    </div>
                );
            }
        },
        {
            id: "requestedBy",
            header: "Requested By",
            accessorFn: (row: any) => row.requested_by?.name || "-",
        },
        {
            id: "receivedBy",
            header: "Rec / Rej By",
            cell: ({ row }: any) => {
                if (row.original.status === 'rejected') {
                    return row.original.updated_by?.name || "-";
                }
                if (!row.original.stos || row.original.stos.length === 0) return "-";
                
                // Find latest GRN across all STOs
                let latestGrn: any = null;
                for (const sto of row.original.stos) {
                    if (sto.grns && sto.grns.length > 0) {
                        const grn = sto.grns[sto.grns.length - 1];
                        if (!latestGrn || new Date(grn.created_at) > new Date(latestGrn.created_at)) {
                            latestGrn = grn;
                        }
                    }
                }
                
                return latestGrn?.received_by?.name || "-";
            }
        },
    ];

    return (
        <XPage title="Request Stock">
            
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total IRs</p>
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
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Approved</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.processing}</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <CheckCircle className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">In Transit</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.inTransit}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Truck className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fulfilled</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.completed}</h3>
                        </div>
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            <PackageCheck className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Date Range */}
            <div className="mb-6 flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            <XDataTable
                title="Request Stock"
                entity={Entity.InternalRequests}
                data={filteredRequests}
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
                        show: (row) => row.status === 'draft',
                    },
                    {
                        action: "delete",
                        url: (row) => `/purchasing/internal-requests/${row.uuid}`,
                        show: (row) => row.status === 'draft',
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
