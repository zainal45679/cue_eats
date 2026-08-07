import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { XPage } from '@/components/x/page/XPage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';
import { Plus, Edit, Trash2, Utensils, Settings2, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/shadcn/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs"
import { cn } from '@/lib/utils';
import { MenuItemFormDialog } from './components/MenuItemFormDialog';
import { CategoryFormDialog } from './components/CategoryFormDialog';
import { ModifierGroupFormDialog } from './components/ModifierGroupFormDialog';
import { Input } from '@/components/shadcn/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { Switch } from '@/components/shadcn/ui/switch';
import { Label } from '@/components/shadcn/ui/label';
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
      return <div className="p-10 bg-red-100 text-red-900 h-screen w-screen overflow-auto">
        <h1 className="text-2xl font-bold mb-4">React Render Error</h1>
        <pre>{this.state.error?.toString()}</pre>
        <pre className="mt-4 text-sm opacity-80">{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

interface MenuPosProps {
    categories: any[];
    items: any[];
    modifierGroups: any[];
    ingredients: any[];
}

export default function MenuManagement({ items, categories, modifierGroups, ingredients }: MenuPosProps) {
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(categories.length > 0 ? categories[0].id : null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const activeCategory = categories.find((c: any) => c.id === activeCategoryId);
    
    const activeCategoryItems = activeCategory
        ? items.filter((item: any) => {
            if (item.menu_category_id !== activeCategory.id) return false;
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (statusFilter === 'active' && !item.is_active) return false;
            if (statusFilter === 'inactive' && item.is_active) return false;
            return true;
          })
        : [];

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

    const handleDelete = (url: string) => {
        if (confirm('Are you sure you want to delete this?')) {
            router.delete(url);
        }
    };

    const toggleItemStatus = (item: any, field: 'is_active' | 'is_available', value: boolean) => {
        router.put(`/menu-pos/items/${item.id}`, {
            menu_category_id: item.menu_category_id,
            name: item.name,
            price: item.price,
            description: item.description,
            is_active: field === 'is_active' ? value : item.is_active,
            is_available: field === 'is_available' ? value : item.is_available,
            modifier_group_ids: item.modifier_groups?.map((g: any) => g.id) || [],
            image: item.image,
        }, {
            preserveScroll: true
        });
    };

    return (
        <ErrorBoundary>
        <XPage 
            title="Menu Management" 
            breadcrumbs={[
                { label: 'Menu POS', href: '/menu-pos' },
                { label: 'Management' },
            ]}
        >
            <div className="space-y-4">
                <Tabs defaultValue="menu-builder" className="w-full">
                    <TabsList className="bg-transparent border-b w-full justify-start h-auto p-0 space-x-6 rounded-none mb-4">
                        <TabsTrigger 
                            value="menu-builder" 
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-sm"
                        >
                            <Utensils className="h-4 w-4 mr-2" /> Menu Builder
                        </TabsTrigger>
                        <TabsTrigger 
                            value="modifiers" 
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-sm"
                        >
                            <Settings2 className="h-4 w-4 mr-2" /> Modifiers & Add-ons
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="menu-builder" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
                            
                            <div className="flex flex-col space-y-4 sticky top-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-foreground">Categories</h3>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openCategoryModal()}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="space-y-0.5">
                                    {categories.length === 0 && (
                                        <div className="text-xs text-muted-foreground py-2">No categories created yet.</div>
                                    )}
                                    {categories.map((cat: any) => (
                                        <div 
                                            key={cat.id}
                                            onClick={() => setActiveCategoryId(cat.id)}
                                            className={cn(
                                                "group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm",
                                                activeCategoryId === cat.id 
                                                    ? "bg-muted font-medium text-foreground" 
                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            )}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); openCategoryModal(cat); }}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="min-w-0">
                                {activeCategory ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <h3 className="text-lg font-medium">{activeCategory.name}</h3>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Input 
                                                    placeholder="Search items..." 
                                                    className="h-8 w-[180px] text-sm"
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                />
                                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                    <SelectTrigger className="h-8 w-[120px] text-sm">
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Status</SelectItem>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button onClick={() => openItemModal(null)} size="sm" className="h-8">
                                                    <Plus className="h-4 w-4 mr-1.5" /> Add Item
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="rounded-md border bg-background">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead className="w-[450px] h-10 text-xs font-medium">Item Details</TableHead>
                                                        <TableHead className="h-10 text-xs font-medium">Price</TableHead>
                                                        <TableHead className="h-10 text-xs font-medium">Status</TableHead>
                                                        <TableHead className="h-10 text-xs font-medium">Add-ons</TableHead>
                                                        <TableHead className="h-10 text-right text-xs font-medium">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {activeCategoryItems.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                                                                No items found in this category matching your criteria.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        activeCategoryItems.map((item: any) => (
                                                            <TableRow key={item.id} className="group">
                                                                <TableCell className="py-2.5">
                                                                    <div className="flex items-center gap-3">
                                                                        {item.image ? (
                                                                            <img src={`/storage/${item.image}`} alt={item.name} className="w-10 h-10 rounded-md object-cover border" />
                                                                        ) : (
                                                                            <div className="w-10 h-10 rounded-md border bg-muted flex items-center justify-center">
                                                                                <ImageIcon className="w-4 h-4 text-muted-foreground opacity-50" />
                                                                            </div>
                                                                        )}
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="font-medium text-sm text-foreground truncate">{item.name}</div>
                                                                            {item.description && (
                                                                                <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5 whitespace-normal" title={item.description}>{item.description}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-2.5 text-sm font-medium">${item.price}</TableCell>
                                                                <TableCell className="py-2.5">
                                                                    <div className="flex flex-col gap-2">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Switch 
                                                                                checked={item.is_active} 
                                                                                onCheckedChange={(val) => toggleItemStatus(item, 'is_active', val)}
                                                                                className="scale-75 origin-left"
                                                                            />
                                                                            <span className="text-[11px] font-medium text-muted-foreground">{item.is_active ? 'Active' : 'Inactive'}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Switch 
                                                                                checked={item.is_available} 
                                                                                onCheckedChange={(val) => toggleItemStatus(item, 'is_available', val)}
                                                                                className="scale-75 origin-left"
                                                                            />
                                                                            <span className="text-[11px] font-medium text-muted-foreground">{item.is_available ? 'Available' : 'Unavailable'}</span>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-2.5">
                                                                    {item.modifier_groups && item.modifier_groups.length > 0 ? (
                                                                        <Badge variant="secondary" className="h-5 text-[10px] font-medium bg-muted text-muted-foreground">{item.modifier_groups.length} groups</Badge>
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground opacity-50">-</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="py-2.5 text-right">
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-0.5">
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openItemModal(item)}>
                                                                            <Edit className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(`/menu-pos/items/${item.id}`)}>
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border rounded-md border-dashed">
                                        Select a category to view items.
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="modifiers" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium tracking-tight">Modifier Groups</h3>
                                <Button onClick={() => openGroupModal()} size="sm" className="h-8">
                                    <Plus className="h-4 w-4 mr-1.5" /> New Group
                                </Button>
                            </div>
                            <div className="rounded-md border bg-background">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="h-10 text-xs font-medium">Group Name</TableHead>
                                            <TableHead className="h-10 text-xs font-medium">Rules</TableHead>
                                            <TableHead className="h-10 text-xs font-medium">Options / Modifiers</TableHead>
                                            <TableHead className="h-10 text-right text-xs font-medium">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modifierGroups.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                                                    No modifier groups found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {modifierGroups.map((group) => (
                                            <TableRow key={group.id} className="group">
                                                <TableCell className="py-2.5 font-medium text-sm text-foreground">{group.name}</TableCell>
                                                <TableCell className="py-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        {group.is_required ? (
                                                            <Badge variant="secondary" className="h-5 text-[10px] font-medium">Required</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="h-5 text-[10px] font-medium text-muted-foreground">Optional</Badge>
                                                        )}
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {group.min_selections} - {group.max_selections} max
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-2.5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {group.modifiers?.map((m: any) => (
                                                            <Badge key={m.id} variant="secondary" className="h-5 text-[10px] font-medium bg-muted text-muted-foreground hover:bg-muted">
                                                                {m.name} {m.price_adjustment > 0 ? <span className="text-foreground ml-0.5">(+${m.price_adjustment})</span> : ''}
                                                            </Badge>
                                                        ))}
                                                        {(!group.modifiers || group.modifiers.length === 0) && (
                                                            <span className="text-xs text-muted-foreground italic">No options defined</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-2.5 text-right">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-0.5">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openGroupModal(group)}>
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(`/menu-pos/modifiers/${group.id}`)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                
                <CategoryFormDialog isOpen={isCategoryModalOpen} setIsOpen={setIsCategoryModalOpen} category={selectedCategory} />
                <MenuItemFormDialog isOpen={isItemModalOpen} setIsOpen={setIsItemModalOpen} item={selectedItem} initialCategoryId={activeCategoryId} categories={categories} modifierGroups={modifierGroups} ingredients={ingredients} />
                <ModifierGroupFormDialog isOpen={isGroupModalOpen} setIsOpen={setIsGroupModalOpen} group={selectedGroup} ingredients={ingredients} />
            </div>
        </XPage>
        </ErrorBoundary>
    );
}
