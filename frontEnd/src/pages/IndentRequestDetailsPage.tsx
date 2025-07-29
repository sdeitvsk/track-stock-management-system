import React from "react";
import { Button } from "../components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import PurchaseItemSelect from "@/components/forms/PurchaseItemSelect";
import { AvailablePurchase } from "@/services/indentRequestService";


interface IndentRequestDetailsPageProps {
  request: any;
  isAdmin: boolean;
  updateStatusMutation: any;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
  handleItemChange: (index: number, key: string, value: any) => void;
  handleStatusUpdate: (requestId: number, newStatus: string, approved_quantities?: Array<{ item_id: number; approved_quantity: number }>) => void;
  availablePurchases: AvailablePurchase[];
}

const IndentRequestDetailsPage: React.FC<IndentRequestDetailsPageProps> = ({
  request,
  isAdmin,
  updateStatusMutation,
  getPriorityBadge,
  getStatusBadge,
  handleItemChange,
  handleStatusUpdate,
  availablePurchases,
}) => {


  if (!request) {
    return <div className="p-8 text-center text-gray-500">No request found.</div>;
  }
  return (
    <>
  
   
    <div className="w-full mx-auto bg-slate-200 p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Request Details - #{request.id}</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <strong>Department:</strong> {request.department}
          </div>
          <div>
            <strong>Purpose:</strong> {request.purpose}
          </div>
          <div>
            <strong>Priority:</strong> {getPriorityBadge(request.priority)}
          </div>
          <div>
            <strong>Status:</strong> {getStatusBadge(request.status)}
          </div>
          <div>
            <strong>Requested By:</strong> {request.requested_by}
          </div>
          <div>
            <strong>Date:</strong> {new Date(request.requested_date).toLocaleDateString()}
          </div>
          <div>
          </div>
        </div>
        <div>
          <strong>Items:</strong>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Item Name</TableHead>
                <TableHead>Available Stock</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Approved Qty</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.items?.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="p-1">{item.item_name}</TableCell>
                  <TableCell className="p-1 text-center">
                    {(() => {
                      const maxQty = availablePurchases.length > 0
                        ? availablePurchases.reduce((acc, p) => acc + (p.item_id === item.item_id ? p.remaining_quantity : 0), 0)
                        : 0;
                      item.maxQty = maxQty;
                      return maxQty;
                    })()}
                  </TableCell>
                  <TableCell className="p-1 text-center">{item.quantity}</TableCell>
                  {isAdmin && request.status === "pending" ? (
                    <>
                      <TableCell className="p-1">
                        <Input
                          type="number"
                          min={0}
                          max={item.maxQty}
                          value={item.approved_quantity ?? item.quantity}
                          onChange={(e) => {
                            const newQty = Number(e.target.value);
                            if (newQty > item.maxQty) {
                              alert(`Quantity cannot be more than maximum allowed (${item.maxQty})`);
                              return; // prevent update
                            }
                            handleItemChange(index, "approved_quantity", newQty);
                          }}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Input
                          value={item.remarks || ""}
                          onChange={(e) => handleItemChange(index, "remarks", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="p-1">
                        <span>{item.approved_quantity ?? item.quantity}</span>
                      </TableCell>
                      <TableCell className="p-1">
                        <span>{item.remarks || "-"}</span>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {isAdmin && request.status === "pending" && (
          <div className="flex space-x-2 pt-4">
            <Button
              onClick={() => {
                const approved_quantities = request.items.map((item: any) => ({
                  item_id: item.id,
                  approved_quantity: item.approved_quantity ?? item.quantity,
                }));
                handleStatusUpdate(request.id, "approved", approved_quantities);
              }}
              className="bg-green-600 hover:bg-green-700"
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => handleStatusUpdate(request.id, "rejected")}
              variant="destructive"
              disabled={updateStatusMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default IndentRequestDetailsPage;
