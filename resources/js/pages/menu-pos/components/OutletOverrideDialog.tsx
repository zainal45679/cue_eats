import { useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';

export function OutletOverrideDialog({
  isOpen,
  setIsOpen,
  item = null,
  locations = [],
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item?: any;
  locations: any[];
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    business_location_id: '',
    menu_item_id: '',
    price: '',
    is_available: true,
    is_active: true,
  });

  useEffect(() => {
    if (item && isOpen) {
      setData({
        business_location_id: locations.length > 0 ? locations[0].id.toString() : '',
        menu_item_id: item.id?.toString() || '',
        price: item.price?.toString() || '',
        is_available: item.is_available ?? true,
        is_active: item.is_active ?? true,
      });
    } else if (isOpen) {
      reset();
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/menu-pos/items/outlet-overrides', {
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Outlet Price & Stock Override</DialogTitle>
            <DialogDescription>
              Override base pricing and availability for {item?.name} at a specific outlet/branch.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select Outlet / Business Location</Label>
              <Select 
                value={data.business_location_id} 
                onValueChange={(val) => setData('business_location_id', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Outlet" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Master Base Price: ${item?.price}</Label>
              <Label htmlFor="override_price">Outlet Override Price ($)</Label>
              <Input
                id="override_price"
                type="number"
                step="0.01"
                placeholder={`Default: $${item?.price || 0}`}
                value={data.price}
                onChange={(e) => setData('price', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div>
                <Label htmlFor="outlet_available" className="font-semibold cursor-pointer">Available at this Outlet</Label>
                <p className="text-xs text-muted-foreground">In Stock for orders at this location</p>
              </div>
              <Switch
                id="outlet_available"
                checked={data.is_available}
                onCheckedChange={(checked) => setData('is_available', checked)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={processing} className="bg-[#f97316] hover:bg-[#ea580c] text-white">
              Save Override
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
