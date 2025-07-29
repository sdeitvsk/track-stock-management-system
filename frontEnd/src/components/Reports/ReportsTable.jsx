import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment';

function ReportsTable({ data, title = 'Report Title', summaryCols = [] }) {
  const [visibleRows, setVisibleRows] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterError, setFilterError] = useState('');
  const rowsPerLoad = 40;
  const containerRef = useRef(null);

  const DateCols = import.meta.env.VITE_Date_Columns.split(',');

  useEffect(() => {

   
    
    // Reset everything when data changes
    setFilters({});
    setFilteredData(data);
    setVisibleRows(data.slice(0, rowsPerLoad));
    setCurrentIndex(rowsPerLoad);
  }, [data]);

  const parseFilterValue = (value) => {
    const operators = {
      '>': 'gt',
      '<': 'lt',
      '>=': 'gte',
      '<=': 'lte',
      '=': 'eq'
    };

    for (const [symbol, op] of Object.entries(operators)) {
      if (value.startsWith(symbol)) {
        const numValue = parseFloat(value.slice(symbol.length));
        if (!isNaN(numValue)) {
          return { operator: op, value: numValue };
        }
      }
    }
    return { operator: 'contains', value };
  };

  const compareValues = (cellValue, filterValue, operator) => {
    const numCell = parseFloat(cellValue);

    if (operator === 'contains') {
      return cellValue.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
    }

    if (isNaN(numCell)) {
      return false;
    }

    switch (operator) {
      case 'gt': return numCell > filterValue;
      case 'lt': return numCell < filterValue;
      case 'gte': return numCell >= filterValue;
      case 'lte': return numCell <= filterValue;
      case 'eq': return numCell === filterValue;
      default: return false;
    }
  };

  const applyFilters = (allData) => {
    try {
      setFilterError('');
      const filtered = allData.filter(row => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const { operator, value: filterValue } = parseFilterValue(value);
          const cellValue = row[key];
          return compareValues(cellValue, filterValue, operator);
        });
      });

      // Apply current sort if exists
      const sortedAndFiltered = sortConfig.key
        ? sortData(filtered, sortConfig.key, sortConfig.direction)
        : filtered;

      setFilteredData(sortedAndFiltered);
      setVisibleRows(sortedAndFiltered.slice(0, rowsPerLoad));
      setCurrentIndex(rowsPerLoad);
    } catch (error) {
      setFilterError('Invalid filter format. Use >, <, >=, <= for numeric comparisons.');
    }
  };

  useEffect(() => {
    applyFilters(data);
  }, [filters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentIndex < filteredData.length) {
          const nextRows = filteredData.slice(currentIndex, currentIndex + rowsPerLoad);
          setVisibleRows(prev => [...prev, ...nextRows]);
          setCurrentIndex(prev => prev + rowsPerLoad);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [currentIndex, filteredData]);

  const handleFilterChange = (header, value) => {
    setFilters(prev => ({
      ...prev,
      [header]: value
    }));
  };

  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD-MMM-YYYY');
  };

  const calculateColumnSums = () => {
    const sums = {};
    summaryCols.forEach(col => {
      sums[col] = data.reduce((sum, row) => {
        const value = Number(row[col]);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
    });
    return sums;
  };

  const isNumeric = (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  };

  const sortData = (data, key, direction) => {
    return [...data].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      // Handle numeric values
      if (isNumeric(aVal) && isNumeric(bVal)) {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      // Handle dates
      else if (DateCols.includes(key) && isValidDate(aVal) && isValidDate(bVal)) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      // Handle strings
      else {
        aVal = (aVal?.toString() || '').toLowerCase();
        bVal = (bVal?.toString() || '').toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const sortedData = sortData(filteredData, key, direction);
    setFilteredData(sortedData);
    setVisibleRows(sortedData.slice(0, currentIndex));
  };

  const getSortIcon = (header) => {
    if (sortConfig.key !== header) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="mt-2 overflow-y-auto relative" style={{ maxHeight: '80vh' }}>

      <table className="min-w-full bg-white border border-gray-300 relative">
        <thead className="bg-gray-800 text-black ">
          <tr>
            {data.length > 0 && Object.keys(data[0]).map(header => (
              <th
                key={header}
                className="px-4 py-2 border cursor-pointer hover:bg-gray-700 sticky top-0"
                onClick={() => handleSort(header)}
              >
                <div className="flex items-center justify-between">
                  <span>{header}</span>
                  <span className="ml-2">{getSortIcon(header)}</span>
                </div>
              </th>
            ))}
          </tr>
          <tr>
            {data.length > 0 && Object.keys(data[0]).map(header => (
              <th key={`filter-${header}`} className="px-1 py-1 border sticky top-0">
                <input
                  type="text"
                  value={filters[header] || ''}
                  onChange={(e) => handleFilterChange(header, e.target.value)}
                  className="w-full px-1  text-gray-800 bg-white border rounded"
                  placeholder="Filter..."
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, index) => (
            <tr key={index}>
              {Object.entries(row).map(([key, cell], cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-2 py-1 border ${isNumeric(cell) ? 'text-right' : ''}`}
                >
                  {DateCols.includes(key) && isValidDate(cell)
                    ? formatDate(cell)
                    : cell?.toString() || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-800 text-white sticky bottom-0">
          <tr>
            {data.length > 0 && Object.keys(data[0]).map(key => {
              const sums = calculateColumnSums();
              return (
                <td
                  key={key}
                  className={`px-2 py-1 border ${summaryCols.includes(key) ? 'text-right' : 'text-center'}`}
                >
                  {summaryCols.includes(key) ? sums[key]?.toLocaleString() : ''}
                </td>
              );
            })}
          </tr>
          <tr>
            <td colSpan={data.length > 0 ? Object.keys(data[0]).length : 1} className="px-2 py-1 text-center">
              {filterError ? (
                <span className="text-red-400">{filterError}</span>
              ) : (
                `Displaying ${visibleRows.length} of ${filteredData.length} records`
              )}
            </td>
          </tr>
        </tfoot>
      </table>
      <div ref={containerRef} style={{ height: '10px' }} />
    </div>
  )
}

export default ReportsTable