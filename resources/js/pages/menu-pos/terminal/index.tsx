import { Head, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

import { Card, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { ScrollArea, ScrollBar } from '@/components/shadcn/ui/scroll-area';
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModifierSelectionDialog } from './components/ModifierSelectionDialog';
import { CheckoutDialog } from './components/CheckoutDialog';
import { PrintReceipt } from './components/PrintReceipt';

export default function PosTerminal({ categories, inventoryBalances }: { categories: any[], inventoryBalances: Record<string, number> }) {
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');
    
    // Support auto-print from flash
    const { flash } = usePage().props as any;
    const [orderToPrint, setOrderToPrint] = useState<any>(flash?.recent_order || null);

    // If a new flash order comes in (e.g. from a fresh checkout), update orderToPrint
    useEffect(() => {
        if (flash?.recent_order) {
            setOrderToPrint(flash.recent_order);
        }
    }, [flash?.recent_order]);
    
    const [selectedItemForMod, setSelectedItemForMod] = useState<any | null>(null);
    const [isModModalOpen, setIsModModalOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Flatten all items for search or "All" category view
    const allItems = useMemo(() => {
        return categories.flatMap(c => c.items || []);
    }, [categories]);

    // Filter items based on active category and search
    const filteredItems = useMemo(() => {
        let items = activeCategoryId === 'all' 
            ? allItems 
            : categories.find(c => c.id === activeCategoryId)?.items || [];
            
        if (searchQuery) {
            items = items.filter((item: any) => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        let result = items.filter((item: any) => item.is_active !== 0 && item.is_active !== false);
        
        // Push out-of-stock items to the bottom
        return result.sort((a: any, b: any) => {
            const aAvail = a.is_available === 1 || a.is_available === true;
            const bAvail = b.is_available === 1 || b.is_available === true;
            if (aAvail === bAvail) return 0;
            return aAvail ? -1 : 1;
        });
    }, [categories, activeCategoryId, searchQuery, allItems]);

    // Format modifier state into a consistent string key for cart grouping
    const getModifierHash = (modifiers: Record<string, any[]>) => {
        if (!modifiers || Object.keys(modifiers).length === 0) return 'no-mods';
        // sort group IDs and mod IDs for consistent hashing
        return Object.keys(modifiers).sort().map(gId => {
            const mods = modifiers[gId as any].map((m: any) => m.id).sort();
            return `${gId}:${mods.join(',')}`;
        }).join('|');
    };

    const checkInventory = (item: any, selectedModifiers: Record<string, any[]>, requestedDelta: number = 1): boolean => {
        const requiredIngredients: Record<string, number> = {};
        
        // Add current cart usage
        cart.forEach(cartItem => {
            cartItem.recipe_items?.forEach((recipe: any) => {
                requiredIngredients[recipe.ingredient_id] = (requiredIngredients[recipe.ingredient_id] || 0) + (parseFloat(recipe.quantity) * cartItem.quantity);
            });
            Object.values(cartItem.selectedModifiers || {}).flat().forEach((mod: any) => {
                mod.recipe_items?.forEach((recipe: any) => {
                    requiredIngredients[recipe.ingredient_id] = (requiredIngredients[recipe.ingredient_id] || 0) + (parseFloat(recipe.quantity) * cartItem.quantity);
                });
            });
        });

        // Add the new delta
        item.recipe_items?.forEach((recipe: any) => {
            requiredIngredients[recipe.ingredient_id] = (requiredIngredients[recipe.ingredient_id] || 0) + (parseFloat(recipe.quantity) * requestedDelta);
        });
        Object.values(selectedModifiers || {}).flat().forEach((mod: any) => {
            mod.recipe_items?.forEach((recipe: any) => {
                requiredIngredients[recipe.ingredient_id] = (requiredIngredients[recipe.ingredient_id] || 0) + (parseFloat(recipe.quantity) * requestedDelta);
            });
        });

        // Validate against inventoryBalances
        for (const [ingredientId, requiredQty] of Object.entries(requiredIngredients)) {
            const available = inventoryBalances[ingredientId] || 0;
            if (requiredQty > available) {
                return false;
            }
        }
        return true;
    };

    const handleItemClick = (item: any) => {
        if (!item.is_available && item.is_available !== 1) return;
        
        if (item.modifier_groups && item.modifier_groups.length > 0) {
            setSelectedItemForMod(item);
            setIsModModalOpen(true);
        } else {
            addToCart(item, {});
        }
    };

    const addToCart = (item: any, selectedModifiers: Record<string, any[]>) => {
        if (!checkInventory(item, selectedModifiers, 1)) {
            alert('Insufficient stock for this item or its modifiers.');
            return;
        }

        const hash = getModifierHash(selectedModifiers);
        const existingItemIndex = cart.findIndex(c => c.id === item.id && c.modHash === hash);
        
        // Calculate item base price + modifiers
        let itemUnitPrice = parseFloat(item.price);
        Object.values(selectedModifiers).flat().forEach((mod: any) => {
            itemUnitPrice += parseFloat(mod.price_adjustment);
        });

        if (existingItemIndex >= 0) {
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, { 
                ...item, 
                cart_id: Date.now() + Math.random(), 
                quantity: 1, 
                modHash: hash,
                selectedModifiers,
                unitPriceWithMods: itemUnitPrice
            }]);
        }
    };

    const updateQuantity = (cartId: number, delta: number) => {
        setCart(prev => prev.map(cartItem => {
            if (cartItem.cart_id === cartId) {
                if (delta > 0) {
                    if (!checkInventory(cartItem, cartItem.selectedModifiers, delta)) {
                        alert('Insufficient stock to increase quantity.');
                        return cartItem;
                    }
                }
                const newQuantity = Math.max(0, cartItem.quantity + delta);
                return { ...cartItem, quantity: newQuantity };
            }
            return cartItem;
        }).filter(item => item.quantity > 0));
    };

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((sum, item) => sum + (item.unitPriceWithMods * item.quantity), 0);

    return (
        <>
            <Head title="POS Terminal" />
            <div className="flex h-[calc(100vh-80px)] w-full bg-muted/10 overflow-hidden rounded-xl border border-border/40 shadow-sm print:hidden">
                {/* Left Side: Main POS Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Top Bar: Search & Categories */}
                    <div className="bg-background border-b p-3 space-y-3 shadow-sm z-10 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search menu items..." 
                                className="pl-9 h-10 bg-muted/50 border-transparent focus-visible:border-primary"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex space-x-2 pb-1">
                                <Button 
                                    variant={activeCategoryId === 'all' ? 'default' : 'secondary'}
                                    className="rounded-full px-5 h-8 text-xs"
                                    onClick={() => setActiveCategoryId('all')}
                                >
                                    All Items
                                </Button>
                                {categories.map(cat => (
                                    <Button 
                                        key={cat.id}
                                        variant={activeCategoryId === cat.id ? 'default' : 'secondary'}
                                        className="rounded-full px-5 h-8 text-xs"
                                        onClick={() => setActiveCategoryId(cat.id)}
                                    >
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="hidden" />
                        </ScrollArea>
                    </div>

                    {/* Item Grid */}
                    <ScrollArea className="flex-1 p-3 min-h-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredItems.map((item: any) => (
                                <Card 
                                    key={item.id} 
                                    className={cn(
                                        "p-0 gap-0 flex flex-col overflow-hidden border-border/40 transition-all group duration-300 rounded-xl bg-card",
                                        (item.is_available || item.is_available === 1) 
                                            ? "cursor-pointer hover:border-primary/60 hover:shadow-lg" 
                                            : "opacity-75 cursor-not-allowed"
                                    )}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="w-full aspect-[4/3] relative overflow-hidden bg-muted shrink-0">
                                        {item.image_url ? (
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name}
                                                className={cn(
                                                    "absolute inset-0 w-full h-full object-cover transition-transform duration-500", 
                                                    (item.is_available || item.is_available === 1) ? "group-hover:scale-110" : "grayscale-[0.5]"
                                                )}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-medium">
                                                No Image
                                            </div>
                                        )}
                                        {(!item.is_available && item.is_available !== 1) && (
                                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[3px] flex items-center justify-center z-10">
                                                <div className="bg-white/90 dark:bg-black/90 text-black dark:text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                                                    Sold Out
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex flex-col flex-1 bg-card border-t border-border/10">
                                        <h3 className="font-semibold text-[13px] leading-tight line-clamp-2 text-card-foreground" title={item.name}>{item.name}</h3>
                                        <p className="text-primary font-bold text-[14px] mt-1">${parseFloat(item.price).toFixed(2)}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        {filteredItems.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-20">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-xl font-medium">No items found</p>
                                <p>Try adjusting your search or category filter</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
                
                
                {/* Right Side: Enhanced Cart */}
                {cart.length > 0 && (
                    <div className="w-[320px] bg-card border-l shadow-xl flex flex-col z-20">
                    <div className="p-4 border-b flex justify-between items-center bg-card">
                        <div className="flex items-center gap-2 font-bold text-lg text-card-foreground">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                            <h2>Current Order</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2" onClick={clearCart} disabled={cart.length === 0}>
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
                        </Button>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4 bg-muted/20 min-h-0">
                        <div className="space-y-3">
                            {cart.map(item => (
                                    <div key={item.cart_id} className="bg-background p-3 rounded-lg border border-border/40 shadow-sm text-sm">
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium leading-tight truncate">{item.name}</p>
                                                {Object.values(item.selectedModifiers || {}).flat().map((mod: any, idx) => (
                                                    <p key={idx} className="text-[11px] text-muted-foreground flex justify-between mt-0.5">
                                                        <span className="truncate pr-1">+ {mod.name}</span>
                                                        {parseFloat(mod.price_adjustment) > 0 && <span>${parseFloat(mod.price_adjustment).toFixed(2)}</span>}
                                                    </p>
                                                ))}
                                            </div>
                                            <p className="font-semibold whitespace-nowrap">${(item.unitPriceWithMods * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-muted-foreground">${item.unitPriceWithMods.toFixed(2)} / ea</span>
                                            <div className="flex items-center bg-muted/50 border rounded-md overflow-hidden h-7">
                                                <button className="px-2.5 h-full hover:bg-muted transition-colors flex items-center justify-center" onClick={() => updateQuantity(item.cart_id, -1)}>
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="px-3 h-full flex items-center justify-center font-medium text-xs min-w-[2.5rem] border-x bg-background">{item.quantity}</span>
                                                <button className="px-2.5 h-full hover:bg-muted transition-colors text-primary flex items-center justify-center" onClick={() => updateQuantity(item.cart_id, 1)}>
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </ScrollArea>
                    
                    <div className="p-5 border-t bg-card">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-muted-foreground text-sm font-medium">Subtotal</span>
                            <span className="font-bold text-xl">${subtotal.toFixed(2)}</span>
                        </div>
                        <Button 
                            className="w-full h-12 text-base font-bold rounded-lg shadow-sm" 
                            size="lg"
                            disabled={cart.length === 0}
                            onClick={() => setIsCheckoutOpen(true)}
                        >
                            Checkout
                        </Button>
                    </div>
                    </div>
                )}
            </div>

            {selectedItemForMod && (
                <ModifierSelectionDialog
                    item={selectedItemForMod}
                    isOpen={isModModalOpen}
                    setIsOpen={setIsModModalOpen}
                    onAddToCart={addToCart}
                />
            )}

            <CheckoutDialog 
                isOpen={isCheckoutOpen}
                setIsOpen={setIsCheckoutOpen}
                cart={cart}
                subtotal={subtotal}
                onSuccess={() => {
                    clearCart();
                    // Let the page reload or handle the flash to print
                }}
            />

            {/* Hidden Print Component */}
            {orderToPrint && (
                <PrintReceipt 
                    order={orderToPrint} 
                    onPrinted={() => setOrderToPrint(null)} 
                />
            )}
        </>
    );
}
