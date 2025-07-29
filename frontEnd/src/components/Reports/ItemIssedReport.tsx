import React from 'react'
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../../services/reportsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';

interface ItemIssedReportProps {
    filters: {
        start_date?: string;
        end_date?: string;
        search?: string;
    };
    isActive: boolean;
}

const ItemIssedReport: React.FC<ItemIssedReportProps> = ({ filters, isActive }) => {

    const { data, isLoading, refetch } = useQuery({

        queryKey: ['items-issued', filters],
        queryFn: () => reportsService.getItemsIssued({
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
                <Package className="w-5 h-5 text-purple-600" />
                Items Issued Report
            </CardTitle>
            <CardDescription>
                Complete items issued report with date filters
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
                                <TableHead>Item Name</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Issue Date</TableHead>
                                <TableHead>Member</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.data.items_issued.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.item_name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.issue_date ? format(new Date(item.issue_date), 'dd/MM/yyyy') : '-'}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </CardContent>
    </Card>
  )
}

export default ItemIssedReport
