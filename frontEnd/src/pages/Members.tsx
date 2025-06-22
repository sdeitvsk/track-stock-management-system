
import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Building, Phone } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { inventoryService, Member } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const filters = searchTerm ? { name: searchTerm } : {};
      const response = await inventoryService.getMembers(filters);
      
      if (response.success && response.data) {
        setMembers(response.data.members);
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
          </div>
          <Button>
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
                  <div className={`w-3 h-3 rounded-full ${member.is_active ? 'bg-green-400' : 'bg-red-400'}`}></div>
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
      </div>
    </Layout>
  );
};

export default Members;
