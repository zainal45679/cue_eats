import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { useForm } from '@inertiajs/react';
import { ShoppingBag, CreditCard, Banknote, AlertCircle } from 'lucide-react';
import { StockWarningDialog } from './StockWarningDialog';

interface CheckoutDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    cart: any[];
    subtotal: number;
    orderId?: string;
    tableId?: string;
    waiterId?: string;
    pax?: number;
    onSuccess: () => void;
}

export function CheckoutDialog({ isOpen, setIsOpen, cart, subtotal, orderId, tableId, waiterId, pax, onSuccess }: CheckoutDialogProps) {
    const [stockWarningOpen, setStockWarningOpen] = useState(false);
    const [outOfStockItems, setOutOfStockItems] = useState<any[]>([]);
    const [checkingStock, setCheckingStock] = useState(false);

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        action: 'settle',
        order_id: orderId || '',
        dining_table_id: tableId || '',
        waiter_id: waiterId || '',
        pax: pax || 1,
        customer_name: '',
        order_type: tableId ? 'Dine-in' : 'Takeaway',
        payment_method: 'Cash',
        tendered_amount: '' as string | number,
        allow_override: false,
        cart: [],
    });

    useEffect(() => {
        if (isOpen) {
            setData(prev => ({
                ...prev,
                action: 'settle',
                order_id: orderId || '',
                dining_table_id: tableId || '',
                waiter_id: waiterId || '',
                pax: pax || 1,
                order_type: tableId ? 'Dine-in' : 'Takeaway',
                allow_override: false,
                tendered_amount: subtotal > 0 ? String(subtotal) : ''
            }));
        }
    }, [isOpen, subtotal, orderId, tableId, waiterId, pax]);

    const tenderedVal = parseFloat(String(data.tendered_amount)) || 0;
    const changeVal = Math.max(0, tenderedVal - subtotal);
    const isInsufficient = data.payment_method === 'Cash' && tenderedVal < subtotal;

    transform((currentData) => ({
        ...currentData,
        action: 'settle',
        order_id: orderId || currentData.order_id || null,
        dining_table_id: tableId || currentData.dining_table_id || null,
        waiter_id: waiterId || currentData.waiter_id || null,
        pax: pax || currentData.pax || null,
        allow_override: currentData.allow_override || false,
        tendered_amount: currentData.payment_method === 'Cash' ? (parseFloat(String(currentData.tendered_amount)) || 0) : 0,
        change_amount: currentData.payment_method === 'Cash' ? (Math.max(0, (parseFloat(String(currentData.tendered_amount)) || 0) - subtotal)) : 0,
        cart: cart.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            price: item.price,
            notes: '',
            modifiers: item.selectedModifiers ? Object.values(item.selectedModifiers).flat().map((mod: any) => ({
                modifier_id: mod.id,
                price_adjustment: parseFloat(mod.price_adjustment ?? mod.price ?? 0)
            })) : []
        }))
    }));

    const handleQuickCash = (amount: number) => {
        setData(prev => ({
            ...prev,
            payment_method: 'Cash',
            tendered_amount: String(amount)
        }));
    };

    const executeCheckout = (override: boolean) => {
        setData('allow_override', override);
        post('/menu-pos/terminal/checkout', {
            onSuccess: () => {
                setIsOpen(false);
                reset();
                onSuccess();
            },
        });
    };

    const handleCheckout = async () => {
        if (isInsufficient) return;

        if (cart.length > 0 && !data.allow_override) {
            setCheckingStock(true);
            try {
                const formattedCart = cart.map(item => ({
                    menu_item_id: item.id,
                    quantity: item.quantity,
                    modifiers: item.selectedModifiers ? Object.values(item.selectedModifiers).flat().map((mod: any) => ({
                        modifier_id: mod.id
                    })) : []
                }));

                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                const response = await fetch('/menu-pos/terminal/check-stock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({ cart: formattedCart }),
                });
                const resData = await response.json();
                setCheckingStock(false);

                if (resData && resData.is_available === false) {
                    setOutOfStockItems(resData.out_of_stock_items || []);
                    setStockWarningOpen(true);
                    return;
                }
            } catch (e) {
                setCheckingStock(false);
            }
        }

        executeCheckout(data.allow_override);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6" /> Checkout
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {errors && Object.keys(errors).length > 0 && (
                            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-4">
                                <strong>Validation Error:</strong> 
                                <ul className="list-disc pl-5 mt-1">
                                    {Object.values(errors).map((err, idx) => (
                                        <li key={idx}>{err as string}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Customer Name (Optional)</Label>
                            <Input 
                                value={data.customer_name} 
                                onChange={e => setData('customer_name', e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Order Type</Label>
                                <Select value={data.order_type} onValueChange={v => setData('order_type', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dine-in">Dine-in</SelectItem>
                                        <SelectItem value="Takeaway">Takeaway</SelectItem>
                                        <SelectItem value="Delivery">Delivery</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select value={data.payment_method} onValueChange={v => setData('payment_method', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                        <SelectItem value="UPI">UPI / Digital</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {data.payment_method === 'Cash' && (
                            <div className="space-y-3 pt-2 border-t">
                                <div className="space-y-2">
                                    <Label>Cash Tendered ($)</Label>
                                    <Input 
                                        type="number"
                                        step="0.01"
                                        value={data.tendered_amount}
                                        onChange={e => setData('tendered_amount', e.target.value)}
                                        placeholder="0.00"
                                        className="text-lg font-semibold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Quick Cash Presets</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[20, 50, 100].map(amt => (
                                            <Button 
                                                key={amt}
                                                type="button"
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleQuickCash(amt)}
                                                className="font-bold"
                                            >
                                                ${amt}
                                            </Button>
                                        ))}
                                        <Button 
                                            type="button"
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleQuickCash(subtotal)}
                                            className="font-bold text-xs"
                                        >
                                            Exact (${subtotal.toFixed(2)})
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>Total Due</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>

                            {data.payment_method === 'Cash' && (
                                <>
                                    <div className="flex justify-between text-sm pt-2 border-t">
                                        <span className="text-muted-foreground">Tendered Amount</span>
                                        <span className="font-semibold">${tenderedVal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-base font-bold pt-1">
                                        <span>Change Due</span>
                                        <span className={isInsufficient ? "text-red-500" : "text-emerald-600 text-lg"}>
                                            ${changeVal.toFixed(2)}
                                        </span>
                                    </div>

                                    {isInsufficient && (
                                        <div className="flex items-center gap-2 text-xs font-medium text-red-500 bg-red-500/10 p-2 rounded-md mt-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>Insufficient cash. Short by ${(subtotal - tenderedVal).toFixed(2)}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button 
                            onClick={handleCheckout} 
                            disabled={processing || checkingStock || (cart.length === 0 && !orderId && !data.order_id) || isInsufficient} 
                            className="w-full sm:w-auto"
                        >
                            {data.payment_method === 'Cash' ? (
                                <>
                                    <Banknote className="w-4 h-4 mr-2" /> Complete Cash Payment (${subtotal.toFixed(2)})
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-4 h-4 mr-2" /> Pay ${subtotal.toFixed(2)}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Out of Stock Warning Modal */}
            <StockWarningDialog
                open={stockWarningOpen}
                onOpenChange={setStockWarningOpen}
                outOfStockItems={outOfStockItems}
                onConfirmOverride={() => executeCheckout(true)}
            />
        </>
    );
}
