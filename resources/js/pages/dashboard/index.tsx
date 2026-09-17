import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    BarChart3, 
    FileText, 
    Tag, 
    XCircle, 
    Calendar, 
    Monitor, 
    PieChart, 
    ChefHat, 
    Users, 
    Package, 
    Clock, 
    RefreshCw, 
    CheckCircle2, 
    ArrowRight,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/shadcn/ui/dialog';
import { cn } from '@/lib/utils';

interface AdvancedDashboardProps {
    metrics: {
        todaysRevenue: number;
        todaysOrders: number;
        activeOrders: number;
        aov: number;
        canceledOrders: number;
    };
    kitchen: {
        pending: number;
        preparing: number;
        ready: number;
        cancelled?: number;
    };
    orderTypes: { order_type: string; count: number; revenue: number }[];
    cashierPerformance: { name: string; orders: number; revenue: number }[];
    topConsumed: { name: string; quantity: number; uom: string }[];
    lowStockItems: { name: string; qty: number; uom: string; location: string }[];
    salesTrend: { name: string; revenue: number }[];
    canceledOrdersList?: any[];
    currentDateFormatted?: string;
}

export default function Dashboard({ 
    metrics, 
    kitchen, 
    orderTypes, 
    cashierPerformance, 
    topConsumed, 
    lowStockItems, 
    salesTrend,
    canceledOrdersList = [],
    currentDateFormatted
}: AdvancedDashboardProps) {
    const [canceledDialogOpen, setCanceledDialogOpen] = useState(false);

    // Ensure salesTrend has 7 days for the chart to look like the screenshot even if empty
    const paddedSalesTrend = (salesTrend || []).length === 7 ? salesTrend : [
        { name: "Sep 01", revenue: 0 },
        { name: "Sep 02", revenue: 0 },
        { name: "Sep 03", revenue: 0 },
        { name: "Sep 04", revenue: 0 },
        { name: "Sep 05", revenue: 0 },
        { name: "Sep 06", revenue: 0 },
        { name: "Sep 07", revenue: 0 },
    ].map((defaultDay, idx) => salesTrend[idx] || defaultDay);

    const maxRevenue = Math.max(...(paddedSalesTrend || []).map(d => d.revenue || 0), 100);

    // Calculate Sales by Type breakdown dynamically
    const getOrderTypeData = (typeKey: string) => {
        const normalizedTarget = typeKey.toLowerCase().replace(/[^a-z]/g, "");
        const item = (orderTypes || []).find((o: any) => {
            if (!o || !o.order_type) return false;
            const norm = String(o.order_type).toLowerCase().replace(/[^a-z]/g, "");
            return norm === normalizedTarget;
        });
        return {
            count: item ? Number(item.count || 0) : 0,
            revenue: item ? Number(item.revenue || 0) : 0,
        };
    };

    const dineIn = getOrderTypeData("dinein");
    const takeaway = getOrderTypeData("takeaway");
    const delivery = getOrderTypeData("delivery");

    const totalOrderTypeCount = (orderTypes || []).reduce((sum: number, o: any) => sum + Number(o.count || 0), 0);
    const totalOrderTypeRevenue = (orderTypes || []).reduce((sum: number, o: any) => sum + Number(o.revenue || 0), 0);

    const dineInPct = totalOrderTypeCount > 0 ? (dineIn.count / totalOrderTypeCount) * 100 : 0;
    const takeawayPct = totalOrderTypeCount > 0 ? (takeaway.count / totalOrderTypeCount) * 100 : 0;
    const p1 = dineInPct;
    const p2 = dineInPct + takeawayPct;

    return (
        <div className="flex-1 min-h-0 p-3 bg-[#f5f6f8] dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 w-full font-sans transition-colors">
            <Head title="Dashboard" />
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-[#121214] p-3 shadow-sm mb-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white leading-none">Dashboard</h2>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-green-500/20 bg-green-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            <span className="text-xs font-medium text-green-500 tracking-wide">Live</span>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Today’s service, sales, kitchen, and stock overview.</p>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2.5 shrink-0">
                    <div className="h-9 flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] px-3 text-sm text-zinc-600 dark:text-zinc-300">
                        <Calendar className="w-4 h-4 mr-2 text-zinc-500 dark:text-zinc-400" />
                        {currentDateFormatted || "Today"}
                    </div>
                    <Link href="/menu-pos/terminal" className="ml-auto sm:ml-0">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 font-medium px-4 shadow-xs">
                            <Monitor className="w-4 h-4 mr-2" />
                            Open POS
                        </Button>
                    </Link>
                </div>
            </div>

            {/* SECTION 1: TOP KPI CARDS */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-3">
                {/* Gross Revenue */}
                <div className="group min-h-[112px] p-3 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">Gross Revenue</div>
                        <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[34px] font-bold tracking-tight text-zinc-950 dark:text-white leading-none mb-1">
                            ${metrics.todaysRevenue.toFixed(2)}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{metrics.todaysOrders === 0 ? "No orders yet" : "Today"}</div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="min-h-[112px] p-3 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">Total Orders</div>
                        <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[34px] font-bold tracking-tight text-zinc-950 dark:text-white leading-none mb-1">
                            {metrics.todaysOrders}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{metrics.todaysOrders === 0 ? "No orders yet" : "Today"}</div>
                    </div>
                </div>

                {/* Average Order Value */}
                <div className="min-h-[112px] p-3 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">Average Order Value</div>
                        <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[34px] font-bold tracking-tight text-zinc-950 dark:text-white leading-none mb-1">
                            ${metrics.aov.toFixed(2)}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Today</div>
                    </div>
                </div>

                {/* Canceled Orders */}
                <button
                    type="button"
                    onClick={() => setCanceledDialogOpen(true)}
                    className="min-h-[112px] w-full p-3 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between text-left cursor-pointer hover:border-red-500/40 hover:shadow-md transition-all group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-red-500 transition-colors">Canceled Orders</div>
                        <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-colors">
                            <XCircle className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-red-500 transition-colors" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[34px] font-bold tracking-tight text-zinc-950 dark:text-white leading-none mb-1 flex items-baseline justify-between">
                            <span>{metrics.canceledOrders}</span>
                            {metrics.canceledOrders > 0 && (
                                <span className="text-[11px] font-semibold text-red-500 group-hover:underline">View details →</span>
                            )}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Today</div>
                    </div>
                </button>
            </div>
            
            {/* SECTION 2: CHARTS */}
            <div className="grid gap-3 lg:grid-cols-3 mb-3">
                {/* Revenue Overview */}
                <div className="lg:col-span-2 p-3 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <BarChart3 className="w-5 h-5 text-primary mt-1" />
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">Revenue Overview</h3>
                                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Total gross revenue for the last 7 days.</p>
                            </div>
                        </div>
                        <div className="h-8 flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181b] px-3 text-xs text-zinc-600 dark:text-zinc-400">
                            Last 7 days
                        </div>
                    </div>
                    
                    <div className="h-[200px] w-full mt-auto flex items-end justify-between px-4 gap-4 relative">
                        {/* Background Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                            <div className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800/60 flex-1"></div>
                            <div className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800/60 flex-1"></div>
                            <div className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800/60 flex-1"></div>
                            <div className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800/60 flex-1"></div>
                            <div className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-800/60"></div>
                        </div>

                        {/* Bars */}
                        {paddedSalesTrend.map((day, idx) => {
                            const h = Math.max((day.revenue / maxRevenue) * 100, 0);
                            
                            return (
                                <div key={idx} className="flex flex-col items-center justify-end w-full group relative h-full z-10">
                                    {day.revenue > 0 && (
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-zinc-800 text-white font-bold text-xs py-1 px-2 rounded transition-all shadow-lg pointer-events-none">
                                            ${day.revenue.toFixed(2)}
                                        </div>
                                    )}
                                    <div className="w-full max-w-[36px] flex justify-center h-[calc(100%-24px)] items-end">
                                        <div 
                                            className={cn("w-full transition-all rounded-t-sm", h > 0 ? "bg-[#10b981]" : "bg-transparent")}
                                            style={{ height: `${h}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-2 h-4">{day.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sales by Type */}
                <div className="p-3 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col">
                    <div className="flex gap-3 mb-6">
                        <PieChart className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mt-1" />
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">Sales by Type</h3>
                            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Completed orders today.</p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-4 px-1">
                        {/* Donut Chart Visual */}
                        <div 
                            className="w-40 h-40 rounded-full flex items-center justify-center relative shrink-0 p-4 border border-zinc-200 dark:border-zinc-800 transition-all"
                            style={{
                                background: totalOrderTypeCount > 0 
                                    ? `conic-gradient(#f97316 0% ${p1}%, #3b82f6 ${p1}% ${p2}%, #10b981 ${p2}% 100%)`
                                    : undefined
                            }}
                        >
                            {/* Inner Cutout Hole */}
                            <div className="w-28 h-28 rounded-full bg-white dark:bg-[#121214] flex items-center justify-center relative shadow-inner">
                                <div className="text-center absolute px-2">
                                    {totalOrderTypeCount === 0 ? (
                                        <>
                                            <div className="text-xs font-bold text-zinc-900 dark:text-white mb-1">No sales yet</div>
                                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 max-w-[90px] leading-tight">Orders will appear here.</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-base font-extrabold text-zinc-900 dark:text-white leading-none mb-1">
                                                ${totalOrderTypeRevenue.toFixed(2)}
                                            </div>
                                            <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                                                {totalOrderTypeCount} order{totalOrderTypeCount === 1 ? '' : 's'}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col gap-4 flex-1 max-w-[125px] pr-2">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></div>
                                    <span className="text-[13px] text-zinc-600 dark:text-zinc-300">Dine-in</span>
                                </div>
                                <span className="text-[13px] font-bold text-zinc-900 dark:text-white">{dineIn.count}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div>
                                    <span className="text-[13px] text-zinc-600 dark:text-zinc-300">Takeaway</span>
                                </div>
                                <span className="text-[13px] font-bold text-zinc-900 dark:text-white">{takeaway.count}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                                    <span className="text-[13px] text-zinc-600 dark:text-zinc-300">Delivery</span>
                                </div>
                                <span className="text-[13px] font-bold text-zinc-900 dark:text-white">{delivery.count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3: BOTTOM CARDS */}
            <div className="grid gap-3 lg:grid-cols-3">
                {/* Kitchen Load */}
                <div className="p-3 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col relative group">
                    <div className="flex gap-3 mb-6">
                        <ChefHat className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mt-1" />
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">Kitchen Load</h3>
                            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Live kitchen tickets.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 flex flex-col items-center justify-center">
                            <div className="text-[28px] font-bold text-zinc-900 dark:text-white leading-none mb-2">{kitchen.pending}</div>
                            <div className="flex items-center gap-1.5 text-primary">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Pending</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/10 p-3 flex flex-col items-center justify-center">
                            <div className="text-[28px] font-bold text-zinc-900 dark:text-white leading-none mb-2">{kitchen.preparing}</div>
                            <div className="flex items-center gap-1.5 text-[#3b82f6]">
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Preparing</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-[#10b981]/30 bg-[#10b981]/10 p-3 flex flex-col items-center justify-center">
                            <div className="text-[28px] font-bold text-zinc-900 dark:text-white leading-none mb-2">{kitchen.ready}</div>
                            <div className="flex items-center gap-1.5 text-[#10b981]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Ready</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <Link href="/menu-pos/kds" className="text-sm font-medium text-primary hover:opacity-80 flex items-center transition-opacity">
                            View kitchen <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>

                {/* Cashier Leaderboard */}
                <div className="p-3 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col relative group">
                    <div className="flex gap-3 mb-6">
                        <Users className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mt-1" />
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">Cashier Leaderboard</h3>
                            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Top staff by revenue today.</p>
                        </div>
                    </div>
                    {cashierPerformance.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mb-4">
                            <Users className="w-9 h-9 text-zinc-400 dark:text-zinc-600 mb-3" />
                            <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1">No completed orders yet</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Staff performance appears after your first sale.</div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {cashierPerformance.map((cashier, index) => (
                                <div key={`${cashier.name}-${index}`} className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2.5">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">{cashier.name}</p>
                                        <p className="text-xs text-zinc-500">{cashier.orders} order{cashier.orders === 1 ? '' : 's'}</p>
                                    </div>
                                    <p className="text-sm font-bold">${cashier.revenue.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Inventory Health */}
                <div className="p-3 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col relative group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <Package className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mt-1" />
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">Inventory Health</h3>
                            </div>
                        </div>
                        <div className={cn("px-3 py-1 rounded-full border text-xs font-medium", lowStockItems.length > 0 ? "border-amber-500/30 text-amber-500" : "border-emerald-500/30 text-emerald-500")}>
                            {lowStockItems.length > 0 ? `${lowStockItems.length} low` : 'Healthy'}
                        </div>
                    </div>
                    {lowStockItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mb-4">
                            <div className="w-11 h-11 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">All stock levels are healthy.</div>
                        </div>
                    ) : (
                        <div className="space-y-2 mb-4">
                            {lowStockItems.slice(0, 4).map((item) => (
                                <div key={item.name} className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                                    <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
                                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{item.qty} {item.uom}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-auto">
                        <Link href="/inventory/live-stock" className="text-sm font-medium text-primary hover:opacity-80 flex items-center transition-opacity">
                            View inventory <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Canceled Orders Detail Dialog */}
            <Dialog open={canceledDialogOpen} onOpenChange={setCanceledDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="w-5 h-5" />
                            Canceled Orders Today ({canceledOrdersList.length})
                        </DialogTitle>
                        <DialogDescription>
                            Review all orders and tickets cancelled during today's service.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
                        {canceledOrdersList.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No canceled orders recorded today.
                            </div>
                        ) : (
                            canceledOrdersList.map((order: any) => (
                                <div key={order.id} className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/5 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-foreground">#{order.order_number}</span>
                                                {order.table_name && (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                        {order.table_name}
                                                    </span>
                                                )}
                                                <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-600/10 text-red-600 border border-red-600/20">
                                                    CANCELLED
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Staff: <span className="font-medium text-foreground">{order.waiter_name}</span> • Time: <span className="font-medium text-foreground">{order.cancelled_at}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {order.rejection_reason && (
                                        <div className="text-xs bg-background/80 p-2 rounded border border-border/50 text-red-600 dark:text-red-400 font-medium">
                                            Reason: {order.rejection_reason}
                                        </div>
                                    )}

                                    {order.items && order.items.length > 0 && (
                                        <div className="text-xs space-y-1 pt-1 border-t border-border/40">
                                            <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Items in Ticket:</p>
                                            {order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-muted-foreground pl-1">
                                                    <span className={cn(item.is_voided && "line-through text-red-500/80")}>
                                                        {item.quantity}× {item.name}
                                                    </span>
                                                    {item.void_reason && (
                                                        <span className="text-[10px] text-red-500 italic">({item.void_reason})</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
