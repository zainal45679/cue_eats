import React, { useState, useMemo } from "react";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type { XDataTableColumn } from "@/components/x/table/XDataTableType";
import { usePage, router } from "@inertiajs/react";
import { Entity } from "@/lib/permissions";
import { XDateRangePicker } from "@/components/x/date-picker/XDateRangePicker";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { DollarSign, Layers, ShoppingCart, TrendingUp, Calculator, LayoutList } from "lucide-react";
import { Badge } from "@/components/shadcn/ui/badge";

export default function InventoryConsumptionIndex() {
    const { props } = usePage<any>();
    const { consumptions, serverCategories, filters } = props;

    const [showCategorySidebar, setShowCategorySidebar] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

    const categories = useMemo(() => {
        if (serverCategories) {
            return Object.entries(serverCategories).sort((a, b) => a[0].localeCompare(b[0]));
        }
        return [];
    }, [serverCategories]);

    const processedRows = useMemo(() => {
        let rows = consumptions || [];
        if (selectedCategory) {
            rows = rows.filter((item: any) => {
                const cat = item.ingredient?.category?.name || 'Uncategorized';
                return cat === selectedCategory;
            });
        }
        return rows;
    }, [consumptions, selectedCategory]);

    const maxConsumed = useMemo(() => {
        return Math.max(...processedRows.map((r: any) => Number(r.total_consumed)), 1);
    }, [processedRows]);

    const maxOrders = useMemo(() => {
        return Math.max(...processedRows.map((r: any) => Number(r.total_orders)), 1);
    }, [processedRows]);

    const maxCost = useMemo(() => {
        return Math.max(...processedRows.map((r: any) => Number(r.total_cost)), 1);
    }, [processedRows]);

    const columns: XDataTableColumn<any>[] = [
        {
            id: "ingredient",
            header: "Ingredient",
            accessorFn: (row: any) => row.ingredient?.name || "-",
            cell: ({ row }: any) => {
                const name = row.original.ingredient?.name || "-";
                const cat = row.original.ingredient?.category?.name;
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{name}</span>
                        {cat && (
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                {cat}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            id: "total_orders",
            header: "Total POS Orders",
            accessorFn: (row: any) => row.total_orders,
            cell: ({ getValue }: any) => {
                const val = Number(getValue());
                const pct = Math.round((val / maxOrders) * 100);
                return (
                    <div className="flex items-center gap-3 w-[140px]">
                        <span className="w-8 text-right font-medium text-muted-foreground">{val}</span>
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            }
        },
        {
            id: "total_consumed",
            header: "Total Consumed",
            cell: ({ row }: any) => {
                const qty = Number(row.original.total_consumed);
                const uom = row.original.ingredient?.base_uom?.code || '';
                const pct = Math.round((qty / maxConsumed) * 100);
                return (
                    <div className="flex flex-col gap-1 w-[160px]">
                        <div className="flex items-end justify-between">
                            <span className="font-bold text-red-600 leading-none">
                                {qty.toFixed(2)} <span className="text-[10px] font-normal opacity-70 ml-0.5">{uom}</span>
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground">{pct}% of max</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            },
        },
        {
            id: "total_cost",
            header: "Est. Cost Value",
            cell: ({ row }: any) => {
                const cost = Number(row.original.total_cost);
                const pct = Math.round((cost / maxCost) * 100);
                return (
                    <div className="flex items-center gap-3 w-[160px]">
                        <span className="w-14 font-semibold text-emerald-600">
                            {cost > 0 ? `$${cost.toFixed(2)}` : "-"}
                        </span>
                        {cost > 0 && (
                            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                        )}
                    </div>
                );
            },
        }
    ];

    const data = {
        rows: processedRows,
        meta: {
            total: processedRows.length,
            per_page: processedRows.length,
            current_page: 1,
            last_page: 1,
        }
    };

    const totalIngredients = processedRows.length;
    const totalCost = processedRows.reduce((sum: number, row: any) => sum + Number(row.total_cost || 0), 0);
    const totalOrders = processedRows.reduce((sum: number, row: any) => sum + Number(row.total_orders || 0), 0);
    
    let topIngredient = "-";
    if (processedRows.length > 0) {
        const top = [...processedRows].sort((a, b) => b.total_orders - a.total_orders)[0];
        topIngredient = top.ingredient?.name || "-";
    }

    const avgCostPerOrder = totalOrders > 0 ? totalCost / totalOrders : 0;

    return (
        <XPage title="Daily Consumption Report">
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
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
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
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
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
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
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
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
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
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

            <div className="relative min-h-[calc(100vh-140px)] flex flex-col">
                {/* Floating Right Nav Anchor (Fixed Position) */}
                <div className="absolute right-0 top-[48px] z-20 flex flex-col items-end">
                    <button
                        onClick={() => setShowCategorySidebar(!showCategorySidebar)}
                        className={`group flex items-center justify-center p-2 bg-card border shadow-sm hover:bg-muted/80 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden h-9 whitespace-nowrap ${showCategorySidebar ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                        title="Toggle Categories"
                    >
                        <LayoutList className={`size-4 shrink-0 transition-colors duration-500 ${showCategorySidebar ? 'text-primary' : 'group-hover:text-primary'}`} />
                        <div className="overflow-hidden w-0 opacity-0 group-hover:w-[84px] group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                        <span className="font-semibold text-sm pl-2">
                            Categories
                        </span>
                        </div>
                    </button>

                    {/* Floating Sidebar Content */}
                    <div className={`transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] mt-3 overflow-hidden rounded-xl bg-sidebar text-sidebar-foreground flex flex-col ${
                        showCategorySidebar ? 'w-full md:w-56 opacity-100 h-fit max-h-[calc(100vh-200px)] border border-sidebar-border shadow-sm' : 'w-0 opacity-0 h-0 border-transparent shadow-none'
                    }`}>
                        <div className="w-full md:w-56 flex flex-col h-fit shrink-0">
                            <div className="px-4 py-4 border-b border-sidebar-border flex items-center justify-between">
                            <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                                <LayoutList className="size-4" />
                                Categories
                            </h3>
                            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-300">
                                {categories.length}
                            </Badge>
                            </div>
                            
                            <div className="p-3 overflow-y-auto flex-1 space-y-1 custom-scrollbar max-h-[400px]">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                                selectedCategory === null 
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                }`}
                            >
                                <span>All Categories</span>
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md transition-all duration-300 ${selectedCategory === null ? 'bg-background' : 'bg-sidebar-accent/50 group-hover:bg-background'}`}>
                                {consumptions.length}
                                </span>
                            </button>
                            
                            {categories.map(([cat, count]) => (
                                <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`group w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                                    selectedCategory === cat 
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                }`}
                                >
                                <span className="truncate pr-2">{cat}</span>
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${selectedCategory === cat ? 'bg-background' : 'bg-sidebar-accent/50 group-hover:bg-background'}`}>
                                    {count}
                                </span>
                                </button>
                            ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Main Content: Data Table */}
                <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${showCategorySidebar ? 'md:mr-[240px]' : ''}`}>
                    <XDataTable
                        title="Consumption Summary"
                        entity={Entity.InventoryLedger}
                        data={data}
                        columns={columns}
                        actions={[]}
                    />
                </div>
            </div>
        </XPage>
    );
}
