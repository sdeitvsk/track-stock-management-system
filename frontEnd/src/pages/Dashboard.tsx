
import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Send, TrendingUp, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import StatsCard from '../components/Dashboard/StatsCard';
import LowStockAlert from '../components/Dashboard/LowStockAlert';
import { inventoryService, InventorySummary } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventorySummary();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Welcome to your inventory management system">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout title="Dashboard" subtitle="Welcome to your inventory management system">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No data available</p>
        </div>
      </Layout>
    );
  }

  const totalValue = dashboardData.inventory_summary.reduce((sum, item) => sum + item.current_value, 0);
  const totalStock = dashboardData.inventory_summary.reduce((sum, item) => sum + item.current_stock, 0);
  const totalIssued = dashboardData.inventory_summary.reduce((sum, item) => sum + item.total_issued, 0);

  return (
    <Layout title="Dashboard" subtitle="Welcome to your inventory management system">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Items"
            value={dashboardData.summary_stats.total_items}
            icon={Package}
            color="blue"
          />
          <StatsCard
            title="Current Stock"
            value={totalStock.toLocaleString()}
            icon={Package}
            color="green"
          />
          <StatsCard
            title="Total Issued"
            value={totalIssued.toLocaleString()}
            icon={Send}
            color="yellow"
          />
          <StatsCard
            title="Total Value"
            value={`$${totalValue.toLocaleString()}`}
            icon={TrendingUp}
            color="green"
          />
        </div>

        {/* Low Stock Alerts */}
        <LowStockAlert alerts={dashboardData.low_stock_alerts} />

        {/* Recent Inventory */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Inventory Overview</h3>
          </div>
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
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {dashboardData.inventory_summary.slice(0, 10).map((item) => {
                  const stockPercentage = (item.current_stock / item.total_purchased) * 100;
                  const stockStatus = stockPercentage < 10 ? 'critical' : 
                                    stockPercentage < 25 ? 'low' : 'good';
                  
                  return (
                    <tr key={item.item_name}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{item.item_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                        {item.current_stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                        {item.total_purchased}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                        {item.total_issued}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                        ${item.current_value.toLocaleString()}
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
