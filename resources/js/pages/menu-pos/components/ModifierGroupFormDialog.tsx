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
import { Plus, Trash2 } from 'lucide-react';

export function ModifierGroupFormDialog({
  isOpen,
  setIsOpen,
  group = null,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  group?: any;
}) {
  const isEditing = !!group;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    is_required: false,
    min_selections: 0,
    max_selections: 1,
    modifiers: [] as { id?: number; name: string; price_adjustment: number }[],
  });

  useEffect(() => {
    if (group && isOpen) {
      setData({
        name: group.name || '',
        is_required: group.is_required ?? false,
        min_selections: group.min_selections ?? 0,
        max_selections: group.max_selections ?? 1,
        modifiers: group.modifiers?.map((m: any) => ({
            id: m.id,
            name: m.name,
            price_adjustment: m.price_adjustment
        })) || [],
      });
    } else if (isOpen) {
      reset();
    }
  }, [group, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(`/menu-pos/modifiers/${group.id}`, {
        onSuccess: () => setIsOpen(false),
      });
    } else {
      post('/menu-pos/modifiers', {
        onSuccess: () => {
          reset();
          setIsOpen(false);
        },
      });
    }
  };

  const addModifier = () => {
    setData('modifiers', [...data.modifiers, { name: '', price_adjustment: 0 }]);
  };

  const removeModifier = (index: number) => {
    const newMods = [...data.modifiers];
    newMods.splice(index, 1);
    setData('modifiers', newMods);
  };

  const updateModifier = (index: number, field: string, value: any) => {
    const newMods = [...data.modifiers];
    newMods[index] = { ...newMods[index], [field]: value };
    setData('modifiers', newMods);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Modifier Group' : 'Create Modifier Group'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update rules and options.' : 'Add add-ons, sizes, or variants.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g. Size, Extra Toppings"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                
                <div className="flex flex-col justify-center space-y-2 pt-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_required"
                            checked={data.is_required}
                            onCheckedChange={(checked) => setData('is_required', checked)}
                        />
                        <Label htmlFor="is_required">Required Selection</Label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="min">Minimum Selections</Label>
                    <Input
                        id="min"
                        type="number"
                        min="0"
                        value={data.min_selections}
                        onChange={(e) => setData('min_selections', parseInt(e.target.value))}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="max">Maximum Selections</Label>
                    <Input
                        id="max"
                        type="number"
                        min="1"
                        value={data.max_selections}
                        onChange={(e) => setData('max_selections', parseInt(e.target.value))}
                    />
                </div>
            </div>

            <div className="border-t pt-4 mt-2 space-y-4">
                <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Modifiers</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addModifier}>
                        <Plus className="h-4 w-4 mr-1" /> Add Option
                    </Button>
                </div>
                
                {data.modifiers.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No options added yet.</p>
                )}

                {data.modifiers.map((mod, index) => (
                    <div key={index} className="flex items-center gap-3 bg-muted/30 p-2 rounded-md">
                        <div className="flex-1">
                            <Input
                                placeholder="Option Name (e.g. Large)"
                                value={mod.name}
                                onChange={(e) => updateModifier(index, 'name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-32">
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="+ Price"
                                value={mod.price_adjustment}
                                onChange={(e) => updateModifier(index, 'price_adjustment', e.target.value)}
                                required
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeModifier(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
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
