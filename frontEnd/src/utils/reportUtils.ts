
import { ReportConfig } from '../config/reportsConfig';

export const getDefaultFilters = (reportConfig: ReportConfig) => {
  const baseFilters = {
    search: ''
  };

  switch (reportConfig.filterType) {
    case 'date-range':
      return {
        ...baseFilters,
        start_date: '',
        end_date: ''
      };
    case 'as-on-date':
      return {
        ...baseFilters,
        as_on_date: new Date().toISOString().split('T')[0]
      };
    case 'custom':
      // For future custom filter types
      return baseFilters;
    default:
      return baseFilters;
  }
};

export const validateFilters = (filters: any, reportConfig: ReportConfig): boolean => {
  switch (reportConfig.filterType) {
    case 'date-range':
      return Boolean(filters.start_date && filters.end_date);
    case 'as-on-date':
      return Boolean(filters.as_on_date);
    default:
      return true;
  }
};

export const formatFiltersForAPI = (filters: any, reportConfig: ReportConfig) => {
  const cleanFilters: any = {};
  
  Object.keys(filters).forEach(key => {
    if (filters[key] && filters[key].trim !== '') {
      cleanFilters[key] = filters[key];
    }
  });

  return cleanFilters;
};

/**
 * Converts an array of objects to CSV and triggers a download in the browser.
 * @param data Array of objects to export
 * @param filename Name of the file to download
 */
export function exportToCsv(data: any[], filename: string) {
  if (!data || !data.length) return;
  const keys = Object.keys(data[0]);
  const csvRows = [
    keys.join(','),
    ...data.map(row => keys.map(k => '"' + String(row[k] ?? '').replace(/"/g, '""') + '"').join(','))
  ];
  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
