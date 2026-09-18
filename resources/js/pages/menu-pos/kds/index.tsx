import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Badge } from '@/components/shadcn/ui/badge';
import { 
    Clock, 
    CheckCircle, 
    ChefHat, 
    XCircle, 
    AlertTriangle, 
    AlertCircle,
    Utensils, 
    ShoppingBag, 
    Bike, 
    Flame, 
    Volume2, 
    VolumeX, 
    Maximize2, 
    Minimize2,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadcn/ui/dialog';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { XPage } from '@/components/x/page/XPage';

export default function KdsScreen({ orders, locationId }: { orders: any[], locationId: string }) {
    const { auth } = usePage<any>().props;
    const allLocations = auth?.all_business_locations || [];
    const [localOrders, setLocalOrders] = useState<any[]>(orders);
    const [now, setNow] = useState(new Date());
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'preparing'>('all');
    const [rejectOrder, setRejectOrder] = useState<any | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [previousOrderIds, setPreviousOrderIds] = useState<Set<string>>(new Set(orders.map(o => o.id.toString())));
    const [isSoundReady, setIsSoundReady] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (typeof document === 'undefined') return;
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        setLocalOrders(orders);
    }, [orders]);

    const validOrders = useMemo(() => {
        return localOrders.filter(order => 
            order.status !== 'draft' && 
            ((order.items && order.items.length > 0) || (order.kots && order.kots.length > 0))
        );
    }, [localOrders]);
    
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

    // Live 1-second clock ticker for precise MM:SS elapsed times
    useEffect(() => {
        const timerInterval = setInterval(() => setNow(new Date()), 1000);
        
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

            const subscribeToLocation = (locId: string) => {
                const locChannel = window.Echo.private(`orders.${locId}`);
                locChannel.listen('.App\\Events\\OrderCreated', handleOrderCreated);
                locChannel.listen('.App\\Events\\OrderStatusUpdated', handleOrderStatusUpdated);
                channels.push({ name: `orders.${locId}`, instance: locChannel });
            };

            if (locationId) {
                subscribeToLocation(locationId);
            } else if (allLocations && allLocations.length > 0) {
                allLocations.forEach((loc: any) => subscribeToLocation(loc.id));
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
    }, [locationId, allLocations]);

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

    const updateKotStatus = (kotId: string, status: string) => {
        router.post(`/menu-pos/kds/kot/${kotId}/status`, { status }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                router.reload({ only: ['orders'], preserveScroll: true, preserveState: true });
            }
        });
    };

    let showNav = false;
    if (typeof window !== 'undefined') {
        showNav = new URLSearchParams(window.location.search).get('layout') === 'dashboard';
    }

    const pendingCount = validOrders.filter(o => o.kitchen_status === 'pending' || !o.kitchen_status).length;
    const preparingCount = validOrders.filter(o => o.kitchen_status === 'preparing').length;

    const displayedOrders = useMemo(() => {
        if (activeFilter === 'pending') {
            return validOrders.filter(o => o.kitchen_status === 'pending' || !o.kitchen_status);
        }
        if (activeFilter === 'preparing') {
            return validOrders.filter(o => o.kitchen_status === 'preparing');
        }
        return validOrders;
    }, [validOrders, activeFilter]);

    const renderItemRow = (item: any, isParentReady = false) => {
        const isVoided = Boolean(item.is_voided);
        const itemName = item.menu_item?.name || item.menu_item_name || 'Unnamed Item';

        if (isVoided) {
            return (
                <li key={item.id} className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                    <div className="flex items-start gap-2.5">
                        <span className="font-mono font-bold text-sm line-through shrink-0 text-rose-600">
                            {item.quantity}×
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm line-through text-rose-700 leading-snug">
                                {itemName}
                            </div>
                            <div className="text-[10px] font-bold mt-0.5 flex items-center gap-1 uppercase tracking-wide text-rose-600">
                                <XCircle className="w-3 h-3 shrink-0" />
                                <span>Voided</span>
                                {item.void_reason && (
                                    <span className="normal-case opacity-90 truncate">— {item.void_reason}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </li>
            );
        }

        return (
            <li 
                key={item.id} 
                className={cn(
                    "p-2 rounded-lg transition-colors border",
                    isParentReady 
                        ? "opacity-50 bg-muted/20 border-border/30" 
                        : "bg-muted/15 hover:bg-muted/30 border-border/50"
                )}
            >
                <div className="flex items-start gap-2.5">
                    {/* Quantity Badge: Clean light-mode badge */}
                    <div className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs font-mono shrink-0",
                        isParentReady 
                            ? "bg-muted text-muted-foreground" 
                            : "bg-muted/80 text-foreground border border-border/60"
                    )}>
                        {item.quantity}×
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className={cn(
                            "font-bold text-sm leading-snug tracking-tight",
                            isParentReady ? "line-through text-muted-foreground" : "text-foreground"
                        )}>
                            {itemName}
                        </div>

                        {/* Modifiers List */}
                        {item.modifiers && item.modifiers.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                {item.modifiers.map((mod: any) => (
                                    <span 
                                        key={mod.id} 
                                        className="inline-flex items-center text-[11px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40"
                                    >
                                        + {mod.modifier?.name || mod.modifier_name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Special Kitchen Cooking Note / Allergies */}
                        {item.notes && (
                            <div className="mt-1.5 flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-medium leading-tight">
                                <FileText className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                                <span>Note: {item.notes}</span>
                            </div>
                        )}
                    </div>
                </div>
            </li>
        );
    };

    const content = (
        <div className="flex flex-col gap-5">
            {/* Top Command Bar */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card border border-border/80 p-3.5 sm:px-4 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <h1 className="text-xl font-black tracking-tight text-foreground">Kitchen Display</h1>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground border border-border/50">
                        Live Feed
                    </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-muted/50 border border-border/60 rounded-xl">
                    {[
                        { id: 'all', label: `All (${validOrders.length})` },
                        { id: 'pending', label: `Pending (${pendingCount})` },
                        { id: 'preparing', label: `Preparing (${preparingCount})` },
                    ].map((tab) => {
                        const isActive = activeFilter === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveFilter(tab.id as any)}
                                className={cn(
                                    "px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer select-none",
                                    isActive
                                        ? "bg-background text-foreground shadow-xs font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    {/* Audio Toggle / Test */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                            "h-8 text-xs font-medium gap-1.5 cursor-pointer rounded-lg",
                            !isSoundReady && "border-amber-400 text-amber-700 bg-amber-50"
                        )}
                        onClick={() => {
                            if (!isSoundReady) setIsSoundReady(true);
                            playKdsBeep();
                        }}
                    >
                        {isSoundReady ? (
                            <>
                                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Sound On</span>
                            </>
                        ) : (
                            <>
                                <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                                <span>Enable Sound</span>
                            </>
                        )}
                    </Button>

                    {/* Fullscreen Button */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs font-medium gap-1.5 cursor-pointer rounded-lg hidden sm:inline-flex"
                        onClick={toggleFullscreen}
                    >
                        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                    </Button>
                </div>
            </header>

            {/* KDS Order Cards Grid */}
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {displayedOrders.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border/80 rounded-2xl bg-card/60">
                        <div className="w-14 h-14 rounded-full bg-muted/80 flex items-center justify-center mb-3">
                            <ChefHat className="w-7 h-7 opacity-40 text-foreground" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-1">
                            {activeFilter === 'all' 
                                ? 'Kitchen All Clear' 
                                : activeFilter === 'pending' 
                                ? 'No Pending Orders' 
                                : 'No Preparing Orders'}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {activeFilter === 'all'
                                ? 'No active tickets. New orders will appear automatically.'
                                : activeFilter === 'pending'
                                ? 'All orders are currently in preparation or finished.'
                                : 'Start preparing a pending ticket to view it here.'}
                        </p>
                    </div>
                )}
                
                {displayedOrders.map((order) => {
                    const orderTime = new Date(order.created_at);
                    const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - orderTime.getTime()) / 1000));
                    const mins = Math.floor(elapsedSeconds / 60);
                    const secs = elapsedSeconds % 60;
                    const formattedTimer = mins > 59 
                        ? `${Math.floor(mins / 60)}h ${mins % 60}m` 
                        : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                    
                    const isCancelled = order.kitchen_status === 'cancelled';
                    const isPreparing = order.kitchen_status === 'preparing';
                    const isPending = order.kitchen_status === 'pending' || !order.kitchen_status;
                    
                    // Urgency thresholds (commercial kitchen benchmark: 8m warning, 15m overdue)
                    const isOverdue = mins >= 15;
                    const isWarning = mins >= 8 && mins < 15;

                    const tableName = order.dining_table?.name || order.diningTable?.name;

                    // Calculate total items accurately
                    const itemsFromOrder = order.items?.reduce((sum: number, item: any) => sum + (item.is_voided ? 0 : (Number(item.quantity) || 1)), 0) || 0;
                    const itemsFromKots = order.kots?.reduce((acc: number, kot: any) => {
                        return acc + (kot.items?.reduce((sum: number, item: any) => sum + (item.is_voided ? 0 : (Number(item.quantity) || 1)), 0) || 0);
                    }, 0) || 0;
                    const totalItemsCount = Math.max(itemsFromOrder, itemsFromKots);

                    const renderDestinationBadge = () => {
                        if (tableName) {
                            return (
                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                                    <Utensils className="w-3 h-3" />
                                    <span>{tableName}</span>
                                </span>
                            );
                        }
                        if (order.order_type?.toLowerCase() === 'takeaway') {
                            return (
                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
                                    <ShoppingBag className="w-3 h-3" />
                                    <span>Takeaway</span>
                                </span>
                            );
                        }
                        if (order.order_type?.toLowerCase() === 'delivery') {
                            return (
                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full">
                                    <Bike className="w-3 h-3" />
                                    <span>Delivery</span>
                                </span>
                            );
                        }
                        return (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-muted text-muted-foreground border border-border/50 px-2 py-0.5 rounded-full uppercase">
                                {order.order_type || 'Order'}
                            </span>
                        );
                    };

                    return (
                        <div 
                            key={order.id} 
                            className={cn(
                                "flex flex-col bg-card border border-border/75 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 min-h-[300px]",
                                isCancelled 
                                    ? "border-rose-200 bg-rose-50/15" 
                                    : isOverdue && isPending 
                                        ? "border-rose-300 ring-1 ring-rose-300/50" 
                                        : isPreparing 
                                            ? "border-blue-300" 
                                            : "border-border/75"
                            )}
                        >
                            {/* Top Urgency Color Strip */}
                            <div className={cn(
                                "h-1.5 w-full shrink-0",
                                isCancelled ? "bg-rose-500" :
                                isOverdue && isPending ? "bg-rose-500" :
                                isPreparing ? "bg-blue-600" :
                                "bg-amber-500"
                            )} />

                            {/* Card Header: Order #, Table, Timer, and Metadata */}
                            <div className="p-3.5 border-b border-border/60 bg-muted/20 flex flex-col gap-2">
                                {/* Row 1: Order #, Destination, and Live Timer */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                        <span className={cn(
                                            "text-lg font-black tracking-tight text-foreground",
                                            isCancelled && "line-through text-rose-600"
                                        )}>
                                            #{order.order_number}
                                        </span>
                                        {renderDestinationBadge()}
                                    </div>

                                    {/* Live Timer Pill */}
                                    <div className={cn(
                                        "flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold tracking-tight shrink-0 font-mono",
                                        isCancelled ? "bg-muted text-muted-foreground line-through" :
                                        isOverdue && isPending ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                        isWarning ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                        "bg-muted/70 text-muted-foreground border border-border/60"
                                    )}>
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{formattedTimer}</span>
                                    </div>
                                </div>

                                {/* Row 2: Ticket Summary & Status Badge */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <span className="font-semibold text-foreground/80">
                                            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                                        </span>
                                        {order.waiter?.name && (
                                            <>
                                                <span>•</span>
                                                <span className="truncate max-w-[120px]">Server: {order.waiter.name}</span>
                                            </>
                                        )}
                                    </div>

                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                                        isCancelled ? "bg-rose-50 text-rose-700 border-rose-200" :
                                        isPreparing ? "bg-blue-50 text-blue-700 border-blue-200" :
                                        "bg-amber-50 text-amber-700 border-amber-200"
                                    )}>
                                        {isCancelled ? 'CANCELLED' : isPreparing ? 'PREPARING' : 'PENDING'}
                                    </span>
                                </div>
                            </div>

                            {/* Cancelled Order Notification Banner */}
                            {isCancelled && (
                                <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-3.5 py-2.5 flex flex-col gap-1 text-xs">
                                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-rose-700">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <span>Order Cancelled — Do Not Prepare</span>
                                    </div>
                                    {order.rejection_reason && (
                                        <p className="text-[11px] opacity-90 pl-5">
                                            Reason: {order.rejection_reason}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Card Body: Unified Ticket Items List */}
                            <div className="flex-1 p-3.5 overflow-y-auto max-h-[380px] custom-scrollbar space-y-3">
                                {order.kots && order.kots.length > 0 ? (
                                    order.kots.map((kot: any) => {
                                        const isKotReady = kot.status === 'ready';
                                        const isKotPreparing = kot.status === 'preparing';

                                        return (
                                            <div key={kot.id} className="pt-2 first:pt-0 space-y-2">
                                                {/* Round Section Divider */}
                                                <div className="flex items-center justify-between text-xs py-1 border-b border-border/40 pb-1.5 gap-2">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="font-bold uppercase tracking-wide text-foreground/80 text-[11px] shrink-0">
                                                            Round #{kot.round_number}
                                                        </span>
                                                        {kot.kot_number && (
                                                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[85px]" title={kot.kot_number}>
                                                                #{kot.kot_number.replace(/^KOT-/, '')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <span className={cn(
                                                            "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border",
                                                            isKotReady ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                            isKotPreparing ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                            "bg-amber-50 text-amber-700 border-amber-200"
                                                        )}>
                                                            {isKotReady ? '✓ PREPARED' : isKotPreparing ? 'PREPARING' : 'NEW'}
                                                        </span>

                                                        {!isKotReady && !isCancelled && (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateKotStatus(kot.id, isKotPreparing ? 'ready' : 'preparing')}
                                                                className="text-[10px] font-semibold px-2 py-0.5 rounded border border-border/70 bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                            >
                                                                {isKotPreparing ? 'Mark Ready' : 'Start Prep'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Round Items */}
                                                <ul className="space-y-1.5">
                                                    {kot.items?.map((item: any) => renderItemRow(item, isKotReady))}
                                                </ul>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <ul className="space-y-1.5">
                                        {order.items?.map((item: any) => renderItemRow(item, false))}
                                    </ul>
                                )}
                            </div>

                            {/* Card Footer: Action Controls */}
                            <div className="p-3 bg-muted/20 border-t border-border/60 mt-auto flex items-center gap-2">
                                {isCancelled ? (
                                    <Button 
                                        variant="destructive" 
                                        size="lg"
                                        className="w-full h-10 text-xs font-bold shadow-xs cursor-pointer rounded-xl"
                                        onClick={() => {
                                            setLocalOrders(prev => prev.filter(o => o.id !== order.id));
                                            router.post(`/menu-pos/kds/${order.id}/dismiss`, {}, { preserveScroll: true });
                                        }}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1.5" />
                                        Acknowledge & Clear Ticket
                                    </Button>
                                ) : isPending ? (
                                    <>
                                        <Button 
                                            variant="outline" 
                                            size="lg"
                                            className="h-10 px-3.5 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 cursor-pointer transition-colors shadow-2xs rounded-xl"
                                            onClick={() => setRejectOrder(order)}
                                        >
                                            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                                            Reject
                                        </Button>
                                        <Button 
                                            size="lg"
                                            className="h-10 flex-1 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer transition-colors rounded-xl"
                                            onClick={() => updateStatus(order.id, 'preparing')}
                                        >
                                            <Flame className="w-4 h-4 mr-1.5" />
                                            Start Preparing
                                        </Button>
                                    </>
                                ) : (
                                    <Button 
                                        size="lg"
                                        className="w-full h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-colors rounded-xl"
                                        onClick={() => updateStatus(order.id, 'ready')}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1.5" />
                                        Mark Order Ready
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* Reject Order Dialog */}
            <Dialog open={Boolean(rejectOrder)} onOpenChange={(open) => !open && setRejectOrder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Order #{rejectOrder?.order_number}</DialogTitle>
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
        </div>
    );

    return showNav ? (
        <XPage title="Kitchen Display System">{content}</XPage>
    ) : (
        <div className="min-h-screen overflow-y-auto bg-muted/10 p-4 md:p-6">
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
