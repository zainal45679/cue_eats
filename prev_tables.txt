import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Users, ReceiptText, Clock, User, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import { ScrollArea, ScrollBar } from '@/components/shadcn/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function TablesScreen({ zones }: { zones: any[] }) {
    const { auth } = usePage().props as any;
    const currentUserId = auth.user?.id;
    const [activeZone, setActiveZone] = useState(zones.length > 0 ? zones[0].id : null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const activeZoneData = zones.find(z => z.id === activeZone);

    const getTableColorClass = (table: any) => {
        if (!table.active_order) return 'bg-card border-border border-l-4 border-l-green-500 hover:border-l-green-600 text-card-foreground shadow-sm'; 
        if (table.active_order.status === 'billed') return 'bg-card border-border border-l-4 border-l-red-500 text-card-foreground shadow-sm'; 
        return 'bg-card border-border border-l-4 border-l-orange-500 text-card-foreground shadow-sm'; 
    };

    const handleTableClick = (table: any) => {
        router.post('/menu-pos/terminal/open-table', { table_id: table.id });
    };

    const getRunningTime = (createdAt: string) => {
        const start = new Date(createdAt);
        const diffMs = currentTime.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    // Calculate Summary Stats
    let totalTables = 0;
    let available = 0;
    let occupied = 0;
    let billed = 0;

    zones.forEach(zone => {
        zone.tables?.forEach((table: any) => {
            totalTables++;
            if (!table.active_order) available++;
            else if (table.active_order.status === 'billed') billed++;
            else occupied++;
        });
    });

    return (
        <>
            <Head title="Dine-In Tables" />
            <div className="flex h-[calc(100vh-80px)] w-full bg-muted/10 overflow-hidden rounded-xl border border-border/40 shadow-sm print:hidden flex-col">
                
                {/* Top Navigation Header */}
                <div className="bg-background border-b p-3 space-y-3 shadow-sm z-10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => router.visit('/menu-pos')} 
                                className="h-8 px-2 text-muted-foreground"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back
                            </Button>
                            <h1 className="text-lg font-bold tracking-tight">Dine-In Floor</h1>
                        </div>
                        
                        {/* Stats Summary */}
                        <div className="flex items-center gap-4 text-xs font-medium hidden sm:flex bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                <span className="text-muted-foreground">Available: {available}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                                <span className="text-muted-foreground">Running: {occupied}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                <span className="text-muted-foreground">Billed: {billed}</span>
                            </div>
                            <div className="pl-2 ml-2 border-l border-border text-foreground font-bold">
                                Total: {totalTables}
                            </div>
                        </div>
                    </div>

                    {/* Zone Toggles (Matching POS categories) */}
                    {zones.length > 0 && (
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex space-x-2 pb-1">
                                {zones.map(zone => (
                                    <Button 
                                        key={zone.id}
                                        variant={activeZone === zone.id ? 'default' : 'secondary'}
                                        className="rounded-full px-5 h-8 text-xs"
                                        onClick={() => setActiveZone(zone.id)}
                                    >
                                        {zone.name}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="hidden" />
                        </ScrollArea>
                    )}
                </div>

                {/* Main Content Area - Table Grid */}
                <ScrollArea className="flex-1 p-4 min-h-0">
                    {zones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <p className="text-lg font-medium text-foreground">No Dining Zones Found</p>
                            <p className="text-sm mt-1">Please set up your dining zones and tables in the admin panel.</p>
                        </div>
                    ) : activeZoneData ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 pb-8">
                            {activeZoneData.tables?.map((table: any) => {
                                const order = table.active_order;
                                const isAvailable = !order;
                                const isBilled = order?.status === 'billed';
                                const colorClass = getTableColorClass(table);
                                
                                // Lock logic: If an active order exists and current user is not the creator
                                const isLockedByOther = order && order.user_id !== currentUserId;
                                
                                return (
                                    <div 
                                        key={table.id}
                                        onClick={() => !isLockedByOther && handleTableClick(table)}
                                        className={cn(
                                            "relative flex flex-col p-2.5 border rounded-lg transition-all min-h-[96px] group overflow-hidden",
                                            colorClass,
                                            isLockedByOther ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:scale-[1.02]"
                                        )}
                                    >
                                        {isLockedByOther && (
                                            <div className="absolute inset-0 bg-black/5 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                                <Lock className="w-8 h-8 text-foreground/40 mb-1" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Occupied</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-1 relative z-0">
                                            <div className="text-base font-bold leading-none tracking-tight">{table.name}</div>
                                            <div className={cn("flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border", 
                                                isAvailable ? "bg-muted/50 text-muted-foreground border-border/50" : "bg-primary/10 text-primary border-primary/20"
                                            )}>
                                                <Users size={10} /> 
                                                {order?.pax || table.seating_capacity}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col justify-end mt-1">
                                            {order ? (
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        {order.waiter && (
                                                            <div className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                                                                <User size={10} className="text-muted-foreground" />
                                                                <span className="truncate max-w-[70px]">{order.waiter.name}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                                                            <Clock size={10} className="text-muted-foreground" />
                                                            <span>{getRunningTime(order.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[9px] uppercase tracking-wider font-semibold mb-0.5 text-muted-foreground">Total</div>
                                                        <div className="font-bold text-sm leading-none tracking-tight text-foreground">
                                                            ₹{Number(order.grand_total).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                                                    Available
                                                </div>
                                            )}
                                        </div>

                                        {isBilled && (
                                            <div className="absolute top-2 right-2 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-sm"></span>
                                            </div>
                                        )}
                                    </div>
                                );
                        })}
                    </div>
                    ) : null}
                </ScrollArea>
            </div>
        </>
    );
}
