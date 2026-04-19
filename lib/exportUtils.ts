/**
 * Utility for exporting data to CSV and handling print layouts
 */

/**
 * Flattens a nested object into a single-level object with dot notation keys.
 * This is essential for CSV export where nested structures (like bimDetails) 
 * need to be mapped to individual columns.
 */
export const flattenObject = (obj: any, prefix = ''): any => {
  return Object.keys(obj).reduce((acc: any, k: string) => {
    const pre = prefix.length ? prefix + '_' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = Array.isArray(obj[k]) ? obj[k].join(', ') : obj[k];
    }
    return acc;
  }, {});
};

/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 */
export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  // Flatten all objects in the array
  const flattenedData = data.map(item => flattenObject(item));
  
  // Extract headers from the first object
  const headers = Object.keys(flattenedData[0]);
  
  // Create CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...flattenedData.map(row => 
      headers.map(header => {
        const val = row[header];
        const escaped = ('' + (val ?? '')).replace(/"/g, '""'); // Escape double quotes
        return `"${escaped}"`; // Wrap in quotes
      }).join(',')
    )
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Triggers the browser print dialog.
 * Targeted @media print CSS in the components will handle formatting.
 */
export const triggerPrint = () => {
  window.print();
};
