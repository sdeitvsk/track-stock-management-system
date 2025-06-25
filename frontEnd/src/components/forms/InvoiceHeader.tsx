
import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Member } from '../../services/inventoryService';

interface InvoiceHeaderProps {
  invoiceNo: string;
  invoiceDate: string;
  selectedSupplier: string;
  suppliers: Member[];
  onInvoiceNoChange: (value: string) => void;
  onInvoiceDateChange: (value: string) => void;
  onSupplierChange: (value: string) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoiceNo,
  invoiceDate,
  selectedSupplier,
  suppliers,
  onInvoiceNoChange,
  onInvoiceDateChange,
  onSupplierChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Invoice Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="invoice-no">Invoice No. *</Label>
          <Input
            id="invoice-no"
            value={invoiceNo}
            onChange={(e) => onInvoiceNoChange(e.target.value)}
            placeholder="Enter invoice number"
          />
        </div>
        <div>
          <Label htmlFor="invoice-date">Invoice Date *</Label>
          <Input
            id="invoice-date"
            type="date"
            value={invoiceDate}
            onChange={(e) => onInvoiceDateChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="supplier">Supplier *</Label>
          <Select value={selectedSupplier} onValueChange={onSupplierChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
