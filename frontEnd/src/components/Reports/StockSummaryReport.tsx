
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle } from 'lucide-react';
import { reportsService } from '../../services/reportsService';
import { format } from 'date-fns';

interface StockSummaryReportProps {
  filters: {
    as_on_date?: string;
    search?: string;
  };
  isActive: boolean;
}

const StockSummaryReport: React.FC<StockSummaryReportProps> = ({ filters, isActive }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['stock-balance-summary', filters],
    queryFn: () => reportsService.getStockBalanceSummary({
      as_on_date: filters.as_on_date,
      search: filters.search
    }),
    enabled: isActive
  });

  React.useEffect(() => {
    if (isActive) {
      refetch();
    }
  }, [filters, isActive, refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Total Items: {data?.data.total_count || 0} | 
              As on Date: {data?.data.as_on_date ? format(new Date(data.data.as_on_date), 'dd/MM/yyyy') : '-'}
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
                {data?.data.stock_summary.map((stock, index) => (
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
      </CardContent>
    </Card>
  );
};

export default StockSummaryReport;
