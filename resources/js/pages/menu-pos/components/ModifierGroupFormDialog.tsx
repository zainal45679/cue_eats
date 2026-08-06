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
import { Plus, Trash2, UtensilsCrossed, ChevronDown, ChevronUp } from 'lucide-react';
import { RecipeBuilder } from './RecipeBuilder';
import { cn } from '@/lib/utils';

export function ModifierGroupFormDialog({
  isOpen,
  setIsOpen,
  group = null,
  ingredients = [],
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  group?: any;
  ingredients?: any[];
}) {
  const isEditing = !!group;
  const [expandedRecipeIndex, setExpandedRecipeIndex] = useState<number | null>(null);

  const { data, setData, post, put, processing, errors, reset, transform } = useForm({
    name: '',
    is_required: false,
    min_selections: 0,
    max_selections: 1,
    modifiers: [] as { id?: number; name: string; price_adjustment: number; recipe_items: any[] }[],
  });

  // Clean up empty recipes before submitting
  transform((data) => ({
    ...data,
    modifiers: data.modifiers.map(mod => ({
      ...mod,
      recipe_items: mod.recipe_items ? mod.recipe_items.filter((ri: any) => ri.ingredient_id && ri.quantity && parseFloat(ri.quantity) > 0) : []
    }))
  }));

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
            price_adjustment: m.price_adjustment,
            recipe_items: m.recipe_items?.map((ri: any) => ({
                ingredient_id: ri.ingredient_id?.toString() || '',
                quantity: ri.quantity?.toString() || ''
            })) || []
        })) || [],
      });
      setExpandedRecipeIndex(null);
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
    setData('modifiers', [...data.modifiers, { name: '', price_adjustment: 0, recipe_items: [] }]);
    setExpandedRecipeIndex(data.modifiers.length); // Open the new modifier's recipe by default
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
                    <div key={index} className="flex flex-col gap-2 bg-muted/30 p-3 rounded-md border">
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Option Name (e.g. Large)"
                                    value={mod.name}
                                    onChange={(e) => updateModifier(index, 'name', e.target.value)}
                                    required
                                    className="bg-background"
                                />
                            </div>
                            <div className="w-32">
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="+ Price"
                                    value={mod.price_adjustment}
                                    onChange={(e) => updateModifier(index, 'price_adjustment', e.target.value)}
                                    required
                                    className="bg-background"
                                />
                            </div>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className={cn("px-2", expandedRecipeIndex === index && "bg-accent")}
                                onClick={() => setExpandedRecipeIndex(expandedRecipeIndex === index ? null : index)}
                                title="Manage Recipe"
                            >
                                <UtensilsCrossed className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-xs">Recipe {(mod.recipe_items?.length || 0) > 0 && `(${mod.recipe_items.length})`}</span>
                                {expandedRecipeIndex === index ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeModifier(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        {expandedRecipeIndex === index && (
                            <div className="mt-2 p-3 bg-background border rounded-md shadow-sm">
                                <RecipeBuilder
                                    ingredients={ingredients}
                                    recipeItems={mod.recipe_items || []}
                                    onChange={(newItems) => updateModifier(index, 'recipe_items', newItems)}
                                    title="Modifier Recipe"
                                    description={`Specify ingredients that are consumed when '${mod.name || 'this option'}' is selected.`}
                                />
                            </div>
                        )}
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
