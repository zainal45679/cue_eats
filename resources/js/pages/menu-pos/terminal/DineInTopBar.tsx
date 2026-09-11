import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { Input } from '@/components/shadcn/ui/input';
import { Users, UserCircle, XCircle, LayoutGrid, ShoppingBag, ClipboardList, UtensilsCrossed, Search, X } from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import { Badge } from '@/components/shadcn/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/shadcn/ui/scroll-area';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export function DineInTopBar({ 
    table, 
    waiters, 
    waiterId, 
    setWaiterId, 
    pax, 
    setPax, 
    activeOrder, 
    isWaiter,
    searchQuery,
    setSearchQuery,
    categories,
    activeCategoryId,
    setActiveCategoryId,
}: any) {
    const handleBackClick = () => {
        router.get('/menu-pos/tables');
    };

    const currentWaiterName = waiters?.find((w: any) => w.id === waiterId)?.name || 'Unknown Waiter';

    return (
        <div className="bg-background border-b p-3 space-y-3 shadow-sm z-10 shrink-0">
            {/* Row 1: Mode Switch, Table Info, Order Status & Search */}
            <div className="flex items-center justify-between">
                {/* Left Section: Mode Switch / Table Context */}
                <div className="flex items-center gap-2 shrink-0">
                    {!table ? (
                        <div className="inline-flex items-center p-0.5 bg-muted/60 border border-border/60 rounded-lg shadow-2xs">
                            <button
                                type="button"
                                onClick={handleBackClick}
                                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Dine-In</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all bg-background text-foreground shadow-xs cursor-default"
                            >
                                <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                                <span>Takeaway</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="inline-flex items-center p-0.5 bg-muted/60 border border-border/60 rounded-lg shadow-2xs">
                                <button
                                    type="button"
                                    onClick={handleBackClick}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all bg-background text-foreground shadow-xs cursor-pointer"
                                    title="Back to floor tables"
                                >
                                    <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                                    <span>Dine-In</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.get('/menu-pos/terminal')}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                                    title="Switch to Takeaway"
                                >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Takeaway</span>
                                </button>
                            </div>

                            <Badge variant="secondary" className="h-8 px-3 text-xs font-bold rounded-full bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5">
                                <UtensilsCrossed className="w-3.5 h-3.5" />
                                <span>{table.name}</span>
                            </Badge>

                            <div className="flex items-center gap-1 bg-muted/50 border border-border/50 rounded-full px-2.5 h-8">
                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                <input 
                                    type="number" 
                                    min={1} 
                                    className="w-10 text-xs bg-transparent border-none text-center font-semibold text-foreground focus:outline-hidden" 
                                    value={pax} 
                                    onChange={e => setPax(e.target.value)} 
                                    placeholder="Pax"
                                    title="Guest Pax"
                                />
                            </div>

                            <div className="flex items-center gap-1">
                                {isWaiter ? (
                                    <div className="flex items-center h-8 px-3 text-xs font-medium bg-muted/50 rounded-full text-foreground border border-border/50">
                                        <UserCircle className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
                                        {currentWaiterName}
                                    </div>
                                ) : (
                                    <Select value={waiterId} onValueChange={setWaiterId}>
                                        <SelectTrigger className="w-[130px] h-8 text-xs bg-muted/50 border-border/50 rounded-full focus:ring-0">
                                            <SelectValue placeholder="Waiter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {waiters?.map((w: any) => (
                                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {!activeOrder && (
                                <Button 
                                    variant="default" 
                                    size="sm" 
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-3.5 rounded-full font-semibold shadow-xs"
                                    onClick={() => {
                                        router.post('/menu-pos/terminal/occupy-table', {
                                            table_id: table.id
                                        });
                                    }}
                                >
                                    Occupy
                                </Button>
                            )}
                        </>
                    )}

                    {/* Live Orders button right along with the mode toggle */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-2.5 border border-border/50 rounded-lg hover:bg-muted"
                        onClick={() => router.get('/menu-pos/live-orders')}
                    >
                        <ClipboardList className="w-3.5 h-3.5 text-primary" />
                        <span>Live Orders</span>
                    </Button>
                </div>

                {/* Right Section: Status Badges, Release Table & Menu Search */}
                <div className="flex items-center gap-2.5">
                    {activeOrder && (
                        <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="font-mono font-bold text-xs bg-muted/50 h-8 px-2.5 rounded-full border-border/50">
                                {activeOrder.order_number}
                            </Badge>
                            <Badge className={cn(
                                "text-xs h-8 px-3 rounded-full font-medium shadow-2xs",
                                activeOrder.status === 'billed' ? 'bg-amber-500 text-white' :
                                activeOrder.status === 'Completed' ? 'bg-emerald-600 text-white' :
                                'bg-blue-600 text-white'
                            )}>
                                {activeOrder.status === 'billed' ? 'Billed' : activeOrder.status || 'Running'}
                            </Badge>
                        </div>
                    )}

                    {activeOrder && activeOrder.status === 'draft' && (
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8 rounded-full px-3 text-xs font-semibold"
                            onClick={() => {
                                if (window.confirm("Are you sure you want to cancel and free this table?")) {
                                    router.post('/menu-pos/terminal/checkout', {
                                        action: 'cancel_draft',
                                        order_id: activeOrder.id,
                                        order_type: 'Dine-in'
                                    });
                                }
                            }}
                        >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Release
                        </Button>
                    )}

                    {/* Search bar on the right side */}
                    <div className="relative w-64 sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input 
                            id="pos-menu-search"
                            placeholder="Search menu items... (/)" 
                            className="pl-8 pr-8 h-8 bg-muted/50 border-border/50 focus-visible:bg-background focus-visible:border-primary rounded-full text-xs w-full"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                                type="button"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 2: Category Navigation Pills */}
            <div className="flex items-center justify-between w-full mb-1">
                <ScrollArea className="flex-1 whitespace-nowrap">
                    <div className="flex space-x-2 pb-1">
                        <Button 
                            type="button"
                            variant={activeCategoryId === 'all' ? 'default' : 'outline'}
                            className={cn(
                                "rounded-full px-5 h-8 text-xs shrink-0 font-medium transition-all cursor-pointer",
                                activeCategoryId === 'all'
                                    ? "bg-primary text-primary-foreground shadow-xs border-transparent hover:bg-primary/90"
                                    : "bg-muted/50 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                            onClick={() => setActiveCategoryId('all')}
                        >
                            All Items
                        </Button>
                        {categories?.map((cat: any) => (
                            <Button 
                                key={cat.id}
                                type="button"
                                variant={activeCategoryId === cat.id ? 'default' : 'outline'}
                                className={cn(
                                    "rounded-full px-5 h-8 text-xs shrink-0 font-medium transition-all cursor-pointer",
                                    activeCategoryId === cat.id
                                        ? "bg-primary text-primary-foreground shadow-xs border-transparent hover:bg-primary/90"
                                        : "bg-muted/50 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                                onClick={() => setActiveCategoryId(cat.id)}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="hidden" />
                </ScrollArea>
            </div>
        </div>
    );
}
