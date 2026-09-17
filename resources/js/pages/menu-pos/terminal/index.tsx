import { Head, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';

import { Card, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/shadcn/ui/dialog';
import { Input } from '@/components/shadcn/ui/input';
import { ScrollArea, ScrollBar } from '@/components/shadcn/ui/scroll-area';
import { Search, Plus, Minus, Trash2, ShoppingCart, Utensils, Receipt, CreditCard, Printer, AlertTriangle, Lock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModifierSelectionDialog } from './components/ModifierSelectionDialog';
import { CheckoutDialog } from './components/CheckoutDialog';
import { PrintReceipt } from './components/PrintReceipt';
import { PrintKOT } from './components/PrintKOT';
import { DineInTopBar } from './DineInTopBar';
import { ActiveOrdersSheet } from './components/ActiveOrdersSheet';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function PosTerminal({ 
    categories, 
    inventoryBalances, 
    waiters, 
    table, 
    activeOrder,
    runningOrders = [],
    locationId
}: { 
    categories: any[], 
    inventoryBalances: Record<string, number>, 
    waiters?: any[], 
    table?: any, 
    activeOrder?: any,
    runningOrders?: any[],
    locationId?: string | null
}) {
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [voidItem, setVoidItem] = useState<any>(null);
    const [voidReason, setVoidReason] = useState('');
    const [managerPin, setManagerPin] = useState('');
    const [isWasted, setIsWasted] = useState(false);
    const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');
    const [isActiveOrdersOpen, setIsActiveOrdersOpen] = useState(false);
    const menuGridRef = useRef<HTMLDivElement>(null);
    const touchStartYRef = useRef<number | null>(null);
    const categoryScrollLockRef = useRef(false);
    const categoryScrollDistanceRef = useRef(0);

    const switchCategoryFromMenuScroll = (direction: 1 | -1) => {
        if (categoryScrollLockRef.current) {
            return false;
        }

        const categoryIds: Array<number | 'all'> = [
            'all',
            ...categories.map((category: any) => category.id),
        ];
        const currentIndex = categoryIds.indexOf(activeCategoryId);
        const nextIndex = Math.min(
            Math.max(currentIndex + direction, 0),
            categoryIds.length - 1,
        );
        const nextCategoryId = categoryIds[nextIndex];

        if (nextCategoryId === activeCategoryId) {
            return false;
        }

        categoryScrollLockRef.current = true;
        setActiveCategoryId(nextCategoryId);
        window.setTimeout(() => {
            categoryScrollLockRef.current = false;
        }, 450);
        return true;
    };

    const getMenuViewport = () =>
        menuGridRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]') ?? null;

    const handleMenuWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        if (event.deltaY === 0) return;

        const viewport = getMenuViewport();
        if (!viewport) return;

        const atTop = viewport.scrollTop <= 2;
        const atBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2;
        const isScrollingPastCategoryBoundary = event.deltaY > 0 ? atBottom : atTop;

        if (!isScrollingPastCategoryBoundary) {
            categoryScrollDistanceRef.current = 0;
            return;
        }

        if (
            categoryScrollDistanceRef.current !== 0 &&
            Math.sign(categoryScrollDistanceRef.current) !== Math.sign(event.deltaY)
        ) {
            categoryScrollDistanceRef.current = 0;
        }

        categoryScrollDistanceRef.current += event.deltaY;
        if (Math.abs(categoryScrollDistanceRef.current) < 240) {
            return;
        }

        const movedCategory = event.deltaY > 0
            ? switchCategoryFromMenuScroll(1)
            : switchCategoryFromMenuScroll(-1);

        if (movedCategory) {
            categoryScrollDistanceRef.current = 0;
            event.preventDefault();
        }
    };

    const handleMenuTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleMenuTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        const startY = touchStartYRef.current;
        const endY = event.changedTouches[0]?.clientY;
        touchStartYRef.current = null;

        if (startY === null || endY === undefined || Math.abs(endY - startY) < 120) {
            return;
        }

        const viewport = getMenuViewport();
        if (!viewport) return;

        const atTop = viewport.scrollTop <= 2;
        const atBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2;
        if (endY < startY && atBottom) {
            switchCategoryFromMenuScroll(1);
        } else if (endY > startY && atTop) {
            switchCategoryFromMenuScroll(-1);
        }
    };

    useEffect(() => {
        const viewport = getMenuViewport();
        viewport?.scrollTo({ top: 0, behavior: 'auto' });
    }, [activeCategoryId]);

    const handleSelectOrder = (orderId: string) => {
        router.get('/menu-pos/terminal', { order_id: orderId }, {
            preserveState: false,
        });
    };

    const handleNewOrder = () => {
        clearCart();
        router.get('/menu-pos/terminal', {}, {
            preserveState: false,
        });
    };
    
    // Support auto-print from flash
    const { flash, auth } = usePage().props as any;
    const [orderToPrint, setOrderToPrint] = useState<any>(null);
    const [kotToPrint, setKotToPrint] = useState<any>(null);
    
    const isWaiter = auth?.roles?.includes('waiter') && !auth?.roles?.includes('admin') && !auth?.roles?.includes('outlet_manager');

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

    // Live WebSockets updates via Reverb / Echo
    useEffect(() => {
        const targetLocationId = locationId || auth?.user?.business_location_id;
        let channel: any = null;

        if (window.Echo && targetLocationId) {
            channel = window.Echo.private(`orders.${targetLocationId}`)
                .listen('.App\\Events\\OrderCreated', () => {
                    router.reload({ only: ['runningOrders', 'inventoryBalances'], preserveScroll: true, preserveState: true });
                })
                .listen('.App\\Events\\OrderStatusUpdated', (event: any) => {
                    router.reload({ only: ['runningOrders', 'activeOrder'], preserveScroll: true, preserveState: true });
                    
                    if (event?.kitchenStatus === 'ready') {
                        try {
                            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            osc.type = 'sine';
                            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
                            gain.gain.setValueAtTime(0.2, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                            osc.connect(gain);
                            gain.connect(ctx.destination);
                            osc.start();
                            osc.stop(ctx.currentTime + 0.4);
                        } catch (e) {
                            // AudioContext might require prior user gesture
                        }

                        toast.success('Food is Ready for Pickup/Serving!', {
                            description: 'Kitchen marked an order as READY.',
                            duration: 4000,
                        });
                    }
                });
        }

        return () => {
            if (channel && window.Echo && targetLocationId) {
                channel.stopListening('.App\\Events\\OrderCreated');
                channel.stopListening('.App\\Events\\OrderStatusUpdated');
                window.Echo.leave(`orders.${targetLocationId}`);
            }
        };
    }, [locationId, auth?.user?.business_location_id]);
    
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
            toast.warning('Insufficient stock for this item or its modifiers.');
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
                        toast.warning('Insufficient stock to increase quantity.');
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

    const subtotal = cart.reduce((sum, item) => sum + (getItemUnitPrice(item) * item.quantity), 0);

    const handleKotAction = (actionType: 'save_kot' | 'kot_and_print_bill') => {
        if (cart.length === 0) return;
        if (table && !waiterId) {
            toast.error('Please assign a waiter before sending KOT');
            return;
        }

        router.post('/menu-pos/terminal/checkout', {
            action: actionType,
            order_id: activeOrder?.id,
            dining_table_id: table?.id || null,
            waiter_id: waiterId || null,
            pax: pax || 1,
            order_type: table ? 'Dine-in' : 'Takeaway',
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

    const handlePrintBill = () => {
        if (!activeOrder) return;
        router.post('/menu-pos/terminal/checkout', {
            action: 'print_bill',
            order_id: activeOrder.id,
            order_type: activeOrder.order_type || (table ? 'Dine-in' : 'Takeaway')
        }, {
            onSuccess: (page: any) => {
                const recentOrder = page?.props?.flash?.recent_order;
                if (recentOrder) {
                    triggerOrderPrint(recentOrder);
                }
            },
            onError: (errors) => {
                console.error(errors);
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string || 'Failed to generate bill');
            }
        });
    };

    // Keyboard Shortcuts (matching Petpooja POS: F6 = KOT, F7 = KOT & Bill / Print Bill, F8 = Settle, / = Search)
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
                    handleKotAction('save_kot');
                }
            } else if (e.key === 'F7') {
                e.preventDefault();
                if (cart.length > 0) {
                    handleKotAction('kot_and_print_bill');
                } else if (activeOrder) {
                    handlePrintBill();
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
            <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100svh-72px)] w-full bg-muted/10 overflow-hidden print:hidden">
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
                    runningOrders={runningOrders}
                    onOpenRunningOrders={() => setIsActiveOrdersOpen(true)}
                    onNewOrder={handleNewOrder}
                />
                <div className="flex-1 min-h-0 flex overflow-hidden">
                {/* Left Side: Main POS Area */}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* Item Grid */}
                    <div
                        ref={menuGridRef}
                        className="flex-1 min-h-0"
                        onWheel={handleMenuWheel}
                        onTouchStart={handleMenuTouchStart}
                        onTouchEnd={handleMenuTouchEnd}
                    >
                    <ScrollArea className="h-full p-3.5 bg-muted/10">
                        <motion.div 
                            key={activeCategoryId}
                            initial={{ opacity: 0.7, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={cn(
                                "grid gap-3 transition-all",
                                (cart.length > 0 || activeOrder)
                                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5"
                                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                            )}
                        >
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
                                    <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                                        <img 
                                            src={item.image_url || '/images/placeholder-food.svg'} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            onError={(e) => {
                                                // Fallback to placeholder if image fails to load
                                                (e.target as HTMLImageElement).src = '/images/placeholder-food.svg';
                                            }}
                                        />
                                        {/* In-cart count badge */}
                                        {inCartQty > 0 && (
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground font-black text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                                                {inCartQty}
                                            </div>
                                        )}
                                        {/* Veg / Non-Veg Indicator */}
                                        {item.dietary_type && (
                                            <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-xs p-1 rounded-md shadow-2xs">
                                                <div className={cn(
                                                    "w-2.5 h-2.5 rounded-full",
                                                    item.dietary_type === 'veg' ? "bg-green-600" :
                                                    item.dietary_type === 'non-veg' ? "bg-red-600" : "bg-amber-500"
                                                )} />
                                            </div>
                                        )}
                                        {/* Modifier badge */}
                                        {item.has_modifiers && (
                                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                                                <UtensilsCrossed className="w-2.5 h-2.5" />
                                                Customizable
                                            </div>
                                        )}
                                        {/* Stock badge */}
                                        {!isAvailable && (
                                            <div className="absolute inset-0 bg-background/80 backdrop-blur-2xs flex items-center justify-center">
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
                        </motion.div>
                        {filteredItems.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-20">
                                <Search className="w-12 h-12 mb-3 opacity-25" />
                                <p className="text-lg font-semibold">No menu items found</p>
                                <p className="text-sm opacity-80">Try searching with a different keyword or category</p>
                            </div>
                        )}
                    </ScrollArea>
                    </div>
                </div>
                
                {/* Right Side: Enhanced Cart & Billing (Hidden by default, shown when items in cart or active order) */}
                {(cart.length > 0 || activeOrder) && (
                <div className="w-full md:w-[350px] lg:w-[360px] xl:w-[380px] shrink-0 bg-card border-l shadow-lg flex flex-col z-20 h-full">
                    <div className="p-3.5 border-b flex justify-between items-center bg-card shrink-0">
                        <div className="flex items-center gap-2.5 font-bold text-base text-foreground">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                <ShoppingCart className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h2 className="leading-tight text-sm font-bold text-foreground">
                                    {activeOrder ? (table ? 'Subsequent KOT' : `Order #${activeOrder.order_number}`) : (table ? `${table.name} Cart` : 'Quick Bill / Takeaway')}
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
                                <Trash2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> Clear
                            </Button>
                        )}
                    </div>
                    
                    <ScrollArea className="flex-1 min-h-0 p-3 bg-card">
                        <div className="space-y-3">

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
                                        {activeOrder.items.map((item: any) => {
                                            if (item.is_voided) {
                                                return (
                                                    <div key={item.id} className="bg-red-500/5 p-2 rounded-xl border border-red-500/20 text-sm opacity-65 relative overflow-hidden">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                                        <div className="flex justify-between items-start gap-2 pl-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-xs leading-tight line-through text-muted-foreground">{item.quantity}× {item.menu_item?.name}</p>
                                                                {item.void_reason && <p className="text-[10px] text-red-500 italic mt-0.5">Voided: {item.void_reason}</p>}
                                                            </div>
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">Voided</span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
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
                                                                setVoidReason('');
                                                                setManagerPin('');
                                                                const isCooking = activeOrder.kitchen_status === 'preparing' || activeOrder.kitchen_status === 'ready';
                                                                setIsWasted(isCooking);
                                                            }}
                                                        >
                                                            Void Item
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {cart.length > 0 && (
                                <div className="flex items-center justify-between mb-2.5 px-1">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">NEW ITEMS</h3>
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-500">{cart.length} item{cart.length === 1 ? '' : 's'}</span>
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
                                        <div className="flex items-center bg-muted/50 border border-border/50 rounded-lg overflow-hidden h-7">
                                            <button 
                                                type="button"
                                                className="px-2.5 h-full hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer" 
                                                onClick={() => updateQuantity(item.cart_id, -1)}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-2.5 h-full flex items-center justify-center font-bold text-xs min-w-[2rem] border-x border-border/50 bg-background text-foreground">{item.quantity}</span>
                                            <button 
                                                type="button"
                                                className="px-2.5 h-full hover:bg-muted transition-colors text-amber-600 dark:text-amber-500 flex items-center justify-center cursor-pointer" 
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
                    
                    <div className="p-4 border-t bg-card shrink-0 space-y-3 mt-auto">
                        {activeOrder && (
                            <div className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-border/60">
                                <span className="text-muted-foreground font-medium">Previous KOT Total</span>
                                <span className="font-semibold text-foreground">₹{parseFloat(activeOrder.grand_total).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {activeOrder ? 'New Items Subtotal' : 'SUBTOTAL'}
                            </span>
                            <span className="font-extrabold text-2xl text-foreground">₹{subtotal.toFixed(2)}</span>
                        </div>
                        {activeOrder && cart.length > 0 && (
                            <div className="flex justify-between items-center text-xs pt-1 border-t text-muted-foreground font-medium">
                                <span>Estimated Total</span>
                                <span className="font-bold text-base text-foreground">
                                    ₹{(parseFloat(activeOrder.grand_total) + subtotal).toFixed(2)}
                                </span>
                            </div>
                        )}
                        
                        <div className="space-y-2.5 pt-1">
                            <div className="grid grid-cols-2 gap-2.5">
                                {/* Send KOT */}
                                <button 
                                    type="button"
                                    className="h-14 bg-[#fe9900] hover:bg-[#e08700] active:scale-[0.98] text-white rounded-2xl flex flex-col items-center justify-center py-2 px-2 shadow-xs transition-all cursor-pointer select-none border-0"
                                    onClick={() => {
                                        if (cart.length === 0) {
                                            toast.error('Cart is empty. Please select items from the menu first.');
                                            return;
                                        }
                                        handleKotAction('save_kot');
                                    }}
                                >
                                    <div className="flex items-center gap-1.5 font-bold text-sm leading-tight">
                                        <Utensils className="w-4 h-4" />
                                        <span>Send KOT</span>
                                    </div>
                                    <span className="text-[11px] font-medium text-white/90 mt-0.5 leading-none">[F6] Kitchen</span>
                                </button>

                                {/* Send KOT & Bill */}
                                <button 
                                    type="button"
                                    className="h-14 bg-[#e87f0a] hover:bg-[#cf6f08] active:scale-[0.98] text-white rounded-2xl flex flex-col items-center justify-center py-2 px-2 shadow-xs transition-all cursor-pointer select-none border-0"
                                    onClick={() => {
                                        if (cart.length === 0 && !activeOrder) {
                                            toast.error('Cart is empty. Please select items from the menu first.');
                                            return;
                                        }
                                        if (cart.length > 0) {
                                            handleKotAction('kot_and_print_bill');
                                        } else if (activeOrder) {
                                            handlePrintBill();
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-1.5 font-bold text-sm leading-tight">
                                        {cart.length === 0 && activeOrder ? <Printer className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                                        <span>{cart.length === 0 && activeOrder ? 'Print Bill' : 'Send KOT & Bill'}</span>
                                    </div>
                                    <span className="text-[11px] font-medium text-white/90 mt-0.5 leading-none">{cart.length === 0 && activeOrder ? '[F7]' : '[F7] Both'}</span>
                                </button>
                            </div>

                            {/* Pay / Settle Order */}
                            <button 
                                type="button"
                                className="w-full h-14 bg-[#00875a] hover:bg-[#00734d] active:scale-[0.98] text-white rounded-2xl flex items-center justify-between px-4.5 shadow-xs transition-all cursor-pointer select-none border-0"
                                onClick={() => {
                                    if (cart.length === 0 && !activeOrder) {
                                        toast.error('Cart is empty. Please select items from the menu first.');
                                        return;
                                    }
                                    setIsCheckoutOpen(true);
                                }}
                            >
                                <div className="flex items-center gap-2.5 font-bold text-[15px]">
                                    <CreditCard className="w-5 h-5" />
                                    <span>Pay / Settle Order</span>
                                </div>
                                <span className="text-xs font-bold bg-black/20 text-white px-2.5 py-1 rounded-lg tracking-wide">[F8]</span>
                            </button>
                        </div>
                    </div>
                </div>
                )}
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
                defaultCustomerName={activeOrder?.customer_name || ''}
                onSuccess={() => {
                    clearCart();
                    // Let the page reload or handle the flash to print
                }}
            />


            {/* Void Item Dialog */}
            <Dialog open={!!voidItem} onOpenChange={(open) => { if (!open) { setVoidItem(null); setVoidReason(''); setManagerPin(''); setIsWasted(false); } }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-destructive" />
                            Void Sent Item
                        </DialogTitle>
                        <DialogDescription>
                            Review the item status and confirm voiding from the active ticket.
                        </DialogDescription>
                    </DialogHeader>
                    {voidItem && (() => {
                        const isCooking = activeOrder?.kitchen_status === 'preparing' || activeOrder?.kitchen_status === 'ready';
                        return (
                            <div className="flex flex-col gap-3 py-2">
                                {isCooking && (
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="text-xs space-y-1">
                                            <p className="font-bold">Kitchen cooking is in progress!</p>
                                            <p className="opacity-90">The kitchen is already preparing or has finished this item. Voiding will record it as food wastage.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-muted p-3 rounded-md">
                                    <p className="font-semibold text-sm text-foreground">{voidItem.quantity}x {voidItem.menu_item?.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Subtotal: ₹{parseFloat(voidItem.subtotal).toFixed(2)}</p>
                                </div>
                                
                                {isCooking ? (
                                    <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 p-2.5 rounded-md">
                                        <input 
                                            type="checkbox" 
                                            id="term-waste-item"
                                            checked={true}
                                            disabled={true}
                                            className="rounded border-gray-300 text-destructive focus:ring-destructive cursor-not-allowed"
                                        />
                                        <label htmlFor="term-waste-item" className="text-xs font-semibold text-destructive">
                                            Food Wastage Logged (Cooking in progress)
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-0.5">
                                        <input 
                                            type="checkbox" 
                                            id="term-waste-item"
                                            checked={isWasted}
                                            onChange={(e) => setIsWasted(e.target.checked)}
                                            className="rounded border-gray-300 text-destructive focus:ring-destructive"
                                        />
                                        <label htmlFor="term-waste-item" className="text-xs text-muted-foreground cursor-pointer">
                                            Log as Wastage? (Do not return to stock)
                                        </label>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Reason for voiding <span className="text-destructive">*</span>
                                    </label>
                                    <input 
                                        id="voidReason"
                                        type="text" 
                                        placeholder="e.g. Guest changed mind, wrong item..." 
                                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                                        value={voidReason}
                                        onChange={(e) => setVoidReason(e.target.value)}
                                    />
                                </div>

                                {isCooking && isWaiter && (
                                    <div className="space-y-1.5 pt-2 border-t">
                                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Lock className="w-3.5 h-3.5 text-primary" />
                                            Manager Authorization PIN <span className="text-destructive">*</span>
                                        </label>
                                        <Input 
                                            type="password" 
                                            maxLength={6}
                                            placeholder="Enter 4-digit Manager PIN (e.g. 1234)" 
                                            className="font-mono text-center tracking-widest text-base h-10"
                                            value={managerPin}
                                            onChange={(e) => setManagerPin(e.target.value)}
                                        />
                                        <p className="text-[11px] text-muted-foreground">A manager must enter their PIN to authorize voiding an item being prepared.</p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setVoidItem(null)}>Cancel</Button>
                        <Button 
                            variant="destructive"
                            disabled={!voidReason.trim() || ((activeOrder?.kitchen_status === 'preparing' || activeOrder?.kitchen_status === 'ready') && isWaiter && !managerPin.trim())}
                            onClick={() => {
                                const isCooking = activeOrder?.kitchen_status === 'preparing' || activeOrder?.kitchen_status === 'ready';
                                router.post(`/menu-pos/live-orders/items/${voidItem.id}/cancel`, { 
                                    reason: voidReason,
                                    is_wasted: isCooking ? true : isWasted,
                                    manager_pin: managerPin
                                }, {
                                    onSuccess: () => {
                                        setVoidItem(null);
                                        setVoidReason('');
                                        setManagerPin('');
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

            {/* Active & Running Orders Drawer */}
            <ActiveOrdersSheet
                isOpen={isActiveOrdersOpen}
                onClose={() => setIsActiveOrdersOpen(false)}
                runningOrders={runningOrders}
                currentOrderId={activeOrder?.id}
                onSelectOrder={handleSelectOrder}
                onNewOrder={handleNewOrder}
            />
        </>
    );
}
