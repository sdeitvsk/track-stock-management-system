
import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Member } from '../../services/inventoryService';

interface IssueHeaderProps {
  invoiceNo: string;
  invoiceDate: string;
  selectedMember: string;
  description: string;
  members: Member[];
  onInvoiceNoChange: (value: string) => void;
  onInvoiceDateChange: (value: string) => void;
  onMemberChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const IssueHeader: React.FC<IssueHeaderProps> = ({
  invoiceNo,
  invoiceDate,
  selectedMember,
  description,
  members,
  onInvoiceNoChange,
  onInvoiceDateChange,
  onMemberChange,
  onDescriptionChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Issue Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="invoice-no">Reference No.</Label>
          <Input
            id="invoice-no"
            value={invoiceNo}
            onChange={(e) => onInvoiceNoChange(e.target.value)}
            placeholder="Enter reference number"
          />
        </div>
        <div>
          <Label htmlFor="invoice-date">Issue Date</Label>
          <Input
            id="invoice-date"
            type="date"
            value={invoiceDate}
            onChange={(e) => onInvoiceDateChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="member">Member *</Label>
          <Select value={selectedMember} onValueChange={onMemberChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id.toString()}>
                  {member.name} ({member.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter description"
          />
        </div>
      </div>
    </div>
  );
};

export default IssueHeader;
