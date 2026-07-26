import React, { useState, useMemo } from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
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
                <Link href={`/purchasing/stos/${row.original.uuid}`} className="text-primary hover:underline font-medium">
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
                ],
            },
            cell: ({ row }: any) => {
                const status = row.original.status || "pending_dispatch";
                const colors: Record<string, string> = {
                    pending_dispatch: "bg-yellow-100 text-yellow-800",
                    dispatched: "bg-blue-100 text-blue-800",
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
    ];

    return (
        <XPage title="Dispatch Orders (STOs)">
            
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '#64748b' }} />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Total Dispatches</p>
                            <h3 className="text-xl font-black text-slate-800 leading-none">{stats.total}</h3>
                        </div>
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-md">
                            <FileText className="size-4" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '#f47a20' }} />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Pending Dispatch</p>
                            <h3 className="text-xl font-black text-slate-800 leading-none">{stats.pendingDispatch}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
                            <Clock className="size-4" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '#2196f3' }} />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">In Transit</p>
                            <h3 className="text-xl font-black text-slate-800 leading-none">{stats.inTransit}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                            <Truck className="size-4" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '#9c27b0' }} />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Partially Received</p>
                            <h3 className="text-xl font-black text-slate-800 leading-none">{stats.partiallyReceived}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                            <Package className="size-4" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '#4caf50' }} />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Fully Received</p>
                            <h3 className="text-xl font-black text-slate-800 leading-none">{stats.fullyReceived}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                            <CheckCircle className="size-4" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Filter Tabs & Date Range */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="grid w-full sm:w-[500px] grid-cols-3 h-11 bg-muted/50 p-1">
                        <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Orders</TabsTrigger>
                        <TabsTrigger value="incoming" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Incoming (To Me)</TabsTrigger>
                        <TabsTrigger value="outgoing" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Outgoing (From Me)</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            <XDataTable
                title="Stock Transfer Orders"
                entity={Entity.InternalRequests}
                data={filteredStos}
                columns={columns}
                actions={[
                    {
                        name: "View",
                        action: "custom",
                        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
                        url: (row) => `/purchasing/stos/${row.uuid}`,
                    },
                ]}
            />
        </XPage>
    );
}
