import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Users, Activity, PackageOpen } from 'lucide-react';
import { Badge } from '@/components/shadcn/ui/badge';
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
    
    const maxRevenue = Math.max(...salesTrend.map(d => d.revenue), 1);
    const maxCashierRevenue = Math.max(...cashierPerformance.map(c => c.revenue), 1);
    const maxOrderTypeRev = Math.max(...orderTypes.map(o => o.revenue), 1);
    const maxTopConsumed = Math.max(...topConsumed.map(c => c.quantity), 1);

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 pt-6 pb-20 bg-background w-full">
            <Head title="Command Center" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight mb-1 text-foreground">Command Center</h2>
                    <p className="text-sm font-medium text-muted-foreground">Real-time overview of your business.</p>
                </div>
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-2 rounded-full shadow-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-bold text-primary">Live Data</span>
                </div>
            </div>

            {/* SECTION 1: FINANCIALS */}
            <div className="space-y-4">
                
                {/* Refined Typography Data Strip */}
                <div className="flex flex-col md:flex-row md:items-end gap-10 pb-6 border-b border-border/40 mb-6">
                    <div>
                        <div className="text-sm font-semibold text-muted-foreground tracking-tight mb-2">Today's Gross Revenue</div>
                        <div className="text-6xl font-black tracking-tighter tabular-nums leading-none">${metrics.todaysRevenue.toFixed(2)}</div>
                    </div>
                    <div className="flex gap-8 md:ml-auto">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Orders</div>
                            <div className="text-2xl font-bold tracking-tight tabular-nums leading-none">{metrics.todaysOrders}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Avg Value</div>
                            <div className="text-2xl font-bold tracking-tight tabular-nums leading-none">${metrics.aov.toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Canceled</div>
                            <div className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 tabular-nums leading-none">{metrics.canceledOrders}</div>
                        </div>
                    </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Sales Trend Chart */}
                    <div className="col-span-4 space-y-4 p-6 rounded-3xl bg-card border border-border/50 shadow-sm">
    <h3 className="text-lg font-bold tracking-tight">7-Day Revenue Trend</h3>
    
                            <div className="h-[220px] w-full mt-2 flex items-end justify-between px-2">
                                {[...salesTrend].reverse().map((day, idx) => {
                                    const heightPercentage = Math.max((day.revenue / maxRevenue) * 100, 2); // min 2%
                                    return (
                                        <div key={idx} className="flex flex-col items-center justify-end w-full group relative h-full">
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-foreground text-background font-bold text-xs py-1.5 px-2.5 rounded-md transition-all z-10 shadow-lg pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                                ${day.revenue.toFixed(2)}
                                            </div>
                                            {/* Bar */}
                                            <div className="w-full px-1 sm:px-2 flex justify-center h-full items-end">
                                                <div 
                                                    className="w-full max-w-[40px] bg-emerald-500/80 group-hover:bg-emerald-400 transition-all rounded-t-md relative overflow-hidden" 
                                                    style={{ height: `${heightPercentage}%` }}
                                                >
                                                    <div className="absolute top-0 left-0 w-full h-2 bg-white/20"></div>
                                                </div>
                                            </div>
                                            {/* Label */}
                                            <span className="text-[11px] font-semibold text-muted-foreground mt-3">
                                                {day.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        
</div>

                    {/* Order Types */}
                    <div className="col-span-3 space-y-4 p-6 rounded-3xl bg-card border border-border/50 shadow-sm">
    <h3 className="text-lg font-bold tracking-tight">Sales by Type</h3>
    
                            <div className="space-y-4 pt-2">
                                {orderTypes.length === 0 ? (
                                    <div className="text-center text-muted-foreground text-sm py-4">No sales data today.</div>
                                ) : (
                                    orderTypes.map((type, index) => {
                                        const pct = (type.revenue / maxOrderTypeRev) * 100;
                                        return (
                                            <div key={index} className="flex flex-col gap-1.5">
                                                <div className="flex items-end justify-between">
                                                    <span className="font-bold text-sm capitalize">{type.order_type} <span className="text-muted-foreground text-xs font-medium ml-1">({type.count})</span></span>
                                                    <span className="font-bold text-sm">${parseFloat(type.revenue.toString()).toFixed(2)}</span>
                                                </div>
                                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary/80 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        
</div>
                </div>
            </div>

            {/* SECTION 2: OPERATIONS & INVENTORY */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2">
                
                {/* Kitchen Load */}
                <div className="space-y-4 p-6 rounded-3xl bg-card border border-border/50 shadow-sm flex flex-col h-full">
    <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-bold tracking-tight">Kitchen Load</h3>
            <p className="text-sm text-muted-foreground">Live KDS tickets</p>
        </div>
        
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                            <Link href="/menu-pos/kds?layout=dashboard"><ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                    
    </div>
    
                        <div className="flex w-full gap-2">
                            <div className="flex-1 flex flex-col items-center justify-center p-5 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200/50 dark:border-amber-500/20">
                                <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-500 mb-1">{kitchen.pending}</span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700/70 dark:text-amber-500/80">Pending</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200/50 dark:border-blue-500/20">
                                <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-500 mb-1">{kitchen.preparing}</span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700/70 dark:text-blue-500/80">Prep</span>
                            </div>
                        </div>
                    
</div>

                {/* Staff Leaderboard */}
                <div className="space-y-4 p-6 rounded-3xl bg-card border border-border/50 shadow-sm">
    <div>
        <h3 className="text-lg font-bold tracking-tight">Cashier Leaderboard</h3>
        <p className="text-sm text-muted-foreground">Top staff by revenue today</p>
    </div>
    
                        <div className="space-y-4 pt-2">
                            {cashierPerformance.length === 0 ? (
                                <div className="text-center text-muted-foreground text-sm py-4">No data available.</div>
                            ) : (
                                cashierPerformance.slice(0, 4).map((cashier, index) => {
                                    const pct = (cashier.revenue / maxCashierRevenue) * 100;
                                    return (
                                        <div key={index} className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <span className="font-semibold text-sm">{cashier.name}</span>
                                                </div>
                                                <span className="font-bold text-sm">${cashier.revenue.toFixed(2)}</span>
                                            </div>
                                            <div className="flex pl-7">
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary/70 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    
</div>

                {/* Critical Inventory */}
                <div className="space-y-4 p-6 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
    <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-bold tracking-tight text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Low Stock Alerts
            </h3>
        </div>
        
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-100" asChild>
                            <Link href="/inventory/live-stock"><ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                    
    </div>
    
                        <div className="space-y-3 pt-2">
                            {lowStockItems.length === 0 ? (
                                <div className="text-center text-muted-foreground text-sm py-8 font-medium">
                                    All stock levels are healthy!
                                </div>
                            ) : (
                                lowStockItems.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-background p-2 rounded-lg border border-red-500/20 shadow-sm">
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <span className="font-bold text-sm truncate">{item.name}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{item.location}</span>
                                        </div>
                                        <div className="shrink-0 font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-md text-sm border border-red-100 dark:border-red-500/20">
                                            {item.qty} {item.uom}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    
</div>

            </div>
        </div>
    );
}
