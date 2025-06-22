
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { inventoryService, Member } from '../../services/inventoryService';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

interface NewPurchaseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface PurchaseFormData {
  member_id: number;
  item_name: string;
  quantity: number;
  rate: number;
  description?: string;
}

const NewPurchaseForm: React.FC<NewPurchaseFormProps> = ({ onClose, onSuccess }) => {
  const [suppliers, setSuppliers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<PurchaseFormData>();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await inventoryService.getMembers({ type: 'supplier' });
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
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      setLoading(true);
      const response = await inventoryService.createPurchase(data);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Purchase created successfully'
        });
        onSuccess();
      } else {
        throw new Error(response.message || 'Failed to create purchase');
      }
    } catch (error: any) {
      console.error('Failed to create purchase:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create purchase',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Purchase</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Select onValueChange={(value) => setValue('member_id', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder={loadingSuppliers ? "Loading..." : "Select supplier"} />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.member_id && (
              <p className="text-sm text-red-500 mt-1">Supplier is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="item_name">Item Name</Label>
            <Input
              id="item_name"
              {...register('item_name', { 
                required: 'Item name is required',
                minLength: { value: 2, message: 'Item name must be at least 2 characters' }
              })}
              placeholder="Enter item name"
            />
            {errors.item_name && (
              <p className="text-sm text-red-500 mt-1">{errors.item_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' }
              })}
              placeholder="Enter quantity"
            />
            {errors.quantity && (
              <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rate">Rate (per unit)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              {...register('rate', { 
                required: 'Rate is required',
                min: { value: 0, message: 'Rate must be positive' }
              })}
              placeholder="Enter rate per unit"
            />
            {errors.rate && (
              <p className="text-sm text-red-500 mt-1">{errors.rate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Purchase'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPurchaseForm;
