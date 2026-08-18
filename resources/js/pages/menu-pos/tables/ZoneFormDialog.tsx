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
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';

interface ZoneFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    zone?: any;
}

export function ZoneFormDialog({ open, onOpenChange, zone }: ZoneFormDialogProps) {
    const isEditing = !!zone;
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    useEffect(() => {
        if (zone) {
            setName(zone.name || '');
            setDescription(zone.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [zone, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = { name, description };

        if (isEditing) {
            router.put(`/menu-pos/zones/${zone.id}`, payload, {
                onSuccess: () => {
                    setSubmitting(false);
                    onOpenChange(false);
                },
                onError: () => setSubmitting(false),
            });
        } else {
            router.post('/menu-pos/zones', payload, {
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
                        <DialogTitle>{isEditing ? 'Edit Dining Zone' : 'Add Dining Zone'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="zone-name" className="text-right">
                                Zone Name
                            </Label>
                            <Input
                                id="zone-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Main Hall, Outdoor Terrace"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="zone-desc" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="zone-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {isEditing ? 'Save Changes' : 'Create Zone'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
