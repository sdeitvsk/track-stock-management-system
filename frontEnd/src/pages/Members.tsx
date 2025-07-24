import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Building, Phone, Edit, Trash2 } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { inventoryService, Member } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import MemberForm from '../components/forms/MemberForm';

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Station');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [searchTerm, filterType]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterType) filters.type = filterType;
      const response = await inventoryService.getMembers(filters);
      
      if (response.success && response.data) {
        setMembers(response.data.members || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load members',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleDeleteMember = (member: Member) => {
    setDeletingMember(member);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      
      if (editingMember) {
        // Update existing member
        const response = await inventoryService.updateMember(editingMember.id, data);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Member updated successfully',
          });
          setIsFormOpen(false);
          fetchMembers();
        } else {
          throw new Error(response.message || 'Failed to update member');
        }
      } else {
        // Create new member
        const response = await inventoryService.createMember(data);
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Member added successfully',
          });
          setIsFormOpen(false);
          fetchMembers();
        } else {
          throw new Error(response.message || 'Failed to create member');
        }
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save member',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingMember(null);
  };

  const confirmDelete = async () => {
    if (!deletingMember) return;

    try {
      const response = await inventoryService.deleteMember(deletingMember.id);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Member deleted successfully',
        });
        setDeletingMember(null);
        fetchMembers();
      } else {
        throw new Error(response.message || 'Failed to delete member');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete member',
        variant: 'destructive'
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      case 'supplier':
        return 'bg-green-100 text-green-800';
      case 'station':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout title="Members" subtitle="Manage employees, suppliers, and stations">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-80"
              />
            </div>
            <select
              value={filterType}
              onChange={handleFilterChange}
              className="ml-2 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              style={{ minWidth: 120 }}
            >
              <option value="">All Types</option>
              <option value="employee">Employee</option>
              <option value="supplier">Supplier</option>
              <option value="station">Station</option>
            </select>
          </div>
          <Button onClick={handleAddMember}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              No members found
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{member.name}</h3>
                      <Badge className={`text-xs ${getTypeColor(member.type)}`}>
                        {member.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${member.is_active ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMember(member)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMember(member)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  {member.department && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>{member.department}</span>
                    </div>
                  )}
                  {member.category && (
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 text-center">🏷️</span>
                      <span>{member.category}</span>
                    </div>
                  )}
                  {member.contact_info && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{member.contact_info}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Created: {formatDate(member.created_at)}</span>
                    <span className={member.is_active ? 'text-green-600' : 'text-red-600'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Member Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </DialogTitle>
            </DialogHeader>
            <MemberForm
              member={editingMember || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={formLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingMember?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Members;
