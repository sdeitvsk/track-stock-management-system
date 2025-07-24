
import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { inventoryService, InventoryItem } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchInventoryData();
  }, [searchTerm]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventorySummary(searchTerm);
      if (response.success && response.data) {
        setInventoryItems(response.data.inventory_summary);
      }
    } catch (error: any) {
      console.error('Failed to fetch inventory data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatNumber = (value: any): string => {
    const num = Number(value);
    return isNaN(num) ? '0' : num.toString();
  };

  const formatCurrency = (value: any): string => {
    const num = Number(value);
    return isNaN(num) ? '₹ 0.00' : `₹ ${num.toFixed(2)}`;
  };

  const formatCurrencyWithCommas = (value: any): string => {
    const num = Number(value);
    return isNaN(num) ? '₹ 0' : `₹ ${num.toLocaleString()}`;
  };

  return (
    <Layout title="Inventory" subtitle="Manage your inventory items">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Purchased
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Issued
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Avg Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : inventoryItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  inventoryItems.map((item) => {
                    const totalPurchased = Number(item.total_purchased) || 0;
                    const currentStock = Number(item.current_stock) || 0;
                    const stockPercentage = totalPurchased > 0 ? (currentStock / totalPurchased) * 100 : 0;
                    const stockStatus = stockPercentage < 10 ? 'critical' : 
                                      stockPercentage < 25 ? 'low' : 'good';
                    
                    return (
                      <tr key={item.item_name} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 text-slate-400 mr-3" />
                            <div className="font-medium text-slate-900">{item.item_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {formatNumber(item.current_stock)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {formatNumber(item.total_purchased)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {formatNumber(item.total_issued)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {formatCurrency(item.average_rate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {formatCurrencyWithCommas(item.current_value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            stockStatus === 'critical' ? 'bg-red-100 text-red-800' :
                            stockStatus === 'low' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {stockStatus === 'critical' ? 'Critical' :
                             stockStatus === 'low' ? 'Low Stock' : 'Good'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;