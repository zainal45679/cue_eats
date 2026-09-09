import { Head, router, usePage, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { XPage } from '@/components/x/page/XPage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent } from '@/components/shadcn/ui/card';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Utensils, 
  FolderOpen, 
  Download, 
  SlidersHorizontal, 
  Building2, 
  Search, 
  Store, 
  ChevronDown, 
  Percent, 
  X, 
  Layers, 
  CheckCircle2, 
  XCircle,
  BookOpen,
  Bike,
  Package,
  UtensilsCrossed,
  QrCode,
  ChevronRight,
  ArrowLeft,
  Tag,
  Receipt,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChefHat
} from 'lucide-react';
import { Badge } from '@/components/shadcn/ui/badge';
import { cn } from '@/lib/utils';
import { MenuItemFormDialog } from './components/MenuItemFormDialog';
import { CategoryFormDialog } from './components/CategoryFormDialog';
import { ModifierGroupFormDialog } from './components/ModifierGroupFormDialog';
import { OutletOverrideDialog } from './components/OutletOverrideDialog';
import { BulkActionDialog } from './components/BulkActionDialog';
import { Input } from '@/components/shadcn/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { Switch } from '@/components/shadcn/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/shadcn/ui/dropdown-menu';
import React from 'react';

class ErrorBoundary extends React.Component<{children: any}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-100 text-red-900 h-screen w-screen overflow-auto">
          <h1 className="text-2xl font-bold mb-4">React Render Error</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre className="mt-4 text-sm opacity-80">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

interface MenuPosProps {
  categories: any[];
  allCategories?: any[];
  items: any[];
  modifierGroups: any[];
  ingredients: any[];
  locations?: any[];
  kitchenStations?: any[];
  combos?: any[];
}

// Petpooja Service / Channel Types
const CHANNELS = [
  {
    id: 'base',
    title: 'Base Menu',
    subtitle: 'Central Master Catalog',
    description: 'Master dish catalog, base prices, tax slabs & kitchen routing',
    icon: BookOpen,
    bgClass: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 border border-amber-200 dark:border-amber-800',
  },
  {
    id: 'delivery',
    title: 'Home Delivery',
    subtitle: 'Swiggy / Zomato & Direct',
    description: 'Channel-specific delivery pricing and aggregator visibility',
    icon: Bike,
    bgClass: 'bg-red-100 dark:bg-red-950/50 text-red-600 border border-red-200 dark:border-red-800',
  },
  {
    id: 'parcel',
    title: 'Parcel',
    subtitle: 'Takeaway & Counter Pickup',
    description: 'Packaging charges, takeaway rates and counter items',
    icon: Package,
    bgClass: 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 border border-yellow-200 dark:border-yellow-800',
  },
  {
    id: 'dine_in',
    title: 'Dine In',
    subtitle: 'Restaurant Table Service',
    description: 'Indoor dining menu, AC/Non-AC pricing and table service',
    icon: UtensilsCrossed,
    bgClass: 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800',
  },
  {
    id: 'qr',
    title: 'Pick Up Menu QR',
    subtitle: 'Digital QR Code Menu',
    description: 'Contactless self-ordering QR menu for tables and counters',
    icon: QrCode,
    bgClass: 'bg-teal-100 dark:bg-teal-950/50 text-teal-600 border border-teal-200 dark:border-teal-800',
  },
];

export default function MenuManagement({ 
  items = [], 
  categories = [], 
  allCategories = [],
  modifierGroups = [], 
  ingredients = [],
  locations = [],
  kitchenStations = [],
  combos = []
}: MenuPosProps) {
  const { url } = usePage();

  // Parse Petpooja Tab from URL query param (?tab=...)
  const getTabFromUrl = (currentUrl: string) => {
    if (!currentUrl) return 'items';
    const queryPart = currentUrl.includes('?') ? currentUrl.split('?')[1] : '';
    const params = new URLSearchParams(queryPart);
    const tab = params.get('tab') || params.get('view');
    if (tab === 'categories') return 'categories';
    if (tab === 'variants') return 'variants';
    if (tab === 'modifiers' || tab === 'addons') return 'modifiers';
    if (tab === 'outlet-menu') return 'outlet-menu';
    if (tab === 'availability' || tab === 'stock-86') return 'availability';
    if (tab === 'taxes') return 'taxes';
    if (tab === 'discounts') return 'discounts';
    return 'items';
  };

  const getChannelFromUrl = (currentUrl: string) => {
    if (!currentUrl) return null;
    const queryPart = currentUrl.includes('?') ? currentUrl.split('?')[1] : '';
    const params = new URLSearchParams(queryPart);
    const channel = params.get('channel');
    if (['base', 'delivery', 'parcel', 'dine_in', 'qr'].includes(channel || '')) {
      return channel;
    }
    return null;
  };

  const [activeTab, setActiveTab] = useState<string>(() => getTabFromUrl(url));
  const [selectedChannel, setSelectedChannel] = useState<string | null>(() => getChannelFromUrl(url));

  useEffect(() => {
    const nextTab = getTabFromUrl(url);
    const nextChannel = getChannelFromUrl(url);
    setActiveTab(nextTab);
    setSelectedChannel(nextChannel);
  }, [url]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSelectedChannel(null);
    router.get(`/menu-pos?tab=${newTab}`, {}, { preserveState: true, replace: true });
  };

  const handleChannelSelect = (channelId: string | null) => {
    setSelectedChannel(channelId);
    if (channelId) {
      router.get(`/menu-pos?tab=items&channel=${channelId}`, {}, { preserveState: true, replace: true });
    } else {
      router.get(`/menu-pos?tab=items`, {}, { preserveState: true, replace: true });
    }
  };

  // Selected outlet for outlet menu view
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    locations.length > 0 ? locations[0].id.toString() : ''
  );
  
  // Filters for Item Master
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Search filter for Category Master
  const [categorySearch, setCategorySearch] = useState('');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // Statistics
  const stats = useMemo(() => {
    const totalItems = items.length;
    const activeItems = items.filter((i: any) => i.is_active && i.is_available).length;
    const outOfStockItems = items.filter((i: any) => !i.is_available).length;
    const vegCount = items.filter((i: any) => i.food_type === 'veg' || i.food_type === 'vegan').length;
    const nonVegCount = items.filter((i: any) => i.food_type === 'non_veg' || i.food_type === 'egg').length;
    const totalCategories = (allCategories.length > 0 ? allCategories : categories).length;
    const totalModifiers = modifierGroups.length;
    const totalVariants = items.reduce((sum, item) => sum + (item.variants?.length || 0), 0);

    return {
      totalItems,
      activeItems,
      outOfStockItems,
      vegCount,
      nonVegCount,
      totalCategories,
      totalModifiers,
      totalVariants,
    };
  }, [items, categories, allCategories, modifierGroups]);

  // Clean flat categories list
  const flatCategories = useMemo(() => {
    return (allCategories.length > 0 ? allCategories : categories);
  }, [allCategories, categories]);

  // Filtered Items for Item Master & Availability Dashboard
  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      // Category filter
      if (categoryFilter !== 'all') {
        const catId = Number(categoryFilter);
        if (item.menu_category_id !== catId && item.sub_category_id !== catId) {
          return false;
        }
      }

      // Search Query filter (Dish name or item code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.name?.toLowerCase().includes(q);
        const codeMatch = item.item_code && item.item_code.toLowerCase().includes(q);
        if (!nameMatch && !codeMatch) return false;
      }

      // Dietary filter
      if (dietaryFilter !== 'all') {
        if (dietaryFilter === 'veg' && item.food_type !== 'veg') return false;
        if (dietaryFilter === 'non_veg' && item.food_type !== 'non_veg') return false;
        if (dietaryFilter === 'egg' && item.food_type !== 'egg') return false;
        if (dietaryFilter === 'vegan' && item.food_type !== 'vegan') return false;
      }

      // Stock / Active Status filter
      if (statusFilter === 'active' && (!item.is_active || !item.is_available)) return false;
      if (statusFilter === 'inactive' && item.is_active) return false;
      if (statusFilter === 'out_of_stock' && item.is_available) return false;

      return true;
    });
  }, [items, categoryFilter, searchQuery, dietaryFilter, statusFilter]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all' || dietaryFilter !== 'all' || statusFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDietaryFilter('all');
    setStatusFilter('all');
  };

  // Filtered categories for Category Master tab
  const filteredCategoriesList = useMemo(() => {
    if (!categorySearch.trim()) return flatCategories;
    const q = categorySearch.toLowerCase().trim();
    return flatCategories.filter((cat: any) => cat.name.toLowerCase().includes(q));
  }, [flatCategories, categorySearch]);

  // Modal helpers
  const openItemModal = (item = null) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };

  const openCategoryModal = (cat = null) => {
    setSelectedCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const openGroupModal = (group = null) => {
    setSelectedGroup(group);
    setIsGroupModalOpen(true);
  };

  const openOverrideModal = (item: any) => {
    setSelectedItem(item);
    setIsOverrideModalOpen(true);
  };

  const handleDelete = (deleteUrl: string, title = 'item') => {
    if (confirm(`Are you sure you want to delete this ${title}? This action cannot be undone.`)) {
      router.delete(deleteUrl, { preserveScroll: true });
    }
  };

  const toggleItemAvailability = (item: any, isAvailable: boolean) => {
    router.put(`/menu-pos/items/${item.id}`, {
      menu_category_id: item.menu_category_id,
      sub_category_id: item.sub_category_id,
      item_code: item.item_code,
      name: item.name,
      price: item.price,
      description: item.description,
      food_type: item.food_type || 'veg',
      spice_level: item.spice_level ?? 0,
      is_chef_special: item.is_chef_special ?? false,
      is_best_seller: item.is_best_seller ?? false,
      is_jain: item.is_jain ?? false,
      is_tax_inclusive: item.is_tax_inclusive ?? false,
      tax_rate: item.tax_rate ?? '5.00',
      kitchen_station_id: item.kitchen_station_id,
      has_variants: item.has_variants ?? false,
      is_active: item.is_active ?? true,
      is_available: isAvailable,
      modifier_group_ids: item.modifier_groups?.map((g: any) => g.id) || [],
      image: item.image,
    }, {
      preserveScroll: true
    });
  };

  const toggleOutletStock = (item: any, isAvailable: boolean) => {
    if (!selectedLocationId) return;
    router.post('/menu-pos/items/outlet-overrides', {
      business_location_id: selectedLocationId,
      menu_item_id: item.id,
      price: item.price,
      is_available: isAvailable,
      is_active: true,
    }, {
      preserveScroll: true
    });
  };

  // FSSAI-Compliant Food Type Symbols (Standard Petpooja UI)
  const renderFoodTypeIcon = (foodType: string) => {
    switch (foodType) {
      case 'veg':
        return (
          <span title="Vegetarian" className="inline-flex items-center justify-center w-4 h-4 border border-emerald-600 rounded-[3px] bg-white p-[2px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          </span>
        );
      case 'non_veg':
        return (
          <span title="Non-Vegetarian" className="inline-flex items-center justify-center w-4 h-4 border border-red-600 rounded-[3px] bg-white p-[2px] shrink-0">
            <span className="w-0 h-0 border-x-[4px] border-x-transparent border-b-[7px] border-b-red-600"></span>
          </span>
        );
      case 'egg':
        return (
          <span title="Contains Egg" className="inline-flex items-center justify-center w-4 h-4 border border-amber-600 rounded-[3px] bg-white p-[2px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          </span>
        );
      case 'vegan':
        return (
          <span title="Vegan" className="inline-flex items-center justify-center w-4 h-4 border border-green-700 rounded-[3px] bg-white p-[2px] shrink-0">
            <span className="text-[9px] leading-none text-green-700 font-bold">🌱</span>
          </span>
        );
      default:
        return (
          <span title="Vegetarian" className="inline-flex items-center justify-center w-4 h-4 border border-emerald-600 rounded-[3px] bg-white p-[2px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          </span>
        );
    }
  };

  const currentActiveChannel = CHANNELS.find(c => c.id === selectedChannel);

  return (
    <ErrorBoundary>
      <XPage 
        title="Menu Management" 
        fullWidth={true}
        breadcrumbs={[
          { label: 'Menu', href: '/menu-pos' },
          ...(selectedChannel ? [{ label: currentActiveChannel?.title || 'Menu' }] : []),
          ...(activeTab !== 'items' ? [{ label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }] : []),
        ]}
      >
        {/* PETPOOJA TOP BREADCRUMB & BACK ACTION ROW */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
              <span>🏠</span>
            </Link>
            <span>&gt;</span>
            <button 
              onClick={() => handleChannelSelect(null)} 
              className={cn("hover:underline", !selectedChannel && activeTab === 'items' && "font-bold text-foreground")}
            >
              Menu
            </button>
            {activeTab !== 'items' && (
              <>
                <span>&gt;</span>
                <span className="font-bold text-foreground capitalize">{activeTab}</span>
              </>
            )}
            {selectedChannel && (
              <>
                <span>&gt;</span>
                <span className="font-bold text-foreground">{currentActiveChannel?.title}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedChannel ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleChannelSelect(null)} 
                className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Menus
              </Button>
            ) : (
              <Link 
                href="/dashboard" 
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                &lt; Back
              </Link>
            )}
          </div>
        </div>

        {/* PETPOOJA HORIZONTAL NAVIGATION TABS STRIP */}
        <div className="bg-[#f0f9ff]/70 dark:bg-muted/30 border-y border-border/60 -mx-6 px-6 mb-6 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 py-1">
            <button
              onClick={() => handleTabChange('items')}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap",
                activeTab === 'items'
                  ? "text-[#0284c7] font-bold border-b-2 border-[#0284c7] rounded-b-none"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Items</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            <button
              onClick={() => handleTabChange('categories')}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap",
                activeTab === 'categories'
                  ? "text-[#0284c7] font-bold border-b-2 border-[#0284c7] rounded-b-none"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Categories
            </button>

            <button
              onClick={() => handleTabChange('variants')}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap",
                activeTab === 'variants'
                  ? "text-[#0284c7] font-bold border-b-2 border-[#0284c7] rounded-b-none"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Variants
            </button>

            <button
              onClick={() => handleTabChange('modifiers')}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap",
                activeTab === 'modifiers'
                  ? "text-[#0284c7] font-bold border-b-2 border-[#0284c7] rounded-b-none"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Addons
            </button>

            <Link
              href="/menu-pos/tables"
              className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-md transition-colors whitespace-nowrap"
            >
              Tables/Areas
            </Link>

            <button
              onClick={() => handleTabChange('outlet-menu')}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap",
                activeTab === 'outlet-menu'
                  ? "text-[#0284c7] font-bold border-b-2 border-[#0284c7] rounded-b-none"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Outlet Menu
            </button>

            <button
              onClick={() => handleTabChange('taxes')}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap",
                activeTab === 'taxes'
                  ? "text-[#0284c7] font-bold border-b-2 border-[#0284c7] rounded-b-none"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Taxes
            </button>

            <button
              onClick={() => handleTabChange('discounts')}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap",
                activeTab === 'discounts'
                  ? "text-[#0284c7] font-bold border-b-2 border-[#0284c7] rounded-b-none"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Discounts
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PETPOOJA TAB 1: ITEMS (CHANNEL CARDS OR DISH CATALOG)     */}
        {/* ======================================================== */}
        {activeTab === 'items' && !selectedChannel && (
          <div className="bg-card rounded-2xl border p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Channel & Service Menus</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Select a service menu to view and configure channel-specific dish pricing and availability.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CHANNELS.map(ch => (
                <div
                  key={ch.id}
                  onClick={() => handleChannelSelect(ch.id)}
                  className="group p-5 rounded-xl border bg-background hover:border-[#f97316]/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", ch.bgClass)}>
                      <ch.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-[#f97316] transition-colors flex items-center gap-1.5">
                        {ch.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{ch.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-500/70 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Dishes in Master Database: <strong className="text-foreground">{items.length}</strong></span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleChannelSelect('base')}
                className="text-xs font-semibold"
              >
                View Base Menu Table ({items.length} items) &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PETPOOJA TAB 1B: CHANNEL DISH TABLE (FULL WIDTH)         */}
        {/* ======================================================== */}
        {activeTab === 'items' && selectedChannel && (
          <div className="space-y-4">
            
            {/* CHANNEL HEADER & SWITCHER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-xs">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleChannelSelect(null)} 
                  className="h-9 w-9 shrink-0" 
                  title="Back to All Channel Menus"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground tracking-tight">{currentActiveChannel?.title}</h2>
                    <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                      {filteredItems.length} dishes
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{currentActiveChannel?.description}</p>
                </div>
              </div>

              {/* QUICK CHANNEL PILLS & ACTIONS */}
              <div className="flex items-center flex-wrap gap-2">
                <div className="bg-muted p-1 rounded-lg flex items-center gap-1 text-xs font-medium">
                  {CHANNELS.map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => handleChannelSelect(ch.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-all",
                        selectedChannel === ch.id 
                          ? "bg-card text-foreground font-bold shadow-xs" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {ch.title}
                    </button>
                  ))}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 font-medium text-xs">
                      <SlidersHorizontal className="w-3.5 h-3.5 mr-1" /> Bulk Actions <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setIsBulkModalOpen(true)}>
                      <Percent className="w-4 h-4 mr-2 text-primary" /> Bulk Price Updates
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/menu-pos/items/export-csv'}>
                      <Download className="w-4 h-4 mr-2 text-primary" /> Export Menu CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button size="sm" className="h-8 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium text-xs px-3 shadow-sm" onClick={() => openItemModal()}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add New Item
                </Button>
              </div>
            </div>

            {/* UNIFIED FILTER TOOLBAR */}
            <div className="bg-card p-3.5 rounded-xl border shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                
                {/* SEARCH INPUT */}
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by dish name, SKU code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* FILTER DROPDOWNS */}
                <div className="flex items-center flex-wrap gap-2">
                  
                  {/* CATEGORY FILTER DROPDOWN (FLAT SIMPLE CATEGORIES) */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px] h-9 text-xs">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value="all">All Categories ({items.length})</SelectItem>
                      {flatCategories.map((cat: any) => {
                        const count = items.filter(i => i.menu_category_id === cat.id || i.sub_category_id === cat.id).length;
                        return (
                          <SelectItem key={cat.id} value={cat.id.toString()} className="text-xs font-medium">
                            📁 {cat.name} ({count})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {/* DIETARY FILTER */}
                  <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
                    <SelectTrigger className="w-[140px] h-9 text-xs">
                      <SelectValue placeholder="Dietary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dietary</SelectItem>
                      <SelectItem value="veg">Veg 🟢</SelectItem>
                      <SelectItem value="non_veg">Non-Veg 🔴</SelectItem>
                      <SelectItem value="egg">Egg 🟡</SelectItem>
                      <SelectItem value="vegan">Vegan 🌱</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* AVAILABILITY / STATUS FILTER */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] h-9 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active / In Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* RESET FILTERS BUTTON */}
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters} 
                      className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* METRICS STRIP */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-2.5 border-t text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Total Dishes: <strong className="text-foreground font-semibold">{stats.totalItems}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Veg: <strong className="text-foreground font-semibold">{stats.vegCount}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Non-Veg: <strong className="text-foreground font-semibold">{stats.nonVegCount}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Categories: <strong className="text-foreground font-semibold">{stats.totalCategories}</strong>
                </span>
                {stats.outOfStockItems > 0 && (
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold ml-auto">
                    ⚠️ {stats.outOfStockItems} dishes currently marked Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* FULL-WIDTH PETPOOJA DISH TABLE */}
            <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[320px]">Dish & Details</TableHead>
                    <TableHead className="w-[180px]">Category</TableHead>
                    <TableHead className="w-[110px]">
                      {selectedChannel === 'base' ? 'Base Price' : `${currentActiveChannel?.title} Price`}
                    </TableHead>
                    <TableHead className="w-[120px]">Variations</TableHead>
                    <TableHead className="w-[110px]">Tax Slab</TableHead>
                    <TableHead className="w-[130px] text-center">In Stock</TableHead>
                    <TableHead className="w-[110px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-44 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                          <Utensils className="w-8 h-8 opacity-40" />
                          <p className="text-sm font-medium">No dishes match your active filters.</p>
                          {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs h-8">
                              Clear All Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item: any) => {
                      const channelPrice = item.channel_prices?.[selectedChannel] ?? item.price;
                      const hasChannelOverride = item.channel_prices?.[selectedChannel] !== undefined;

                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          
                          {/* DISH & DETAILS */}
                          <TableCell>
                            <div className="flex items-start gap-3">
                              <div className="pt-0.5">
                                {renderFoodTypeIcon(item.food_type || 'veg')}
                              </div>

                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-md object-cover border shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                  <Utensils className="w-4 h-4 opacity-50" />
                                </div>
                              )}

                              <div className="min-w-0">
                                <span className="font-semibold text-xs text-foreground block truncate">{item.name}</span>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                                  {item.item_code && (
                                    <span className="font-mono bg-muted/60 px-1 rounded text-[10px]">{item.item_code}</span>
                                  )}
                                  <span>•</span>
                                  <span>{item.kitchen_station ? item.kitchen_station.name : 'Kitchen'}</span>
                                  
                                  {item.is_chef_special && (
                                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[9px] px-1 py-0">Chef Special ⭐</Badge>
                                  )}
                                  {item.is_best_seller && (
                                    <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-[9px] px-1 py-0">Best Seller 🔥</Badge>
                                  )}
                                  {item.spice_level > 0 && (
                                    <span title={`Spice Level: ${item.spice_level}`}>{ '🌶️'.repeat(item.spice_level) }</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* CATEGORY (CLEAN SINGLE CATEGORY) */}
                          <TableCell>
                            <span className="font-medium text-xs text-foreground">{item.category?.name || 'Unassigned'}</span>
                          </TableCell>

                          {/* PRICE */}
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-xs text-foreground">${Number(channelPrice).toFixed(2)}</span>
                              {hasChannelOverride && selectedChannel !== 'base' && (
                                <Badge className="text-[9px] px-1 py-0 bg-blue-500/10 text-blue-600 border-blue-500/20">Custom</Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* VARIATIONS */}
                          <TableCell>
                            {item.has_variants && item.variants?.length > 0 ? (
                              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 font-medium">
                                {item.variants.length} Sizes
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Standard</span>
                            )}
                          </TableCell>

                          {/* TAX SLAB */}
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {item.tax_rate ? `${item.tax_rate}%` : '5%'} GST {item.is_tax_inclusive ? '(Inc)' : ''}
                            </span>
                          </TableCell>

                          {/* STOCK STATUS (AVAILABILITY SWITCH) */}
                          <TableCell className="text-center">
                            <div className="inline-flex items-center gap-2">
                              <Switch
                                checked={item.is_available}
                                onCheckedChange={(val) => toggleItemAvailability(item, val)}
                              />
                              <span className={cn(
                                "text-[10px] font-semibold",
                                item.is_available ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                              )}>
                                {item.is_available ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </TableCell>

                          {/* ACTIONS */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {locations.length > 0 && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openOverrideModal(item)} title="Outlet Price Override">
                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openItemModal(item)} title="Edit Item">
                                <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(`/menu-pos/items/${item.id}`, 'menu item')} title="Delete Item">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PETPOOJA TAB 2: CATEGORIES (100% FLAT & SIMPLE)           */}
        {/* ======================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            
            {/* SEARCH & ACTIONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
                {categorySearch && (
                  <button onClick={() => setCategorySearch('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-medium">
                  Total Categories: <strong className="text-foreground">{filteredCategoriesList.length}</strong>
                </span>
                <Button size="sm" className="h-9 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium text-xs px-3.5" onClick={() => openCategoryModal()}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Category
                </Button>
              </div>
            </div>

            {/* FLAT CATEGORIES TABLE */}
            <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="w-[160px]">Dishes Inside</TableHead>
                    <TableHead className="w-[140px]">Display Sort Order</TableHead>
                    <TableHead className="w-[120px] text-center">Status</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategoriesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                        <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">No categories found.</p>
                        <Button size="sm" className="mt-3 text-xs bg-[#f97316] text-white" onClick={() => openCategoryModal()}>
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategoriesList.map((cat: any, idx: number) => {
                      const count = items.filter((i: any) => i.menu_category_id === cat.id || i.sub_category_id === cat.id).length;
                      return (
                        <TableRow key={cat.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-xs text-muted-foreground font-mono">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                                <FolderOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-xs text-foreground block">{cat.name}</span>
                                {cat.description && <span className="text-[11px] text-muted-foreground">{cat.description}</span>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                              {count} {count === 1 ? 'dish' : 'dishes'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            Order #{cat.sort_order ?? idx + 1}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-2 py-0.5">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCategoryModal(cat)} title="Edit Category">
                                <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(`/menu-pos/categories/${cat.id}`, 'category')} title="Delete Category">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PETPOOJA TAB 3: VARIANTS (PORTION SIZES)                  */}
        {/* ======================================================== */}
        {activeTab === 'variants' && (
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-foreground">Portion Sizes & Variants</h3>
                <p className="text-xs text-muted-foreground">Dishes with multiple portion sizes (Half/Full, Small/Medium/Large) and size-specific prices.</p>
              </div>
            </div>

            <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Dish Name</TableHead>
                    <TableHead className="w-[160px]">Category</TableHead>
                    <TableHead className="w-[120px]">Base Master Price</TableHead>
                    <TableHead>Configured Portion Sizes</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.filter((i: any) => i.has_variants && i.variants?.length > 0).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-36 text-center text-muted-foreground">
                        <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">No dishes currently have portion variants.</p>
                        <p className="text-xs text-muted-foreground mt-1">Edit any menu item and toggle "Item Has Portion Variations" to add sizes.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.filter((i: any) => i.has_variants && i.variants?.length > 0).map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {renderFoodTypeIcon(item.food_type || 'veg')}
                            <span className="font-semibold text-xs text-foreground">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.category?.name || '-'}
                        </TableCell>
                        <TableCell className="font-bold text-xs">
                          ${Number(item.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.variants.map((v: any) => (
                              <Badge key={v.id} variant="outline" className="text-xs px-2 py-0.5 bg-primary/5 text-primary border-primary/20">
                                {v.name}: <strong className="ml-1">${Number(v.price).toFixed(2)}</strong>
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => openItemModal(item)}>
                            <Edit className="w-3 h-3 mr-1" /> Edit Sizes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PETPOOJA TAB 4: ADDONS (MODIFIERS & TOPPINGS)             */}
        {/* ======================================================== */}
        {activeTab === 'modifiers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-xs">
              <div>
                <h3 className="font-bold text-sm text-foreground">Add-ons & Modifiers</h3>
                <p className="text-xs text-muted-foreground">Configure extra toppings, preparation notes, and add-on price adjustments.</p>
              </div>
              <Button size="sm" className="h-9 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium text-xs px-3.5" onClick={() => openGroupModal()}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Modifier Group
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modifierGroups.length === 0 ? (
                <div className="col-span-full p-12 text-center border rounded-xl bg-card text-muted-foreground">
                  <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No modifier groups configured yet.</p>
                  <Button size="sm" className="mt-3 text-xs bg-[#f97316] text-white" onClick={() => openGroupModal()}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Modifier Group
                  </Button>
                </div>
              ) : (
                modifierGroups.map(group => (
                  <Card key={group.id} className="border rounded-xl bg-card shadow-xs">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{group.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            {group.min_selection > 0 ? (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px] px-1.5 py-0">
                                Mandatory (Min: {group.min_selection})
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">
                                Optional
                              </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground">Max: {group.max_selection}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openGroupModal(group)}>
                            <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(`/menu-pos/modifier-groups/${group.id}`, 'modifier group')}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1 pt-2 border-t">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Choices & Add-on Prices</span>
                        {group.modifiers?.map((mod: any) => (
                          <div key={mod.id} className="flex justify-between items-center text-xs p-1.5 rounded bg-muted/40">
                            <span>{mod.name}</span>
                            <span className="font-semibold text-foreground">
                              {Number(mod.price) > 0 ? `+$${Number(mod.price).toFixed(2)}` : 'Free'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PETPOOJA TAB 5: OUTLET MENU                               */}
        {/* ======================================================== */}
        {activeTab === 'outlet-menu' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-amber-500/5 border-amber-500/20">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-xs text-foreground">
                    Customizing Menu for: <span className="underline">{locations.find(l => l.id.toString() === selectedLocationId)?.name || 'Selected Outlet'}</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Any prices or stock toggled here only apply to this branch. Master menu defaults remain intact for other outlets.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Outlet:</span>
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                  <SelectTrigger className="w-[200px] h-8 bg-card text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id.toString()}>📍 {loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[320px]">Dish Name</TableHead>
                    <TableHead className="w-[180px]">Category</TableHead>
                    <TableHead className="w-[130px]">Master Price</TableHead>
                    <TableHead className="w-[160px]">Outlet Price</TableHead>
                    <TableHead className="w-[150px] text-center">Outlet Stock</TableHead>
                    <TableHead className="w-[130px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any) => {
                    const override = item.outlet_overrides?.find((o: any) => o.business_location_id?.toString() === selectedLocationId);
                    const effectivePrice = override && override.price !== null ? Number(override.price).toFixed(2) : Number(item.price).toFixed(2);
                    const isOverridden = override && override.price !== null;
                    const isOutletAvailable = override ? override.is_available : item.is_available;

                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            {renderFoodTypeIcon(item.food_type || 'veg')}
                            <div>
                              <span className="font-semibold text-xs text-foreground block">{item.name}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{item.item_code || '-'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.category?.name || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          ${Number(item.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-foreground">${effectivePrice}</span>
                            {isOverridden ? (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px] px-1 py-0">Overridden</Badge>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">(Master Default)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={isOutletAvailable}
                            onCheckedChange={(val) => toggleOutletStock(item, val)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => openOverrideModal(item)}>
                            <Edit className="w-3 h-3 mr-1" /> Override Price
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PETPOOJA TAB 6: TAXES                                     */}
        {/* ======================================================== */}
        {activeTab === 'taxes' && (
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-xl border shadow-xs">
              <h3 className="font-bold text-sm text-foreground">Tax Rates & GST Slabs</h3>
              <p className="text-xs text-muted-foreground">GST slabs applied to menu items during billing and KOT generation.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 border rounded-xl bg-card shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    5%
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">5% GST (Restaurant Services)</h4>
                    <p className="text-[11px] text-muted-foreground">Standard food & beverage dining rate</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border rounded-xl bg-card shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                    12%
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">12% GST</h4>
                    <p className="text-[11px] text-muted-foreground">Packaged items / specified goods</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border rounded-xl bg-card shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-sm">
                    18%
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">18% GST</h4>
                    <p className="text-[11px] text-muted-foreground">Special services & luxury categories</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PETPOOJA TAB 7: DISCOUNTS                                 */}
        {/* ======================================================== */}
        {activeTab === 'discounts' && (
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-xl border shadow-xs flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-foreground">Discounts & Offers</h3>
                <p className="text-xs text-muted-foreground">Manage bill discounts, promotional coupon codes, and flat amount deductions.</p>
              </div>
              <Button size="sm" className="h-9 bg-[#f97316] text-white text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Create Discount Rule
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4 border rounded-xl bg-card shadow-xs space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">10% OFF</Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold">Active</span>
                </div>
                <h4 className="font-bold text-xs text-foreground">Happy Hours 10%</h4>
                <p className="text-[11px] text-muted-foreground">Applicable on Dine-In orders between 4PM - 7PM.</p>
              </Card>
              <Card className="p-4 border rounded-xl bg-card shadow-xs space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">WELCOME15</Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold">Active</span>
                </div>
                <h4 className="font-bold text-xs text-foreground">First Order Promo</h4>
                <p className="text-[11px] text-muted-foreground">15% off on online delivery orders above $25.</p>
              </Card>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PETPOOJA ONLINE MENU ON/OFF (ITEM AVAILABILITY)           */}
        {/* ======================================================== */}
        {activeTab === 'availability' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3.5 rounded-xl border shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search dishes to toggle availability..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> {stats.activeItems} In Stock
                </span>
                <span className="flex items-center gap-1.5 text-red-500">
                  <XCircle className="w-4 h-4" /> {stats.outOfStockItems} Out of Stock
                </span>
              </div>
            </div>

            {/* RAPID TOGGLE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border bg-card transition-all",
                    !item.is_available && "border-red-300 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {renderFoodTypeIcon(item.food_type || 'veg')}
                    <div className="min-w-0">
                      <span className="font-semibold text-xs block truncate text-foreground">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        {item.category?.name} • ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-[10px] font-bold tracking-tight",
                      item.is_available ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {item.is_available ? 'IN STOCK' : 'OUT OF STOCK'}
                    </span>
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={(val) => toggleItemAvailability(item, val)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIALOG MODALS */}
        <MenuItemFormDialog
          isOpen={isItemModalOpen}
          setIsOpen={setIsItemModalOpen}
          item={selectedItem}
          initialCategoryId={categoryFilter !== 'all' ? categoryFilter : null}
          categories={flatCategories}
          modifierGroups={modifierGroups}
          ingredients={ingredients}
          kitchenStations={kitchenStations}
        />

        <CategoryFormDialog
          isOpen={isCategoryModalOpen}
          setIsOpen={setIsCategoryModalOpen}
          category={selectedCategory}
          parentCategories={[]}
        />

        <ModifierGroupFormDialog
          isOpen={isGroupModalOpen}
          setIsOpen={setIsGroupModalOpen}
          group={selectedGroup}
          ingredients={ingredients}
        />

        <OutletOverrideDialog
          isOpen={isOverrideModalOpen}
          setIsOpen={setIsOverrideModalOpen}
          item={selectedItem}
          locations={locations}
        />

        <BulkActionDialog
          isOpen={isBulkModalOpen}
          setIsOpen={setIsBulkModalOpen}
          categories={flatCategories}
        />
      </XPage>
    </ErrorBoundary>
  );
}
