import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { DollarSign, ShoppingBag, ChefHat, AlertTriangle, ArrowRight, TrendingUp, XCircle, Users, Activity, PackageOpen } from 'lucide-react';
import { Badge } from '@/components/shadcn/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';

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

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <Head title="Command Center" />
            
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Command Center</h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5">
                        Live Data for Today
                    </Badge>
                </div>
            </div>

            {/* SECTION 1: FINANCIALS */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">Financial Overview</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">${metrics.todaysRevenue.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{metrics.todaysOrders}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">${metrics.aov.toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Canceled Orders</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{metrics.canceledOrders}</div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Sales Trend Chart */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>7-Day Revenue Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[250px] w-full mt-4 flex items-end justify-between px-4 pb-4 border-b">
                                {[...salesTrend].reverse().map((day, idx) => {
                                    const heightPercentage = (day.revenue / maxRevenue) * 100;
                                    return (
                                        <div key={idx} className="flex flex-col items-center justify-end w-full group relative">
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
                                                ${day.revenue.toFixed(2)}
                                            </div>
                                            <div 
                                                className="w-4/5 md:w-3/5 bg-emerald-500/80 hover:bg-emerald-500 transition-all rounded-t-sm" 
                                                style={{ height: `${heightPercentage}%`, minHeight: '2px' }}
                                            ></div>
                                            <span className="text-[10px] text-muted-foreground mt-2 rotate-[-45deg] md:rotate-0 origin-top-left transform translate-y-2 md:translate-y-0">
                                                {day.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Types */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Sales by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orderTypes.length === 0 ? (
                                    <div className="text-center text-muted-foreground text-sm py-4">No sales data today.</div>
                                ) : (
                                    orderTypes.map((type, index) => (
                                        <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none capitalize">{type.order_type}</p>
                                                <p className="text-xs text-muted-foreground">{type.count} orders</p>
                                            </div>
                                            <div className="font-bold text-sm">
                                                ${parseFloat(type.revenue.toString()).toFixed(2)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* SECTION 2: OPERATIONS */}
            <div className="space-y-4 pt-4">
                <h3 className="text-xl font-semibold border-b pb-2">Operations & Team</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    
                    {/* Kitchen Load */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Kitchen KDS Load</CardTitle>
                                <CardDescription>Real-time order statuses</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/menu-pos/kds?layout=dashboard">View KDS</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border">
                                <div className="text-center flex-1">
                                    <div className="text-3xl font-bold text-yellow-600">{kitchen.pending}</div>
                                    <div className="text-xs text-muted-foreground mt-1 uppercase font-semibold">Pending</div>
                                </div>
                                <div className="h-12 w-px bg-border"></div>
                                <div className="text-center flex-1">
                                    <div className="text-3xl font-bold text-blue-600">{kitchen.preparing}</div>
                                    <div className="text-xs text-muted-foreground mt-1 uppercase font-semibold">Preparing</div>
                                </div>
                                <div className="h-12 w-px bg-border"></div>
                                <div className="text-center flex-1">
                                    <div className="text-3xl font-bold text-emerald-600">{kitchen.ready}</div>
                                    <div className="text-xs text-muted-foreground mt-1 uppercase font-semibold">Ready</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Staff Leaderboard */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Cashier Performance</CardTitle>
                                <CardDescription>Top staff by revenue today</CardDescription>
                            </div>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cashierPerformance.length === 0 ? (
                                    <div className="text-center text-muted-foreground text-sm py-4">No data available.</div>
                                ) : (
                                    cashierPerformance.map((cashier, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{cashier.name}</p>
                                                    <p className="text-xs text-muted-foreground">{cashier.orders} orders</p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold">
                                                ${cashier.revenue.toFixed(2)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* SECTION 3: INVENTORY */}
            <div className="space-y-4 pt-4">
                <h3 className="text-xl font-semibold border-b pb-2">Inventory Health</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    
                    {/* Low Stock Alerts */}
                    <Card className="border-red-500/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-red-600 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" /> Critical Low Stock
                                </CardTitle>
                                <CardDescription>Items running dangerously low</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/inventory/live-stock">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ingredient</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead className="text-right">Available</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStockItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                                                All stock levels are healthy!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        lowStockItems.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{item.location}</TableCell>
                                                <TableCell className="text-right text-red-600 font-bold">
                                                    {item.qty} {item.uom}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Top Consumed */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-500" /> Top Consumed Today
                                </CardTitle>
                                <CardDescription>Highest volume ingredients used</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ingredient</TableHead>
                                        <TableHead className="text-right">Total Used</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topConsumed.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                                                No consumption data for today.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        topConsumed.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-right font-bold text-blue-600">
                                                    {parseFloat(item.quantity.toString()).toFixed(2)} {item.uom}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </div>

        </div>
    );
}
