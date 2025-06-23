
import React, { useState, useEffect } from 'react';
import { Plus, Save, Edit, Trash2, ShoppingCart } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { inventoryService, Member, Purchase } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

interface InvoiceItem {
  id?: number;
  item_name: string;
  quantity: number;
  rate: number;
  amount: number;
}

const PurchaseEntry = () => {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [suppliers, setSuppliers] = useState<Member[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [currentItem, setCurrentItem] = useState<InvoiceItem>({
    item_name: '',
    quantity: 0,
    rate: 0,
    amount: 0
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    // Calculate amount when quantity or rate changes
    const amount = currentItem.quantity * currentItem.rate;
    setCurrentItem(prev => ({ ...prev, amount }));
  }, [currentItem.quantity, currentItem.rate]);

  const fetchSuppliers = async () => {
    try {
      const response = await inventoryService.getMembers({ type: 'supplier', limit: 100 });
      if (response.success && response.data) {
        setSuppliers(response.data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load suppliers',
        variant: 'destructive'
      });
    }
  };

  const handleItemChange = (field: keyof InvoiceItem, value: string | number) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addOrUpdateItem = () => {
    if (!currentItem.item_name || currentItem.quantity <= 0 || currentItem.rate <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all item fields with valid values',
        variant: 'destructive'
      });
      return;
    }

    if (editingIndex !== null) {
      // Update existing item
      const updatedItems = [...invoiceItems];
      updatedItems[editingIndex] = { ...currentItem };
      setInvoiceItems(updatedItems);
      setEditingIndex(null);
    } else {
      // Add new item
      setInvoiceItems(prev => [...prev, { ...currentItem }]);
    }

    // Reset current item
    setCurrentItem({
      item_name: '',
      quantity: 0,
      rate: 0,
      amount: 0
    });
  };

  const editItem = (index: number) => {
    setCurrentItem({ ...invoiceItems[index] });
    setEditingIndex(index);
  };

  const removeItem = (index: number) => {
    setInvoiceItems(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setCurrentItem({
        item_name: '',
        quantity: 0,
        rate: 0,
        amount: 0
      });
    }
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((total, item) => total + item.amount, 0);
  };

  const saveInvoice = async () => {
    if (!invoiceNo || !selectedSupplier || invoiceItems.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill invoice number, select supplier, and add at least one item',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Save each item as a separate purchase
      for (const item of invoiceItems) {
        await inventoryService.createPurchase({
          member_id: parseInt(selectedSupplier),
          item_name: item.item_name,
          quantity: item.quantity,
          rate: item.rate,
          invoice_no: invoiceNo,
          invoice_date: invoiceDate,
          description: `Invoice: ${invoiceNo}`
        });
      }

      toast({
        title: 'Success',
        description: 'Invoice saved successfully',
        variant: 'default'
      });

      // Reset form
      setInvoiceNo('');
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setSelectedSupplier('');
      setInvoiceItems([]);
      setCurrentItem({
        item_name: '',
        quantity: 0,
        rate: 0,
        amount: 0
      });
    } catch (error: any) {
      console.error('Failed to save invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to save invoice',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Purchase Entry" subtitle="Create and manage purchase invoices">
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Invoice Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoice-no">Invoice No. *</Label>
              <Input
                id="invoice-no"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Enter invoice number"
              />
            </div>
            <div>
              <Label htmlFor="invoice-date">Invoice Date *</Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="supplier">Supplier *</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Item Entry */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <Label htmlFor="item-name">Item Name *</Label>
              <Input
                id="item-name"
                value={currentItem.item_name}
                onChange={(e) => handleItemChange('item_name', e.target.value)}
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
                onChange={(e) => handleItemChange('quantity', parseFloat(e.target.value) || 0)}
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
                onChange={(e) => handleItemChange('rate', parseFloat(e.target.value) || 0)}
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
              <Button onClick={addOrUpdateItem} className="w-full">
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

        {/* Items Table */}
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
                            onClick={() => editItem(index)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
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

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={saveInvoice} 
            disabled={loading || invoiceItems.length === 0}
            className="px-8"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Invoice
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PurchaseEntry;
