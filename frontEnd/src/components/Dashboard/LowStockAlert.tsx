
import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { LowStockAlert as LowStockAlertType } from '../../services/inventoryService';

interface LowStockAlertProps {
  alerts: LowStockAlertType[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Stock Status</h3>
        </div>
        <p className="text-slate-600">All items are well stocked! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-red-50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Low Stock Alerts</h3>
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {alerts.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.item_name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">{alert.item_name}</p>
              <p className="text-sm text-slate-600">
                Only {alert.current_stock} units remaining
              </p>
            </div>
            <div className="text-right">
              <div className="w-16 bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${Math.max(alert.stock_percentage, 5)}%` }}
                ></div>
              </div>
              <p className="text-xs text-red-600 mt-1">
                {alert.stock_percentage}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlert;
