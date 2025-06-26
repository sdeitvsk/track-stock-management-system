
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ResetPasswordFormProps {
  onSubmit: (password: string) => void;
  isLoading: boolean;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      new_password: '',
      confirm_password: ''
    }
  });

  const newPassword = watch('new_password');

  const handleFormSubmit = (data: any) => {
    onSubmit(data.new_password);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new_password">New Password</Label>
        <Input
          id="new_password"
          type="password"
          {...register('new_password', { 
            required: 'New password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' }
          })}
          placeholder="Enter new password"
        />
        {errors.new_password && (
          <p className="text-sm text-red-600">{errors.new_password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm Password</Label>
        <Input
          id="confirm_password"
          type="password"
          {...register('confirm_password', { 
            required: 'Please confirm the password',
            validate: (value) => value === newPassword || 'Passwords do not match'
          })}
          placeholder="Confirm new password"
        />
        {errors.confirm_password && (
          <p className="text-sm text-red-600">{errors.confirm_password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
