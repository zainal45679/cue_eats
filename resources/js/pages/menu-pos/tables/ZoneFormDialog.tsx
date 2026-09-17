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
import { Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
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
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

    useEffect(() => {
        if (!open) return;
        if (zone) {
            setName(zone.name || '');
            setDescription(zone.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [zone, open]);


    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setSubmitting(true);
        router.delete(`/menu-pos/zones/${zone.id}`, {
            onSuccess: () => {
                setSubmitting(false);
                setShowDeleteConfirm(false);
                onOpenChange(false);
                toast.success('Dining zone deleted successfully.');
            },
            onError: (errors: any) => {
                setSubmitting(false);
                setShowDeleteConfirm(false);
                toast.error(errors?.error || 'Failed to delete dining zone.');
            },
        });
    };

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
                            <Button type="submit" className="flex-1 sm:flex-none" disabled={submitting}>
                                {isEditing ? 'Save Changes' : 'Create Zone'}
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
                            Delete Dining Zone
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete dining zone <strong>{zone?.name}</strong>? All tables inside it will also be removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={submitting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                            onClick={confirmDelete}
                        >
                            {submitting ? 'Deleting...' : 'Delete Zone'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}
