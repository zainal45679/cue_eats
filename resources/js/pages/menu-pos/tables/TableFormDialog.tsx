import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/ui/select';

interface TableFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    table?: any;
    zones: any[];
    defaultZoneId?: string;
}

export function TableFormDialog({ open, onOpenChange, table, zones, defaultZoneId }: TableFormDialogProps) {
    const isEditing = !!table;
    const [name, setName] = React.useState('');
    const [seatingCapacity, setSeatingCapacity] = React.useState<number>(4);
    const [diningZoneId, setDiningZoneId] = React.useState<string>('');
    const [submitting, setSubmitting] = React.useState(false);

    useEffect(() => {
        if (table) {
            setName(table.name || '');
            setSeatingCapacity(table.seating_capacity || 4);
            setDiningZoneId(table.dining_zone_id || defaultZoneId || '');
        } else {
            setName('');
            setSeatingCapacity(4);
            setDiningZoneId(defaultZoneId || (zones.length > 0 ? zones[0].id : ''));
        }
    }, [table, open, defaultZoneId, zones]);


    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this table?')) return;
        setSubmitting(true);
        router.delete(`/menu-pos/tables/${table.id}`, {
            onSuccess: () => {
                setSubmitting(false);
                onOpenChange(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {

        e.preventDefault();
        setSubmitting(true);

        const payload = {
            name,
            seating_capacity: Number(seatingCapacity),
            dining_zone_id: diningZoneId,
        };

        if (isEditing) {
            router.put(`/menu-pos/tables/${table.id}`, payload, {
                onSuccess: () => {
                    setSubmitting(false);
                    onOpenChange(false);
                },
                onError: () => setSubmitting(false),
            });
        } else {
            router.post('/menu-pos/tables/create', payload, {
                onSuccess: () => {
                    setSubmitting(false);
                    onOpenChange(false);
                },
                onError: () => setSubmitting(false),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Dining Table' : 'Add New Table'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="zone-select" className="text-right">
                                Zone
                            </Label>
                            <Select value={diningZoneId} onValueChange={setDiningZoneId} disabled={isEditing}>
                                <SelectTrigger className="col-span-3" id="zone-select">
                                    <SelectValue placeholder="Select Zone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {zones.map((z) => (
                                        <SelectItem key={z.id} value={z.id}>
                                            {z.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="table-name" className="text-right">
                                Table Name
                            </Label>
                            <Input
                                id="table-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Table 1, Patio T-2, VIP Suite"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="capacity" className="text-right">
                                Seats (Pax)
                            </Label>
                            <Input
                                id="capacity"
                                type="number"
                                min={1}
                                max={50}
                                value={seatingCapacity}
                                onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-between w-full mt-4">
                        {isEditing ? (
                            <Button type="button" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 px-3 w-full sm:w-auto" onClick={handleDelete} disabled={submitting}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                        ) : <div className="hidden sm:block"></div>}
                        <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
                            <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 sm:flex-none" disabled={submitting || !diningZoneId}>
                                {isEditing ? 'Save Changes' : 'Create Table'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
