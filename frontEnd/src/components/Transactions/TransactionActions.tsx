
import React from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '../ui/button';

interface TransactionActionsProps {
  onAddPurchase: () => void;
  onAddIssue: () => void;
}

const TransactionActions: React.FC<TransactionActionsProps> = ({
  onAddPurchase,
  onAddIssue
}) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button onClick={onAddIssue} className="bg-blue-600 hover:bg-blue-700">
        <Package className="w-4 h-4 mr-2" />
        Add Issue
      </Button>
      <Button onClick={onAddPurchase} className="bg-green-600 hover:bg-green-700">
        <Plus className="w-4 h-4 mr-2" />
        Add Purchase
      </Button>
    </div>
  );
};

export default TransactionActions;
