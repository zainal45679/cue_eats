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

export function MenuItemFormDialog({
  isOpen,
  setIsOpen,
  item = null,
  initialCategoryId = null,
  categories,
  modifierGroups,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item?: any;
  initialCategoryId?: number | null;
  categories: any[];
  modifierGroups: any[];
}) {
  const isEditing = !!item;

  const { data, setData, post, processing, errors, reset } = useForm({
    menu_category_id: '',
    name: '',
    description: '',
    price: '',
    image: null as File | string | null,
    is_active: true,
    is_available: true,
    modifier_group_ids: [] as number[],
    _method: 'post',
  });

  useEffect(() => {
    if (item && isOpen) {
      setData({
        menu_category_id: item.menu_category_id?.toString() || '',
        name: item.name || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        image: item.image || null,
        is_active: item.is_active ?? true,
        is_available: item.is_available ?? true,
        modifier_group_ids: item.modifier_groups?.map((g: any) => g.id) || [],
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

  const toggleModifierGroup = (id: number) => {
    const ids = data.modifier_group_ids.includes(id)
        ? data.modifier_group_ids.filter((groupId: number) => groupId !== id)
        : [...data.modifier_group_ids, id];
    setData('modifier_group_ids', ids);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Menu Item' : 'Create Menu Item'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details for this item.' : 'Add a new item to your menu.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={data.menu_category_id} 
                onValueChange={(val) => setData('menu_category_id', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.menu_category_id && <p className="text-sm text-destructive">{errors.menu_category_id}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                
                <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={data.price}
                    onChange={(e) => setData('price', e.target.value)}
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image</Label>
              <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
              />
              {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
              {typeof data.image === 'string' && data.image && (
                  <div className="mt-2 flex items-center gap-4">
                      <img src={`/storage/${data.image}`} alt="Current" className="w-16 h-16 object-cover rounded-md" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setData('image', null)} className="text-destructive h-8">Remove Image</Button>
                  </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="is_active"
                        checked={data.is_active}
                        onCheckedChange={(checked) => setData('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Active (Visible)</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="is_available"
                        checked={data.is_available}
                        onCheckedChange={(checked) => setData('is_available', checked)}
                    />
                    <Label htmlFor="is_available">Available (In Stock)</Label>
                </div>
            </div>

            <div className="border-t pt-4 mt-2">
                <Label className="mb-2 block">Linked Modifier Groups</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {modifierGroups.map(group => (
                        <div key={group.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`mod-${group.id}`} 
                                checked={data.modifier_group_ids.includes(group.id)}
                                onCheckedChange={() => toggleModifierGroup(group.id)}
                            />
                            <Label htmlFor={`mod-${group.id}`} className="font-normal">{group.name}</Label>
                        </div>
                    ))}
                </div>
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
