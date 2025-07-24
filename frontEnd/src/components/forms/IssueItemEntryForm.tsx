import React, { useState } from 'react';
import { Plus, Edit } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import PurchaseItemSelect from './PurchaseItemSelect';

interface IssueItem {
  id?: number;
  purchase_id: string;
  item_name: string;
  quantity: number;
  remaining_quantity?: number; // <-- add this line
}

interface IssueItemEntryFormProps {
  currentItem: IssueItem;
  editingIndex: number | null;
  onItemChange: (field: keyof IssueItem, value: string | number | { purchase_id: string; item_name: string }) => void;
  onAddOrUpdateItem: () => void;
}

const IssueItemEntryForm: React.FC<IssueItemEntryFormProps> = ({
  currentItem,
  editingIndex,
  onItemChange,
  onAddOrUpdateItem
}) => {
  const [remainingQuantity, setRemainingQuantity] = useState(0);

  // Update remainingQuantity when item changes
  React.useEffect(() => {
    if (currentItem && typeof currentItem.remaining_quantity === 'number') {
      setRemainingQuantity(currentItem.remaining_quantity);
    } else {
      setRemainingQuantity(0);
    }
  }, [currentItem.purchase_id, currentItem.remaining_quantity]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Items</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <Label htmlFor="item-name">Item Name *</Label>
          <PurchaseItemSelect
            value={currentItem.purchase_id}
            onChange={(val) =>  { 
              onItemChange('purchase_id', val);
              // Set remaining quantity when item is selected
              if (val && typeof val.remaining_quantity === 'number') {
                setRemainingQuantity(val.remaining_quantity);
                // Optionally reset quantity if it exceeds new remaining
                if (currentItem.quantity > val.remaining_quantity) {
                  onItemChange('quantity', val.remaining_quantity);
                }
              } else {
                setRemainingQuantity(0);
              }
            }}
            placeholder="Select available item"
          />
        
        </div>
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={remainingQuantity || undefined}
            value={currentItem.quantity || ''}
            onChange={(e) => {
              let val = parseFloat(e.target.value) || 0;
              if (val > remainingQuantity) {
                val = remainingQuantity;
              }
              onItemChange('quantity', val);
            }}
            placeholder="0"
          />
        </div>
        <div>
          <Button onClick={onAddOrUpdateItem} className="w-full">
            {editingIndex !== null ? (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Update
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IssueItemEntryForm;
