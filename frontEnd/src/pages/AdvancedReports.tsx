
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import ReportsFilters from '../components/Reports/ReportsFilters';
import { reportsService } from '../services/reportsService';
import { FileBarChart, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const AdvancedReports = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    as_on_date: new Date().toISOString().split('T')[0],
    search: ''
  });

  // Total Transactions Query
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['total-transactions', filters],
    queryFn: () => reportsService.getTotalTransactions({
      start_date: filters.start_date,
      end_date: filters.end_date,
      search: filters.search
    }),
    enabled: activeTab === 'transactions'
  });

  // Stock Balance Detailed Query
  const { data: stockDetailedData, isLoading: stockDetailedLoading, refetch: refetchStockDetailed } = useQuery({
    queryKey: ['stock-balance-detailed', filters],
    queryFn: () => reportsService.getStockBalanceDetailed({
      as_on_date: filters.as_on_date,
      search: filters.search
    }),
    enabled: activeTab === 'stock-detailed'
  });

  // Stock Balance Summary Query
  const { data: stockSummaryData, isLoading: stockSummaryLoading, refetch: refetchStockSummary } = useQuery({
    queryKey: ['stock-balance-summary', filters],
    queryFn: () => reportsService.getStockBalanceSummary({
      as_on_date: filters.as_on_date,
      search: filters.search
    }),
    enabled: activeTab === 'stock-summary'
  });

  const handleApplyFilters = () => {
    switch (activeTab) {
      case 'transactions':
        refetchTransactions();
        break;
      case 'stock-detailed':
        refetchStockDetailed();
        break;
      case 'stock-summary':
        refetchStockSummary();
        break;
    }
  };

  const handleExport = () => {
    // Export functionality can be implemented here
    console.log('Export functionality to be implemented');
  };

  const getReportType = () => {
    switch (activeTab) {
      case 'transactions':
        return 'transactions' as const;
      case 'stock-detailed':
        return 'stock-detailed' as const;
      case 'stock-summary':
        return 'stock-summary' as const;
      default:
        return 'transactions' as const;
    }
  };

  return (
    <Layout title="Advanced Reports" subtitle="Comprehensive inventory and transaction analytics">
      <div className="space-y-6">
        {/* Reports Header */}
        <div className="flex items-center gap-3">
          <FileBarChart className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Reports</h2>
            <p className="text-gray-600">Generate detailed reports with advanced filtering options</p>
          </div>
        </div>

        {/* Filters */}
        <ReportsFilters
          reportType={getReportType()}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onExport={handleExport}
        />

        {/* Reports Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Transactions
            </TabsTrigger>
            <TabsTrigger value="stock-detailed" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Stock Balance Detailed
            </TabsTrigger>
            <TabsTrigger value="stock-summary" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Stock Balance Summary
            </TabsTrigger>
          </TabsList>

          {/* Total Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Total Transactions Report
                </CardTitle>
                <CardDescription>
                  Complete transaction history including purchases, issues, and approved indent requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Total Records: {transactionsData?.data.total_count || 0}
                      </p>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Member</TableHead>
                            <TableHead>Invoice/Purpose</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactionsData?.data.transactions.map((transaction) => (
                            <TableRow key={`${transaction.type}-${transaction.id}`}>
                              <TableCell className="font-medium">{transaction.id}</TableCell>
                              <TableCell>{transaction.name}</TableCell>
                              <TableCell>{transaction.invoice_no}</TableCell>
                              <TableCell>
                                <Badge variant={transaction.type === 'purchase' ? 'default' : 
                                              transaction.type === 'issue' ? 'destructive' : 'secondary'}>
                                  {transaction.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {transaction.invoice_date ? format(new Date(transaction.invoice_date), 'dd/MM/yyyy') : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Balance Detailed Tab */}
          <TabsContent value="stock-detailed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Stock Balance Detailed Report
                </CardTitle>
                <CardDescription>
                  Detailed view of stock balance for each purchase batch as on date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stockDetailedLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Total Records: {stockDetailedData?.data.total_count || 0} | 
                        As on Date: {stockDetailedData?.data.as_on_date ? format(new Date(stockDetailedData.data.as_on_date), 'dd/MM/yyyy') : '-'}
                      </p>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Purchase ID</TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Purchase Qty</TableHead>
                            <TableHead>Total Issues</TableHead>
                            <TableHead>Remaining Qty</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockDetailedData?.data.stock_details.map((stock) => (
                            <TableRow key={stock.id}>
                              <TableCell className="font-medium">{stock.id}</TableCell>
                              <TableCell>{stock.item_name}</TableCell>
                              <TableCell>{stock.Purchase}</TableCell>
                              <TableCell>{stock.Total_issues}</TableCell>
                              <TableCell>
                                <span className={stock.remaining_quantity <= 0 ? 'text-red-600 font-semibold' : ''}>
                                  {stock.remaining_quantity}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Balance Summary Tab */}
          <TabsContent value="stock-summary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                  Stock Balance Summary Report
                </CardTitle>
                <CardDescription>
                  Consolidated stock summary by item name as on date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stockSummaryLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Total Items: {stockSummaryData?.data.total_count || 0} | 
                        As on Date: {stockSummaryData?.data.as_on_date ? format(new Date(stockSummaryData.data.as_on_date), 'dd/MM/yyyy') : '-'}
                      </p>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Total Purchase</TableHead>
                            <TableHead>Total Issued</TableHead>
                            <TableHead>Total Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockSummaryData?.data.stock_summary.map((stock, index) => (
                            <TableRow key={`${stock.item_name}-${index}`}>
                              <TableCell className="font-medium">{stock.item_name}</TableCell>
                              <TableCell>{stock.total_purchase}</TableCell>
                              <TableCell>{stock.total_issued}</TableCell>
                              <TableCell>
                                <span className={stock.total_balance <= 0 ? 'text-red-600 font-semibold' : ''}>
                                  {stock.total_balance}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdvancedReports;
