
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '../ui/button';

interface PurchaseActionsProps {
  isEditing: boolean;
  loading: boolean;
  hasItems: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const PurchaseActions: React.FC<PurchaseActionsProps> = ({
  isEditing,
  loading,
  hasItems,
  onCancel,
  onSave
}) => {
  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button 
        onClick={onSave} 
        disabled={loading || !hasItems}
        className="px-8"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {isEditing ? 'Updating...' : 'Saving...'}
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Update Invoice' : 'Save Invoice'}
          </>
        )}
      </Button>
    </div>
  );
};

export default PurchaseActions;
