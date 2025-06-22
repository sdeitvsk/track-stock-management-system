
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

interface NewIssueFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface IssueFormData {
  member_id: number;
  item_name: string;
  quantity: number;
  description?: string;
}

const NewIssueForm: React.FC<NewIssueFormProps> = ({ onClose, onSuccess }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<IssueFormData>();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await inventoryService.getMembers({ 
        type: 'employee,station' // Get both employees and stations for issuing
      });
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
    } finally {
      setLoadingMembers(false);
    }
  };

  const onSubmit = async (data: IssueFormData) => {
    try {
      setLoading(true);
      const response = await inventoryService.createIssue(data);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Issue created successfully'
        });
        onSuccess();
      } else {
        throw new Error(response.message || 'Failed to create issue');
      }
    } catch (error: any) {
      console.error('Failed to create issue:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create issue',
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
          <h2 className="text-xl font-semibold">New Issue</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="member">Issue To</Label>
            <Select onValueChange={(value) => setValue('member_id', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder={loadingMembers ? "Loading..." : "Select member"} />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name} ({member.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.member_id && (
              <p className="text-sm text-red-500 mt-1">Member is required</p>
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
              {loading ? 'Creating...' : 'Create Issue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewIssueForm;
