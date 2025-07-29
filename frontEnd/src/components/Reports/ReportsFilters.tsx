
import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Search, Filter, Download } from 'lucide-react';

interface ReportsFiltersProps {
  reportType: 'transactions' | 'stock-detailed' | 'stock-summary' | 'items-issued';
  filters: {
    start_date?: string;
    end_date?: string;
    as_on_date?: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  onApplyFilters: () => void;
  onExport?: () => void;
}

const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  reportType,
  filters,
  onFiltersChange,
  onApplyFilters,
  onExport
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Filter */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Search..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Date Filters based on report type */}
        {reportType === 'transactions' || reportType === 'items-issued' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="start_date">From Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">To Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
          </>
        )}

        {(reportType === 'stock-detailed' || reportType === 'stock-summary') && (
          <div className="space-y-2">
            <Label htmlFor="as_on_date">As On Date</Label>
            <Input
              id="as_on_date"
              type="date"
              value={filters.as_on_date || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleFilterChange('as_on_date', e.target.value)}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-end gap-2">
          <Button onClick={onApplyFilters} className="bg-purple-600 hover:bg-purple-700">
            Apply Filters
          </Button>
          {onExport && (
            <Button onClick={onExport} variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsFilters;
