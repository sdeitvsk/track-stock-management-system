
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Key, Search, Filter } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { loginUserService, LoginUser } from '../services/loginUserService';
import { inventoryService } from '../services/inventoryService';
import LoginUserForm from '../components/forms/LoginUserForm';
import ResetPasswordForm from '../components/forms/ResetPasswordForm';

const LoginUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LoginUser | null>(null);

  const { data: loginUsersData, isLoading } = useQuery({
    queryKey: ['loginUsers', page, search, roleFilter],
    queryFn: () => loginUserService.getLoginUsers({
      page,
      limit: 10,
      search,
      role: roleFilter
    })
  });

  const { data: membersData } = useQuery({
    queryKey: ['members'],
    queryFn: () => inventoryService.getMembers({ type: 'employee, station', limit: 100 })
  });

  const createMutation = useMutation({
    mutationFn: loginUserService.createLoginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loginUsers'] });
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Login user created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create login user',
        variant: 'destructive',
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      loginUserService.updateLoginUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loginUsers'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: 'Success',
        description: 'Login user updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update login user',
        variant: 'destructive',
      });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      loginUserService.resetPassword(id, password),
    onSuccess: () => {
      setIsResetPasswordDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: 'Success',
        description: 'Password reset successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reset password',
        variant: 'destructive',
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: loginUserService.deleteLoginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loginUsers'] });
      toast({
        title: 'Success',
        description: 'Login user deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete login user',
        variant: 'destructive',
      });
    }
  });

  const handleEdit = (user: LoginUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleResetPassword = (user: LoginUser) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this login user?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Layout title="Login Users" subtitle="Manage staff login accounts">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Login Users Management</CardTitle>
              <CardDescription>
                Create and manage staff login accounts
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Login User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Login User</DialogTitle>
                  <DialogDescription>
                    Create a new login account for staff members
                  </DialogDescription>
                </DialogHeader>
                <LoginUserForm
                  members={membersData?.data?.members || []}
                  onSubmit={(data) => createMutation.mutate(data)}
                  isLoading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="Officer">Officer</option>
              </select>
            </div>

            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginUsersData?.data?.users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>
                          {user.member ? (
                            <div>
                              <div className="font-medium">{user.member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.member.department}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No member linked</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'destructive'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetPassword(user)}
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Login User</DialogTitle>
              <DialogDescription>
                Update login user information
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <LoginUserForm
                user={selectedUser}
                members={membersData?.data?.members || []}
                onSubmit={(data) => updateMutation.mutate({ id: selectedUser.id, data })}
                isLoading={updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Reset password for {selectedUser?.username}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <ResetPasswordForm
                onSubmit={(password) => 
                  resetPasswordMutation.mutate({ id: selectedUser.id, password })
                }
                isLoading={resetPasswordMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default LoginUsers;
