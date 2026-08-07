import { useState, useMemo } from 'react';
import { Label } from '@/components/shadcn/ui/label';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/shadcn/ui/command';
import { Plus, Trash2, Utensils, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeBuilderProps {
    ingredients: any[];
    recipeItems: any[];
    onChange: (items: any[]) => void;
    title?: string;
    description?: string;
    emptyTitle?: string;
    emptyDescription?: string;
}

export function RecipeBuilder({
    ingredients = [],
    recipeItems = [],
    onChange,
    title = "Recipe & Ingredients",
    description = "Define the bill of materials for this item. These ingredients will be automatically deducted from inventory when this item is sold.",
    emptyTitle = "No ingredients added",
    emptyDescription = "This item currently doesn't track any inventory items."
}: RecipeBuilderProps) {
    const [openComboboxes, setOpenComboboxes] = useState<Record<number, boolean>>({});

    const groupedIngredients = useMemo(() => {
        return ingredients.reduce((acc, ing) => {
            const categoryName = ing.category?.name || 'Uncategorized';
            if (!acc[categoryName]) acc[categoryName] = [];
            acc[categoryName].push(ing);
            return acc;
        }, {} as Record<string, any[]>);
    }, [ingredients]);

    return (
        <div className="border-t pt-4 mt-4">
            <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                    <Label className="text-base font-semibold">{title}</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                </div>
                {recipeItems.length > 0 && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onChange([])} 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 text-xs font-medium"
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {recipeItems.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-3">
                        <Utensils className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-sm font-medium">{emptyTitle}</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">{emptyDescription}</p>
                    <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => onChange([{ ingredient_id: '', quantity: '' }])}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Start Building Recipe
                    </Button>
                </div>
            ) : (
                <div className="space-y-3 mt-2">
                    <div className="flex items-center text-xs font-medium text-muted-foreground px-1 pb-2 border-b">
                        <div className="flex-1">Ingredient</div>
                        <div className="w-32 text-right pr-4">Quantity</div>
                        <div className="w-9"></div>
                    </div>
                    {recipeItems.map((ri, index) => {
                        const selectedIngredient = ingredients?.find(i => i.id.toString() === ri.ingredient_id?.toString());
                        const uomCode = selectedIngredient?.base_uom?.code || 'Units';
                        
                        const isQuantityInvalid = !ri.quantity || parseFloat(ri.quantity) <= 0;
                        const isIngredientMissing = !ri.ingredient_id;
                        const isRowInvalid = isQuantityInvalid || isIngredientMissing;
                        
                        return (
                            <div key={index} className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border bg-card shadow-sm transition-colors hover:bg-accent/10",
                                isRowInvalid && "border-destructive/40 bg-destructive/5"
                            )}>
                                <div className="flex-1">
                                    <Popover 
                                        open={openComboboxes[index] || false} 
                                        onOpenChange={(open) => setOpenComboboxes({...openComboboxes, [index]: open})}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between h-9 font-normal px-3",
                                                    !ri.ingredient_id && "text-muted-foreground border-destructive/50"
                                                )}
                                            >
                                                {selectedIngredient ? (
                                                    <span className="truncate pr-2">{selectedIngredient.name}</span>
                                                ) : (
                                                    <span>Search ingredient...</span>
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start" onWheel={(e) => e.stopPropagation()}>
                                            <Command>
                                                <CommandInput placeholder="Search by name or SKU..." />
                                                <CommandList className="max-h-[250px] overflow-y-auto">
                                                    <CommandEmpty>No ingredient found.</CommandEmpty>
                                                    {Object.entries(groupedIngredients || {}).map(([category, items]) => (
                                                        <CommandGroup key={category} heading={category}>
                                                            {items.map((ing) => {
                                                                const isAlreadyAdded = recipeItems.some((item, idx) => idx !== index && item.ingredient_id?.toString() === ing.id.toString());
                                                                
                                                                return (
                                                                    <CommandItem
                                                                        key={ing.id}
                                                                        value={`${ing.name} ${ing.code}`}
                                                                        onSelect={() => {
                                                                            if (isAlreadyAdded) return;
                                                                            const newItems = [...recipeItems];
                                                                            newItems[index].ingredient_id = ing.id.toString();
                                                                            onChange(newItems);
                                                                            setOpenComboboxes({...openComboboxes, [index]: false});
                                                                        }}
                                                                        disabled={isAlreadyAdded}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                ri.ingredient_id?.toString() === ing.id.toString() ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        <div className="flex flex-col w-full">
                                                                            <div className="flex items-center justify-between w-full">
                                                                                <span>{ing.name}</span>
                                                                                {isAlreadyAdded && <span className="text-[10px] text-destructive ml-2 font-medium">(Added)</span>}
                                                                            </div>
                                                                            <span className="text-[10px] text-muted-foreground opacity-70 font-mono">{ing.code}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                )
                                                            })}
                                                        </CommandGroup>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {selectedIngredient && (
                                        <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
                                            SKU: <span className="font-mono">{selectedIngredient.code}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="w-32 flex items-center relative">
                                    <Input 
                                        type="number" 
                                        step="any" 
                                        min="0"
                                        placeholder="0.000" 
                                        className={cn(
                                            "h-9 pr-12 text-right font-medium font-mono text-sm",
                                            isQuantityInvalid && "border-destructive/50"
                                        )}
                                        value={ri.quantity}
                                        onChange={(e) => {
                                            const newItems = [...recipeItems];
                                            newItems[index].quantity = e.target.value;
                                            onChange(newItems);
                                        }}
                                    />
                                    <div className="absolute right-3 text-[10px] font-semibold text-muted-foreground pointer-events-none select-none uppercase">
                                        {uomCode}
                                    </div>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 mt-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => {
                                        const newItems = [...recipeItems];
                                        newItems.splice(index, 1);
                                        onChange(newItems);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        );
                    })}
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full mt-2 border-dashed bg-transparent hover:bg-accent h-9 text-xs"
                        onClick={() => onChange([...recipeItems, { ingredient_id: '', quantity: '' }])}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Another Ingredient
                    </Button>
                    <div className="flex items-center justify-between pt-2 px-1">
                        <span className="text-xs text-muted-foreground font-medium">Total Ingredients: {recipeItems.length}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
