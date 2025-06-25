
import React from 'react';
import { Plus, Edit } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import ItemNameAutocomplete from './ItemNameAutocomplete';

interface InvoiceItem {
  id?: number;
  item_name: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface ItemEntryFormProps {
  currentItem: InvoiceItem;
  editingIndex: number | null;
  onItemChange: (field: keyof InvoiceItem, value: string | number) => void;
  onAddOrUpdateItem: () => void;
}

const ItemEntryForm: React.FC<ItemEntryFormProps> = ({
  currentItem,
  editingIndex,
  onItemChange,
  onAddOrUpdateItem
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Items</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <Label htmlFor="item-name">Item Name *</Label>
          <ItemNameAutocomplete
            value={currentItem.item_name}
            onChange={(value) => onItemChange('item_name', value)}
            placeholder="Enter item name"
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={currentItem.quantity || ''}
            onChange={(e) => onItemChange('quantity', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="rate">Rate *</Label>
          <Input
            id="rate"
            type="number"
            min="0"
            step="0.01"
            value={currentItem.rate || ''}
            onChange={(e) => onItemChange('rate', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={currentItem.amount.toFixed(2)}
            readOnly
            className="bg-slate-50"
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

export default ItemEntryForm;
