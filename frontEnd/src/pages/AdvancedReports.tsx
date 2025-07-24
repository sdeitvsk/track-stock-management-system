import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import ReportsFilters from '../components/Reports/ReportsFilters';
import ReportRenderer from '../components/Reports/ReportRenderer';
import { FileBarChart } from 'lucide-react';
import { getEnabledReports, getReportById } from '../config/reportsConfig';
import Select from "react-select/creatable";

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

  const handleExport = () => {
    console.log('Export functionality to be implemented for:', activeTab);
  };

  const getReportType = () => {
    if (!currentReport) return 'transactions' as const;
    
    switch (currentReport.filterType) {
      case 'date-range':
        return 'transactions' as const;
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