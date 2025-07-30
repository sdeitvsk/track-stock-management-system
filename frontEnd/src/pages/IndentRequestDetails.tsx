import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import IndentRequestDetailsPage from "./IndentRequestDetailsPage";
import Layout from "../components/Layout/Layout";
import { Button } from "../components/ui/button";
import { indentRequestService } from "../services/indentRequestService";
import { useAuth } from "../contexts/AuthContext";
import { AvailablePurchase } from "../services/indentRequestService";
import { useToast } from '../hooks/use-toast';
import { Toaster } from "@/components/ui/toaster";

const IndentRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [availablePurchases, setAvailablePurchases] = useState<AvailablePurchase[]>([]);
  // Fetch single indent request
  const requestIdNum = id ? Number(id) : undefined;
  const { data, isLoading, error } = useQuery({
    queryKey: ["indentRequest", requestIdNum],
    queryFn: () => indentRequestService.getIndentRequestById(requestIdNum),
    enabled: !!requestIdNum,
  });

  // Mutation for status update
  const updateStatusMutation = useMutation({
    mutationFn: (params: { id: number; status: string; remarks?: string; approved_quantities?: Array<{ item_id: number; approved_quantity: number }> }) =>
      indentRequestService.updateIndentRequestStatus(params.id, {
        status: params.status as 'approved' | 'rejected' | 'partial',
        remarks: params.remarks,
        approved_quantities: params.approved_quantities,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indentRequest", requestIdNum] });
      queryClient.invalidateQueries({ queryKey: ["indentRequests"] });
    },
  });

  // Helper badge functions (copy from IndentRequests)
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800" },
      approved: { color: "bg-green-100 text-green-800" },
      rejected: { color: "bg-red-100 text-red-800" },
      partial: { color: "bg-blue-100 text-blue-800" },
    };
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config?.color || "bg-gray-100 text-gray-800"}`}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      low: "bg-gray-100 text-gray-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${priorityColors[priority] || "bg-gray-100 text-gray-800"}`}>{priority?.charAt(0).toUpperCase() + priority?.slice(1)}</span>
    );
  };

  // Item change handler
  const [requestState, setRequestState] = React.useState(null);
  React.useEffect(() => {
    if (data?.data) setRequestState(data.data);
    if (data?.availablePurchases) setAvailablePurchases(data.availablePurchases);
    
  }, [data]);

  const handleItemChange = (index, key, value) => {
    setRequestState((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((itm, idx) =>
        idx === index ? { ...itm, [key]: value } : itm
      );
      return { ...prev, items: updatedItems };
    });
  };

  const { toast } = useToast();

  const handleStatusUpdate = (requestId, newStatus, approved_quantities) => {
    if (
      newStatus === 'approved' &&
      Array.isArray(approved_quantities) &&
      approved_quantities.every(q => !q.approved_quantity || q.approved_quantity === 0)
    ) {
      toast({
        title: 'Error',
        description: 'Cannot approve request: all approved quantities are zero.',
        variant: 'destructive'
      });
      return;
    }
    updateStatusMutation.mutate({ id: requestId, status: newStatus, approved_quantities });
  };

  if (isLoading) {
    return <Layout title="Indent Request Details" subtitle="Loading..."><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>;
  }
  if (error || !requestState) {
    return <Layout title="Indent Request Details" subtitle="Error"><div className="p-8 text-center text-red-600">Failed to load request details</div></Layout>;
  }

  return (
    <Layout title="Indent Request Details" subtitle={`Request #${id}`}>
      <div className="mb-4 flex gap-2">
        <Button variant="outline" onClick={() => navigate("/indent-requests")}>Back to Requests</Button>
        {requestState && requestState.status === 'pending' && (isAdmin || requestState.requested_by === (window.localStorage.getItem('username') || '')) && (
          <Button variant="default" onClick={() => navigate(`/indent-requests/${id}/edit`)}>
            Edit
        </Button>
        )}
      </div>
      <IndentRequestDetailsPage
        request={requestState}
        isAdmin={isAdmin}
        updateStatusMutation={updateStatusMutation}
        getPriorityBadge={getPriorityBadge}
        getStatusBadge={getStatusBadge}
        handleItemChange={handleItemChange}
        handleStatusUpdate={handleStatusUpdate}
        availablePurchases={availablePurchases}
      />
      <Toaster />
    </Layout>
  );
};

export default IndentRequestDetails;
