
import React from 'react';
import TransactionsReport from './TransactionsReport';
import StockDetailedReport from './StockDetailedReport';
import StockSummaryReport from './StockSummaryReport';
import { ReportConfig } from '../../config/reportsConfig';

interface ReportRendererProps {
  reportConfig: ReportConfig;
  filters: any;
  isActive: boolean;
}

const ReportRenderer: React.FC<ReportRendererProps> = ({ reportConfig, filters, isActive }) => {
  const renderReport = () => {
    switch (reportConfig.id) {
      case 'transactions':
        return (
          <TransactionsReport 
            filters={filters} 
            isActive={isActive} 
          />
        );
      case 'stock-detailed':
        return (
          <StockDetailedReport 
            filters={filters} 
            isActive={isActive} 
          />
        );
      case 'stock-summary':
        return (
          <StockSummaryReport 
            filters={filters} 
            isActive={isActive} 
          />
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Report component not implemented yet</p>
          </div>
        );
    }
  };

  return renderReport();
};

export default ReportRenderer;
