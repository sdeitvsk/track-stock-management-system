
import React, { useState, useEffect } from 'react';
import { Plus, Save, Edit, Trash2, Package } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { inventoryService, Member, Issue } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

interface IssueItem {
  id?: number;
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
  const [members, setMembers] = useState<Member[]>([]);
  const [issueItems, setIssueItems] = useState<IssueItem[]>([]);
  const [currentItem, setCurrentItem] = useState<IssueItem>({
    item_name: '',
    quantity: 0
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
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
      // Get all issues for this transaction
      const response = await inventoryService.getIssues(1, 100, { transaction_id: transactionId });
      
      if (response.success && response.data && response.data.issues && response.data.issues.length > 0) {
        const issues = response.data.issues;
        const firstIssue = issues[0];
        
        // Set form data from the first issue's transaction
        setInvoiceNo(firstIssue.transaction.invoice_no || '');
        setInvoiceDate(firstIssue.transaction.invoice_date?.split('T')[0] || new Date().toISOString().split('T')[0]);
        setSelectedMember(firstIssue.transaction.member_id.toString());
        setDescription(firstIssue.transaction.description || '');
        
        // Convert issues to issue items
        const items: IssueItem[] = issues.map(issue => ({
          id: issue.id,
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

  const handleItemChange = (field: keyof IssueItem, value: string | number) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addOrUpdateItem = () => {
    if (!currentItem.item_name || currentItem.quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all item fields with valid values',
        variant: 'destructive'
      });
      return;
    }

    if (editingIndex !== null) {
      // Update existing item
      const updatedItems = [...issueItems];
      updatedItems[editingIndex] = { ...currentItem };
      setIssueItems(updatedItems);
      setEditingIndex(null);
    } else {
      // Add new item
      setIssueItems(prev => [...prev, { ...currentItem }]);
    }

    // Reset current item
    setCurrentItem({
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
      // Save each item as a separate issue
      for (const item of issueItems) {
        await inventoryService.createIssue({
          member_id: parseInt(selectedMember),
          item_name: item.item_name,
          quantity: item.quantity,
          invoice_no: invoiceNo,
          invoice_date: invoiceDate,
          description: description || `Issue: ${invoiceNo || 'Direct Issue'}`
        });
      }

      toast({
        title: 'Success',
        description: isEditing ? 'Issue updated successfully' : 'Issue saved successfully',
        variant: 'default'
      });

      // Navigate back to transactions page after save
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
        {/* Issue Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Issue Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="invoice-no">Reference No.</Label>
              <Input
                id="invoice-no"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Enter reference number"
              />
            </div>
            <div>
              <Label htmlFor="invoice-date">Issue Date</Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="member">Member *</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name} ({member.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>
        </div>

        {/* Item Entry */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
                {issueItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                      No items added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  issueItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
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
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={saveIssue} 
            disabled={loading || issueItems.length === 0}
            className="px-8"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Issue' : 'Save Issue'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default IssueEntry;
