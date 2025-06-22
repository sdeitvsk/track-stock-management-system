
import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Download, Calendar } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { inventoryService, InventorySummary } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [dashboardData, setDashboardData] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventorySummary();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Reports" subtitle="Inventory analytics and insights">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout title="Reports" subtitle="Inventory analytics and insights">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No report data available</p>
        </div>
      </Layout>
    );
  }

  // Prepare chart data
  const topItems = dashboardData.inventory_summary
    .sort((a, b) => b.current_value - a.current_value)
    .slice(0, 10)
    .map(item => ({
      name: item.item_name.length > 15 ? item.item_name.substring(0, 15) + '...' : item.item_name,
      value: item.current_value
    }));

  const stockStatusData = [
    { name: 'Good Stock', value: dashboardData.inventory_summary.filter(item => (item.current_stock / item.total_purchased) * 100 >= 25).length, color: '#10b981' },
    { name: 'Low Stock', value: dashboardData.inventory_summary.filter(item => {
      const percentage = (item.current_stock / item.total_purchased) * 100;
      return percentage < 25 && percentage >= 10;
    }).length, color: '#f59e0b' },
    { name: 'Critical', value: dashboardData.inventory_summary.filter(item => (item.current_stock / item.total_purchased) * 100 < 10).length, color: '#ef4444' }
  ];

  const totalValue = dashboardData.inventory_summary.reduce((sum, item) => sum + item.current_value, 0);

  return (
    <Layout title="Reports" subtitle="Inventory analytics and insights">
      <div className="space-y-6">
        {/* Report Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            <span className="text-slate-600">Report generated on {new Date().toLocaleDateString()}</span>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.summary_stats.total_items}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboardData.summary_stats.low_stock_items}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Stock Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {((dashboardData.summary_stats.total_items - dashboardData.summary_stats.low_stock_items) / dashboardData.summary_stats.total_items * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Items by Value */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Top Items by Value</span>
              </CardTitle>
              <CardDescription>
                Items with highest current value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stock Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Status Distribution</CardTitle>
              <CardDescription>
                Current stock status across all items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Inventory Report</CardTitle>
            <CardDescription>
              Complete overview of all inventory items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Item Name</th>
                    <th className="text-left p-2">Current Stock</th>
                    <th className="text-left p-2">Total Purchased</th>
                    <th className="text-left p-2">Total Issued</th>
                    <th className="text-left p-2">Avg Rate</th>
                    <th className="text-left p-2">Current Value</th>
                    <th className="text-left p-2">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.inventory_summary.map((item) => {
                    const utilization = ((item.total_issued / item.total_purchased) * 100).toFixed(1);
                    return (
                      <tr key={item.item_name} className="border-b hover:bg-slate-50">
                        <td className="p-2 font-medium">{item.item_name}</td>
                        <td className="p-2">{item.current_stock}</td>
                        <td className="p-2">{item.total_purchased}</td>
                        <td className="p-2">{item.total_issued}</td>
                        <td className="p-2">${Number(item.average_rate).toFixed(2)}</td>
                        <td className="p-2">${item.current_value.toLocaleString()}</td>
                        <td className="p-2">{utilization}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
