import React from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { usePage, router } from "@inertiajs/react";
import { Entity } from "@/lib/permissions";
import { XDateRangePicker } from "@/components/x/date-picker/XDateRangePicker";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { DollarSign, Layers, ShoppingCart, TrendingUp, Calculator } from "lucide-react";
export default function InventoryConsumptionIndex() {
    const { props } = usePage<any>();
    const { consumptions, filters } = props;

    const dateFilterValue = {
        from: filters?.start_date ? new Date(filters.start_date) : undefined,
        to: filters?.end_date ? new Date(filters.end_date) : undefined,
    };

    const handleDateSelect = (date: any) => {
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        
        const format = (d: Date) => {
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        };

        if (date?.from) {
            queryParams.start_date = format(date.from);
        } else {
            delete queryParams.start_date;
        }

        if (date?.to) {
            queryParams.end_date = format(date.to);
        } else {
            delete queryParams.end_date;
        }
        
        router.get(window.location.pathname, queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns: XDataTableColumn<any>[] = [
        {
            id: "ingredient",
            header: "Ingredient",
            accessorFn: (row: any) => row.ingredient?.name || "-",
            cell: ({ getValue }: any) => <span className="font-semibold">{getValue()}</span>
        },
        {
            id: "total_orders",
            header: "Total POS Orders",
            accessorFn: (row: any) => row.total_orders,
            cell: ({ getValue }: any) => <span className="text-muted-foreground">{getValue()}</span>
        },
        {
            id: "total_consumed",
            header: "Total Consumed",
            cell: ({ row }: any) => {
                const qty = Number(row.original.total_consumed);
                const uom = row.original.ingredient?.base_uom?.code || '';
                return (
                    <span className="font-bold text-red-600">
                        {qty.toFixed(2)} <span className="text-[10px] font-normal opacity-70 ml-0.5">{uom}</span>
                    </span>
                );
            },
        },
        {
            id: "total_cost",
            header: "Est. Cost Value",
            cell: ({ row }: any) => {
                const cost = Number(row.original.total_cost);
                return (
                    <span className="font-semibold text-muted-foreground">
                        {cost > 0 ? `$${cost.toFixed(2)}` : "-"}
                    </span>
                );
            },
        }
    ];

    const data = {
        rows: consumptions,
        meta: {
            total: consumptions.length,
            per_page: consumptions.length,
            current_page: 1,
            last_page: 1,
        }
    };

    const totalIngredients = consumptions.length;
    const totalCost = consumptions.reduce((sum: number, row: any) => sum + Number(row.total_cost || 0), 0);
    const totalOrders = consumptions.reduce((sum: number, row: any) => sum + Number(row.total_orders || 0), 0);
    
    let topIngredient = "-";
    if (consumptions.length > 0) {
        const top = [...consumptions].sort((a, b) => b.total_orders - a.total_orders)[0];
        topIngredient = top.ingredient?.name || "-";
    }

    const avgCostPerOrder = totalOrders > 0 ? totalCost / totalOrders : 0;

    return (
        <XPage title="Daily Consumption Report">
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Cost Value</p>
                            <h3 className="text-2xl font-bold leading-none">${totalCost.toFixed(2)}</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                            <DollarSign className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total POS Orders</p>
                            <h3 className="text-2xl font-bold leading-none">{totalOrders}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                            <ShoppingCart className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Avg Cost / Order</p>
                            <h3 className="text-2xl font-bold leading-none">${avgCostPerOrder.toFixed(2)}</h3>
                        </div>
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                            <Calculator className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Ingredients Used</p>
                            <h3 className="text-2xl font-bold leading-none">{totalIngredients}</h3>
                        </div>
                        <div className="p-2 bg-slate-500/10 text-slate-500 rounded-lg shrink-0">
                            <Layers className="size-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground dark:border-sidebar-border shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div className="min-w-0 flex-1 pr-4">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Most Ordered</p>
                            <h3 className="text-xl font-bold leading-none truncate" title={topIngredient}>{topIngredient}</h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg shrink-0">
                            <TrendingUp className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-sm font-medium text-muted-foreground">Aggregated consumption from POS sales</h2>
                </div>
                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <XDateRangePicker value={dateFilterValue} onChange={handleDateSelect} />
                </div>
            </div>

            <XDataTable
                title="Consumption Summary"
                entity={Entity.InventoryLedger}
                data={data}
                columns={columns}
                actions={[]}
            />
        </XPage>
    );
}
