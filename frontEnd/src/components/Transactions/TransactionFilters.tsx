
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { inventoryService, Member } from '../../services/inventoryService';
import { toast } from '../ui/use-toast';

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  memberFilter: string;
  onMemberFilterChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  members: Member[];
  onClearFilters: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  memberFilter,
  onMemberFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  members,
  onClearFilters
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h3>

         <div className='flex align-center space-x-2 '>
           <button className='sm justify-between bg-green-400 px-2 py-0.5 text-sm rounded-sm ml-3 mb-1'
                    onClick={() => {
                      // Logic to update items can be added here
                      inventoryService.syncProducts().then(() => {
                        toast({ title: "Success", description: "Products synced successfully" });
                      }).catch(() => {
                        toast({ title: "Error", description: "Failed to sync products", variant: "destructive" });
                      });
                      toast({ title: "Info", description: "Update items functionality not implemented yet" });
                    }}
                  >Update Items</button>
                   <Button variant="outline" onClick={onClearFilters}>
                      Clear All
                  </Button>
         </div>

       
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search by Invoice */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by invoice..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            
            <SelectItem value="purchase">Purchase</SelectItem>
            <SelectItem value="issue">Issue</SelectItem>
          </SelectContent>
        </Select>

        {/* Member Filter */}
        <Select value={memberFilter} onValueChange={onMemberFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id.toString()}>
                {member.name} ({member.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Start Date */}
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          placeholder="Start Date"
        />

        {/* End Date */}
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          placeholder="End Date"
        />
      </div>
    </div>
  );
};

export default TransactionFilters;
