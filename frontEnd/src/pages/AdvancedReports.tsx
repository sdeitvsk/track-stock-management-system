import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import ReportsFilters from '../components/Reports/ReportsFilters';
import ReportRenderer from '../components/Reports/ReportRenderer';
import { FileBarChart } from 'lucide-react';
import { getEnabledReports, getReportById } from '../config/reportsConfig';
import Select from "react-select/creatable";
import { exportToCsv } from '../utils/reportUtils';
import { reportsService } from '../services/reportsService';

const AdvancedReports = () => {
  const enabledReports = getEnabledReports();
  const [activeTab, setActiveTab] = useState(enabledReports[0]?.id || 'transactions');
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    as_on_date: new Date().toISOString().split('T')[0],
    search: ''
  });

  const currentReport = getReportById(activeTab);

  const handleApplyFilters = () => {
    // Force re-render of active report
    setFilters({ ...filters });
  };

  const handleExport = async () => {
    const reportConfig = getReportById(activeTab);
    if (!reportConfig) return;

    const reportType = getReportType();
    let data: any[] = [];
    let filename = '';

    try {
      if (reportType === 'transactions') {
        const response = await reportsService.getTotalTransactions(filters);
        data = response.data.transactions;
        filename = 'transactions_report.csv';
      } else if (reportType === 'stock-detailed') {
        const response = await reportsService.getStockBalanceDetailed(filters);
        data = response.data.stock_details;
        filename = 'stock_detailed_report.csv';
      } else if (reportType === 'stock-summary') {
        const response = await reportsService.getStockBalanceSummary(filters);
        data = response.data.stock_summary;
        filename = 'stock_summary_report.csv';
      } else if (reportType === 'items-issued') {
        const response = await reportsService.getItemsIssued(filters);
        data = response.data.items_issued;
        filename = 'items_issued_report.csv';
      }

      if (data.length) {
        exportToCsv(data, filename);
      } else {
        alert('No data available to export.');
      }
    } catch (error) {
      alert('Failed to export report.');
      console.error(error);
    }
  };

  const getReportType = () => {
    if (!currentReport) return 'transactions' as const;
    
    switch (currentReport.filterType) {
      case 'date-range':
        return activeTab.includes('items-issued') || activeTab.includes('transactions') ? 'items-issued' as const :   'transactions' as const;
      case 'as-on-date':
        return activeTab.includes('detailed') ? 'stock-detailed' as const : 'stock-summary' as const;
      
      default:
        return 'transactions' as const;
    }
  };

  const handleReportChange = (selectedOption: any) => {
    if (selectedOption?.value) {
      setActiveTab(selectedOption.value);
    }
  };

  const reportOptions = enabledReports.map((report) => ({
    label: report.title,
    value: report.id
  }));

  const selectedOption = reportOptions.find(option => option.value === activeTab);

  return (
    <Layout title="Advanced Reports" subtitle="Comprehensive inventory and transaction analytics">
      <div className="space-y-6">
        {/* Reports Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileBarChart className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Advanced Reports</h2>
              <p className="text-gray-600">Generate detailed reports with advanced filtering options</p>
            </div>
          </div>
          
          <div className="min-w-[250px]">
            <Select
              options={reportOptions}
              value={selectedOption}
              onChange={handleReportChange}
              placeholder="Select Report"
              isSearchable={true}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {/* Filters */}
        <ReportsFilters
          reportType={getReportType()}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onExport={handleExport}
        />

        {/* Dynamic Report Content */}
        {currentReport && (
          <div className="mt-6">
            <ReportRenderer 
              reportConfig={currentReport}
              filters={filters}
              isActive={true}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdvancedReports;