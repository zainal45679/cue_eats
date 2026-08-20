import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Badge } from '@/components/shadcn/ui/badge';
import { Clock, CheckCircle, ChefHat, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadcn/ui/dialog';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { XPage } from '@/components/x/page/XPage';

export default function KdsScreen({ orders, locationId }: { orders: any[], locationId: string }) {
    const [now, setNow] = useState(new Date());
    const [rejectOrder, setRejectOrder] = useState<any | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [previousOrderIds, setPreviousOrderIds] = useState<Set<string>>(new Set(orders.map(o => o.id.toString())));
    const [isSoundReady, setIsSoundReady] = useState(false);

    const playKdsBeep = () => {
        try {
            const audio = new Audio('/audio/new-order.mp3');
            audio.play().catch(e => console.warn('Audio playback blocked by browser', e));
        } catch (e) {
            console.warn('Audio playback failed', e);
        }
    };

    useEffect(() => {
        const currentIds = new Set(orders.map(o => o.id.toString()));
        let hasNewOrder = false;
        
        for (const order of orders) {
            if (!previousOrderIds.has(order.id.toString())) {
                hasNewOrder = true;
                break;
            }
        }

        if (hasNewOrder) {
            playKdsBeep();
        }

        setPreviousOrderIds(currentIds);
    }, [orders]);

    // Update timers every minute
    useEffect(() => {
        const timerInterval = setInterval(() => setNow(new Date()), 60000);
        
        // Listen for new orders via WebSockets for this specific location
        if (window.Echo && locationId) {
            window.Echo.channel(`orders.${locationId}`)
                .listen('.App\\Events\\OrderCreated', (e: any) => {
                    playKdsBeep();
                    router.reload({ only: ['orders'], preserveScroll: true, preserveState: true });
                });
        }
        
        return () => {
            clearInterval(timerInterval);
            if (window.Echo) {
                window.Echo.leaveChannel('orders');
            }
        };
    }, []);

    const updateStatus = (orderId: string, status: string, reason?: string) => {
        router.post(`/menu-pos/kds/${orderId}/status`, {
            kitchen_status: status,
            rejection_reason: reason
        }, {
            preserveScroll: true,
            onSuccess: () => {
                if (status === 'rejected') {
                    setRejectOrder(null);
                    setRejectionReason('');
                }
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'preparing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    let showNav = false;
    if (typeof window !== 'undefined') {
        showNav = new URLSearchParams(window.location.search).get('layout') === 'dashboard';
    }

    const content = (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kitchen Display</h1>
                    <p className="text-muted-foreground">Manage active orders</p>
                </div>
                <div className="flex items-center gap-4">
                    {!isSoundReady && (
                        <div className="text-xs text-amber-500 animate-pulse font-medium bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                            Tap anywhere to enable sound
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Badge variant="outline" className="px-3 py-1 bg-card">
                            {orders.filter(o => o.kitchen_status === 'pending').length} Pending
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 bg-card">
                            {orders.filter(o => o.kitchen_status === 'preparing').length} Preparing
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {orders.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-card/50">
                        <ChefHat className="w-16 h-16 mb-4 opacity-20" />
                        <h2 className="text-xl font-medium mb-1">No Active Orders</h2>
                        <p>Kitchen is clear. Waiting for new orders...</p>
                    </div>
                )}
                
                {orders.map((order) => {
                    const orderTime = new Date(order.created_at);
                    const isOverdue = (now.getTime() - orderTime.getTime()) > 15 * 60000; // 15 mins
                    
                    const isPreparing = order.kitchen_status === 'preparing';
                    const isPending = order.kitchen_status === 'pending';
                    const tableName = order.dining_table?.name || order.diningTable?.name;

                    const updateKotStatus = (kotId: string, status: string) => {
                        router.post(`/menu-pos/kds/kot/${kotId}/status`, { status }, { preserveScroll: true });
                    };

                    return (
                        <div key={order.id} className={cn(
                            "flex flex-col bg-card border shadow-sm rounded-lg overflow-hidden min-h-[260px]",
                            isPreparing ? "border-t-[6px] border-t-blue-600" : "border-t-[6px] border-t-amber-500",
                            isOverdue && isPending && "border-t-red-600 animate-pulse"
                        )}>
                            {/* Card Header: Primary Order & Table Info */}
                            <div className="flex flex-col p-3 border-b bg-muted/20 space-y-1.5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xl font-black leading-none tracking-tight text-foreground flex items-center gap-2">
                                            <span>#{order.order_number}</span>
                                            {tableName && (
                                                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                    {tableName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-xs font-bold shrink-0",
                                        isOverdue ? "text-red-600 font-extrabold" : "text-muted-foreground"
                                    )}>
                                        {formatDistanceToNow(orderTime, { addSuffix: true })}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold uppercase tracking-wider bg-foreground/10 px-1.5 py-0.5 rounded text-foreground text-[10px]">
                                        {order.order_type}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                                        isPreparing ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    )}>
                                        {order.kitchen_status}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Card Body: Round-by-Round Submissions */}
                            <div className="flex-1 p-2.5 overflow-y-auto max-h-[340px] custom-scrollbar space-y-3">
                                {order.kots && order.kots.length > 0 ? (
                                    order.kots.map((kot: any) => {
                                        const isKotReady = kot.status === 'ready';
                                        const isKotPreparing = kot.status === 'preparing';

                                        return (
                                            <div 
                                                key={kot.id} 
                                                className={cn(
                                                    "border rounded-lg overflow-hidden transition-all",
                                                    isKotReady 
                                                        ? "bg-muted/30 border-emerald-500/30 opacity-75" 
                                                        : isKotPreparing 
                                                            ? "bg-blue-500/5 border-blue-500/40 shadow-sm" 
                                                            : "bg-amber-500/5 border-amber-500/40 shadow-sm"
                                                )}
                                            >
                                                {/* Round Header */}
                                                <div className={cn(
                                                    "px-2.5 py-1.5 flex justify-between items-center border-b text-xs font-bold",
                                                    isKotReady 
                                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" 
                                                        : isKotPreparing 
                                                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" 
                                                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                                )}>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono">Round #{kot.round_number}</span>
                                                        <span className="text-[10px] opacity-75 font-normal">({kot.kot_number})</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border",
                                                            isKotReady ? "bg-emerald-600 text-white border-emerald-600" :
                                                            isKotPreparing ? "bg-blue-600 text-white border-blue-600" :
                                                            "bg-amber-600 text-white border-amber-600"
                                                        )}>
                                                            {isKotReady ? '✓ PREPARED' : isKotPreparing ? '⚡ PREPARING' : '🔴 NEW'}
                                                        </span>

                                                        {!isKotReady && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 text-[10px] font-bold px-2 bg-background hover:bg-muted"
                                                                onClick={() => updateKotStatus(kot.id, isKotPreparing ? 'ready' : 'preparing')}
                                                            >
                                                                {isKotPreparing ? 'Mark Ready' : 'Start Prep'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Round Items List */}
                                                <ul className="py-1 divide-y divide-border/20">
                                                    {kot.items?.map((item: any) => (
                                                        <li key={item.id} className="px-2.5 py-1.5 hover:bg-muted/20">
                                                            <div className="flex items-start">
                                                                <span className="font-extrabold text-sm w-7 shrink-0 text-foreground">{item.quantity} x</span>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className={cn(
                                                                        "font-bold text-sm leading-tight",
                                                                        isKotReady ? "text-muted-foreground line-through" : "text-foreground"
                                                                    )}>
                                                                        {item.menu_item?.name || item.menu_item_name}
                                                                    </div>
                                                                    {item.modifiers && item.modifiers.length > 0 && (
                                                                        <div className="mt-0.5">
                                                                            {item.modifiers.map((mod: any) => (
                                                                                <div key={mod.id} className="text-xs text-muted-foreground font-medium">
                                                                                    - {mod.modifier?.name || mod.modifier_name}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {item.notes && (
                                                                        <div className="mt-1 text-xs font-bold text-red-600 dark:text-red-400 leading-tight">
                                                                            * {item.notes}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <ul className="py-1">
                                        {order.items?.map((item: any) => (
                                            <li key={item.id} className="px-2 py-1.5 hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0">
                                                <div className="flex items-start">
                                                    <span className="font-bold text-sm w-7 shrink-0">{item.quantity} x</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm leading-tight text-foreground">
                                                            {item.menu_item?.name}
                                                        </div>
                                                        {item.modifiers && item.modifiers.length > 0 && (
                                                            <div className="mt-0.5">
                                                                {item.modifiers.map((mod: any) => (
                                                                    <div key={mod.id} className="text-xs text-muted-foreground font-medium">
                                                                        - {mod.modifier?.name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {item.notes && (
                                                            <div className="mt-1 text-xs font-bold text-red-600 dark:text-red-400 leading-tight">
                                                                * {item.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            
                            {/* Card Footer: Overall Order Bump Controls */}
                            <div className="p-2 bg-muted/20 border-t mt-auto flex gap-2">
                                {isPending ? (
                                    <>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="flex-1 text-destructive border-destructive/30 hover:bg-destructive hover:text-white h-8 text-xs font-bold px-0"
                                            onClick={() => setRejectOrder(order)}
                                        >
                                            Reject
                                        </Button>
                                        <Button 
                                            size="sm"
                                            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-bold px-0"
                                            onClick={() => updateStatus(order.id, 'preparing')}
                                        >
                                            Start Prep All
                                        </Button>
                                    </>
                                ) : (
                                    <Button 
                                        size="sm"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm font-bold"
                                        onClick={() => updateStatus(order.id, 'ready')}
                                    >
                                        Mark All Ready
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reject Order Dialog */}
            <Dialog open={!!rejectOrder} onOpenChange={(open) => !open && setRejectOrder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Order {rejectOrder?.order_number}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="block text-sm font-medium mb-2">Reason for rejection</label>
                        <Textarea 
                            placeholder="e.g. Out of ingredients, kitchen too busy..."
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectOrder(null)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            disabled={!rejectionReason.trim()}
                            onClick={() => updateStatus(rejectOrder.id, 'rejected', rejectionReason)}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );

    return showNav ? (
        <XPage title="Kitchen Display System">{content}</XPage>
    ) : (
        <div className="h-screen overflow-y-auto bg-background p-4 md:p-6">
            <Head title="Kitchen Display System" />
            {content}
        </div>
    );
}

import AppLayout from '@/layouts/app-layout';

KdsScreen.layout = (page: any) => {
    let showNav = false;
    if (typeof window !== 'undefined') {
        showNav = new URLSearchParams(window.location.search).get('layout') === 'dashboard';
    }
    return showNav ? <AppLayout>{page}</AppLayout> : <>{page}</>;
};
