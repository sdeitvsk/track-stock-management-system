
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface InvoiceItem {
  id?: number;
  item_name: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface ItemsTableProps {
  invoiceItems: InvoiceItem[];
  onEditItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
  calculateTotal: () => number;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  invoiceItems,
  onEditItem,
  onRemoveItem,
  calculateTotal
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Invoice Items</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoiceItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No items added yet
                </TableCell>
              </TableRow>
            ) : (
              invoiceItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.item_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.rate.toFixed(2)}</TableCell>
                  <TableCell>${item.amount.toFixed(2)}</TableCell>
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
            {invoiceItems.length > 0 && (
              <TableRow className="bg-slate-50 font-medium">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell>${calculateTotal().toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ItemsTable;
