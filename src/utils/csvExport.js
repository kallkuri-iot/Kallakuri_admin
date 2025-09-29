/**
 * Utility functions for exporting data to CSV
 */

/**
 * Convert JSON data to CSV format
 * @param {Array} data - Array of objects to convert to CSV
 * @returns {String} CSV formatted string
 */
export const convertToCSV = (data) => {
  if (!data || !data.length) {
    return '';
  }
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeader = headers.join(',');
  
  // Create CSV rows from data
  const csvRows = data.map(row => {
    return headers.map(header => {
      // Handle special cases (nested objects, arrays, etc.)
      const cell = row[header];
      if (cell === null || cell === undefined) {
        return '';
      } else if (typeof cell === 'object') {
        return JSON.stringify(cell).replace(/"/g, '""'); // Escape double quotes
      }
      
      // Convert to string and escape quotes
      return String(cell).replace(/"/g, '""');
    }).join(',');
  });
  
  // Combine header and rows
  return [csvHeader, ...csvRows].join('\n');
};

/**
 * Download data as a CSV file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file to download
 */
export const downloadCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }
  
  // Convert data to CSV format
  const csv = convertToCSV(data);
  
  // Create a Blob with the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create object URL
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add link to document
  document.body.appendChild(link);
  
  // Click the link to trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format analytics data for CSV export based on chart/data type
 * @param {Object} data - The analytics data to format
 * @param {String} chartType - Type of chart/data to format
 * @returns {Array} Formatted data ready for CSV export
 */
export const formatAnalyticsForExport = (data, chartType) => {
  if (!data) return [];
  
  // Format data based on chart type
  switch (chartType) {
    case 'overview':
      // Format monthly trend data
      return data.combinedMonthlyData.map(item => ({
        Month: item.month,
        'Damage Claims': item.damageClaimsCount,
        Orders: item.orderCount,
        'Staff Activities': item.activityCount
      }));
      
    case 'byDistributor':
    case 'byProduct':
      // Format distributor/product data
      return data.map(item => ({
        Name: item.name,
        Count: item.claims || item.orders || item.activities
      }));
      
    case 'trend':
      // Format trend data
      return data.map(item => ({
        Month: item.month,
        Submitted: item.submitted,
        Approved: item.approved,
        Rejected: item.rejected,
        Dispatched: item.dispatched || 0
      }));
      
    case 'statusDistribution':
      // Format status distribution data
      return data.map(item => ({
        Status: item.name,
        Count: item.value
      }));
      
    case 'productivityByStaff':
      // Format staff productivity data
      return data.map(item => ({
        'Staff Name': item.name,
        'Productivity Score': item.productivity,
      }));
      
    case 'topPerformers':
      // Format top performers data
      return data.map(item => ({
        'Staff Name': item.name,
        'Activities': item.activities,
        'Completion Rate': item.completionRate + '%',
        'Avg Response Time': item.avgResponseTime,
        'Productivity Score': item.productivityScore
      }));
      
    default:
      return data;
  }
}; 