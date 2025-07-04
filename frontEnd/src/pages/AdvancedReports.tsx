
import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ReportsFilters from '../components/Reports/ReportsFilters';
import ReportRenderer from '../components/Reports/ReportRenderer';
import { FileBarChart } from 'lucide-react';
import { getEnabledReports, getReportById } from '../config/reportsConfig';

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
    const report = getReportById(activeTab);
    if (!report) return 'transactions' as const;
    
    switch (report.filterType) {
      case 'date-range':
        return 'transactions' as const;
      case 'as-on-date':
        return activeTab.includes('detailed') ? 'stock-detailed' as const : 'stock-summary' as const;
      default:
        return 'transactions' as const;
    }
  };

  return (
    <Layout title="Advanced Reports" subtitle="Comprehensive inventory and transaction analytics">
      <div className="space-y-6">
        {/* Reports Header */}
        <div className="flex items-center gap-3">
          <FileBarChart className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Reports</h2>
            <p className="text-gray-600">Generate detailed reports with advanced filtering options</p>
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

        {/* Dynamic Reports Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-${enabledReports.length}`}>
            {enabledReports.map((report) => {
              const IconComponent = report.icon;
              return (
                <TabsTrigger key={report.id} value={report.id} className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {report.title}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Dynamic Report Content */}
          {enabledReports.map((report) => (
            <TabsContent key={report.id} value={report.id}>
              <ReportRenderer 
                reportConfig={report}
                filters={filters}
                isActive={activeTab === report.id}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdvancedReports;
