import React, { useState, useMemo } from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { Entity } from "@/lib/permissions";
import { router, Link, usePage } from "@inertiajs/react";
import { Store, Factory, FileText, CheckCircle, Clock, Settings, Truck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { XDateRangePicker } from "@/components/x/date-picker/XDateRangePicker";

export default function InternalRequestsIndex({ internalRequests, locations }: { internalRequests: any, locations: any[] }) {
    const { auth } = usePage<any>().props;
    const [activeTab, setActiveTab] = useState("all");

    // Filter logic for quick tabs
    const filteredRequests = useMemo(() => {
        if (activeTab === "all") return internalRequests;
        
        let newRows = internalRequests.rows || [];
        if (activeTab === "incoming") {
            newRows = newRows.filter((ir: any) => ir.to_location_id === auth.user.business_location_id);
        } else if (activeTab === "outgoing") {
            newRows = newRows.filter((ir: any) => ir.from_location_id === auth.user.business_location_id);
        }
        
        return {
            ...internalRequests,
            rows: newRows
        };
    }, [internalRequests, activeTab, auth.user.business_location_id]);

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
                    { label: "Fulfilled", value: "fulfilled" },
                    { label: "Received", value: "received" },
                    { label: "Converted to STO", value: "converted_to_sto" },
                ],
            },
            cell: ({ row }: any) => {
                const status = row.original.status || "draft";
                const colors: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-800",
                    pending_fulfillment: "bg-yellow-100 text-yellow-800",
                    approved: "bg-blue-100 text-blue-800",
                    rejected: "bg-red-100 text-red-800",
                    fulfilled: "bg-amber-100 text-amber-800",
                    received: "bg-emerald-100 text-emerald-800",
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
            accessorFn: (row: any) => row.requested_by?.name || "-",
        },
    ];

    return (
        <XPage title="Indents (Internal Requests)">
            
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '#64748b' }} />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Total Requests</p>
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
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Pending Approval</p>
                            <h3 className="text-xl font-black text-slate-800 leading-none">{stats.pendingApproval}</h3>
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
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Processing</p>
                            <h3 className="text-xl font-black text-slate-800 leading-none">{stats.processing}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                            <Settings className="size-4" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '#9c27b0' }} />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">In Transit / STO</p>
                            <h3 className="text-xl font-black text-slate-800 leading-none">{stats.inTransit}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                            <Truck className="size-4" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '#4caf50' }} />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Completed & Received</p>
                            <h3 className="text-xl font-black text-slate-800 leading-none">{stats.completed}</h3>
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
                        <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Requests</TabsTrigger>
                        <TabsTrigger value="incoming" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Incoming (To Me)</TabsTrigger>
                        <TabsTrigger value="outgoing" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Outgoing (From Me)</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            <XDataTable
                title="Indents"
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
