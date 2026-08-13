import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { DollarSign, ShoppingBag, ChefHat, AlertTriangle, ArrowRight, TrendingUp, XCircle, Users, Activity, PackageOpen } from 'lucide-react';
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
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Gross Revenue */}
                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                        <CardContent className="p-4 pl-6 flex items-center justify-between h-full">
                            <div>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Gross Revenue</p>
                                <h3 className="text-3xl font-black leading-none">${metrics.todaysRevenue.toFixed(2)}</h3>
                            </div>
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                                <DollarSign className="size-6" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Total Orders */}
                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                        <CardContent className="p-4 pl-6 flex items-center justify-between h-full">
                            <div>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Orders</p>
                                <h3 className="text-3xl font-black leading-none">{metrics.todaysOrders}</h3>
                            </div>
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
                                <ShoppingBag className="size-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* AOV */}
                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                        <CardContent className="p-4 pl-6 flex items-center justify-between h-full">
                            <div>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Avg Order Value</p>
                                <h3 className="text-3xl font-black leading-none">${metrics.aov.toFixed(2)}</h3>
                            </div>
                            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl shrink-0">
                                <TrendingUp className="size-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Canceled */}
                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                        <CardContent className="p-4 pl-6 flex items-center justify-between h-full">
                            <div>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Canceled</p>
                                <h3 className="text-3xl font-black leading-none">{metrics.canceledOrders}</h3>
                            </div>
                            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl shrink-0">
                                <XCircle className="size-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Sales Trend Chart */}
                    <Card className="col-span-4 rounded-xl border-sidebar-border/70 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold">7-Day Revenue Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>

                    {/* Order Types */}
                    <Card className="col-span-3 rounded-xl border-sidebar-border/70 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold">Sales by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* SECTION 2: OPERATIONS & INVENTORY */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2">
                
                {/* Kitchen Load */}
                <Card className="rounded-xl border-sidebar-border/70 shadow-sm flex flex-col">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold">Kitchen Load</CardTitle>
                            <CardDescription className="text-xs">Live KDS tickets</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                            <Link href="/menu-pos/kds?layout=dashboard"><ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center pt-4">
                        <div className="flex w-full gap-2">
                            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <span className="text-4xl font-black text-amber-600 mb-1">{kitchen.pending}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80">Pending</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <span className="text-4xl font-black text-blue-600 mb-1">{kitchen.preparing}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700/80">Prep</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Staff Leaderboard */}
                <Card className="rounded-xl border-sidebar-border/70 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold">Cashier Leaderboard</CardTitle>
                        <CardDescription className="text-xs">Top staff by revenue today</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                {/* Critical Inventory */}
                <Card className="rounded-xl border-red-500/30 shadow-sm bg-red-500/5">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold text-red-600 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
                            </CardTitle>
                        </div>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-100" asChild>
                            <Link href="/inventory/live-stock"><ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
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
                                        <div className="shrink-0 font-black text-red-600 bg-red-100 dark:bg-red-950 px-2 py-1 rounded-md text-sm">
                                            {item.qty} {item.uom}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
