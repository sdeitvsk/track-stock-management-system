
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { inventoryService } from '../../services/inventoryService';
import { useToast } from '../../hooks/use-toast';

interface PurchaseItem {
  id: number;
  item_name: string;
  remaining_quantity: number;
  rate: string;
}

interface PurchaseItemSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PurchaseItemSelect: React.FC<PurchaseItemSelectProps> = ({
  value,
  onChange,
  placeholder = "Select item..."
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableItems();
  }, []);

  const fetchAvailableItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getPurchases(1, 100, {
        remaining_quantity_gt: 0
      });
      
      if (response.success && response.data) {
        // Filter items with remaining quantity > 0
        const availableItems = response.data.purchases?.filter(
          purchase => purchase.remaining_quantity > 0
        ) || [];
        setItems(availableItems);
      }
    } catch (error) {
      console.error('Failed to fetch available items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = items.find(item => item.id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItem ? (
            <span className="truncate">
              {selectedItem.item_name} (Available: {selectedItem.remaining_quantity})
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="Search items..." />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Loading...' : 'No available items found.'}
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.item_name}-${item.id}`}
                  onSelect={() => {
                    onChange(item.id.toString());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.item_name}</span>
                    <span className="text-xs text-muted-foreground">
                      Available: {item.remaining_quantity} | Rate: ${item.rate}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PurchaseItemSelect;
