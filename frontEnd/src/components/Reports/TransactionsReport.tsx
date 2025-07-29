
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp } from 'lucide-react';
import { reportsService } from '../../services/reportsService';
import { format } from 'date-fns';

interface TransactionsReportProps {
  filters: {
    start_date?: string;
    end_date?: string;
    search?: string;
  };
  isActive: boolean;
}

const TransactionsReport: React.FC<TransactionsReportProps> = ({ filters, isActive }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['total-transactions', filters],
    queryFn: () => reportsService.getTotalTransactions({
      start_date: filters.start_date,
      end_date: filters.end_date,
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
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Total Transactions Report
        </CardTitle>
        <CardDescription>
          Complete transaction history including purchases, issues, and approved indent requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Total Records: {data?.data.total_count || 0}
            </p>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.transactions.map((transaction) => (
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
      </CardContent>
    </Card>
  );
};

export default TransactionsReport;
