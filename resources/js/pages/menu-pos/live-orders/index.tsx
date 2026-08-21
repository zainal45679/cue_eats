import { Head, router } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';
import { Eye, Clock, ClipboardList, ChefHat, CheckCircle, Hourglass, DollarSign, Utensils, ShoppingBag, Bike, AlertTriangle, RotateCw, LayoutList, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shadcn/ui/dialog';
import { ScrollArea } from '@/components/shadcn/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/ui/tabs';
import { XPage } from '@/components/x/page/XPage';
import { XDataTable } from '@/components/x/table/XDataTable';
import type { XDataTableColumn } from '@/components/x/table/XDataTableType';
import { Entity } from '@/lib/permissions';

export default function LiveOrdersScreen({
    orders,
    stats,
    activeStatus = 'all'
}: {
    orders: any;
    stats?: {
        total_active: number;
        pending: number;
        preparing: number;
        ready: number;
        total_value: number;
    };
    activeStatus?: string;
}) {
    const [viewOrder, setViewOrder] = useState<any | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('live_orders_view_mode') as 'list' | 'grid') || 'list';
        }
        return 'list';
    });

    const handleViewModeChange = (mode: 'list' | 'grid') => {
        setViewMode(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('live_orders_view_mode', mode);
        }
    };

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['orders', 'stats'],
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => setLastUpdated(new Date()),
            });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleManualRefresh = () => {
        router.reload({
            only: ['orders', 'stats'],
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setLastUpdated(new Date()),
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
            case 'preparing': return 'bg-blue-500 hover:bg-blue-600 text-white';
            case 'ready': return 'bg-green-500 hover:bg-green-600 text-white';
            case 'rejected': return 'bg-red-500 hover:bg-red-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getElapsedTimeInfo = (createdAt: string) => {
        const start = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const diffInMinutes = Math.max(0, Math.floor((now - start) / 60000));

        if (diffInMinutes < 10) {
            return {
                minutes: diffInMinutes,
                text: `${diffInMinutes}m`,
                badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-medium',
                isOverdue: false,
            };
        } else if (diffInMinutes <= 20) {
            return {
                minutes: diffInMinutes,
                text: `${diffInMinutes}m`,
                badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold',
                isOverdue: false,
            };
        } else {
            return {
                minutes: diffInMinutes,
                text: `${diffInMinutes}m`,
                badgeClass: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40 font-bold animate-pulse',
                isOverdue: true,
            };
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        const s = (status || '').toLowerCase();
        if (['completed', 'paid'].includes(s)) {
            return (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] uppercase tracking-wider">
                    PAID
                </Badge>
            );
        }
        if (s === 'billed') {
            return (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] uppercase tracking-wider">
                    BILLED
                </Badge>
            );
        }
        return (
            <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] uppercase tracking-wider">
                UNPAID
            </Badge>
        );
    };

    const renderOrderTypeCell = (row: any) => {
        const type = row.order_type;
        const tableName = row.dining_table?.name || row.diningTable?.name;
        const pax = row.pax;

        if (type === 'Takeaway') {
            return (
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 font-medium px-2 py-0.5 text-xs">
                        <ShoppingBag className="w-3 h-3 mr-1 shrink-0" />
                        Takeaway
                    </Badge>
                </div>
            );
        }

        if (type === 'Delivery') {
            return (
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60 font-medium px-2 py-0.5 text-xs">
                        <Bike className="w-3 h-3 mr-1 shrink-0" />
                        Delivery
                    </Badge>
                </div>
            );
        }

        // Default Dine-in
        return (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60 font-medium px-2 py-0.5 text-xs">
                        <Utensils className="w-3 h-3 mr-1 shrink-0" />
                        Dine-in
                    </Badge>
                </div>
                {(tableName || pax) && (
                    <span className="text-[11px] text-muted-foreground font-medium pl-0.5">
                        {tableName ? `Table: ${tableName}` : ''}
                        {tableName && pax ? ' • ' : ''}
                        {pax ? `${pax} Guests` : ''}
                    </span>
                )}
            </div>
        );
    };

    // Determine dataset rows from TableHelper payload or raw array
    const rawRows = useMemo(() => {
        if (Array.isArray(orders)) return orders;
        return orders?.rows || [];
    }, [orders]);

    // Active orders filter helper (active kitchen orders or open unpaid orders)
    const activeRows = useMemo(() => {
        return rawRows.filter((o: any) => {
            if (o.status === 'cancelled' || o.kitchen_status === 'rejected') return false;
            if (['pending', 'preparing'].includes(o.kitchen_status)) return true;
            return !['Completed', 'completed', 'paid'].includes(o.status) && o.kitchen_status === 'ready';
        });
    }, [rawRows]);

    // Dataset-wide KPI calculations (prefer backend stats if provided, otherwise compute from dataset)
    const totalActiveCount = stats?.total_active ?? activeRows.length;
    const pendingCount = stats?.pending ?? activeRows.filter((o: any) => o.kitchen_status === 'pending').length;
    const preparingCount = stats?.preparing ?? activeRows.filter((o: any) => o.kitchen_status === 'preparing').length;
    const readyCount = stats?.ready ?? activeRows.filter((o: any) => o.kitchen_status === 'ready').length;
    const totalValue = stats?.total_value ?? activeRows.reduce((sum: number, o: any) => sum + parseFloat(o.grand_total || '0'), 0);

    // Active status tab state synchronized with URL query parameter
    const currentTab = activeStatus || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('status') || 'all' : 'all');

    const handleTabChange = (value: string) => {
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        if (value && value !== 'all') {
            queryParams.status = value;
        } else {
            delete queryParams.status;
        }
        queryParams.page = '1';
        router.get(window.location.pathname, queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (newPage: number) => {
        const queryParams = { ...Object.fromEntries(new URLSearchParams(window.location.search)) };
        queryParams.page = String(newPage);
        router.get(window.location.pathname, queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns: XDataTableColumn<any>[] = [
        {
            id: 'order_number',
            header: 'Order #',
            accessorKey: 'order_number',
            cell: ({ row }: any) => <span className="font-medium">{row.original.order_number}</span>
        },
        {
            id: 'order_type',
            header: 'Type',
            accessorKey: 'order_type',
            cell: ({ row }: any) => renderOrderTypeCell(row.original)
        },
        {
            id: 'customer',
            header: 'Customer',
            accessorFn: (row: any) => row.customer_name || 'N/A'
        },
        {
            id: 'items_summary',
            header: 'Items Summary',
            cell: ({ row }: any) => {
                const items = row.original.items || [];
                if (items.length === 0) return <span className="text-muted-foreground text-xs italic">No items</span>;

                const firstTwo = items.slice(0, 2);
                const remainingCount = items.length - 2;

                return (
                    <div className="flex flex-col gap-0.5 max-w-[220px]">
                        <span className="text-xs font-medium text-foreground truncate">
                            {firstTwo.map((item: any, idx: number) => {
                                const name = item.menu_item?.name || item.menuItem?.name || 'Item';
                                return `${item.quantity}x ${name}${idx < firstTwo.length - 1 ? ', ' : ''}`;
                            }).join('')}
                        </span>
                        {remainingCount > 0 && (
                            <span className="text-[11px] text-muted-foreground font-semibold">
                                +{remainingCount} more item{remainingCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            id: 'elapsed',
            header: 'Time Elapsed',
            cell: ({ row }: any) => {
                const timeInfo = getElapsedTimeInfo(row.original.created_at);
                return (
                    <div className="flex items-center gap-1">
                        <Badge variant="outline" className={`${timeInfo.badgeClass} px-2 py-0.5 text-xs inline-flex items-center gap-1`}>
                            {timeInfo.isOverdue ? (
                                <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
                            ) : (
                                <Clock className="w-3 h-3 shrink-0" />
                            )}
                            {timeInfo.text}
                        </Badge>
                    </div>
                );
            }
        },
        {
            id: 'kitchen_status',
            header: 'Kitchen Status',
            accessorKey: 'kitchen_status',
            cell: ({ row }: any) => (
                <Badge className={`${getStatusColor(row.original.kitchen_status)} uppercase tracking-wider text-[10px]`}>
                    {row.original.kitchen_status}
                </Badge>
            )
        },
        {
            id: 'payment_status',
            header: 'Payment',
            cell: ({ row }: any) => getPaymentStatusBadge(row.original.status)
        },
        {
            id: 'total',
            header: 'Total',
            accessorKey: 'grand_total',
            cell: ({ row }: any) => `$${parseFloat(row.original.grand_total || '0').toFixed(2)}`
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="h-6 py-0 px-2 text-xs" onClick={() => setViewOrder(row.original)}>
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View
                    </Button>
                </div>
            )
        }
    ];

    const processedData = useMemo(() => {
        if (Array.isArray(orders)) {
            return {
                rows: rawRows,
                meta: {
                    currentPage: 1,
                    lastPage: 1,
                    total: rawRows.length,
                    perPage: Math.max(rawRows.length, 10)
                },
                filters: [],
                sortBy: null,
                sortDesc: false,
                search: null
            };
        }
        return orders;
    }, [orders, rawRows]);

    const meta = processedData?.meta || { currentPage: 1, lastPage: 1, total: rawRows.length, perPage: 10 };

    return (
        <XPage 
          title="Live Orders" 
          breadcrumbs={[{ label: 'Live Orders', href: '/menu-pos/live-orders' }]}
        >
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-6">
                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Active</p>
                            <h3 className="text-2xl font-bold leading-none">{totalActiveCount}</h3>
                        </div>
                        <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
                            <ClipboardList className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pending</p>
                            <h3 className="text-2xl font-bold leading-none">{pendingCount}</h3>
                        </div>
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                            <Hourglass className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Preparing</p>
                            <h3 className="text-2xl font-bold leading-none">{preparingCount}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
                            <ChefHat className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Ready</p>
                            <h3 className="text-2xl font-bold leading-none">{readyCount}</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                            <CheckCircle className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                    <CardContent className="p-3 pl-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Value</p>
                            <h3 className="text-2xl font-bold leading-none">${totalValue.toFixed(2)}</h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl shrink-0">
                            <DollarSign className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Filter Tabs & Layout Switcher */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
                    <TabsList className="grid w-full sm:w-[600px] grid-cols-4 h-11 bg-muted/50 p-1">
                        <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Orders</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Pending</TabsTrigger>
                        <TabsTrigger value="preparing" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Preparing</TabsTrigger>
                        <TabsTrigger value="ready" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Ready</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <RotateCw className="w-3.5 h-3.5 text-muted-foreground/70" />
                        <span>Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>

                    {/* Dual View Mode Layout Switcher */}
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/40">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 px-2.5 text-xs font-medium"
                            onClick={() => handleViewModeChange('list')}
                            title="Table List View"
                        >
                            <LayoutList className="w-3.5 h-3.5 mr-1" />
                            List
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 px-2.5 text-xs font-medium"
                            onClick={() => handleViewModeChange('grid')}
                            title="Kanban Card Grid View"
                        >
                            <LayoutGrid className="w-3.5 h-3.5 mr-1" />
                            Grid
                        </Button>
                    </div>
                </div>
            </div>

            {/* Render View Mode: List View (XDataTable) vs Grid View (Kanban Cards) */}
            {viewMode === 'list' ? (
                <XDataTable
                    columns={columns}
                    data={processedData}
                    entity={Entity.Orders}
                    title="Live Orders"
                    titleButtons={[
                        {
                            type: 'custom',
                            label: 'Refresh',
                            variant: 'outline',
                            onClick: handleManualRefresh
                        }
                    ]}
                />
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-primary" />
                            Live Orders Grid
                            <Badge variant="outline" className="ml-2 font-normal text-xs">{meta.total} active</Badge>
                        </h3>
                        <Button variant="outline" size="sm" onClick={handleManualRefresh}>
                            <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                            Refresh
                        </Button>
                    </div>

                    {rawRows.length === 0 ? (
                        <Card className="p-8 text-center rounded-xl border border-dashed">
                            <p className="text-muted-foreground text-sm">No active orders matching the selected filter.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {rawRows.map((order: any) => {
                                const timeInfo = getElapsedTimeInfo(order.created_at);
                                const borderAccent =
                                    order.kitchen_status === 'pending' ? 'border-t-amber-500' :
                                    order.kitchen_status === 'preparing' ? 'border-t-blue-500' :
                                    'border-t-emerald-500';

                                return (
                                    <Card key={order.id} className={`border-t-4 ${borderAccent} shadow-sm hover:shadow-md transition-all flex flex-col justify-between rounded-xl overflow-hidden`}>
                                        <CardHeader className="p-3.5 pb-2 flex flex-row items-start justify-between space-y-0 bg-muted/20">
                                            <div className="space-y-1">
                                                <span className="font-bold text-base text-foreground block">{order.order_number}</span>
                                                {renderOrderTypeCell(order)}
                                            </div>
                                            <Badge variant="outline" className={`${timeInfo.badgeClass} px-2 py-0.5 text-xs inline-flex items-center gap-1 shrink-0`}>
                                                {timeInfo.isOverdue ? (
                                                    <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
                                                ) : (
                                                    <Clock className="w-3 h-3 shrink-0" />
                                                )}
                                                {timeInfo.text}
                                            </Badge>
                                        </CardHeader>

                                        <CardContent className="p-3.5 pt-3 flex-1 flex flex-col justify-between gap-3">
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between text-xs border-b pb-2">
                                                    <span className="text-muted-foreground">Customer: <strong className="text-foreground">{order.customer_name || 'Walk-in'}</strong></span>
                                                    <Badge className={`${getStatusColor(order.kitchen_status)} text-[9px] uppercase tracking-wider`}>
                                                        {order.kitchen_status}
                                                    </Badge>
                                                </div>

                                                {/* Items Preview List */}
                                                <div className="space-y-1.5">
                                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                        Items ({order.items?.length || 0})
                                                    </p>
                                                    <ul className="text-xs space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                                                        {order.items?.map((item: any, idx: number) => (
                                                            <li key={item.id || idx} className="flex justify-between items-start text-foreground font-medium border-b border-border/30 pb-1 last:border-0">
                                                                <div className="truncate max-w-[180px]">
                                                                    <span>{item.quantity}x {item.menu_item?.name || item.menuItem?.name || 'Item'}</span>
                                                                    {item.modifiers?.length > 0 && (
                                                                        <div className="text-[10px] text-muted-foreground truncate">
                                                                            +{item.modifiers.map((m: any) => m.modifier?.name).filter(Boolean).join(', ')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-muted-foreground text-[11px] shrink-0 font-normal">
                                                                    ${parseFloat(item.subtotal || '0').toFixed(2)}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="pt-3 border-t flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getPaymentStatusBadge(order.status)}
                                                    <span className="font-bold text-sm text-foreground">${parseFloat(order.grand_total || '0').toFixed(2)}</span>
                                                </div>
                                                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => setViewOrder(order)}>
                                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Inertia Pagination controls for Grid View */}
                    {meta.lastPage > 1 && (
                        <div className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm text-sm">
                            <span className="text-muted-foreground text-xs">
                                Showing page <strong>{meta.currentPage}</strong> of <strong>{meta.lastPage}</strong> ({meta.total} orders)
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={meta.currentPage <= 1}
                                    onClick={() => handlePageChange(meta.currentPage - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={meta.currentPage >= meta.lastPage}
                                    onClick={() => handlePageChange(meta.currentPage + 1)}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* View Order Dialog */}
            <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Order Details: {viewOrder?.order_number}</DialogTitle>
                    </DialogHeader>
                    {viewOrder && (
                        <div className="py-4">
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Customer</span>
                                    <span className="font-medium">{viewOrder.customer_name || 'Walk-in'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Type</span>
                                    <span className="font-medium">{viewOrder.order_type}</span>
                                </div>
                                {(viewOrder.dining_table || viewOrder.diningTable) && (
                                    <div>
                                        <span className="text-muted-foreground block">Table</span>
                                        <span className="font-medium">{(viewOrder.dining_table || viewOrder.diningTable)?.name}</span>
                                    </div>
                                )}
                                {viewOrder.pax && (
                                    <div>
                                        <span className="text-muted-foreground block">Guests (Pax)</span>
                                        <span className="font-medium">{viewOrder.pax}</span>
                                    </div>
                                )}
                                {viewOrder.waiter && (
                                    <div>
                                        <span className="text-muted-foreground block">Waiter</span>
                                        <span className="font-medium">{viewOrder.waiter?.name}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-muted-foreground block">Cashier</span>
                                    <span className="font-medium">{viewOrder.cashier?.name || 'System'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Kitchen Status</span>
                                    <Badge className={getStatusColor(viewOrder.kitchen_status)}>
                                        {viewOrder.kitchen_status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Payment Status</span>
                                    {getPaymentStatusBadge(viewOrder.status)}
                                </div>
                            </div>
                            
                            <h4 className="font-semibold mb-2 border-b pb-2">Items</h4>
                            <ScrollArea className="max-h-[300px]">
                                <ul className="space-y-3">
                                    {viewOrder.items?.map((item: any) => (
                                        <li key={item.id} className="flex justify-between items-start">
                                            <div>
                                                <span className="font-medium">{item.quantity}x {item.menu_item?.name || item.menuItem?.name}</span>
                                                {item.modifiers?.length > 0 && (
                                                    <div className="text-sm text-muted-foreground pl-4">
                                                        {item.modifiers.map((mod: any, idx: number) => (
                                                            <div key={idx}>+ {mod.modifier?.name}</div>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.notes && (
                                                    <div className="text-sm text-muted-foreground pl-4 italic">Note: {item.notes}</div>
                                                )}
                                            </div>
                                            <span className="font-medium">${parseFloat(item.subtotal).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>

                            <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${parseFloat(viewOrder.grand_total).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </XPage>
    );
}

