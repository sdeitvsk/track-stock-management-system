import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { inventoryService, Member } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';
import IssueHeader from '../components/forms/IssueHeader';
import IssueItemEntryForm from '../components/forms/IssueItemEntryForm';
import IssueItemsTable from '../components/forms/IssueItemsTable';
import IssueActions from '../components/forms/IssueActions';

interface IssueItem {
  id?: number;
  purchase_id: string;
  item_name: string;
  quantity: number;
}

const IssueEntry = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editTransactionId = searchParams.get('edit');
  const isEditing = !!editTransactionId;
  
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMember, setSelectedMember] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [issueItems, setIssueItems] = useState<IssueItem[]>([]);
  const [currentItem, setCurrentItem] = useState<IssueItem>({
    purchase_id: '',
    item_name: '',
    quantity: 0
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    if (isEditing) {
      loadTransactionForEdit(editTransactionId);
    }
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await inventoryService.getMembers({ limit: 100 });
      if (response.success && response.data) {
        setMembers(response.data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load members',
        variant: 'destructive'
      });
    }
  };

  const loadTransactionForEdit = async (transactionId: string) => {
    try {
      setLoading(true);
      const response = await inventoryService.getIssues(1, 100, { transaction_id: transactionId });
      
      if (response.success && response.data && response.data.issues && response.data.issues.length > 0) {
        const issues = response.data.issues;
        const firstIssue = issues[0];
        
        setInvoiceNo(firstIssue.transaction.invoice_no || '');
        setInvoiceDate(firstIssue.transaction.invoice_date?.split('T')[0] || new Date().toISOString().split('T')[0]);
        setSelectedMember(firstIssue.transaction.member_id.toString());
        setDescription(firstIssue.transaction.description || '');
        
        const items: IssueItem[] = issues.map(issue => ({
          id: issue.id,
          purchase_id: issue.purchase_id.toString(),
          item_name: issue.item_name,
          quantity: issue.quantity
        }));
        
        setIssueItems(items);
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

  const handleItemChange = (field: keyof IssueItem, value: string | number | { purchase_id: string; item_name: string; remaining_quantity?: number }) => {
    if (field === 'purchase_id' && typeof value === 'object' && value !== null) {
      setCurrentItem(prev => ({
        ...prev,
        purchase_id: value.purchase_id,
        item_name: value.item_name,
        remaining_quantity: value.remaining_quantity
      }));
    } else {
      setCurrentItem(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addOrUpdateItem = () => {
    if (!currentItem.purchase_id || currentItem.quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select an item and enter a valid quantity',
        variant: 'destructive'
      });
      return;
    }

    if (editingIndex !== null) {
      const updatedItems = [...issueItems];
      updatedItems[editingIndex] = { ...currentItem };
      setIssueItems(updatedItems);
      setEditingIndex(null);
    } else {
      console.log('Adding new item:', currentItem);
      
      setIssueItems(prev => [ { ...currentItem }, ...prev]);
    }

    setCurrentItem({
      purchase_id: '',
      item_name: '',
      quantity: 0
    });
  };

  const editItem = (index: number) => {
    setCurrentItem({ ...issueItems[index] });
    setEditingIndex(index);
  };

  const removeItem = (index: number) => {
    setIssueItems(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setCurrentItem({
        purchase_id: '',
        item_name: '',
        quantity: 0
      });
    }
  };

  const saveIssue = async () => {
    if (!selectedMember || issueItems.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select member and add at least one item',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const items = issueItems.map(item => ({
        purchase_id: parseInt(item.purchase_id),
        item_name: item.item_name,
        quantity: item.quantity
      }));

      await inventoryService.createIssue({
        transaction_id: isEditing ? parseInt(editTransactionId!) : undefined,       
        member_id: parseInt(selectedMember),
        items,
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        description: description || `Issue: ${invoiceNo || 'Direct Issue'}`
      });

      toast({
        title: 'Success',
        description: isEditing ? 'Issue updated successfully' : 'Issue saved successfully',
        variant: 'default'
      });

      navigate('/transactions');
    } catch (error: any) {
      console.error('Failed to save issue:', error);
      toast({
        title: 'Error',
        description: 'Failed to save issue',
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
      title={isEditing ? "Edit Issue" : "Issue Entry"} 
      subtitle={isEditing ? "Edit issue transaction" : "Create and manage issue transactions"}
    >
      <div className="space-y-6">
        <IssueHeader
          invoiceNo={invoiceNo}
          invoiceDate={invoiceDate}
          selectedMember={selectedMember}
          description={description}
          members={members}
          onInvoiceNoChange={setInvoiceNo}
          onInvoiceDateChange={setInvoiceDate}
          onMemberChange={setSelectedMember}
          onDescriptionChange={setDescription}
        />

        <IssueItemEntryForm
          currentItem={currentItem}
          editingIndex={editingIndex}
          onItemChange={handleItemChange}
          onAddOrUpdateItem={addOrUpdateItem}
        />

        <IssueItemsTable
          items={issueItems}
          onEditItem={editItem}
          onRemoveItem={removeItem}
        />

        <IssueActions
          isEditing={isEditing}
          loading={loading}
          hasItems={issueItems.length > 0}
          onCancel={handleCancel}
          onSave={saveIssue}
        />
      </div>
    </Layout>
  );
};

export default IssueEntry;
