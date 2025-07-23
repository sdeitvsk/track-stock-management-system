
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Send } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { inventoryService } from '../services/inventoryService';
import { indentRequestService, IndentRequestItem } from '../services/indentRequestService';
import { useToast } from '../hooks/use-toast';
import CreatableSelect from "react-select/creatable";

const IndentRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [indentItems, setIndentItems] = useState<IndentRequestItem[]>([]);
  const [currentItem, setCurrentItem] = useState<IndentRequestItem>({
    item_name: '',
    quantity: 1,
    remarks: '',
    purchase_id: undefined // Optional, used for linking to existing purchases
  });
  const [department, setDepartment] = useState('');
  const [purpose, setPurpose] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [stationDepartments, setStationDepartments] = useState<string[]>([]);

  // Fetch available items
  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: () => inventoryService.getStockCombo()
  });

  const availableItems = (inventoryData?.data?.stock_combo) || [];

  console.log("Available Items:", availableItems);

  // Fetch stations
  const { data: stationsData, isLoading: isLoadingStations, error: stationsError } = useQuery({
    queryKey: ['stations'],
    queryFn: () => inventoryService.getMembers({ type: 'station', limit: 1000 }) // Assuming a large limit to get all stations
  });

  useEffect(() => {
    if (stationsData && stationsData.success && stationsData.data?.members) {
      const names = stationsData.data.members
        .map(member => member.name)
        .filter((name): name is string => !!name) // Filter out null or undefined names
        .sort((a, b) => a.localeCompare(b)); // Sort alphabetically
      setStationDepartments(names);
    }
  }, [stationsData]);

  // Create indent request mutation
  const createIndentMutation = useMutation({
    mutationFn: indentRequestService.createIndentRequest,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Indent request submitted successfully"
      });
      
      // Reset form
      setIndentItems([]);
      setDepartment('');
      setPurpose('');
      setPriority('normal');
      
      navigate('/indent-requests');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit indent request",
        variant: "destructive"
      });
    }
  });

  const addItem = () => {
    if (!currentItem.item_name || currentItem.quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select an item and enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    const existingItemIndex = indentItems.findIndex(item => item.item_name === currentItem.item_name);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...indentItems];
      updatedItems[existingItemIndex].quantity += currentItem.quantity;
      setIndentItems(updatedItems);
    } else {
      setIndentItems([...indentItems, { ...currentItem }]);
    }

    setCurrentItem({ item_name: '', quantity: 1, remarks: '' });
    
    toast({
      title: "Success",
      description: "Item added to indent request"
    });
  };

  const removeItem = (index: number) => {
    setIndentItems(indentItems.filter((_, i) => i !== index));
  };

  const submitIndentRequest = () => {
    if (indentItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the indent request",
        variant: "destructive"
      });
      return;
    }

    if (!department || !purpose) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createIndentMutation.mutate({
      department,
      purpose,
      priority,
      items: indentItems
    });
  };

  const options = availableItems.map(item => ({
  label: `${item.item_name} (${item.remaining_quantity} left)`,
  value: item.item_name
}));

  
  const handleChange = newValue => {
    setCurrentItem({
      ...currentItem,
      item_name: newValue?.value || ""
    });
  };

  return (
    <Layout title="Indent Request" subtitle="Request items from inventory">
      <div className="space-y-6">
        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="department">Department/Station *</Label>
                <Select value={department} onValueChange={(value) => setDepartment(value)} disabled={isLoadingStations || !!stationsError}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder={isLoadingStations ? "Loading stations..." : stationsError ? "Error loading stations" : "Select department/station"} />
                  </SelectTrigger>
                  <SelectContent>
                    {stationsError ? (
                      <SelectItem value="error" disabled>Error loading stations</SelectItem>
                    ) : isLoadingStations ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : stationDepartments.length > 0 ? (
                      stationDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-stations" disabled>No stations found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purpose">Purpose *</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Enter purpose for the request"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Items */}
        <Card>
          <CardHeader>
            <CardTitle>Add Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                  <label className="block text-sm font-medium text-gray-700">
                          Item Name <span className="text-red-500">*</span>
                        </label>
                        <CreatableSelect
                          options={options}
                          onChange={handleChange}
                          placeholder="Select or type item name"
                          isClearable
                        />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={currentItem.remarks}
                  onChange={(e) => setCurrentItem({...currentItem, remarks: e.target.value})}
                  placeholder="Optional remarks"
                />
              </div>
              <div>
                <Button onClick={addItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Requested Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No items added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  indentItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.remarks || '-'}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button 
            onClick={submitIndentRequest} 
            disabled={indentItems.length === 0 || createIndentMutation.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            {createIndentMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default IndentRequest;
