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
import { Switch } from "@/components/shadcn/ui/switch";
import { Label } from "@/components/shadcn/ui/label";
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Settings, Flame } from "lucide-react";

export default function InventoryLedgerIndex() {
    const { props } = usePage<any>();
    const { ledgers, serverStats } = props;

    const isPositive = (item: any) => {
        const qty = typeof item === 'object' && item !== null ? Number(item.quantity) : NaN;
        if (!isNaN(qty) && qty !== 0) return qty > 0;
        const type = typeof item === 'string' ? item : item?.transaction_type;
        return ['purchase', 'transfer_in', 'po_receipt', 'adjustment_up'].includes(type?.toLowerCase());
    };

    const isNegative = (item: any) => {
        const qty = typeof item === 'object' && item !== null ? Number(item.quantity) : NaN;
        if (!isNaN(qty) && qty !== 0) return qty < 0;
        const type = typeof item === 'string' ? item : item?.transaction_type;
        return ['transfer_out', 'consumption', 'adjustment_down', 'sale'].includes(type?.toLowerCase());
    };

    const searchParams = new URLSearchParams(window.location.search);
    const activeTab = searchParams.get("movement") || "all";

    const handleTabChange = (value: string) => {
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        if (value !== "all") {
            queryParams.movement = value;
        } else {
            delete queryParams.movement;
        }
        queryParams.page = "1";
        
        router.get(window.location.pathname, queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const [hideSales, setHideSales] = useState(searchParams.get("hide_sales") === "1");

    const handleHideSalesToggle = (checked: boolean) => {
        setHideSales(checked);
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        if (checked) {
            queryParams.hide_sales = "1";
        } else {
            delete queryParams.hide_sales;
        }
        queryParams.page = "1";
        
        router.get(window.location.pathname, queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const stats = useMemo(() => {
        if (serverStats) {
            return serverStats;
        }
        const rows = ledgers.rows || [];
        const totalCount = ledgers.total ?? ledgers.meta?.total ?? rows.length;
        return {
            total: totalCount,
            inwards: rows.filter((l: any) => isPositive(l)).length,
            outwards: rows.filter((l: any) => isNegative(l)).length,
            adjustments: rows.filter((l: any) => l.transaction_type === 'adjustment_up' || l.transaction_type === 'adjustment_down').length,
            consumption: rows.filter((l: any) => l.transaction_type === 'consumption').length,
        };
    }, [ledgers, serverStats]);

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
            delete queryParams.all_dates;
            const format = (d: Date) => {
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            };
            filters.push({
                id: 'created_at',
                value: [date.from ? format(date.from) : null, date.to ? format(date.to) : (date.from ? format(date.from) : null)]
            });
        } else {
            queryParams.all_dates = "1";
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
            cell: ({ getValue }: any) => getValue()
        },
        {
            id: "location",
            header: "Location",
            accessorFn: (row: any) => row.location?.location_name || "-",
            cell: ({ getValue }: any) => getValue()
        },
        {
            id: "ingredient",
            header: "Ingredient",
            accessorFn: (row: any) => row.ingredient?.name || "-",
            cell: ({ getValue }: any) => getValue()
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
                const ref = row.original.reference;
                
                let typeName = row.original.reference_type.split("\\").pop();
                let refDisplay = "";

                if (ref) {
                    if (ref.order?.order_number) {
                        typeName = "Order";
                        refDisplay = ref.order.order_number;
                    } else if (ref.order_number) {
                        typeName = "Order";
                        refDisplay = ref.order_number;
                    } else if (ref.grn_number) {
                        typeName = "GRN";
                        refDisplay = ref.grn_number;
                    } else if (ref.po_number) {
                        typeName = "PO";
                        refDisplay = ref.po_number;
                    } else if (ref.transfer_number) {
                        typeName = "Transfer";
                        refDisplay = ref.transfer_number;
                    } else if (ref.reference_number) {
                        typeName = "Ref";
                        refDisplay = ref.reference_number;
                    }
                }

                if (!refDisplay) {
                    if (typeName === 'OrderItem') typeName = 'Order';
                    const rawId = typeof row.original.reference_id === 'string' 
                        ? row.original.reference_id.substring(0, 8) 
                        : row.original.reference_id;
                    refDisplay = rawId;
                }

                return <span className="text-muted-foreground text-xs font-mono">{typeName} #{refDisplay}</span>;
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
                if (row.original.running_balance === null) return "-";
                
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
            cell: ({ getValue }: any) => getValue()
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
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
                    <TabsList className="grid w-full sm:w-[500px] grid-cols-3 h-11 bg-muted/50 p-1">
                        <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Movements</TabsTrigger>
                        <TabsTrigger value="inwards" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Inwards (+)</TabsTrigger>
                        <TabsTrigger value="outwards" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Outwards (-)</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-end sm:items-center gap-4 justify-end">
                    <div className="flex items-center space-x-2 bg-muted/30 px-3 py-2 rounded-md border border-border/50 h-10">
                        <Switch id="hide-sales" checked={hideSales} onCheckedChange={handleHideSalesToggle} />
                        <Label htmlFor="hide-sales" className="text-sm font-medium cursor-pointer text-muted-foreground">Hide POS Sales</Label>
                    </div>
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            <XDataTable
                title="Inventory Transactions"
                entity={Entity.InventoryLedger}
                data={ledgers}
                columns={columns}
                actions={[]}
            />
        </XPage>
    );
}
