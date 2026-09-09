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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';

export function BulkActionDialog({
  isOpen,
  setIsOpen,
  categories = [],
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  categories: any[];
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    category_id: '',
    action_type: 'price_percentage',
    value: '10',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/menu-pos/items/bulk-update', {
      onSuccess: () => {
        reset();
        setIsOpen(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Bulk Operations Tool</DialogTitle>
            <DialogDescription>
              Batch update item prices or toggle stock availability across an entire category or full menu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Target Category</Label>
              <Select 
                value={data.category_id} 
                onValueChange={(val) => setData('category_id', val === 'all' ? '' : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories (Full Menu)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- All Categories (Full Menu) --</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Bulk Operation Type</Label>
              <Select 
                value={data.action_type} 
                onValueChange={(val) => setData('action_type', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_percentage">Increase/Decrease Price by %</SelectItem>
                  <SelectItem value="price_flat">Increase/Decrease Price by Flat Amount ($)</SelectItem>
                  <SelectItem value="toggle_available">Batch Set Availability (In Stock / Out of Stock)</SelectItem>
                  <SelectItem value="toggle_active">Batch Set Active Status (Enabled / Disabled)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.action_type === 'price_percentage' && (
              <div className="grid gap-2">
                <Label htmlFor="val_pct">Percentage Change (% e.g. 10 for +10%, -5 for -5%)</Label>
                <Input
                  id="val_pct"
                  type="number"
                  placeholder="10"
                  value={data.value}
                  onChange={(e) => setData('value', e.target.value)}
                />
              </div>
            )}

            {data.action_type === 'price_flat' && (
              <div className="grid gap-2">
                <Label htmlFor="val_flat">Flat Amount ($ e.g. 2.00 for +$2.00, -1.00 for -$1.00)</Label>
                <Input
                  id="val_flat"
                  type="number"
                  step="0.01"
                  placeholder="2.00"
                  value={data.value}
                  onChange={(e) => setData('value', e.target.value)}
                />
              </div>
            )}

            {(data.action_type === 'toggle_available' || data.action_type === 'toggle_active') && (
              <div className="grid gap-2">
                <Label>Set Status To</Label>
                <Select 
                  value={data.value} 
                  onValueChange={(val) => setData('value', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enable / In Stock ✅</SelectItem>
                    <SelectItem value="false">Disable / Out of Stock ❌</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-end border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={processing} className="bg-[#f97316] hover:bg-[#ea580c] text-white">
              Apply Bulk Change
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
