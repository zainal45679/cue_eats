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

export default function PurchaseOrdersIndex({ purchaseOrders }: { purchaseOrders: any }) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '#64748b' }} />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Total Orders</p>
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
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Approved</p>
                            <h3 className="text-xl font-black text-slate-800 leading-none">{stats.approved}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                            <CheckCircle className="size-4" />
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
