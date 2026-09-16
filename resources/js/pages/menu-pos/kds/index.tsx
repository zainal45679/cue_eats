import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Badge } from '@/components/shadcn/ui/badge';
import { Clock, CheckCircle, ChefHat, XCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadcn/ui/dialog';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { XPage } from '@/components/x/page/XPage';

export default function KdsScreen({ orders, locationId }: { orders: any[], locationId: string }) {
    const [localOrders, setLocalOrders] = useState<any[]>(orders);
    const [now, setNow] = useState(new Date());
    const [rejectOrder, setRejectOrder] = useState<any | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [previousOrderIds, setPreviousOrderIds] = useState<Set<string>>(new Set(orders.map(o => o.id.toString())));
    const [isSoundReady, setIsSoundReady] = useState(false);

    useEffect(() => {
        setLocalOrders(orders);
    }, [orders]);
    
    // Use a persistent reference for the audio element
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/audio/new-order.mp3');
        }
    }, []);

    const playKdsBeep = () => {
        if (audioRef.current) {
            try {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.warn('Audio playback blocked by browser', e));
            } catch (e) {
                console.warn('Audio playback failed', e);
            }
        }
    };

    const playCancellationSound = () => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const time = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(520, time);
            osc.frequency.setValueAtTime(392, time + 0.15);
            gain.gain.setValueAtTime(0.3, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.4);
        } catch (e) {
            console.warn('Cancellation tone failed', e);
        }
    };

    // Unlock audio context on first user interaction
    useEffect(() => {
        const handleInteraction = () => {
            if (!isSoundReady) {
                setIsSoundReady(true);
            }
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, [isSoundReady]);

    useEffect(() => {
        const currentIds = new Set(localOrders.map(o => o.id.toString()));
        let hasNewOrder = false;
        
        for (const order of localOrders) {
            if (!previousOrderIds.has(order.id.toString())) {
                hasNewOrder = true;
                break;
            }
        }

        if (hasNewOrder && isSoundReady) {
            playKdsBeep();
        }

        setPreviousOrderIds(currentIds);
    }, [localOrders, isSoundReady]);

    // Update timers and handle real-time sync with fast 3-sec fallback
    useEffect(() => {
        const timerInterval = setInterval(() => setNow(new Date()), 60000);
        
        const channels: any[] = [];

        if (window.Echo) {
            const handleOrderCreated = (e: any) => {
                playKdsBeep();
                if (e.order) {
                    setLocalOrders(prev => {
                        const exists = prev.some(o => o.id === e.order.id);
                        if (exists) {
                            return prev.map(o => o.id === e.order.id ? { ...o, ...e.order } : o);
                        }
                        return [...prev, e.order];
                    });
                }
                router.reload({ only: ['orders'], preserveScroll: true, preserveState: true });
            };

            const handleOrderStatusUpdated = (e: any) => {
                if (e.kitchenStatus === 'cancelled') {
                    playCancellationSound();
                }
                if (e.orderId) {
                    setLocalOrders(prev => {
                        return prev.map(o => {
                            if (o.id === e.orderId) {
                                return {
                                    ...o,
                                    status: e.status ?? o.status,
                                    kitchen_status: e.kitchenStatus ?? o.kitchen_status,
                                };
                            }
                            return o;
                        }).filter(o => {
                            if (o.id === e.orderId && e.kitchenStatus === 'ready') return false;
                            return true;
                        });
                    });
                }
                router.reload({ only: ['orders'], preserveScroll: true, preserveState: true });
            };

            if (locationId) {
                const locChannel = window.Echo.private(`orders.${locationId}`);
                locChannel.listen('.App\\Events\\OrderCreated', handleOrderCreated);
                locChannel.listen('.App\\Events\\OrderStatusUpdated', handleOrderStatusUpdated);
                channels.push({ name: `orders.${locationId}`, instance: locChannel });
            }
        }

        // Fast 3-second background polling fallback
        const pollInterval = setInterval(() => {
            router.reload({ only: ['orders'], preserveScroll: true, preserveState: true });
        }, 3000);
        
        return () => {
            clearInterval(timerInterval);
            clearInterval(pollInterval);
            if (window.Echo) {
                channels.forEach(ch => {
                    ch.instance.stopListening('.App\\Events\\OrderCreated');
                    ch.instance.stopListening('.App\\Events\\OrderStatusUpdated');
                    window.Echo.leave(ch.name);
                });
            }
        };
    }, [locationId]);

    const updateStatus = (orderId: string, status: string, reason?: string) => {
        // Instant optimistic update
        setLocalOrders(prev => {
            if (status === 'ready') return prev.filter(o => o.id !== orderId);
            return prev.map(o => o.id === orderId ? { ...o, kitchen_status: status } : o);
        });

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
                            {localOrders.filter(o => o.kitchen_status === 'pending').length} Pending
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 bg-card">
                            {localOrders.filter(o => o.kitchen_status === 'preparing').length} Preparing
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {localOrders.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-card/50">
                        <ChefHat className="w-16 h-16 mb-4 opacity-20" />
                        <h2 className="text-xl font-medium mb-1">No Active Orders</h2>
                        <p>Kitchen is clear. Waiting for new orders...</p>
                    </div>
                )}
                
                {localOrders.map((order) => {
                    const orderTime = new Date(order.created_at);
                    const isOverdue = (now.getTime() - orderTime.getTime()) > 15 * 60000; // 15 mins
                    
                    const isCancelled = order.kitchen_status === 'cancelled';
                    const isPreparing = order.kitchen_status === 'preparing';
                    const isPending = order.kitchen_status === 'pending';
                    const tableName = order.dining_table?.name || order.diningTable?.name;

                    const updateKotStatus = (kotId: string, status: string) => {
                        router.post(`/menu-pos/kds/kot/${kotId}/status`, { status }, { preserveScroll: true });
                    };

                    return (
                        <div key={order.id} className={cn(
                            "flex flex-col bg-card border shadow-sm rounded-lg overflow-hidden min-h-[260px]",
                            isCancelled ? "border-t-[6px] border-t-red-600 border-red-500/40 bg-red-500/5 shadow-md" :
                            isPreparing ? "border-t-[6px] border-t-blue-600" : "border-t-[6px] border-t-amber-500",
                            isOverdue && isPending && "border-t-red-600 animate-pulse"
                        )}>
                            {/* Card Header: Primary Order & Table Info */}
                            <div className={cn("flex flex-col p-3 border-b space-y-1.5", isCancelled ? "bg-red-500/15" : "bg-muted/20")}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xl font-black leading-none tracking-tight text-foreground flex items-center gap-2">
                                            <span className={cn(isCancelled && "line-through text-red-600")}>#{order.order_number}</span>
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
                                        isCancelled ? "bg-red-600 text-white border-red-600 animate-pulse font-black" :
                                        isPreparing ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    )}>
                                        {isCancelled ? 'CANCELLED' : order.kitchen_status}
                                    </span>
                                </div>
                            </div>

                            {/* Cancelled Order Notification Banner */}
                            {isCancelled && (
                                <>
                                    <div className="bg-red-600 text-white px-3 py-1.5 flex items-center justify-between text-xs font-black tracking-wide uppercase">
                                        <div className="flex items-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                            <span>Order Cancelled</span>
                                        </div>
                                        <span className="text-[10px] opacity-90">DO NOT PREPARE</span>
                                    </div>
                                    {order.rejection_reason && (
                                        <div className="bg-red-500/10 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 font-semibold border-b border-red-500/20">
                                            Reason: {order.rejection_reason}
                                        </div>
                                    )}
                                </>
                            )}
                            
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

                                                        {!isKotReady && !isCancelled && (
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
                                                    {kot.items?.map((item: any) => {
                                                        if (item.is_voided) {
                                                            return (
                                                                <li key={item.id} className="px-2.5 py-1.5 bg-red-500/10 border-l-4 border-l-red-600 my-0.5">
                                                                    <div className="flex items-start">
                                                                        <span className="font-extrabold text-sm w-7 shrink-0 text-red-600 line-through">{item.quantity} x</span>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-bold text-sm leading-tight text-red-600 line-through">
                                                                                {item.menu_item?.name || item.menu_item_name}
                                                                            </div>
                                                                            <div className="text-[10px] font-bold text-red-600 mt-0.5 flex items-center gap-1.5">
                                                                                <span className="bg-red-600 text-white text-[8px] font-black px-1 rounded uppercase tracking-wider no-underline">VOIDED</span>
                                                                                {item.void_reason && <span className="italic truncate text-muted-foreground font-normal">Reason: {item.void_reason}</span>}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            );
                                                        }

                                                        return (
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
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <ul className="py-1">
                                        {order.items?.map((item: any) => {
                                            if (item.is_voided) {
                                                return (
                                                    <li key={item.id} className="px-2 py-1.5 bg-red-500/10 border-l-4 border-l-red-600 my-0.5">
                                                        <div className="flex items-start">
                                                            <span className="font-bold text-sm w-7 shrink-0 text-red-600 line-through">{item.quantity} x</span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-sm leading-tight text-red-600 line-through">
                                                                    {item.menu_item?.name}
                                                                </div>
                                                                <div className="text-[10px] font-bold text-red-600 mt-0.5 flex items-center gap-1.5">
                                                                    <span className="bg-red-600 text-white text-[8px] font-black px-1 rounded uppercase tracking-wider">VOIDED</span>
                                                                    {item.void_reason && <span className="italic truncate text-muted-foreground font-normal">Reason: {item.void_reason}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            }

                                            return (
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
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                            
                            {/* Card Footer: Overall Order Bump Controls */}
                            <div className="p-2 bg-muted/20 border-t mt-auto flex gap-2">
                                {isCancelled ? (
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        className="w-full bg-red-600 hover:bg-red-700 text-white h-9 text-xs font-bold shadow-sm"
                                        onClick={() => {
                                            setLocalOrders(prev => prev.filter(o => o.id !== order.id));
                                            router.post(`/menu-pos/kds/${order.id}/dismiss`, {}, { preserveScroll: true });
                                        }}
                                    >
                                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                        Acknowledge & Clear Ticket
                                    </Button>
                                ) : isPending ? (
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
