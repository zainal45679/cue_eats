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

export default function KdsScreen({ orders }: { orders: any[] }) {
    const [now, setNow] = useState(new Date());
    const [rejectOrder, setRejectOrder] = useState<any | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [previousOrderIds, setPreviousOrderIds] = useState<Set<string>>(new Set(orders.map(o => o.id.toString())));

    const playKdsBeep = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const audioCtx = new AudioContextClass();
            
            const playBuzzer = (startTime: number) => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                // Sawtooth is rich in harmonics and extremely loud/piercing
                oscillator.type = 'sawtooth';
                
                // 2500Hz is right in the peak sensitivity range of human hearing
                oscillator.frequency.setValueAtTime(2500, startTime);
                
                // Sustained loud blast, very fast attack and release
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
                gainNode.gain.setValueAtTime(0.5, startTime + 0.3);
                gainNode.gain.linearRampToValueAtTime(0, startTime + 0.35);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.35);
            };
            
            const t = audioCtx.currentTime;
            
            // 3 rapid, loud bursts simulating a commercial kitchen printer buzzer
            playBuzzer(t);
            playBuzzer(t + 0.5);
            playBuzzer(t + 1.0);
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

    // Update timers every minute & refresh data every 3s for instant updates
    useEffect(() => {
        const timerInterval = setInterval(() => setNow(new Date()), 60000);
        const dataInterval = setInterval(() => {
            router.reload({ only: ['orders'], preserveScroll: true, preserveState: true });
        }, 3000);
        return () => {
            clearInterval(timerInterval);
            clearInterval(dataInterval);
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
                    
                    return (
                        <Card key={order.id} className={cn(
                            "flex flex-col shadow-md border-t-4 transition-all hover:shadow-lg",
                            order.kitchen_status === 'preparing' ? "border-t-blue-500" : "border-t-yellow-500",
                            isOverdue && order.kitchen_status === 'pending' && "border-t-red-500 animate-pulse"
                        )}>
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold">{order.order_number}</span>
                                        <Badge variant="secondary" className="w-fit mt-1">{order.order_type}</Badge>
                                    </div>
                                    <Badge variant="outline" className={cn("px-2 py-0.5 text-xs font-semibold capitalize border", getStatusColor(order.kitchen_status))}>
                                        {order.kitchen_status}
                                    </Badge>
                                </div>
                                <div className="flex items-center text-xs font-medium mt-1">
                                    <Clock className={cn("w-3.5 h-3.5 mr-1", isOverdue ? "text-red-500" : "text-muted-foreground")} />
                                    <span className={cn(isOverdue && "text-red-500 font-bold")}>
                                        {formatDistanceToNow(orderTime, { addSuffix: true })}
                                    </span>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="flex-1 p-0 overflow-y-auto max-h-[300px]">
                                <ul className="divide-y">
                                    {order.items?.map((item: any) => (
                                        <li key={item.id} className="p-3 hover:bg-muted/30 transition-colors">
                                            <div className="flex gap-3">
                                                <div className="font-bold text-lg min-w-[1.5rem]">{item.quantity}x</div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-[15px] leading-tight mb-0.5">{item.menu_item?.name}</div>
                                                    {item.modifiers && item.modifiers.length > 0 && (
                                                        <div className="mt-1 space-y-0.5">
                                                            {item.modifiers.map((mod: any) => (
                                                                <div key={mod.id} className="text-[12px] text-muted-foreground flex items-center">
                                                                    <span className="text-primary/70 mr-1">+</span> 
                                                                    {mod.modifier?.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.notes && (
                                                        <div className="mt-1.5 p-1.5 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-[12px] font-medium rounded-md border border-yellow-500/20 italic">
                                                            Note: {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            
                            <CardFooter className="p-3 pt-0 border-t mt-auto bg-muted/10 grid grid-cols-2 gap-2">
                                {order.kitchen_status === 'pending' ? (
                                    <>
                                        <Button 
                                            variant="outline" 
                                            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                            onClick={() => setRejectOrder(order)}
                                        >
                                            <XCircle className="w-4 h-4 mr-1.5" /> Reject
                                        </Button>
                                        <Button 
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => updateStatus(order.id, 'preparing')}
                                        >
                                            <ChefHat className="w-4 h-4 mr-1.5" /> Prep
                                        </Button>
                                    </>
                                ) : (
                                    <Button 
                                        className="col-span-2 w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                                        onClick={() => updateStatus(order.id, 'ready')}
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" /> Mark Ready
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
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
