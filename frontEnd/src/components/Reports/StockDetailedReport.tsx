
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Package } from 'lucide-react';
import { reportsService } from '../../services/reportsService';
import { format } from 'date-fns';

interface StockDetailedReportProps {
  filters: {
    as_on_date?: string;
    search?: string;
  };
  isActive: boolean;
}

const StockDetailedReport: React.FC<StockDetailedReportProps> = ({ filters, isActive }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['stock-balance-detailed', filters],
    queryFn: () => reportsService.getStockBalanceDetailed({
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
          <Package className="w-5 h-5 text-purple-600" />
          Stock Balance Detailed Report
        </CardTitle>
        <CardDescription>
          Detailed view of stock balance for each purchase batch as on date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Total Records: {data?.data.total_count || 0} | 
              As on Date: {data?.data.as_on_date ? format(new Date(data.data.as_on_date), 'dd/MM/yyyy') : '-'}
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
                {data?.data.stock_details.map((stock) => (
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
      </CardContent>
    </Card>
  );
};

export default StockDetailedReport;
