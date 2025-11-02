import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { inventoryService, Member, Purchase } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';
import InvoiceHeader from '../components/forms/InvoiceHeader';
import ItemEntryForm from '../components/forms/ItemEntryForm';
import ItemsTable from '../components/forms/ItemsTable';
import PurchaseActions from '../components/forms/PurchaseActions';
import { Toaster } from "@/components/ui/toaster";
import productService from '../services/productService';

interface InvoiceItem {
  id?: number;
  item_name: string;
  quantity: number;
  rate: number;
  amount: number;
  item_id: number;
}

const PurchaseEntry = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editTransactionId = searchParams.get('edit');
  const isEditing = !!editTransactionId;
  
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [suppliers, setSuppliers] = useState<Member[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [currentItem, setCurrentItem] = useState<InvoiceItem>({
    item_name: '',
    quantity: 0,
    rate: 0,
    amount: 0,
    item_id: 0
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
    if (isEditing) {
      loadTransactionForEdit(editTransactionId);
    }
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

  const loadTransactionForEdit = async (transactionId: string) => {
    try {
      setLoading(true);
      // Get all purchases for this transaction
      const response = await inventoryService.getPurchases(1, 100, { transaction_id: transactionId });
      
      if (response.success && response.data && response.data.purchases && response.data.purchases.length > 0) {
        const purchases = response.data.purchases;
        const firstPurchase = purchases[0];
        
        // Set form data from the first purchase's transaction
        setInvoiceNo(firstPurchase.transaction.invoice_no || '');
        setInvoiceDate(firstPurchase.transaction.invoice_date?.split('T')[0] || new Date().toISOString().split('T')[0]);
        setSelectedSupplier(firstPurchase.transaction.member_id.toString());
        
        // Convert purchases to invoice items
        const items: InvoiceItem[] = purchases.map(purchase => ({
          id: purchase.id,
          item_name: purchase.item_name,
          quantity: purchase.quantity,
          rate: parseFloat(purchase.rate),
          amount: purchase.quantity * parseFloat(purchase.rate),
          item_id: purchase.item_id
        }));
        
        setInvoiceItems(items);
      }
    } catch (error) {
      console.error('Failed to load transaction for edit:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (field: keyof InvoiceItem, value: string | number) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addOrUpdateItem = async () => {
  // make a shallow copy to work with immediately
  let itemToSave = { ...currentItem };

  // If no item_id, create product and update the local item object
  if (!itemToSave.item_id) {
    toast({
      title: `Product not found, creating new product...`,
      description: 'Please select a valid item',
    });

    try {
      const newProduct = await productService.createProduct({ item_name: itemToSave.item_name });

      console.log('New product created:', newProduct);

      // adapt to whatever your API returns (id, productId, etc.)
      const newId = newProduct.id;
      if (!newId) {
        throw new Error('Created product did not return an id');
      }

      // set local item id so subsequent validation uses it
      itemToSave.item_id = newId;

      // also update component state so the UI reflects the created product
      setCurrentItem(prev => ({
        ...prev,
        item_id: newId,
      }));
    } catch (error) {
      console.error('Failed to create product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive'
      });
      return; // stop if product creation failed
    }
  }

  // compute amount (optional but recommended)
  itemToSave.amount = (itemToSave.quantity || 0) * (itemToSave.rate || 0);

// validate using the local item copy
const validationErrors: string[] = [];

if (!itemToSave.item_name?.trim()) {
  validationErrors.push('Item name is required');
}
if (!itemToSave.item_id) {
  validationErrors.push('Product ID is missing or invalid');
}
if (itemToSave.quantity <= 0) {
  validationErrors.push('Quantity must be greater than 0');
}
if (itemToSave.rate <= 0) {
  validationErrors.push('Rate must be greater than 0');
}

if (validationErrors.length > 0) {
  toast({
    title: 'Validation Error',
    description: validationErrors.join(', '),
    variant: 'destructive',
  });
  return;
}

  // now use itemToSave for add/update
  if (editingIndex !== null) {
    const updatedItems = [...invoiceItems];
    updatedItems[editingIndex] = { ...itemToSave };
    setInvoiceItems(updatedItems);
    setEditingIndex(null);
  } else {
    setInvoiceItems(prev => [{ ...itemToSave }, ...prev]);
  }

  // Reset currentItem in state (clear form)
  setCurrentItem({
    item_name: '',
    quantity: 0,
    rate: 0,
    amount: 0,
    item_id: 0
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
        amount: 0,
        item_id: 0
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
     
      
      const items = invoiceItems.map(item => ({
        item_name: item.item_name,        
        item_id:item.item_id,
        quantity: item.quantity,
        rate: item.rate
      }));

   
      

      await inventoryService.createPurchase({
        transaction_id: isEditing ? parseInt(editTransactionId!) : undefined,
        member_id: parseInt(selectedSupplier),
        items,
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        description: `Invoice: ${invoiceNo}`
      });

      toast({
        title: 'Success',
        description: isEditing ? 'Invoice updated successfully' : 'Invoice saved successfully',
        variant: 'default'
      });

      navigate('/transactions');
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

  const handleCancel = () => {
    navigate('/transactions');
  };

  return (
    <Layout 
      title={isEditing ? "Edit Purchase" : "Purchase Entry"} 
      subtitle={isEditing ? "Edit purchase invoice" : "Create and manage purchase invoices"}
    >
      <div className="space-y-6">
        <InvoiceHeader
          invoiceNo={invoiceNo}
          invoiceDate={invoiceDate}
          selectedSupplier={selectedSupplier}
          suppliers={suppliers}
          onInvoiceNoChange={setInvoiceNo}
          onInvoiceDateChange={setInvoiceDate}
          onSupplierChange={setSelectedSupplier}
        />

        <ItemEntryForm
          currentItem={currentItem}
          editingIndex={editingIndex}
          onItemChange={handleItemChange}
          onAddOrUpdateItem={addOrUpdateItem}
        />

        <ItemsTable
          invoiceItems={invoiceItems}
          onEditItem={editItem}
          onRemoveItem={removeItem}
          calculateTotal={calculateTotal}
        />

        <PurchaseActions
          isEditing={isEditing}
          loading={loading}
          hasItems={invoiceItems.length > 0}
          onCancel={handleCancel}
          onSave={saveInvoice}
        />
      </div>
      <Toaster />
    </Layout>
  );
};

export default PurchaseEntry;
