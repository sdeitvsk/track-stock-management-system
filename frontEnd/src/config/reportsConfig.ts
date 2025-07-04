
import { TrendingUp, Package, AlertCircle, BarChart3, FileText, PieChart } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ReportConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  filterType: 'date-range' | 'as-on-date' | 'custom';
  enabled: boolean;
  queryKey: string;
  serviceMethod: string;
}

export const reportsConfig: ReportConfig[] = [
  {
    id: 'transactions',
    title: 'Total Transactions',
    description: 'Complete transaction history including purchases, issues, and approved indent requests',
    icon: TrendingUp,
    color: 'purple',
    filterType: 'date-range',
    enabled: true,
    queryKey: 'total-transactions',
    serviceMethod: 'getTotalTransactions'
  },
  {
    id: 'stock-detailed',
    title: 'Stock Balance Detailed',
    description: 'Detailed view of stock balance for each purchase batch as on date',
    icon: Package,
    color: 'blue',
    filterType: 'as-on-date',
    enabled: true,
    queryKey: 'stock-balance-detailed',
    serviceMethod: 'getStockBalanceDetailed'
  },
  {
    id: 'stock-summary',
    title: 'Stock Balance Summary',
    description: 'Consolidated stock summary by item name as on date',
    icon: AlertCircle,
    color: 'green',
    filterType: 'as-on-date',
    enabled: true,
    queryKey: 'stock-balance-summary',
    serviceMethod: 'getStockBalanceSummary'
  }
  // Future reports can be easily added here:
  // {
  //   id: 'monthly-trends',
  //   title: 'Monthly Trends',
  //   description: 'Monthly analysis of inventory trends',
  //   icon: BarChart3,
  //   color: 'orange',
  //   filterType: 'date-range',
  //   enabled: false,
  //   queryKey: 'monthly-trends',
  //   serviceMethod: 'getMonthlyTrends'
  // }
];

export const getEnabledReports = () => reportsConfig.filter(report => report.enabled);
export const getReportById = (id: string) => reportsConfig.find(report => report.id === id);
