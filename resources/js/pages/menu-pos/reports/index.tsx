import { Head, router } from '@inertiajs/react';
import { XPage } from '@/components/x/page/XPage';
import { Card, CardContent } from '@/components/shadcn/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/ui/table';
import { Input } from '@/components/shadcn/ui/input';
import { DollarSign, Receipt, CreditCard, Banknote, AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ReportsDashboard({ date, metrics, topItems, wastage }: { date: string, metrics: any, topItems: any[], wastage: any[] }) {
    const [selectedDate, setSelectedDate] = useState(date);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
        router.get('/menu-pos/reports', { date: e.target.value }, { preserveState: true });
    };

    return (
        <XPage 
            title="EOD Reports" 
            breadcrumbs={[{ label: 'POS', url: '/menu-pos' }, { label: 'Reports' }]}
        >
            <Head title="EOD Reports | POS" />
            
            <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="font-bold text-xl sm:text-2xl tracking-tight leading-tight truncate">Day Close Report</h1>
                        <p className="text-sm text-muted-foreground mt-1">Detailed performance metrics for the selected date.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input 
                            type="date" 
                            value={selectedDate} 
                            onChange={handleDateChange} 
                            className="w-[180px]"
                        />
                    </div>
                </div>

                {/* Live Orders Template Style Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-6">
                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                        <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                            <div>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
                                <h3 className="text-2xl font-bold leading-none tabular-nums">${parseFloat(metrics.revenue || 0).toFixed(2)}</h3>
                            </div>
                            <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
                                <DollarSign className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                        <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                            <div>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Bills</p>
                                <h3 className="text-2xl font-bold leading-none tabular-nums">{metrics.orders}</h3>
                            </div>
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
                                <Receipt className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                        <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                            <div>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Discounts</p>
                                <h3 className="text-2xl font-bold leading-none text-red-500 tabular-nums">-${parseFloat(metrics.discounts || 0).toFixed(2)}</h3>
                            </div>
                            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl shrink-0">
                                <TrendingDown className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                        <CardContent className="p-3 pl-5 flex flex-col justify-center h-full gap-1">
                            <div className="flex justify-between items-center w-full">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cash</span>
                                <span className="text-sm font-bold tabular-nums">${parseFloat(metrics.cash || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Card</span>
                                <span className="text-sm font-bold tabular-nums">${parseFloat(metrics.card || 0).toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Selling Items (XDataTable Style) */}
                    <div className="w-full min-w-0 max-w-full">
                        <div className="flex flex-row items-center justify-between gap-2 mb-4">
                            <div className="min-w-0 flex-1">
                                <h1 className="font-bold text-xl sm:text-2xl tracking-tight leading-tight truncate">Item Wise Sales</h1>
                            </div>
                        </div>
                        <div className="rounded-md border overflow-hidden max-w-full">
                            {topItems.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="h-10 text-xs font-medium text-muted-foreground">Item</TableHead>
                                            <TableHead className="h-10 text-xs font-medium text-muted-foreground text-right">Qty</TableHead>
                                            <TableHead className="h-10 text-xs font-medium text-muted-foreground text-right">Sales</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topItems.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{item.menu_item?.name || 'Unknown'}</TableCell>
                                                <TableCell className="text-right tabular-nums">{item.total_quantity}</TableCell>
                                                <TableCell className="text-right tabular-nums">${parseFloat(item.total_sales).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-sm">No sales data for this date.</div>
                            )}
                        </div>
                    </div>

                    {/* Wastage Report (XDataTable Style) */}
                    <div className="w-full min-w-0 max-w-full">
                        <div className="flex flex-row items-center justify-between gap-2 mb-4">
                            <div className="min-w-0 flex-1">
                                <h1 className="font-bold text-xl sm:text-2xl tracking-tight leading-tight truncate text-red-600 dark:text-red-400">Wastage Log</h1>
                            </div>
                        </div>
                        <div className="rounded-md border border-red-500/20 overflow-hidden max-w-full">
                            {wastage.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent bg-red-500/5">
                                            <TableHead className="h-10 text-xs font-medium text-muted-foreground w-24">Time</TableHead>
                                            <TableHead className="h-10 text-xs font-medium text-muted-foreground">Item</TableHead>
                                            <TableHead className="h-10 text-xs font-medium text-muted-foreground text-right">Lost</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {wastage.map((log) => (
                                            <TableRow key={log.id} className="border-red-500/10 hover:bg-red-500/5">
                                                <TableCell className="text-muted-foreground tabular-nums">{log.time}</TableCell>
                                                <TableCell className="font-medium">{log.name}</TableCell>
                                                <TableCell className="text-right text-red-500 font-medium tabular-nums">-{log.quantity} {log.unit}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-10 flex flex-col items-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-500/50 mb-3" />
                                    <p className="text-sm font-medium text-foreground">Zero wastage recorded today!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </XPage>
    );
}
