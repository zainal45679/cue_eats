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

export function CategoryFormDialog({
  isOpen,
  setIsOpen,
  category = null,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  category?: any;
}) {
  const isEditing = !!category;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (category && isOpen) {
      setData({
        name: category.name || '',
        description: category.description || '',
        is_active: category.is_active ?? true,
        sort_order: category.sort_order ?? 0,
      });
    } else if (isOpen) {
      reset();
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(`/menu-pos/categories/${category.id}`, {
        onSuccess: () => setIsOpen(false),
      });
    } else {
      post('/menu-pos/categories', {
        onSuccess: () => {
          reset();
          setIsOpen(false);
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details for this category.' : 'Add a new category to your menu.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. Burgers"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                    id="sort_order"
                    type="number"
                    value={data.sort_order}
                    onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                />
                </div>
                
                <div className="flex flex-col justify-center space-y-2 pt-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked)}
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>
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
