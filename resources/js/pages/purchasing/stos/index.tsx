import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/ui/table";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Link, usePage, router } from "@inertiajs/react";
import { Entity } from "@/lib/permissions";
import { Store, Factory, Truck, Package, PackageCheck, Clock, CheckCircle, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { XDateRangePicker } from "@/components/x/date-picker/XDateRangePicker";

export default function StockTransferOrdersIndex() {
    const { props } = usePage<any>();
    const { stos, locations } = props;
    const { auth } = props;
    
    const [activeTab, setActiveTab] = useState("all");

    // Filter logic for quick tabs
    const filteredStos = useMemo(() => {
        if (activeTab === "all") return stos;
        
        let newRows = stos.rows || [];
        if (activeTab === "incoming") {
            newRows = newRows.filter((sto: any) => sto.to_location_id === auth.user.business_location_id);
        } else if (activeTab === "outgoing") {
            newRows = newRows.filter((sto: any) => sto.from_location_id === auth.user.business_location_id);
        }
        
        return {
            ...stos,
            rows: newRows
        };
    }, [stos, activeTab, auth.user.business_location_id]);

    // Dashboard metrics
    const stats = useMemo(() => {
        const rows = stos.rows || [];
        return {
            total: rows.length,
            pendingDispatch: rows.filter((sto: any) => sto.status === 'pending_dispatch').length,
            inTransit: rows.filter((sto: any) => sto.status === 'dispatched').length,
            partiallyReceived: rows.filter((sto: any) => sto.status === 'partially_received').length,
            fullyReceived: rows.filter((sto: any) => sto.status === 'received').length,
        };
    }, [stos]);

    const dateFilterValue = useMemo(() => {
        const filters = stos.filters || [];
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
    }, [stos.filters]);

    const handleDateSelect = (date: any) => {
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        let filters = stos.filters || [];
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

    const locationOptions = (locations || []).map((l: any) => ({ label: l.location_name, value: l.location_name }));

    const LocationIcon = ({ type }: { type: string }) => {
        if (type?.toLowerCase().includes("warehouse")) return <Factory className="mr-2 size-4 text-blue-500 inline" />;
        return <Store className="mr-2 size-4 text-emerald-500 inline" />;
    };

    const columns: XDataTableColumn<any>[] = [
        {
            id: "sto_number",
            header: "Order Number",
            enableColumnFilter: true,
            meta: { label: "Order Number", variant: "text" },
            cell: ({ row }: any) => (
                <Link href={`/purchasing/stos/${row.original.uuid}?workflow=${props.type || 'manage'}`} className="text-primary hover:underline font-medium">
                    {row.original.sto_number}
                </Link>
            ),
        },
        {
            id: "fromLocation",
            header: "Dispatching Location",
            enableColumnFilter: true,
            meta: { label: "Dispatching Location", variant: "select", options: locationOptions },
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
            header: "Receiving Location",
            enableColumnFilter: true,
            meta: { label: "Receiving Location", variant: "select", options: locationOptions },
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
                    { label: "Pending Dispatch", value: "pending_dispatch" },
                    { label: "Dispatched", value: "dispatched" },
                    { label: "Partially Received", value: "partially_received" },
                    { label: "Received", value: "received" },
                    { label: "Cancelled", value: "cancelled" },
                ],
            },
            cell: ({ row }: any) => {
                const status = row.original.status || "pending_dispatch";
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
            id: "requestedBy",
            header: "Requested By",
            accessorFn: (row: any) => row.internal_request?.requested_by?.name || "-",
        },
        {
            id: "receivedBy",
            header: "Rec / Rej By",
            cell: ({ row }: any) => {
                if (row.original.status === 'cancelled' || row.original.status === 'rejected') {
                    return row.original.internal_request?.updated_by?.name || "-";
                }
                if (!row.original.grns || row.original.grns.length === 0) return "-";
                // Get the latest GRN's receiver
                const latestGrn = row.original.grns[row.original.grns.length - 1];
                return latestGrn.received_by?.name || "-";
            }
        },
    ];

    return (
        <XPage title={props.type === 'incoming' ? 'Receive Stock' : (props.type === 'outgoing' ? 'Dispatch Stock' : 'Stock Transfer Orders')} className="p-6 max-w-7xl mx-auto">
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total STOs</p>
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
                            <h3 className="text-2xl font-bold leading-none">{stats.pendingDispatch}</h3>
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
                {!props.type && (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="grid w-full sm:w-[500px] grid-cols-3 h-11 bg-muted/50 p-1">
                            <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All STOs</TabsTrigger>
                            <TabsTrigger value="incoming" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Incoming (To Me)</TabsTrigger>
                            <TabsTrigger value="outgoing" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Outgoing (From Me)</TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}
                {props.type && <div className="w-full sm:w-auto" />}
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            {props.pendingRequests && props.pendingRequests.length > 0 && props.type !== 'incoming' && (
                <div className="mb-8">
                    <Card className="overflow-hidden border-2 border-primary/20 shadow-md p-0 gap-0">
                        <div className="bg-primary/5 px-4 py-3 flex items-center justify-between border-b border-primary/10">
                            <div>
                                <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
                                    <Clock className="size-4" /> Pending Requests to Dispatch
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    These are approved requests waiting for you to fulfill them.
                                </p>
                            </div>
                            <Badge variant="default" className="px-3 py-1 font-semibold shadow-sm">
                                {props.pendingRequests.length} Pending
                            </Badge>
                        </div>
                        <div className="bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Request Number</TableHead>
                                        <TableHead>Requested By</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {props.pendingRequests.map((req: any) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/purchasing/internal-requests/${req.uuid}/fulfill`} className="font-semibold text-primary hover:underline">
                                                    {req.request_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{req.requested_by?.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Store className="size-4 text-muted-foreground" />
                                                    {req.to_location?.location_name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={req.status === 'partially_fulfilled' ? 'text-indigo-500 border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20' : 'text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20'}>
                                                    {req.status === 'partially_fulfilled' ? 'Pending Fulfillment' : 'Pending Fulfillment'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/purchasing/internal-requests/${req.uuid}/fulfill`}>
                                                    <Button size="sm" variant="default" className="h-8">
                                                        Dispatch Now
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            )}

            <XDataTable
                title={props.type === 'incoming' ? 'Receive Stock' : (props.type === 'outgoing' ? 'Dispatch Stock' : 'Stock Transfer Orders')}
                entity={Entity.StockTransferOrders}
                data={filteredStos}
                columns={columns}
                actions={[
                    {
                        name: props.type === 'incoming' ? "Receive Items" : (props.type === 'outgoing' ? "Dispatch Items" : "View"),
                        action: "custom",
                        icon: props.type === 'incoming' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package-plus"><path d="M16 16h6"/><path d="M19 13v6"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>
                        ) : props.type === 'outgoing' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        ),
                        url: (row) => `/purchasing/stos/${row.uuid}?workflow=${props.type || 'manage'}`,
                    },
                ]}
            />
        </XPage>
    );
}
