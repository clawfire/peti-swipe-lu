
export const parseDate = (dateStr: string | undefined): string | null => {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }
  
  // Handle ISO date strings with time
  if (dateStr.includes('T')) {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }
  }
  
  // Handle various date formats
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};
