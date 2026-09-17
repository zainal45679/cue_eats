import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Switch } from '@/components/shadcn/ui/switch';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/shadcn/ui/accordion';
import { Badge } from '@/components/shadcn/ui/badge';
import { Plus, Trash2, Layers, Sparkles, Flame, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecipeBuilder } from './RecipeBuilder';

export function MenuItemFormDialog({
  isOpen,
  setIsOpen,
  item = null,
  initialCategoryId = null,
  categories = [],
  modifierGroups = [],
  ingredients = [],
  kitchenStations = [],
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item?: any;
  initialCategoryId?: string | number | null;
  categories: any[];
  modifierGroups: any[];
  ingredients?: any[];
  kitchenStations?: any[];
}) {
  const isEditing = !!item;

  const { data, setData, post, processing, errors, reset, transform } = useForm({
    menu_category_id: '',
    sub_category_id: '',
    item_code: '',
    name: '',
    description: '',
    price: '',
    image: null as File | string | null,
    is_active: true,
    is_available: true,
    food_type: 'veg',
    spice_level: 0,
    is_chef_special: false,
    is_best_seller: false,
    is_jain: false,
    is_tax_inclusive: false,
    tax_rate: '5.00',
    kitchen_station_id: '',
    has_variants: false,
    variants: [] as { name: string; price: string; item_code: string }[],
    modifier_group_ids: [] as (string | number)[],
    recipe_items: [] as any[],
    _method: 'post',
  });

  transform((data) => ({
    ...data,
    recipe_items: data.recipe_items.filter(ri => ri.ingredient_id && ri.quantity && parseFloat(ri.quantity) > 0),
    variants: data.has_variants ? data.variants.filter(v => v.name.trim() !== '') : [],
  }));

  useEffect(() => {
    if (item && isOpen) {
      setData({
        menu_category_id: item.menu_category_id?.toString() || '',
        sub_category_id: item.sub_category_id?.toString() || '',
        item_code: item.item_code || '',
        name: item.name || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        image: item.image || null,
        is_active: item.is_active ?? true,
        is_available: item.is_available ?? true,
        food_type: item.food_type || 'veg',
        spice_level: item.spice_level ?? 0,
        is_chef_special: item.is_chef_special ?? false,
        is_best_seller: item.is_best_seller ?? false,
        is_jain: item.is_jain ?? false,
        is_tax_inclusive: item.is_tax_inclusive ?? false,
        tax_rate: item.tax_rate?.toString() || '5.00',
        kitchen_station_id: item.kitchen_station_id?.toString() || '',
        has_variants: item.has_variants ?? false,
        variants: item.variants?.map((v: any) => ({
          name: v.name,
          price: v.price?.toString() || '0',
          item_code: v.item_code || '',
        })) || [],
        modifier_group_ids: item.modifier_groups?.map((g: any) => g.id) || [],
        recipe_items: item.recipe_items?.map((ri: any) => ({
            ingredient_id: ri.ingredient_id?.toString() || '',
            quantity: ri.quantity?.toString() || ''
        })) || [],
        _method: 'put',
      });
    } else if (isOpen) {
      reset();
      setData('_method', 'post');
      if (initialCategoryId) {
        setData('menu_category_id', initialCategoryId.toString());
      }
    }
  }, [item, isOpen, initialCategoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      post(`/menu-pos/items/${item.id}`, {
        forceFormData: true,
        onSuccess: () => setIsOpen(false),
      });
    } else {
      post('/menu-pos/items', {
        forceFormData: true,
        onSuccess: () => {
          reset();
          setIsOpen(false);
        },
      });
    }
  };

  const addVariant = () => {
    setData('variants', [...data.variants, { name: '', price: data.price || '0', item_code: '' }]);
  };

  const removeVariant = (index: number) => {
    setData('variants', data.variants.filter((_, idx) => idx !== index));
  };

  const updateVariant = (index: number, field: string, val: string) => {
    const updated = [...data.variants];
    updated[index] = { ...updated[index], [field]: val };
    setData('variants', updated);
  };

  const toggleModifierGroup = (id: string | number) => {
    const ids = data.modifier_group_ids.includes(id)
        ? data.modifier_group_ids.filter((gId) => gId !== id)
        : [...data.modifier_group_ids, id];
    setData('modifier_group_ids', ids);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {isEditing ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
            <DialogDescription>
              Add the essentials first. Open an optional section only when this dish needs it.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input id="name" placeholder="e.g. Paneer Butter Masala" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={data.menu_category_id} onValueChange={(val) => setData('menu_category_id', val)}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.menu_category_id && <p className="text-xs text-destructive">{errors.menu_category_id}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={data.price} onChange={(e) => setData('price', e.target.value)} />
                  {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                </div>
                <div className="grid gap-2">
                  <Label>Dietary Type *</Label>
                  <Select value={data.food_type} onValueChange={(val) => setData('food_type', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Veg 🟢</SelectItem>
                      <SelectItem value="non_veg">Non-Veg 🔴</SelectItem>
                      <SelectItem value="egg">Egg 🟡</SelectItem>
                      <SelectItem value="vegan">Vegan 🌱</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Accordion type="multiple" className="rounded-xl border px-4">
              <AccordionItem value="details">
                <AccordionTrigger>More item details</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="item_code">Quick billing code</Label>
                      <Input id="item_code" placeholder="e.g. 101 or CB-01" value={data.item_code} onChange={(e) => setData('item_code', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Spice Level</Label>
                      <Select value={data.spice_level.toString()} onValueChange={(val) => setData('spice_level', parseInt(val))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem><SelectItem value="1">Mild 🌶️</SelectItem><SelectItem value="2">Medium 🌶️🌶️</SelectItem><SelectItem value="3">Hot 🌶️🌶️🌶️</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Short dish description..." value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
                  </div>
                  <div className="grid gap-2"><Label htmlFor="image">Dish Photo</Label><Input id="image" type="file" accept="image/*" onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)} /></div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[['is_chef_special', "Chef's Special ⭐", data.is_chef_special], ['is_best_seller', 'Best Seller 🔥', data.is_best_seller], ['is_jain', 'Jain Option', data.is_jain]].map(([id, label, checked]) => (
                      <div key={String(id)} className="flex items-center space-x-2 rounded-lg border p-2.5">
                        <Checkbox id={String(id)} checked={Boolean(checked)} onCheckedChange={(value) => setData(id as 'is_chef_special' | 'is_best_seller' | 'is_jain', Boolean(value))} />
                        <Label htmlFor={String(id)} className="cursor-pointer text-xs">{String(label)}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sizes">
                <AccordionTrigger>Sizes & prices {data.variants.length > 0 ? `(${data.variants.length})` : ''}</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
                    <div><p className="text-sm font-semibold">This item has multiple sizes</p><p className="text-xs text-muted-foreground">For example: Small, Medium and Large.</p></div>
                    <Switch checked={data.has_variants} onCheckedChange={(checked) => setData('has_variants', checked)} />
                  </div>
                  {data.has_variants && <>
                    <div className="flex items-center justify-between"><Label>Sizes</Label><Button type="button" variant="outline" size="sm" onClick={addVariant}><Plus className="mr-1 h-3.5 w-3.5" /> Add Size</Button></div>
                    {data.variants.length === 0 ? <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Add the first size to continue.</div> : data.variants.map((v, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_110px_100px_36px] items-center gap-2">
                        <Input placeholder="Size name" value={v.name} onChange={(e) => updateVariant(idx, 'name', e.target.value)} />
                        <Input type="number" min="0" step="0.01" placeholder="Price" value={v.price} onChange={(e) => updateVariant(idx, 'price', e.target.value)} />
                        <Input placeholder="Code" value={v.item_code} onChange={(e) => updateVariant(idx, 'item_code', e.target.value)} />
                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeVariant(idx)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </>}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="choices">
                <AccordionTrigger>Add-ons & choices {data.modifier_group_ids.length > 0 ? `(${data.modifier_group_ids.length})` : ''}</AccordionTrigger>
                <AccordionContent>
                  {modifierGroups.length === 0 ? <p className="text-xs text-muted-foreground">No add-on groups are available.</p> : <div className="grid gap-2 sm:grid-cols-2">
                    {modifierGroups.map(group => {
                      const isSelected = data.modifier_group_ids.includes(group.id);
                      return <button type="button" key={group.id} className={cn("flex items-center space-x-2 rounded-lg border p-3 text-left transition-colors", isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50")} onClick={() => toggleModifierGroup(group.id)}>
                        <Checkbox checked={isSelected} tabIndex={-1} /><span className="text-xs font-medium">{group.name}</span>
                      </button>;
                    })}
                  </div>}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="recipe">
                <AccordionTrigger>Recipe & kitchen {data.recipe_items.length > 0 ? `(${data.recipe_items.length} ingredients)` : ''}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {kitchenStations.length > 0 && <div className="grid gap-2"><Label>Kitchen Station</Label><Select value={data.kitchen_station_id} onValueChange={(val) => setData('kitchen_station_id', val)}><SelectTrigger><SelectValue placeholder="Select a station" /></SelectTrigger><SelectContent>{kitchenStations.map(ks => <SelectItem key={ks.id} value={ks.id.toString()}>{ks.name} ({ks.code || 'Station'})</SelectItem>)}</SelectContent></Select></div>}
                  <RecipeBuilder ingredients={ingredients} recipeItems={data.recipe_items} onChange={(items) => setData('recipe_items', items)} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tax">
                <AccordionTrigger>Tax settings</AccordionTrigger>
                <AccordionContent className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2"><Label htmlFor="tax_rate">Tax Rate (%)</Label><Input id="tax_rate" type="number" min="0" step="0.01" value={data.tax_rate} onChange={(e) => setData('tax_rate', e.target.value)} /></div>
                  <div className="mt-6 flex items-center justify-between rounded-lg border p-2.5"><Label htmlFor="is_tax_inclusive" className="cursor-pointer text-xs">Price includes tax</Label><Switch id="is_tax_inclusive" checked={data.is_tax_inclusive} onCheckedChange={(checked) => setData('is_tax_inclusive', checked)} /></div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter className="mt-6 border-t pt-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active" className="text-xs cursor-pointer">Shown on menu</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={data.is_available}
                  onCheckedChange={(checked) => setData('is_available', checked)}
                />
                <Label htmlFor="is_available" className="text-xs cursor-pointer">Available</Label>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={processing} className="bg-[#f97316] hover:bg-[#ea580c] text-white">
                {isEditing ? 'Save Changes' : 'Add Item'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
