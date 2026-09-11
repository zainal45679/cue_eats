import { Head, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

import { Card, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import { ScrollArea, ScrollBar } from '@/components/shadcn/ui/scroll-area';
import { Search, Plus, Minus, Trash2, ShoppingCart, Utensils, Receipt, CreditCard, Printer, Save, X, Tag, User, Phone, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModifierSelectionDialog } from './components/ModifierSelectionDialog';
import { CheckoutDialog } from './components/CheckoutDialog';
import { PrintReceipt } from './components/PrintReceipt';
import { PrintKOT } from './components/PrintKOT';
import { DineInTopBar } from './DineInTopBar';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function PosTerminal({ categories, inventoryBalances, waiters, table, activeOrder }: { categories: any[], inventoryBalances: Record<string, number>, waiters?: any[], table?: any, activeOrder?: any }) {
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [voidItem, setVoidItem] = useState<any>(null);
    const [voidReason, setVoidReason] = useState('');
    const [isWasted, setIsWasted] = useState(false);
    const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');
    
    // Support auto-print from flash
    const { flash, auth } = usePage().props as any;
    const [orderToPrint, setOrderToPrint] = useState<any>(null);
    const [kotToPrint, setKotToPrint] = useState<any>(null);
    
    const isWaiter = auth?.roles?.includes('waiter');

    // Dine-in states
    const [waiterId, setWaiterId] = useState<string>(activeOrder?.waiter_id || (isWaiter ? auth.user.id : ''));
    const [pax, setPax] = useState<string>(activeOrder?.pax?.toString() || table?.seating_capacity?.toString() || '');

    const triggerKotPrint = (kotData: any) => {
        if (!kotData) return;
        setKotToPrint({ ...kotData, _ts: Date.now() });
    };

    const triggerOrderPrint = (orderData: any) => {
        if (!orderData) return;
        setOrderToPrint({ ...orderData, _ts: Date.now() });
    };

    // If new flash order or KOT comes in, update print state
    useEffect(() => {
        if (flash?.recent_kot) {
            triggerKotPrint(flash.recent_kot);
        }
        if (flash?.recent_order) {
            triggerOrderPrint(flash.recent_order);
        }
    }, [flash?.recent_order, flash?.recent_kot]);
    
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

    const getItemUnitPrice = (item: any, selectedMods?: Record<string, any[]>): number => {
        let base = parseFloat(item.price || 0);
        const modsObj = selectedMods || item.selectedModifiers;
        if (modsObj) {
            const mods = Object.values(modsObj).flat();
            mods.forEach((mod: any) => {
                const adj = parseFloat(mod?.price_adjustment ?? mod?.price ?? 0);
                if (!isNaN(adj)) {
                    base += adj;
                }
            });
        }
        return base;
    };

    const addToCart = (item: any, selectedModifiers: Record<string, any[]>) => {
        if (!checkInventory(item, selectedModifiers, 1)) {
            alert('Insufficient stock for this item or its modifiers.');
            return;
        }

        const hash = getModifierHash(selectedModifiers);
        const existingItemIndex = cart.findIndex(c => c.id === item.id && c.modHash === hash);
        const itemUnitPrice = getItemUnitPrice(item, selectedModifiers);

        if (existingItemIndex >= 0) {
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += 1;
            newCart[existingItemIndex].unitPriceWithMods = itemUnitPrice;
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

    const clearCart = () => {
        setCart([]);
        setDiscountInput('');
        setShowDiscount(false);
        setCustomerName('');
    };

    const subtotal = cart.reduce((sum, item) => sum + (getItemUnitPrice(item) * item.quantity), 0);

    const discountAmountNum = parseFloat(discountInput) || 0;
    const calculatedDiscount = useMemo(() => {
        if (discountAmountNum <= 0) return 0;
        if (discountType === 'Percentage') {
            return (subtotal * discountAmountNum) / 100;
        }
        return Math.min(subtotal, discountAmountNum);
    }, [subtotal, discountAmountNum, discountType]);

    const netNewItemsTotal = Math.max(0, subtotal - calculatedDiscount);
    const previousOrderTotal = activeOrder ? parseFloat(activeOrder.grand_total || '0') : 0;
    const finalGrandTotal = previousOrderTotal + netNewItemsTotal;

    const handleAction = (actionType: 'save_kot' | 'kot_and_print_bill' | 'print_bill' | 'settle') => {
        if (actionType !== 'print_bill' && cart.length === 0 && actionType !== 'settle') return;
        if (cart.length === 0 && !activeOrder) return;

        if (table && !waiterId) {
            toast.error('Please assign a waiter before proceeding');
            return;
        }

        router.post('/menu-pos/terminal/checkout', {
            action: actionType,
            order_id: activeOrder?.id,
            dining_table_id: table?.id || null,
            waiter_id: waiterId || null,
            pax: pax || 1,
            customer_name: customerName || activeOrder?.customer_name || null,
            order_type: table ? 'Dine-in' : (activeOrder?.order_type || 'Takeaway'),
            payment_method: actionType === 'settle' ? paymentMethod : null,
            discount_type: discountType,
            discount_amount: discountAmountNum > 0 ? discountAmountNum : null,
            cart: cart.map(item => ({
                menu_item_id: item.id,
                quantity: item.quantity,
                price: item.price,
                modifiers: item.selectedModifiers ? Object.values(item.selectedModifiers).flat().map((mod: any) => ({
                    modifier_id: mod.id,
                    price_adjustment: mod.price_adjustment
                })) : []
            }))
        }, { 
            onSuccess: (page: any) => {
                clearCart();
                const recentKot = page?.props?.flash?.recent_kot;
                const recentOrder = page?.props?.flash?.recent_order;
                if (recentKot) {
                    triggerKotPrint(recentKot);
                }
                if (recentOrder) {
                    triggerOrderPrint(recentOrder);
                }
            },
            onError: (errors) => {
                console.error(errors);
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string || 'Failed to process order action');
            }
        });
    };

    // Keyboard Shortcuts (F6 = Send KOT, F7 = Send KOT & Bill / Print Bill, F8 = Settle, / = Search)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                if (e.key === 'Escape') {
                    target.blur();
                }
                return;
            }

            if (e.key === '/') {
                e.preventDefault();
                document.getElementById('pos-menu-search')?.focus();
                return;
            }

            if (e.key === 'F6') {
                e.preventDefault();
                if (cart.length > 0) {
                    handleAction('save_kot');
                }
            } else if (e.key === 'F7') {
                e.preventDefault();
                if (cart.length > 0) {
                    handleAction('kot_and_print_bill');
                } else if (activeOrder) {
                    handleAction('print_bill');
                }
            } else if (e.key === 'F8') {
                e.preventDefault();
                if (cart.length > 0 || activeOrder) {
                    setIsCheckoutOpen(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, activeOrder, table, waiterId, pax]);

    return (
        <>
            <Head title="POS Terminal" />
            <div className="flex flex-1 h-[calc(100vh-70px)] w-full bg-muted/10 overflow-hidden print:hidden flex-col">
                <DineInTopBar 
                    table={table} 
                    waiters={waiters} 
                    waiterId={waiterId} 
                    setWaiterId={setWaiterId} 
                    pax={pax} 
                    setPax={setPax} 
                    activeOrder={activeOrder} 
                    isWaiter={isWaiter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    categories={categories}
                    activeCategoryId={activeCategoryId}
                    setActiveCategoryId={setActiveCategoryId}
                />
                <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Main POS Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Item Grid */}
                    <ScrollArea className="flex-1 p-3.5 min-h-0 bg-muted/10">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
                            {filteredItems.map((item: any) => {
                                const inCartQty = cart.filter(c => c.id === item.id).reduce((sum, c) => sum + c.quantity, 0);
                                const isAvailable = item.is_available || item.is_available === 1;

                                return (
                                <Card 
                                    key={item.id} 
                                    className={cn(
                                        "p-0 gap-0 flex flex-col overflow-hidden border-border/50 transition-all duration-200 rounded-xl bg-card relative select-none",
                                        isAvailable 
                                            ? "cursor-pointer hover:border-primary/50 hover:shadow-md active:scale-[0.99]" 
                                            : "opacity-60 cursor-not-allowed"
                                    )}
                                    onClick={() => handleItemClick(item)}
                                >
                                    {inCartQty > 0 && (
                                        <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground font-bold text-[11px] h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-md">
                                            {inCartQty}
                                        </div>
                                    )}

                                    <div className="w-full aspect-[4/3] relative overflow-hidden bg-muted/60 shrink-0">
                                        {item.image_url ? (
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name}
                                                className={cn(
                                                    "absolute inset-0 w-full h-full object-cover transition-transform duration-300", 
                                                    isAvailable ? "group-hover:scale-105" : "grayscale"
                                                )}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-medium">
                                                No Image
                                            </div>
                                        )}
                                        {!isAvailable && (
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                                <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                    Sold Out
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex flex-col flex-1 bg-card justify-between">
                                        <h3 className="font-semibold text-[13px] leading-snug line-clamp-2 text-foreground" title={item.name}>{item.name}</h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-primary font-bold text-sm">₹{parseFloat(item.price).toFixed(2)}</p>
                                            <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold transition-colors">
                                                <Plus className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )})}
                        </div>
                        {filteredItems.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-20">
                                <Search className="w-12 h-12 mb-3 opacity-25" />
                                <p className="text-lg font-semibold">No menu items found</p>
                                <p className="text-sm opacity-80">Try searching with a different keyword or category</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
                
                {/* Right Side: Enhanced Cart & Billing */}
                <div className="w-full md:w-[350px] lg:w-[360px] xl:w-[380px] shrink-0 bg-card border-l shadow-lg flex flex-col z-20 h-full">
                    <div className="p-3.5 border-b flex justify-between items-center bg-card shrink-0">
                        <div className="flex items-center gap-2.5 font-bold text-base text-foreground">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <ShoppingCart className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="leading-tight text-sm font-bold">
                                    {activeOrder ? (table ? 'Subsequent KOT' : `Order ${activeOrder.order_number}`) : (table ? `${table.name} Cart` : 'Quick Bill / Takeaway')}
                                </h2>
                                <p className="text-[11px] text-muted-foreground font-normal">
                                    {cart.reduce((s, i) => s + i.quantity, 0)} new item{cart.reduce((s, i) => s + i.quantity, 0) === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>
                        {cart.length > 0 && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2 rounded-lg cursor-pointer" 
                                onClick={clearCart} 
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
                            </Button>
                        )}
                    </div>
                    
                    <ScrollArea className="flex-1 p-3 bg-muted/20 min-h-0">
                        <div className="space-y-3">
                            {/* Empty state when cart is empty and no active order */}
                            {cart.length === 0 && !activeOrder && (
                                <div className="h-full flex flex-col items-center justify-center py-8 text-center px-4">
                                    <div className="w-14 h-14 rounded-2xl bg-muted/70 flex items-center justify-center mb-2.5 text-muted-foreground/60 border border-border/50">
                                        <ShoppingCart className="w-7 h-7 opacity-60" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground mb-1">Cart is Empty</h3>
                                    <p className="text-xs text-muted-foreground max-w-[220px] mb-4">
                                        Tap items from the menu on the left to add them to this order
                                    </p>

                                    <div className="w-full max-w-[260px] bg-muted/40 rounded-xl p-3 border border-border/40 text-left space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Keyboard Shortcuts</p>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>Search menu</span>
                                            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border/60 text-[10px] font-mono text-foreground">/</kbd>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>Send KOT</span>
                                            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border/60 text-[10px] font-mono text-foreground">F6</kbd>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>Send KOT &amp; Bill</span>
                                            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border/60 text-[10px] font-mono text-foreground">F7</kbd>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>Pay / Settle</span>
                                            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border/60 text-[10px] font-mono text-foreground">F8</kbd>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sent Items */}
                            {activeOrder && activeOrder.items && activeOrder.items.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Utensils className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Sent to Kitchen</span>
                                        </h3>
                                        <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold">
                                            KOT Active
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {activeOrder.items.map((item: any) => (
                                            <div key={item.id} className="bg-muted/35 p-2.5 rounded-xl border border-border/40 text-sm opacity-95 relative overflow-hidden">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                                <div className="flex justify-between items-start gap-2 pl-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm leading-tight truncate text-foreground">{item.quantity}× {item.menu_item?.name}</p>
                                                        {item.modifiers?.length > 0 && item.modifiers.map((mod: any, idx: number) => (
                                                            <p key={idx} className="text-xs text-muted-foreground flex justify-between mt-0.5 pl-2">
                                                                <span className="truncate pr-1">• {mod.modifier?.name}</span>
                                                            </p>
                                                        ))}
                                                        {item.notes && <p className="text-xs text-muted-foreground italic mt-0.5 pl-2">Note: {item.notes}</p>}
                                                    </div>
                                                    <p className="font-bold text-sm whitespace-nowrap text-foreground">₹{parseFloat(item.subtotal).toFixed(2)}</p>
                                                </div>
                                                <div className="flex justify-end mt-1.5 pl-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-5 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                                                        onClick={() => {
                                                            setVoidItem(item);
                                                            setIsWasted(activeOrder.kitchen_status === 'preparing' || activeOrder.kitchen_status === 'ready');
                                                        }}
                                                    >
                                                        Void Item
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {cart.length > 0 && (
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Items</h3>
                                    <span className="text-xs text-primary font-bold">{cart.length} item{cart.length === 1 ? '' : 's'}</span>
                                </div>
                            )}
                            {cart.map(item => (
                                <div key={item.cart_id} className="bg-card p-3 rounded-xl border border-border/50 shadow-xs text-sm space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm leading-tight text-foreground">{item.name}</p>
                                            {Object.values(item.selectedModifiers || {}).flat().map((mod: any, idx) => (
                                                <p key={idx} className="text-xs text-muted-foreground flex justify-between mt-0.5 pl-2">
                                                    <span className="truncate pr-1">+ {mod.name}</span>
                                                    {parseFloat(mod.price_adjustment) > 0 && <span className="font-medium">+₹{parseFloat(mod.price_adjustment).toFixed(2)}</span>}
                                                </p>
                                            ))}
                                        </div>
                                        <p className="font-bold text-sm whitespace-nowrap text-foreground">₹{(getItemUnitPrice(item) * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-1.5 border-t border-border/30">
                                        <span className="text-xs text-muted-foreground font-medium">₹{getItemUnitPrice(item).toFixed(2)} / ea</span>
                                        <div className="flex items-center bg-muted/60 border border-border/40 rounded-lg overflow-hidden h-7">
                                            <button 
                                                type="button"
                                                className="px-2.5 h-full hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer" 
                                                onClick={() => updateQuantity(item.cart_id, -1)}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-2.5 h-full flex items-center justify-center font-bold text-xs min-w-[2rem] border-x border-border/40 bg-background text-foreground">{item.quantity}</span>
                                            <button 
                                                type="button"
                                                className="px-2.5 h-full hover:bg-muted transition-colors text-primary flex items-center justify-center cursor-pointer" 
                                                onClick={() => updateQuantity(item.cart_id, 1)}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    
                    <div className="p-3.5 border-t bg-card shrink-0 space-y-2.5 shadow-md">
                        {/* 1. Quick Customer Input (Takeaway / Quick Bill) */}
                        {!table && (
                            <div className="flex items-center gap-2 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/50">
                                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <input 
                                    type="text"
                                    placeholder="Customer name / phone (optional)"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    className="text-xs bg-transparent border-none focus:outline-hidden w-full text-foreground placeholder:text-muted-foreground/70"
                                />
                                {customerName && (
                                    <button 
                                        type="button" 
                                        onClick={() => setCustomerName('')}
                                        className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* 2. Discount Bar & Quick Discount Input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <button
                                    type="button"
                                    onClick={() => setShowDiscount(!showDiscount)}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                                >
                                    <Tag className="w-3 h-3" />
                                    <span>{showDiscount ? 'Hide Discount' : '+ Add Discount / Coupon'}</span>
                                </button>
                                {calculatedDiscount > 0 && (
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                        -₹{calculatedDiscount.toFixed(2)} applied
                                    </span>
                                )}
                            </div>

                            {showDiscount && (
                                <div className="flex items-center gap-1.5 p-1.5 bg-muted/50 rounded-lg border border-border/60">
                                    <div className="inline-flex rounded-md border border-border/60 overflow-hidden text-[11px] shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setDiscountType('Fixed')}
                                            className={cn(
                                                "px-2 py-1 font-semibold transition-colors cursor-pointer",
                                                discountType === 'Fixed' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            ₹ Flat
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDiscountType('Percentage')}
                                            className={cn(
                                                "px-2 py-1 font-semibold transition-colors cursor-pointer",
                                                discountType === 'Percentage' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            % Off
                                        </button>
                                    </div>
                                    <Input 
                                        type="number"
                                        placeholder={discountType === 'Percentage' ? 'e.g. 10' : 'e.g. 50'}
                                        value={discountInput}
                                        onChange={e => setDiscountInput(e.target.value)}
                                        className="h-7 text-xs bg-background"
                                        min={0}
                                        max={discountType === 'Percentage' ? 100 : undefined}
                                    />
                                    {discountInput && (
                                        <button
                                            type="button"
                                            onClick={() => setDiscountInput('')}
                                            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 3. Comprehensive Billing Breakdown */}
                        <div className="space-y-1 pt-1.5 border-t border-border/40 text-xs">
                            {activeOrder && (
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Previous Running Total</span>
                                    <span className="font-semibold text-foreground">₹{previousOrderTotal.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>{activeOrder ? 'New Items Subtotal' : 'Items Subtotal'} ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
                            </div>
                            {calculatedDiscount > 0 && (
                                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                                    <span>Discount ({discountType === 'Percentage' ? `${discountInput}%` : 'Flat'})</span>
                                    <span>-₹{calculatedDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[11px] text-muted-foreground/70">
                                <span>Taxes (GST Inclusive)</span>
                                <span>5% Incl.</span>
                            </div>
                        </div>

                        {/* 4. Grand Total / Payable Card */}
                        <div className="p-2.5 bg-muted/60 rounded-xl border border-border/60 flex justify-between items-center">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {activeOrder ? 'Total Payable (Estimated)' : 'Total Amount'}
                                </p>
                                <p className="text-[10px] text-muted-foreground/80">Inclusive of all taxes</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-foreground tracking-tight">
                                    ₹{finalGrandTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* 5. Quick Payment Mode Selector */}
                        {cart.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Pay Via:</span>
                                {[
                                    { id: 'Cash', label: 'Cash' },
                                    { id: 'UPI', label: 'UPI / QR' },
                                    { id: 'Card', label: 'Card' },
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.id as any)}
                                        className={cn(
                                            "flex-1 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer border text-center",
                                            paymentMethod === method.id 
                                                ? "bg-foreground text-background border-foreground shadow-2xs" 
                                                : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        {method.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 6. Action Buttons */}
                        {cart.length > 0 ? (
                            <div className="space-y-2 pt-0.5">
                                <div className="grid grid-cols-2 gap-2">
                                    {/* 1. Send KOT (F6) */}
                                    <Button 
                                        className="h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold flex flex-col items-center justify-center p-1 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                                        onClick={() => handleAction('save_kot')}
                                    >
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Utensils className="w-3.5 h-3.5" />
                                            <span>Send KOT</span>
                                        </div>
                                        <span className="text-[10px] font-normal opacity-90">[F6] Kitchen</span>
                                    </Button>

                                    {/* 2. Send KOT & Bill (F7) */}
                                    <Button 
                                        className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex flex-col items-center justify-center p-1 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                                        onClick={() => handleAction('kot_and_print_bill')}
                                    >
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Receipt className="w-3.5 h-3.5" />
                                            <span>Send KOT &amp; Bill</span>
                                        </div>
                                        <span className="text-[10px] font-normal opacity-90">[F7] Both</span>
                                    </Button>
                                </div>

                                {/* 3. Settle / Pay Order (F8) */}
                                <Button 
                                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-between px-4 rounded-xl shadow-xs text-sm transition-all active:scale-[0.98] cursor-pointer"
                                    onClick={() => setIsCheckoutOpen(true)}
                                >
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        <span>Pay / Settle Order</span>
                                    </div>
                                    <span className="text-xs font-medium bg-black/20 px-2 py-0.5 rounded-md">[F8]</span>
                                </Button>
                            </div>
                        ) : activeOrder ? (
                            <div className="grid grid-cols-2 gap-2 pt-0.5">
                                {/* Print Bill (F7) */}
                                <Button 
                                    variant="outline" 
                                    className="h-11 border-primary/40 text-primary hover:bg-primary/10 font-bold flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                                    onClick={() => handleAction('print_bill')}
                                >
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Print Bill</span>
                                    </div>
                                    <span className="text-[10px] font-normal opacity-80">[F7]</span>
                                </Button>

                                {/* Settle (F8) */}
                                <Button 
                                    className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex flex-col items-center justify-center p-1 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                                    onClick={() => setIsCheckoutOpen(true)}
                                >
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <CreditCard className="w-3.5 h-3.5" />
                                        <span>Settle</span>
                                    </div>
                                    <span className="text-[10px] font-normal opacity-80">[F8]</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-0.5">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        disabled
                                        className="h-11 bg-muted/60 text-muted-foreground/60 font-bold flex flex-col items-center justify-center p-1 rounded-xl border border-border/40 cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Utensils className="w-3.5 h-3.5" />
                                            <span>Send KOT</span>
                                        </div>
                                        <span className="text-[10px] font-normal opacity-70">[F6]</span>
                                    </Button>
                                    <Button 
                                        disabled
                                        className="h-11 bg-muted/60 text-muted-foreground/60 font-bold flex flex-col items-center justify-center p-1 rounded-xl border border-border/40 cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Receipt className="w-3.5 h-3.5" />
                                            <span>Send KOT &amp; Bill</span>
                                        </div>
                                        <span className="text-[10px] font-normal opacity-70">[F7]</span>
                                    </Button>
                                </div>
                                <Button 
                                    disabled
                                    className="w-full h-11 bg-muted/60 text-muted-foreground/60 font-bold flex items-center justify-between px-4 rounded-xl text-sm border border-border/40 cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        <span>Pay / Settle Order</span>
                                    </div>
                                    <span className="text-xs opacity-70">[F8]</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                </div>
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
                subtotal={activeOrder ? parseFloat(activeOrder.grand_total) + subtotal : subtotal}
                orderId={activeOrder?.id}
                tableId={table?.id}
                waiterId={waiterId}
                pax={pax}
                defaultCustomerName={customerName}
                onSuccess={() => {
                    clearCart();
                    // Let the page reload or handle the flash to print
                }}
            />


            {/* Void Item Dialog */}
            <Dialog open={!!voidItem} onOpenChange={(open) => { if (!open) { setVoidItem(null); setVoidReason(''); setIsWasted(false); } }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Void Sent Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to void this item? It has already been sent to the kitchen.
                        </DialogDescription>
                    </DialogHeader>
                    {voidItem && (
                        <div className="flex flex-col gap-4 py-4">
                            <div className="bg-muted p-3 rounded-md">
                                <p className="font-semibold">{voidItem.quantity}x {voidItem.menu_item?.name}</p>
                                <p className="text-sm text-muted-foreground">Subtotal: ₹{parseFloat(voidItem.subtotal).toFixed(2)}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="term-waste-item"
                                    checked={isWasted}
                                    onChange={(e) => setIsWasted(e.target.checked)}
                                    className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                                />
                                <label htmlFor="term-waste-item" className="text-sm">Log as Wastage? (Do not return to stock)</label>
                            </div>

                            <input 
                                type="text" 
                                placeholder="Reason for voiding (e.g. Guest changed mind)..." 
                                className="flex-1 h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                value={voidReason}
                                onChange={(e) => setVoidReason(e.target.value)}
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setVoidItem(null)}>Cancel</Button>
                        <Button 
                            variant="destructive"
                            disabled={!voidReason.trim()}
                            onClick={() => {
                                router.post(`/menu-pos/live-orders/items/${voidItem.id}/cancel`, { 
                                    reason: voidReason,
                                    is_wasted: isWasted 
                                }, {
                                    onSuccess: () => {
                                        setVoidItem(null);
                                        setVoidReason('');
                                        setIsWasted(false);
                                    }
                                });
                            }}
                        >
                            Confirm Void
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Print Components - Render only ONE at a time */}
            {kotToPrint ? (
                <PrintKOT 
                    kot={kotToPrint} 
                    onPrinted={() => setKotToPrint(null)} 
                />
            ) : orderToPrint ? (
                <PrintReceipt 
                    order={orderToPrint} 
                    isBillOnly={flash?.is_bill_only || activeOrder?.order_type === 'Dine-in'}
                    onPrinted={() => setOrderToPrint(null)} 
                />
            ) : null}
        </>
    );
}
