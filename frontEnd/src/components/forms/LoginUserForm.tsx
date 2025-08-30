
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { LoginUser } from '../../services/loginUserService';
import { Member } from '../../services/inventoryService';

interface LoginUserFormProps {
  user?: LoginUser;
  members: Member[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const LoginUserForm: React.FC<LoginUserFormProps> = ({
  user,
  members,
  onSubmit,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      password: '',
      member_id: user?.member_id || '',
      role: user?.role || 'staff',
      is_active: user?.is_active !== undefined ? user.is_active : true
    }
  });

  const availableMembers = members.filter(member => 
    member.type === 'station' && (!user || member.id === user.member_id)
  );

  // const stations = 

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...register('username', { 
            required: 'Username is required',
            minLength: { value: 3, message: 'Username must be at least 3 characters' }
          })}
          placeholder="Enter username"
        />
        {errors.username && (
          <p className="text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="member_id">Select Station</Label>
        <Select
          value={watch('member_id')?.toString() || 'none'}
          {...register('member_id', { required: 'Station is required' })}
          onValueChange={(value) => {
            if (value === 'none') {
              setValue('member_id', null);
            } else {
              setValue('member_id', parseInt(value));
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a station" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No member</SelectItem>
            {availableMembers.map((member) => (
              <SelectItem key={member.id} value={member.id.toString()}>
                {member.name} - {member.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={watch('role')}
          onValueChange={(value) => setValue('role', value as 'admin' | 'staff')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="Officer">Officer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {user && (
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={watch('is_active')}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
      </Button>
    </form>
  );
};

export default LoginUserForm;
