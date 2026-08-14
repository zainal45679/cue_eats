import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Label } from '@/components/shadcn/ui/label';
import { Input } from '@/components/shadcn/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { useForm } from '@inertiajs/react';
import { ShoppingBag, CreditCard, Banknote } from 'lucide-react';

import { useEffect } from 'react';

interface CheckoutDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    cart: any[];
    subtotal: number;
    orderId?: string;
    tableId?: string;
    waiterId?: string;
    pax?: string;
    onSuccess: () => void;
}

export function CheckoutDialog({ isOpen, setIsOpen, cart, subtotal, orderId, tableId, waiterId, pax, onSuccess }: CheckoutDialogProps) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        action: 'settle',
        order_id: orderId || '',
        dining_table_id: tableId || '',
        waiter_id: waiterId || '',
        pax: pax || '',
        customer_name: '',
        order_type: tableId ? 'Dine-in' : 'Takeaway',
        payment_method: 'Cash',
        cart: [],
    });

    // Update form data when props change, as useForm only initializes once on mount
    useEffect(() => {
        setData(currentData => ({
            ...currentData,
            order_id: orderId || '',
            dining_table_id: tableId || '',
            waiter_id: waiterId || '',
            pax: pax || '',
            order_type: tableId ? 'Dine-in' : 'Takeaway',
        }));
    }, [orderId, tableId, waiterId, pax]);

    transform((currentData) => ({
        ...currentData,
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

    // Quick cash logic
    const handleQuickCash = (amount: number) => {
        setData('payment_method', 'Cash');
        // If there was a tendered amount field we would fill it here
    };

    const handleCheckout = () => {
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
                        <div className="space-y-2 pt-2 border-t">
                            <Label className="text-muted-foreground">Quick Cash</Label>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => handleQuickCash(10)}>$10</Button>
                                <Button type="button" variant="outline" className="flex-1" onClick={() => handleQuickCash(20)}>$20</Button>
                                <Button type="button" variant="outline" className="flex-1" onClick={() => handleQuickCash(50)}>$50</Button>
                                <Button type="button" variant="outline" className="flex-1" onClick={() => handleQuickCash(subtotal)}>Exact</Button>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-muted p-4 rounded-lg mt-2">
                        <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Tax</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2">
                            <span>Total Due</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleCheckout} disabled={processing || cart.length === 0} className="w-full sm:w-auto">
                        <CreditCard className="w-4 h-4 mr-2" /> Pay ${subtotal.toFixed(2)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
