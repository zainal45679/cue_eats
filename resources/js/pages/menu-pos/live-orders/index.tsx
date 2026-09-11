import { Head, router } from '@inertiajs/react';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { ScrollArea, ScrollBar } from '@/components/shadcn/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadcn/ui/dialog';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { cn } from '@/lib/utils';
import { 
    Clock, 
    ClipboardList, 
    ChefHat, 
    CheckCircle, 
    Search, 
    X, 
    LayoutGrid, 
    ShoppingBag, 
    Eye, 
    User, 
    AlertCircle
} from 'lucide-react';
export default function LiveOrdersScreen({ orders = [], locationId }: { orders: any[], locationId?: string | null }) {
    const [now, setNow] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'preparing'>('all');
    
    // Dialogs & action states
    const [viewOrder, setViewOrder] = useState<any | null>(null);
    const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<any | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelPrompt, setShowCancelPrompt] = useState(false);
    const [isWasted, setIsWasted] = useState(false);
    const [cancelItemId, setCancelItemId] = useState<string | null>(null);

    // Live WebSockets updates via Echo + 30-sec polling fallback
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);

        if (window.Echo && locationId) {
            window.Echo.channel(`orders.${locationId}`)
                .listen('.App\\Events\\OrderCreated', () => {
                    router.reload({ only: ['orders'], preserveScroll: true, preserveState: true });
                });
        }

        const pollInterval = setInterval(() => {
            router.reload({ only: ['orders'], preserveState: true, preserveScroll: true });
        }, 30000);

        return () => {
            clearInterval(timer);
            clearInterval(pollInterval);
            if (window.Echo && locationId) {
                window.Echo.leaveChannel(`orders.${locationId}`);
            }
        };
    }, [locationId]);

    // Elapsed time calculation
    const getElapsedTime = (createdAt: string) => {
        const start = new Date(createdAt).getTime();
        const diffInMinutes = Math.floor((now.getTime() - start) / 60000);
        if (diffInMinutes < 1) return 'Just now';
        return `${diffInMinutes}m ago`;
    };

    // Summary counts (only active live kitchen orders)
    const pendingOrders = useMemo(() => orders.filter(o => o.kitchen_status === 'pending' || !o.kitchen_status), [orders]);
    const preparingOrders = useMemo(() => orders.filter(o => o.kitchen_status === 'preparing'), [orders]);

    // Filter by tab and search
    const filteredOrders = useMemo(() => {
        let list: any[] = [];

        if (activeTab === 'pending') {
            list = pendingOrders;
        } else if (activeTab === 'preparing') {
            list = preparingOrders;
        } else {
            // All Active: show pending orders first, then preparing orders
            list = [...pendingOrders, ...preparingOrders];
        }

        if (!searchQuery.trim()) {
            return list;
        }

        const q = searchQuery.toLowerCase();
        return list.filter(order => {
            const num = (order.order_number || '').toLowerCase();
            const tableName = (order.dining_table?.name || order.diningTable?.name || '').toLowerCase();
            const cust = (order.customer_name || '').toLowerCase();
            const waiter = (order.waiter?.name || '').toLowerCase();
            const items = (order.items || []).map((i: any) => (i.menu_item?.name || '').toLowerCase()).join(' ');
            return num.includes(q) || tableName.includes(q) || cust.includes(q) || waiter.includes(q) || items.includes(q);
        });
    }, [orders, activeTab, searchQuery, pendingOrders, preparingOrders]);

    // Status action handler
    const updateStatus = (orderId: string, status: string) => {
        router.post(`/menu-pos/kds/${orderId}/status`, {
            kitchen_status: status
        }, {
            preserveScroll: true,
            preserveState: true
        });
    };

    return (
        <>
            <Head title="Live Orders" />
            <div className="flex flex-1 h-[calc(100vh-70px)] w-full bg-muted/10 overflow-hidden print:hidden flex-col">
                
                {/* Top Navigation Header */}
                <div className="bg-background border-b p-3 space-y-3 shadow-xs z-10 shrink-0">
                    {/* Row 1: Mode Switch, Stats Capsule & Search */}
                    <div className="flex items-center justify-between">
                        {/* Left: Mode Switcher */}
                        <div className="flex items-center gap-2">
                            <div className="inline-flex items-center p-0.5 bg-muted/60 border border-border/60 rounded-lg shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => router.get('/menu-pos/tables')}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span>Dine-In</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.get('/menu-pos/terminal')}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Takeaway</span>
                                </button>
                            </div>

                            {/* Active Live Orders Button */}
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="h-8 text-xs gap-1.5 px-2.5 rounded-lg shadow-xs font-semibold bg-primary text-primary-foreground cursor-default"
                            >
                                <ClipboardList className="w-3.5 h-3.5 text-primary-foreground" />
                                <span>Live Orders</span>
                            </Button>
                        </div>

                        {/* Middle & Right: Stats Capsule & Search */}
                        <div className="flex items-center gap-3">
                            {/* Stats Summary Capsule */}
                            <div className="text-xs font-medium hidden sm:flex bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 items-center gap-4">
                                <div className="text-foreground font-bold">
                                    All Active: <span>{orders.length}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                                    <span className="text-muted-foreground">Pending: <span className="text-foreground font-semibold">{pendingOrders.length}</span></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                    <span className="text-muted-foreground">Preparing: <span className="text-foreground font-semibold">{preparingOrders.length}</span></span>
                                </div>
                            </div>

                            {/* Search Box */}
                            <div className="relative w-full max-w-[200px] shrink-0">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                                <Input 
                                    type="text" 
                                    placeholder="Search orders..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-8 h-8 bg-muted/50 border-border/50 focus-visible:bg-background focus-visible:border-primary rounded-full text-xs w-full"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full cursor-pointer"
                                        type="button"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Status Filter Navigation Pills */}
                    <div className="flex items-center justify-between w-full mb-1">
                        <ScrollArea className="flex-1 whitespace-nowrap">
                            <div className="flex space-x-2 pb-1">
                                {[
                                    { id: 'all', label: `All Active (${orders.length})` },
                                    { id: 'pending', label: `Pending (${pendingOrders.length})` },
                                    { id: 'preparing', label: `Preparing (${preparingOrders.length})` },
                                ].map((tab) => (
                                    <Button
                                        key={tab.id}
                                        type="button"
                                        variant={activeTab === tab.id ? 'default' : 'outline'}
                                        className={cn(
                                            "rounded-full px-5 h-8 text-xs shrink-0 font-medium transition-all cursor-pointer",
                                            activeTab === tab.id
                                                ? "bg-primary text-primary-foreground shadow-xs border-transparent hover:bg-primary/90"
                                                : "bg-muted/50 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                        onClick={() => setActiveTab(tab.id as any)}
                                    >
                                        {tab.label}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="hidden" />
                        </ScrollArea>
                    </div>
                </div>

                {/* Main Content Area: KDS-Style Order Cards Grid */}
                <ScrollArea className="flex-1 p-3.5 min-h-0 bg-muted/10">
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border-2 border-dashed rounded-xl bg-card/40 mx-auto max-w-2xl my-8">
                            <ChefHat className="w-16 h-16 mb-4 opacity-25" />
                            <h3 className="text-lg font-bold text-foreground mb-1">No Orders Found</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm">
                                {searchQuery 
                                    ? `No orders matching "${searchQuery}". Try a different keyword.` 
                                    : activeTab === 'all'
                                    ? 'Kitchen and counter are clear. Waiting for new orders to arrive.'
                                    : activeTab === 'pending'
                                    ? 'No pending orders right now. Kitchen is all caught up!'
                                    : 'No orders are currently in preparation.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 items-start">
                            {filteredOrders.map((order) => {
                                const orderTime = new Date(order.created_at);
                                const isOverdue = (now.getTime() - orderTime.getTime()) > 15 * 60000;
                                const isPreparing = order.kitchen_status === 'preparing';
                                const isPending = !isPreparing;
                                const isCancelled = order.status === 'cancelled';
                                const tableName = order.dining_table?.name || order.diningTable?.name;
                                const elapsedTime = getElapsedTime(order.created_at);

                                return (
                                    <div 
                                        key={order.id} 
                                        className={cn(
                                            "flex flex-col bg-card border border-border/70 shadow-xs rounded-xl overflow-hidden min-h-[290px] transition-all hover:shadow-sm",
                                            isPreparing ? "border-t-[5px] border-t-blue-600" : "border-t-[5px] border-t-amber-500",
                                            isOverdue && isPending && "border-t-red-600 ring-1 ring-red-500/40 animate-pulse"
                                        )}
                                    >
                                        {/* Card Header */}
                                        <div className="flex flex-col p-3 border-b bg-muted/20 space-y-1.5">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-lg font-black leading-none tracking-tight text-foreground flex items-center gap-2">
                                                        <span>#{order.order_number}</span>
                                                        {tableName ? (
                                                            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                                                {tableName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border/50">
                                                                {order.order_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {order.customer_name && order.customer_name !== 'Walk-in Customer' && (
                                                        <p className="text-xs text-muted-foreground font-medium mt-1 truncate max-w-[150px]">
                                                            {order.customer_name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={cn(
                                                        "text-xs font-bold shrink-0 flex items-center gap-1",
                                                        isOverdue && isPending ? "text-red-600 font-extrabold" : "text-muted-foreground"
                                                    )}>
                                                        <Clock className="w-3 h-3" />
                                                        {elapsedTime}
                                                    </span>
                                                    <span className="font-extrabold text-xs text-foreground">
                                                        ₹{parseFloat(order.grand_total || '0').toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-xs pt-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold uppercase tracking-wider bg-foreground/10 px-1.5 py-0.5 rounded text-foreground text-[10px]">
                                                        {order.order_type}
                                                    </span>
                                                    {order.waiter?.name && (
                                                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-0.5">
                                                            <User className="w-2.5 h-2.5" />
                                                            {order.waiter.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                                                    isPreparing 
                                                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20" 
                                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                )}>
                                                    {order.kitchen_status || 'pending'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body: Items List directly on the card */}
                                        <div className="flex-1 p-2.5 overflow-y-auto max-h-[300px] divide-y divide-border/20">
                                            <ul className="space-y-1.5">
                                                {order.items?.map((item: any) => (
                                                    <li key={item.id} className="py-1 flex items-start justify-between group">
                                                        <div className="flex items-start flex-1 min-w-0 pr-2">
                                                            <span className="font-bold text-sm w-7 shrink-0 text-foreground">{item.quantity} x</span>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="font-semibold text-sm leading-tight text-foreground">
                                                                    {item.menu_item?.name || item.menu_item_name}
                                                                </div>
                                                                {item.modifiers && item.modifiers.length > 0 && (
                                                                    <div className="mt-0.5 text-xs text-muted-foreground">
                                                                        {item.modifiers.map((mod: any, idx: number) => (
                                                                            <div key={idx}>+ {mod.modifier?.name || mod.modifier_name || mod.name}</div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {item.notes && (
                                                                    <div className="mt-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 italic">
                                                                        * {item.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end shrink-0 gap-0.5">
                                                            <span className="text-xs font-semibold text-foreground">
                                                                ₹{parseFloat(item.subtotal || '0').toFixed(2)}
                                                            </span>
                                                            {!isCancelled && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setCancelItemId(item.id);
                                                                        setSelectedOrderForCancel(order);
                                                                        setIsWasted(isPreparing);
                                                                    }}
                                                                    className="text-[10px] text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                                    title="Cancel this item"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Card Footer: Action Controls */}
                                        <div className="p-2 bg-muted/20 border-t mt-auto flex items-center gap-1.5">
                                            {isPending ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 text-destructive border-destructive/30 hover:bg-destructive hover:text-white h-8 text-xs font-bold px-0 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedOrderForCancel(order);
                                                            setShowCancelPrompt(true);
                                                            setIsWasted(false);
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-bold px-0 cursor-pointer"
                                                        onClick={() => updateStatus(order.id, 'preparing')}
                                                    >
                                                        Start Prep
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 text-destructive border-destructive/30 hover:bg-destructive hover:text-white h-8 text-xs font-bold px-0 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedOrderForCancel(order);
                                                            setShowCancelPrompt(true);
                                                            setIsWasted(true);
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold px-0 cursor-pointer"
                                                        onClick={() => updateStatus(order.id, 'ready')}
                                                    >
                                                        Mark Ready
                                                    </Button>
                                                </>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                                onClick={() => setViewOrder(order)}
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* View Order Details Dialog */}
            <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between pr-4">
                            <span>Order #{viewOrder?.order_number}</span>
                            {viewOrder?.kitchen_status && (
                                <Badge className="text-[10px] uppercase tracking-wider">
                                    {viewOrder.kitchen_status}
                                </Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    {viewOrder && (
                        <div className="py-2 space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-xs bg-muted/40 p-3 rounded-lg border border-border/50">
                                <div>
                                    <span className="text-muted-foreground block">Customer</span>
                                    <span className="font-semibold text-foreground">{viewOrder.customer_name || 'Walk-in Customer'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Order Type</span>
                                    <span className="font-semibold text-foreground">{viewOrder.order_type}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Cashier</span>
                                    <span className="font-semibold text-foreground">{viewOrder.cashier?.name || 'System'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Placed At</span>
                                    <span className="font-semibold text-foreground">
                                        {new Date(viewOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {viewOrder.diningTable?.name && (
                                    <div>
                                        <span className="text-muted-foreground block">Table</span>
                                        <span className="font-semibold text-primary">{viewOrder.diningTable.name}</span>
                                    </div>
                                )}
                                {viewOrder.waiter?.name && (
                                    <div>
                                        <span className="text-muted-foreground block">Waiter</span>
                                        <span className="font-semibold text-foreground">{viewOrder.waiter.name}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">Order Items</h4>
                                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                                    {viewOrder.items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-start text-xs border-b border-border/30 pb-2">
                                            <div>
                                                <span className="font-bold">{item.quantity}x</span> {item.menu_item?.name || item.menu_item_name}
                                                {item.modifiers?.length > 0 && (
                                                    <div className="text-[11px] text-muted-foreground pl-4">
                                                        {item.modifiers.map((mod: any, idx: number) => (
                                                            <div key={idx}>+ {mod.modifier?.name || mod.modifier_name || mod.name}</div>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.notes && (
                                                    <div className="text-[11px] text-amber-600 dark:text-amber-400 pl-4 italic">* {item.notes}</div>
                                                )}
                                            </div>
                                            <span className="font-bold">₹{parseFloat(item.subtotal || '0').toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 border-t flex justify-between items-center text-sm font-bold">
                                <span>Grand Total</span>
                                <span className="text-base text-primary font-black">₹{parseFloat(viewOrder.grand_total || '0').toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setViewOrder(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Entire Order Dialog */}
            <Dialog 
                open={showCancelPrompt && !!selectedOrderForCancel} 
                onOpenChange={(open) => {
                    if (!open) {
                        setShowCancelPrompt(false);
                        setSelectedOrderForCancel(null);
                        setCancelReason('');
                        setIsWasted(false);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Order #{selectedOrderForCancel?.order_number}</DialogTitle>
                    </DialogHeader>
                    <div className="py-3 space-y-3">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Reason for cancellation
                        </label>
                        <Textarea 
                            placeholder="e.g. Customer changed mind, incorrect order entry..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                        />

                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                            <input 
                                type="checkbox" 
                                id="waste-order"
                                checked={isWasted}
                                onChange={(e) => setIsWasted(e.target.checked)}
                                className="rounded border-border text-destructive focus:ring-destructive cursor-pointer"
                            />
                            <label htmlFor="waste-order" className="cursor-pointer">
                                Log as Wastage? (Do not return ingredients to inventory stock)
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                                setShowCancelPrompt(false);
                                setSelectedOrderForCancel(null);
                            }}
                        >
                            Back
                        </Button>
                        <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={!cancelReason.trim()}
                            onClick={() => {
                                router.post(`/menu-pos/live-orders/${selectedOrderForCancel.id}/cancel`, {
                                    reason: cancelReason,
                                    is_wasted: isWasted
                                }, {
                                    onSuccess: () => {
                                        setShowCancelPrompt(false);
                                        setSelectedOrderForCancel(null);
                                        setCancelReason('');
                                        setIsWasted(false);
                                    }
                                });
                            }}
                        >
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Specific Item Dialog */}
            <Dialog 
                open={!!cancelItemId && !!selectedOrderForCancel} 
                onOpenChange={(open) => {
                    if (!open) {
                        setCancelItemId(null);
                        setSelectedOrderForCancel(null);
                        setIsWasted(false);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Item from Order #{selectedOrderForCancel?.order_number}</DialogTitle>
                    </DialogHeader>
                    <div className="py-3 space-y-3">
                        <p className="text-xs text-muted-foreground">
                            Are you sure you want to cancel this item? The order totals will be automatically adjusted.
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                            <input 
                                type="checkbox" 
                                id="waste-item"
                                checked={isWasted}
                                onChange={(e) => setIsWasted(e.target.checked)}
                                className="rounded border-border text-destructive focus:ring-destructive cursor-pointer"
                            />
                            <label htmlFor="waste-item" className="cursor-pointer">
                                Log as Wastage? (Do not return ingredients to inventory stock)
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                                setCancelItemId(null);
                                setSelectedOrderForCancel(null);
                            }}
                        >
                            Back
                        </Button>
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                                router.post(`/menu-pos/live-orders/items/${cancelItemId}/cancel`, {
                                    is_wasted: isWasted
                                }, {
                                    onSuccess: () => {
                                        setCancelItemId(null);
                                        setSelectedOrderForCancel(null);
                                        setIsWasted(false);
                                    }
                                });
                            }}
                        >
                            Confirm Item Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
