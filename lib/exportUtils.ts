
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


export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

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

export const triggerPrint = () => {
  window.print();
};
