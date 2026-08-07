import React, { useState, useMemo } from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { Badge } from "@/components/shadcn/ui/badge";
import { usePage, router } from "@inertiajs/react";
import { Entity } from "@/lib/permissions";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { XDateRangePicker } from "@/components/x/date-picker/XDateRangePicker";
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Settings, Flame } from "lucide-react";

export default function InventoryLedgerIndex() {
    const { props } = usePage<any>();
    const { ledgers } = props;

    const [activeTab, setActiveTab] = useState("all");

    const isPositive = (type: string) => ['purchase', 'transfer_in', 'po_receipt', 'adjustment_up'].includes(type.toLowerCase());
    const isNegative = (type: string) => ['transfer_out', 'consumption', 'adjustment_down', 'sale'].includes(type.toLowerCase());

    const stats = useMemo(() => {
        const rows = ledgers.rows || [];
        return {
            total: rows.length,
            inwards: rows.filter((l: any) => isPositive(l.transaction_type)).length,
            outwards: rows.filter((l: any) => isNegative(l.transaction_type)).length,
            adjustments: rows.filter((l: any) => l.transaction_type === 'adjustment_up' || l.transaction_type === 'adjustment_down').length,
            consumption: rows.filter((l: any) => l.transaction_type === 'consumption').length,
        };
    }, [ledgers]);

    const processedData = useMemo(() => {
        let filteredRows = ledgers.rows || [];
        if (activeTab === "inwards") {
            filteredRows = filteredRows.filter((l: any) => isPositive(l.transaction_type));
        } else if (activeTab === "outwards") {
            filteredRows = filteredRows.filter((l: any) => isNegative(l.transaction_type));
        }
        return { ...ledgers, rows: filteredRows };
    }, [ledgers, activeTab]);

    const dateFilterValue = useMemo(() => {
        const filters = ledgers.filters || [];
        const dateFilter = filters.find((f: any) => f.id === 'created_at');
        if (dateFilter && dateFilter.value && Array.isArray(dateFilter.value)) {
            const parseDate = (val: any) => {
                if (!val) return undefined;
                if (typeof val === 'string') {
                    const [y, m, d] = val.split('-');
                    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                }
                return new Date(val);
            };
            return {
                from: parseDate(dateFilter.value[0]),
                to: parseDate(dateFilter.value[1])
            };
        }
        return undefined;
    }, [ledgers.filters]);

    const handleDateSelect = (date: any) => {
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        let filters = ledgers.filters || [];
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
            id: "created_at",
            header: "Date/Time",
            accessorFn: (row: any) => new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        },
        {
            id: "location",
            header: "Location",
            accessorFn: (row: any) => row.location?.location_name || "-",
        },
        {
            id: "ingredient",
            header: "Ingredient",
            accessorFn: (row: any) => row.ingredient?.name || "-",
        },
        {
            id: "transaction_type",
            header: "Type",
            enableColumnFilter: true,
            meta: {
                label: "Transaction Type",
                variant: "select",
                options: [
                    { label: "Purchase", value: "purchase" },
                    { label: "Transfer In", value: "transfer_in" },
                    { label: "PO Receipt", value: "po_receipt" },
                    { label: "Adjustment Up", value: "adjustment_up" },
                    { label: "Transfer Out", value: "transfer_out" },
                    { label: "Consumption", value: "consumption" },
                    { label: "Adjustment Down", value: "adjustment_down" },
                    { label: "Sale", value: "sale" },
                ],
            },
            cell: ({ row }: any) => {
                const type = row.original.transaction_type;
                const pos = isPositive(type);
                const neg = isNegative(type);
                
                let colorClass = "bg-gray-100 text-gray-800";
                if (pos) colorClass = "bg-emerald-100 text-emerald-800";
                if (neg) colorClass = "bg-red-100 text-red-800";

                return (
                    <Badge variant="outline" className={colorClass}>
                        {type.replace("_", " ").toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            id: "reference",
            header: "Reference",
            cell: ({ row }: any) => {
                if (!row.original.reference_type) return "-";
                const typeName = row.original.reference_type.split("\\").pop();
                return <span className="text-muted-foreground text-xs font-mono">{typeName} #{row.original.reference_id}</span>;
            },
        },
        {
            id: "quantity",
            header: "Qty",
            cell: ({ row }: any) => {
                const qty = Number(row.original.quantity);
                const pos = qty > 0;
                const neg = qty < 0;
                const uom = row.original.ingredient?.base_uom?.code || '';
                
                return (
                    <span className={`font-bold ${pos ? 'text-emerald-600' : neg ? 'text-red-600' : ''}`}>
                        {pos ? '+' : ''}{qty.toFixed(2)} <span className="text-[10px] font-normal opacity-70 ml-0.5">{uom}</span>
                    </span>
                );
            },
        },
        {
            id: "running_balance",
            header: "Balance",
            cell: ({ row }: any) => {
                const uom = row.original.ingredient?.base_uom?.code || '';
                return (
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {Number(row.original.running_balance).toFixed(2)} <span className="text-[10px] font-normal opacity-70 ml-0.5">{uom}</span>
                    </span>
                );
            }
        },
        {
            id: "createdBy",
            header: "User",
            accessorFn: (row: any) => row.created_by?.name || "-",
        },
    ];

    return (
        <XPage title="Inventory Ledger">
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Entries</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.total}</h3>
                        </div>
                        <div className="p-2 bg-slate-500/10 text-slate-500 rounded-lg">
                            <ArrowLeftRight className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Inwards</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.inwards}</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <ArrowDownRight className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Outwards</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.outwards}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <ArrowUpRight className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Adjustments</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.adjustments}</h3>
                        </div>
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Settings className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Consumption</p>
                            <h3 className="text-2xl font-bold leading-none">{stats.consumption}</h3>
                        </div>
                        <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                            <Flame className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="grid w-full sm:w-[500px] grid-cols-3 h-11 bg-muted/50 p-1">
                        <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Movements</TabsTrigger>
                        <TabsTrigger value="inwards" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Inwards (+)</TabsTrigger>
                        <TabsTrigger value="outwards" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Outwards (-)</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            <XDataTable
                title="Inventory Transactions"
                entity={Entity.InventoryLedger}
                data={processedData}
                columns={columns}
                actions={[]}
            />
        </XPage>
    );
}
