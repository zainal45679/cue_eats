import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { useForm } from '@inertiajs/react';
import { ShoppingBag, CreditCard, Banknote, AlertCircle } from 'lucide-react';

interface CheckoutDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    cart: any[];
    subtotal: number;
    onSuccess: () => void;
}

export function CheckoutDialog({ isOpen, setIsOpen, cart, subtotal, onSuccess }: CheckoutDialogProps) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        customer_name: '',
        order_type: 'Dine-in',
        payment_method: 'Cash',
        tendered_amount: '' as string | number,
        cart: [],
    });

    useEffect(() => {
        if (isOpen) {
            setData(prev => ({
                ...prev,
                tendered_amount: subtotal > 0 ? String(subtotal) : ''
            }));
        }
    }, [isOpen, subtotal]);

    const tenderedVal = parseFloat(String(data.tendered_amount)) || 0;
    const changeVal = Math.max(0, tenderedVal - subtotal);
    const isInsufficient = data.payment_method === 'Cash' && tenderedVal < subtotal;

    transform((currentData) => ({
        ...currentData,
        tendered_amount: currentData.payment_method === 'Cash' ? (parseFloat(String(currentData.tendered_amount)) || 0) : 0,
        change_amount: currentData.payment_method === 'Cash' ? (Math.max(0, (parseFloat(String(currentData.tendered_amount)) || 0) - subtotal)) : 0,
        cart: cart.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            price: item.price,
            notes: '',
            modifiers: item.selectedModifiers ? Object.values(item.selectedModifiers).flat().map((mod: any) => ({
                modifier_id: mod.id,
                price_adjustment: mod.price_adjustment
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

    const handleCheckout = () => {
        if (isInsufficient) return;

        post('/menu-pos/terminal/checkout', {
            onSuccess: () => {
                setIsOpen(false);
                reset();
                onSuccess();
            },
        });
    };

    return (
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
                            <Select value={data.order_type} onValueChange={val => setData('order_type', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
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
                            <Select value={data.payment_method} onValueChange={val => setData('payment_method', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Card">Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {data.payment_method === 'Cash' && (
                        <div className="space-y-4 pt-2 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="tendered-amount-input">Cash Tendered ($)</Label>
                                <Input 
                                    id="tendered-amount-input"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.tendered_amount}
                                    onChange={e => setData('tendered_amount', e.target.value)}
                                    placeholder="0.00"
                                    className={isInsufficient ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Quick Cash Presets</Label>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => handleQuickCash(20)}>$20</Button>
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => handleQuickCash(50)}>$50</Button>
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => handleQuickCash(100)}>$100</Button>
                                    <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => handleQuickCash(subtotal)}>Exact (${subtotal.toFixed(2)})</Button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-muted p-4 rounded-lg mt-2 space-y-2">
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
                        disabled={processing || cart.length === 0 || isInsufficient} 
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
    );
}
