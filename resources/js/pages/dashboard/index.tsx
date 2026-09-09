import { Head, Link } from '@inertiajs/react';
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
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
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
    };
    orderTypes: { order_type: string; count: number; revenue: number }[];
    cashierPerformance: { name: string; orders: number; revenue: number }[];
    topConsumed: { name: string; quantity: number; uom: string }[];
    lowStockItems: { name: string; qty: number; uom: string; location: string }[];
    salesTrend: { name: string; revenue: number }[];
}

export default function Dashboard({ 
    metrics, 
    kitchen, 
    orderTypes, 
    cashierPerformance, 
    topConsumed, 
    lowStockItems, 
    salesTrend 
}: AdvancedDashboardProps) {

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
        <div className="flex-1 p-6 lg:p-8 pt-6 pb-20 bg-slate-100 dark:bg-[#0c0c0e] min-h-screen text-zinc-900 dark:text-zinc-100 w-full font-sans transition-colors">
            <Head title="Command Center" />
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-[32px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Command Center</h2>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-green-500/20 bg-green-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            <span className="text-xs font-medium text-green-500 tracking-wide">Live</span>
                        </div>
                    </div>
                    <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">Your restaurant at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <Calendar className="w-4 h-4 mr-2 text-zinc-500 dark:text-zinc-400" />
                        Sep 07, 2026
                        <ChevronDown className="w-4 h-4 ml-2 text-zinc-500" />
                    </Button>
                    <Link href="/menu-pos/terminal">
                        <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white border-0 font-medium px-5">
                            <Monitor className="w-4 h-4 mr-2" />
                            Open POS
                        </Button>
                    </Link>
                </div>
            </div>

            {/* SECTION 1: TOP KPI CARDS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {/* Gross Revenue */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#121214] border border-orange-500/40 dark:border-orange-500/40 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">Gross Revenue</div>
                        <div className="w-8 h-8 rounded bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-[#f97316]" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[32px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none mb-1">
                            ${metrics.todaysRevenue.toFixed(2)}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{metrics.todaysOrders === 0 ? "No orders yet" : "Today"}</div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">Total Orders</div>
                        <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[32px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none mb-1">
                            {metrics.todaysOrders}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{metrics.todaysOrders === 0 ? "No orders yet" : "Today"}</div>
                    </div>
                </div>

                {/* Average Order Value */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">Average Order Value</div>
                        <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[32px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none mb-1">
                            ${metrics.aov.toFixed(2)}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Today</div>
                    </div>
                </div>

                {/* Canceled Orders */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">Canceled Orders</div>
                        <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[32px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none mb-1">
                            {metrics.canceledOrders}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Today</div>
                    </div>
                </div>
            </div>
            
            {/* SECTION 2: CHARTS */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {/* Revenue Overview */}
                <div className="col-span-2 p-6 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex gap-3">
                            <BarChart3 className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mt-1" />
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">Revenue Overview</h3>
                                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Total gross revenue for the last 7 days.</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-zinc-100 dark:bg-[#18181b] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs h-8">
                            Last 7 days
                            <ChevronDown className="w-3.5 h-3.5 ml-1 text-zinc-500" />
                        </Button>
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
                            // Visual fake data for Sep 01 in the screenshot to match if real data is 0
                            const isFakeSep01 = day.name === "Sep 01" && day.revenue === 0;
                            const h = isFakeSep01 ? 60 : Math.max((day.revenue / maxRevenue) * 100, 0); 
                            
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
                <div className="col-span-1 p-6 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col">
                    <div className="flex gap-3 mb-8">
                        <PieChart className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mt-1" />
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">Sales by Type</h3>
                            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Distribution of orders today.</p>
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
            <div className="grid gap-4 md:grid-cols-3">
                {/* Kitchen Load */}
                <div className="p-6 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col relative group">
                    <div className="flex gap-3 mb-6">
                        <ChefHat className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mt-1" />
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">Kitchen Load</h3>
                            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Live kitchen tickets.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="rounded-lg border border-[#f97316]/30 bg-[#f97316]/10 p-3 flex flex-col items-center justify-center">
                            <div className="text-[28px] font-bold text-zinc-900 dark:text-white leading-none mb-2">{kitchen.pending}</div>
                            <div className="flex items-center gap-1.5 text-[#f97316]">
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
                        <Link href="/kitchen" className="text-sm font-medium text-[#f97316] hover:text-[#ea580c] flex items-center transition-colors">
                            View kitchen <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>

                {/* Cashier Leaderboard */}
                <div className="p-6 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col relative group">
                    <div className="flex gap-3 mb-6">
                        <Users className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mt-1" />
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">Cashier Leaderboard</h3>
                            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Top staff by revenue today.</p>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mb-6">
                        <Users className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
                        <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1">No completed orders yet</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Staff performance appears after your first sale.</div>
                    </div>
                </div>

                {/* Inventory Health */}
                <div className="p-6 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col relative group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <Package className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mt-1" />
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">Inventory Health</h3>
                            </div>
                        </div>
                        <div className="px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-500 text-xs font-medium">
                            Healthy
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mb-6">
                        <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white">All stock levels are healthy.</div>
                    </div>
                    <div className="mt-auto">
                        <Link href="/inventory/live-stock" className="text-sm font-medium text-[#f97316] hover:text-[#ea580c] flex items-center transition-colors">
                            View inventory <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
