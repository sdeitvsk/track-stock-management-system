
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

interface IndentRequestItem {
  item_name: string;
  quantity: number;
  remarks?: string;
}

interface IndentRequestType {
  id: number;
  department: string;
  purpose: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'partial';
  requested_date: string;
  requested_by: string;
  items: IndentRequestItem[];
  total_items: number;
}

// Mock data - in real app, this would come from API
const mockIndentRequests: IndentRequestType[] = [
  {
    id: 1,
    department: 'Engineering',
    purpose: 'Equipment maintenance',
    priority: 'high',
    status: 'pending',
    requested_date: '2024-01-15',
    requested_by: 'John Doe',
    items: [
      { item_name: 'Screwdriver Set', quantity: 2, remarks: 'For motor repair' },
      { item_name: 'Electrical Wire', quantity: 10, remarks: 'For wiring work' }
    ],
    total_items: 2
  },
  {
    id: 2,
    department: 'Production',
    purpose: 'Production line setup',
    priority: 'urgent',
    status: 'approved',
    requested_date: '2024-01-14',
    requested_by: 'Jane Smith',
    items: [
      { item_name: 'Safety Gloves', quantity: 50, remarks: 'For workers' },
      { item_name: 'Safety Helmets', quantity: 25, remarks: 'New batch required' }
    ],
    total_items: 2
  },
  {
    id: 3,
    department: 'Maintenance',
    purpose: 'Routine maintenance',
    priority: 'normal',
    status: 'partial',
    requested_date: '2024-01-13',
    requested_by: 'Mike Johnson',
    items: [
      { item_name: 'Lubricant Oil', quantity: 5, remarks: 'For machinery' }
    ],
    total_items: 1
  }
];

const IndentRequests = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<IndentRequestType | null>(null);

  // Filter requests based on search and filters
  const filteredRequests = mockIndentRequests.filter(request => {
    const matchesSearch = request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requested_by.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      partial: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const handleStatusUpdate = (requestId: number, newStatus: string) => {
    // Here you would typically call an API to update the status
    console.log(`Updating request ${requestId} to status: ${newStatus}`);
  };

  return (
    <Layout title="Indent Requests" subtitle="Manage and process indent requests">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Indent Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No indent requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">#{request.id}</TableCell>
                      <TableCell>{request.department}</TableCell>
                      <TableCell>{request.purpose}</TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.total_items} items</TableCell>
                      <TableCell>{new Date(request.requested_date).toLocaleDateString()}</TableCell>
                      <TableCell>{request.requested_by}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Request Details - #{request.id}</DialogTitle>
                              </DialogHeader>
                              {selectedRequest && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <strong>Department:</strong> {selectedRequest.department}
                                    </div>
                                    <div>
                                      <strong>Purpose:</strong> {selectedRequest.purpose}
                                    </div>
                                    <div>
                                      <strong>Priority:</strong> {getPriorityBadge(selectedRequest.priority)}
                                    </div>
                                    <div>
                                      <strong>Status:</strong> {getStatusBadge(selectedRequest.status)}
                                    </div>
                                    <div>
                                      <strong>Requested By:</strong> {selectedRequest.requested_by}
                                    </div>
                                    <div>
                                      <strong>Date:</strong> {new Date(selectedRequest.requested_date).toLocaleDateString()}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <strong>Items:</strong>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Item Name</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead>Remarks</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedRequest.items.map((item, index) => (
                                          <TableRow key={index}>
                                            <TableCell>{item.item_name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.remarks || '-'}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                  
                                  {selectedRequest.status === 'pending' && (
                                    <div className="flex space-x-2 pt-4">
                                      <Button 
                                        onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                      </Button>
                                      <Button
                                        onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                                        variant="destructive"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default IndentRequests;
