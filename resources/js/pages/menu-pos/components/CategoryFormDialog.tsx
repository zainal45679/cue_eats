import { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Switch } from '@/components/shadcn/ui/switch';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/shadcn/ui/alert-dialog';
import { toast } from 'sonner';

export function CategoryFormDialog({
  isOpen,
  setIsOpen,
  category = null,
  initialParentId = null,
  parentCategories = [],
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  category?: any;
  initialParentId?: string | number | null;
  parentCategories?: any[];
}) {
  const isEditing = !!category;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    parent_id: initialParentId ? initialParentId.toString() : '',
    name: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (category && isOpen) {
      setData({
        parent_id: category.parent_id?.toString() || '',
        name: category.name || '',
        description: category.description || '',
        is_active: category.is_active ?? true,
        sort_order: category.sort_order ?? 0,
      });
    } else if (isOpen) {
      reset();
      if (initialParentId) {
        setData('parent_id', initialParentId.toString());
      }
    }
  }, [category, isOpen, initialParentId]);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    router.delete(`/menu-pos/categories/${category.id}`, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setIsOpen(false);
        toast.success('Category deleted successfully.');
      },
      onError: (err: any) => {
        setShowDeleteConfirm(false);
        toast.error(err?.error || 'Failed to delete category.');
      }
    });
  };

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
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update details for this menu category.' : 'Add a new menu category (e.g. Burgers, Beverages, Desserts).'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">

            <div className="grid gap-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. Hot Beverages"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={3}
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
                  onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="flex flex-col justify-center space-y-2 pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', checked)}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between w-full mt-4 border-t pt-4">
            {isEditing ? (
              <Button type="button" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 px-3 w-full sm:w-auto" onClick={handleDelete} disabled={processing}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : <div className="hidden sm:block"></div>}
            <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
              <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 sm:flex-none bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={processing}>
                {processing ? 'Saving...' : 'Save Category'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete category <strong>{category?.name}</strong>? All items inside it might be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              onClick={confirmDelete}
            >
              {processing ? 'Deleting...' : 'Delete Category'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
