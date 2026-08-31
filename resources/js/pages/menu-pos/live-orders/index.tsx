import { Head, router } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';
import { Eye, Clock, ClipboardList, ChefHat, CheckCircle, Hourglass, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shadcn/ui/dialog';
import { ScrollArea } from '@/components/shadcn/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/ui/tabs';
import { XPage } from '@/components/x/page/XPage';
import { XDataTable } from '@/components/x/table/XDataTable';
import type { XDataTableColumn } from '@/components/x/table/XDataTableType';
import { Entity } from '@/lib/permissions';

export default function LiveOrdersScreen({ orders = [] }: { orders: any[] }) {
    const [viewOrder, setViewOrder] = useState<any | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelPrompt, setShowCancelPrompt] = useState(false);
    const [isWasted, setIsWasted] = useState(false);
    const [cancelItemId, setCancelItemId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['orders'], preserveState: true, preserveScroll: true });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
            case 'preparing': return 'bg-blue-500 hover:bg-blue-600 text-white';
            case 'ready': return 'bg-green-500 hover:bg-green-600 text-white';
            case 'rejected': return 'bg-red-500 hover:bg-red-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getElapsedTime = (createdAt: string) => {
        const start = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const diffInMinutes = Math.floor((now - start) / 60000);
        return `${diffInMinutes} min`;
    };

    const pendingCount = orders.filter(o => o.kitchen_status === 'pending').length;
    const preparingCount = orders.filter(o => o.kitchen_status === 'preparing').length;
    const readyCount = orders.filter(o => o.kitchen_status === 'ready').length;
    const totalValue = orders.reduce((sum, o) => sum + parseFloat(o.grand_total || '0'), 0);

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
            accessorKey: 'order_type'
        },
        {
            id: 'customer',
            header: 'Customer',
            accessorFn: (row: any) => row.customer_name || 'N/A'
        },
        {
            id: 'elapsed',
            header: 'Time Elapsed',
            cell: ({ row }: any) => (
                <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {getElapsedTime(row.original.created_at)}
                </div>
            )
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
            id: 'total',
            header: () => <div className="text-right">Total</div>,
            meta: { label: 'Total' },
            accessorKey: 'grand_total',
            cell: ({ row }: any) => (
                <div className="text-right font-medium">
                    ${parseFloat(row.original.grand_total || '0').toFixed(2)}
                </div>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-center">Actions</div>,
            meta: { label: 'Actions' },
            cell: ({ row }: any) => (
                <div className="flex justify-center">
                    <Button variant="ghost" size="sm" className="h-6 py-0 px-2 text-xs" onClick={() => setViewOrder(row.original)}>
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View
                    </Button>
                </div>
            )
        }
    ];

    const filteredOrders = useMemo(() => {
        if (activeTab === 'all') return orders;
        return orders.filter(o => o.kitchen_status === activeTab);
    }, [orders, activeTab]);

    const processedData = {
        rows: filteredOrders,
        meta: {
            currentPage: 1,
            lastPage: 1,
            total: filteredOrders.length,
            perPage: Math.max(filteredOrders.length, 100)
        },
        filters: [],
        sortBy: null,
        sortDesc: false,
        search: null
    };

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
                            <h3 className="text-2xl font-bold leading-none">{orders.length}</h3>
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

            {/* Quick Filter Tabs */}
            <div className="mb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full sm:w-[600px] grid-cols-4 h-11 bg-muted/50 p-1">
                    <TabsTrigger value="all" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">All Orders</TabsTrigger>
                    <TabsTrigger value="pending" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Pending</TabsTrigger>
                    <TabsTrigger value="preparing" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Preparing</TabsTrigger>
                    <TabsTrigger value="ready" className="rounded-md font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm h-full">Ready</TabsTrigger>
                </TabsList>
                </Tabs>
            </div>

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
                        onClick: () => router.reload({ only: ['orders'] })
                    }
                ]}
            />

            {/* View Order Dialog */}
            <Dialog open={!!viewOrder} onOpenChange={(open) => { if (!open) { setViewOrder(null); setShowCancelPrompt(false); setCancelReason(''); setIsWasted(false); setCancelItemId(null); } }}>
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
                                <div>
                                    <span className="text-muted-foreground block">Cashier</span>
                                    <span className="font-medium">{viewOrder.cashier?.name || 'System'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Status</span>
                                    <Badge className={getStatusColor(viewOrder.kitchen_status)}>
                                        {viewOrder.kitchen_status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            
                            <h4 className="font-semibold mb-2 border-b pb-2">Items</h4>
                            <ScrollArea className="max-h-[300px]">
                                <ul className="space-y-3">
                                    {viewOrder.items?.map((item: any) => (
                                        <li key={item.id} className="flex justify-between items-start group">
                                            <div>
                                                <span className="font-medium">{item.quantity}x {item.menu_item?.name}</span>
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
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="font-medium">${parseFloat(item.subtotal).toFixed(2)}</span>
                                                {viewOrder.status !== 'cancelled' && viewOrder.kitchen_status !== 'rejected' && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-5 px-2 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        onClick={() => {
                                                            setCancelItemId(item.id);
                                                            setIsWasted(viewOrder.kitchen_status === 'preparing' || viewOrder.kitchen_status === 'ready');
                                                        }}
                                                    >
                                                        Cancel Item
                                                    </Button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>

                            
                            {showCancelPrompt ? (
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="font-semibold mb-2 text-red-500">Cancel Order</h4>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <input 
                                                type="checkbox" 
                                                id="waste-order"
                                                checked={isWasted}
                                                onChange={(e) => setIsWasted(e.target.checked)}
                                                className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                                            />
                                            <label htmlFor="waste-order">Log as Wastage? (Do not return ingredients to stock)</label>
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Reason for cancellation..." 
                                                className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                            />
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                disabled={!cancelReason.trim()}
                                                onClick={() => {
                                                    router.post(`/menu-pos/live-orders/${viewOrder.id}/cancel`, { reason: cancelReason, is_wasted: isWasted }, {
                                                        onSuccess: () => {
                                                            setShowCancelPrompt(false);
                                                            setCancelReason('');
                                                            setViewOrder(null);
                                                        }
                                                    });
                                                }}
                                            >
                                                Confirm Cancel
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setShowCancelPrompt(false)}>Back</Button>
                                        </div>
                                    </div>
                                </div>
                            ) : cancelItemId ? (
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="font-semibold mb-2 text-red-500">Cancel Specific Item</h4>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <input 
                                                type="checkbox" 
                                                id="waste-item"
                                                checked={isWasted}
                                                onChange={(e) => setIsWasted(e.target.checked)}
                                                className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                                            />
                                            <label htmlFor="waste-item">Log as Wastage? (Do not return ingredients to stock)</label>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => {
                                                    router.post(`/menu-pos/live-orders/items/${cancelItemId}/cancel`, { is_wasted: isWasted }, {
                                                        onSuccess: () => {
                                                            setCancelItemId(null);
                                                            setIsWasted(false);
                                                            setViewOrder(null);
                                                        }
                                                    });
                                                }}
                                            >
                                                Confirm Cancel Item
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => { setCancelItemId(null); setIsWasted(false); }}>Back</Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                    {viewOrder.status !== 'cancelled' && viewOrder.kitchen_status !== 'rejected' && (
                                        <Button variant="destructive" size="sm" onClick={() => { setShowCancelPrompt(true); setIsWasted(viewOrder.kitchen_status === 'preparing' || viewOrder.kitchen_status === 'ready'); }}>
                                            Cancel Order
                                        </Button>
                                    )}
                                    <div className="flex-1"></div>
                                    <span className="font-bold text-lg mr-4">Total</span>
                                    <span className="font-bold text-lg">${parseFloat(viewOrder.grand_total).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </XPage>
    );
}
