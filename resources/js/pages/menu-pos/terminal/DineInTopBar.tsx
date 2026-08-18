import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { Input } from '@/components/shadcn/ui/input';
import { Users, UserCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';
import { router } from '@inertiajs/react';

export function DineInTopBar({ table, waiters, waiterId, setWaiterId, pax, setPax, activeOrder, isWaiter }: any) {
    if (!table) return null;

    const currentWaiterName = waiters?.find((w: any) => w.id === waiterId)?.name || 'Unknown Waiter';

    const handleBackClick = () => {
        router.get('/menu-pos/tables');
    };

    return (
        <div className="flex items-center gap-4 p-3 bg-card border-b shadow-sm w-full shrink-0">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-muted" 
                onClick={handleBackClick}
                title="Back to Tables"
            >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>

            <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full font-bold">
                {table.name}
            </div>

            {activeOrder && activeOrder.status === 'draft' && (
                <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -ml-2 text-xs"
                    onClick={() => {
                        if (window.confirm("Release this table? It will be cleared and made available to others.")) {
                            router.post('/menu-pos/terminal/checkout', {
                                action: 'cancel_draft',
                                order_id: activeOrder.id,
                                order_type: 'Dine-in'
                            });
                        }
                    }}
                >
                    Release
                </Button>
            )}

            {!activeOrder && (
                <Button 
                    variant="default" 
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white -ml-2 text-xs h-7 px-3 rounded-full font-semibold shadow-sm"
                    onClick={() => {
                        router.post('/menu-pos/terminal/occupy-table', {
                            table_id: table.id
                        });
                    }}
                >
                    Occupy Table
                </Button>
            )}

            <div className="mx-2 h-6 w-px bg-border"></div>
            
            <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                {isWaiter ? (
                    <div className="flex items-center h-8 px-3 text-sm font-medium bg-muted/50 rounded-md text-foreground">
                        {currentWaiterName}
                    </div>
                ) : (
                    <Select value={waiterId} onValueChange={setWaiterId}>
                        <SelectTrigger className="w-[180px] h-8 text-sm bg-muted/50 border-transparent">
                            <SelectValue placeholder="Assign Waiter" />
                        </SelectTrigger>
                        <SelectContent>
                            {waiters?.map((w: any) => (
                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Input 
                    type="number" 
                    min={1} 
                    className="w-20 h-8 text-sm bg-muted/50 border-transparent" 
                    value={pax} 
                    onChange={e => setPax(e.target.value)} 
                    placeholder="Pax"
                />
            </div>

            {activeOrder && activeOrder.status === 'draft' && (
                <div className="ml-auto">
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-8 rounded-full px-4 text-xs font-semibold"
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
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Cancel / Free Table
                    </Button>
                </div>
            )}
        </div>
    );
}
