
import React from 'react';
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
}

interface IssueItemEntryFormProps {
  currentItem: IssueItem;
  editingIndex: number | null;
  onItemChange: (field: keyof IssueItem, value: string | number) => void;
  onAddOrUpdateItem: () => void;
}

const IssueItemEntryForm: React.FC<IssueItemEntryFormProps> = ({
  currentItem,
  editingIndex,
  onItemChange,
  onAddOrUpdateItem
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Items</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <Label htmlFor="item-name">Item Name *</Label>
          <PurchaseItemSelect
            value={currentItem.purchase_id}
            onChange={(value) => onItemChange('purchase_id', value)}
            placeholder="Select available item"
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
