import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';

export default function PosTerminal({ categories }: { categories: any[] }) {
    const [cart, setCart] = useState<any[]>([]);

    const addToCart = (item: any) => {
        setCart([...cart, { ...item, quantity: 1, cart_id: Date.now() }]);
    };

    const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

    return (
        <AppLayout>
            <Head title="POS Terminal" />
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Left Side: Menu */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {categories.map(category => (
                        <div key={category.id} className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {category.items?.map((item: any) => (
                                    <Card 
                                        key={item.id} 
                                        className="cursor-pointer hover:border-primary transition-colors"
                                        onClick={() => addToCart(item)}
                                    >
                                        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-muted-foreground mt-2">${item.price}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Right Side: Cart */}
                <div className="w-96 border-l bg-muted/20 flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold">Current Order</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <p className="text-muted-foreground text-center mt-10">Cart is empty</p>
                        ) : (
                            cart.map(item => (
                                <div key={item.cart_id} className="flex justify-between items-center bg-background p-3 rounded shadow-sm">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">${item.price}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 border-t bg-background">
                        <div className="flex justify-between mb-4">
                            <span className="font-medium text-lg">Total</span>
                            <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
                        </div>
                        <Button className="w-full h-12 text-lg">Checkout</Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
