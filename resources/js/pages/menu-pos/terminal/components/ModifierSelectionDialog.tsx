import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Label } from '@/components/shadcn/ui/label';
import { Badge } from '@/components/shadcn/ui/badge';

interface ModifierSelectionDialogProps {
    item: any | null;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onAddToCart: (item: any, selectedModifiers: any) => void;
}

export function ModifierSelectionDialog({ item, isOpen, setIsOpen, onAddToCart }: ModifierSelectionDialogProps) {
    // Record<groupId, array of selected modifier objects>
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, any[]>>({});
    
    // Reset state when a new item is selected
    useEffect(() => {
        if (item && isOpen) {
            setSelectedModifiers({});
        }
    }, [item, isOpen]);

    if (!item) return null;

    const modifierGroups = item.modifier_groups || [];

    const handleSingleSelect = (groupId: string, modifier: any) => {
        setSelectedModifiers(prev => ({
            ...prev,
            [groupId]: [modifier]
        }));
    };

    const handleMultiSelect = (groupId: string, modifier: any, checked: boolean, maxSelections: number) => {
        setSelectedModifiers(prev => {
            const current = prev[groupId] || [];
            if (checked) {
                if (current.some(m => m.id === modifier.id)) return prev; // prevent duplicate addition from event bubbling
                if (current.length >= maxSelections) return prev; // prevent exceeding max
                return { ...prev, [groupId]: [...current, modifier] };
            } else {
                return { ...prev, [groupId]: current.filter(m => m.id !== modifier.id) };
            }
        });
    };

    const isValid = modifierGroups.every((group: any) => {
        const count = (selectedModifiers[group.id] || []).length;
        if (group.is_required && count < group.min_selections) return false;
        return true;
    });

    const calculateItemTotal = () => {
        let total = parseFloat(item.price);
        Object.values(selectedModifiers).flat().forEach((mod: any) => {
            total += parseFloat(mod.price_adjustment);
        });
        return total;
    };

    const handleConfirm = () => {
        if (!isValid) return;
        onAddToCart(item, selectedModifiers);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <div className="p-6 pb-2 border-b">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{item.name}</DialogTitle>
                        <DialogDescription className="text-base">${parseFloat(item.price).toFixed(2)}</DialogDescription>
                    </DialogHeader>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                    <div className="space-y-8">
                        {modifierGroups.map((group: any) => {
                            const isSingleSelect = group.max_selections === 1;
                            const currentSelections = selectedModifiers[group.id] || [];

                            return (
                                <div key={group.id} className="space-y-4">
                                    <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border">
                                        <div>
                                            <h3 className="font-semibold text-lg">{group.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {group.is_required ? `Required (Select ${group.min_selections})` : `Optional (Select up to ${group.max_selections})`}
                                            </p>
                                        </div>
                                        {group.is_required && currentSelections.length < group.min_selections && (
                                            <Badge variant="destructive">Required</Badge>
                                        )}
                                    </div>

                                    {isSingleSelect ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {group.modifiers.map((modifier: any) => (
                                                <div 
                                                    key={modifier.id} 
                                                    onClick={() => handleSingleSelect(group.id, modifier)}
                                                    className={`flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer ${currentSelections[0]?.id === modifier.id ? 'border-primary bg-primary/5' : ''}`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${currentSelections[0]?.id === modifier.id ? 'border-primary' : 'border-input'}`}>
                                                            {currentSelections[0]?.id === modifier.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                        </div>
                                                        <span className="cursor-pointer flex-1 font-medium">{modifier.name}</span>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {parseFloat(modifier.price_adjustment) > 0 ? `+$${parseFloat(modifier.price_adjustment).toFixed(2)}` : ''}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {group.modifiers.map((modifier: any) => {
                                                const isSelected = currentSelections.some((m: any) => m.id === modifier.id);
                                                const isAtMax = !isSelected && currentSelections.length >= group.max_selections;
                                                return (
                                                    <div 
                                                        key={modifier.id} 
                                                        onClick={() => { if (!isAtMax) handleMultiSelect(group.id, modifier, !isSelected, group.max_selections) }}
                                                        className={`flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : ''} ${isAtMax ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className="flex items-center space-x-3 flex-1">
                                                            <Checkbox 
                                                                id={`mod-${modifier.id}`} 
                                                                checked={isSelected}
                                                                disabled={isAtMax}
                                                                onCheckedChange={(checked) => handleMultiSelect(group.id, modifier, checked as boolean, group.max_selections)}
                                                            />
                                                            <Label htmlFor={`mod-${modifier.id}`} className="cursor-pointer flex-1 font-medium">{modifier.name}</Label>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            {parseFloat(modifier.price_adjustment) > 0 ? `+$${parseFloat(modifier.price_adjustment).toFixed(2)}` : ''}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 border-t bg-background">
                    <Button 
                        size="lg" 
                        className="w-full text-lg h-14" 
                        onClick={handleConfirm}
                        disabled={!isValid}
                    >
                        Add to Order - ${calculateItemTotal().toFixed(2)}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
