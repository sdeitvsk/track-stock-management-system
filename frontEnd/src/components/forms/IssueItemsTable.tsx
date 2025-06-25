
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface IssueItem {
  id?: number;
  purchase_id: string;
  item_name: string;
  quantity: number;
}

interface IssueItemsTableProps {
  items: IssueItem[];
  onEditItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
}

const IssueItemsTable: React.FC<IssueItemsTableProps> = ({
  items,
  onEditItem,
  onRemoveItem
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Issue Items</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  No items added yet
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.item_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditItem(index)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IssueItemsTable;
