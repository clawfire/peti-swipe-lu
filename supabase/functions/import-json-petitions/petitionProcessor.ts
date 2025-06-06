// Calculate signatures required based on filing date
export const calculateSignaturesRequired = (filingDate: string): number => {
  try {
    const filing = new Date(filingDate);
    const marchFirst2025 = new Date('2025-03-01');
    return filing < marchFirst2025 ? 4500 : 5500;
  } catch {
    return 5500; // Default to current threshold if date parsing fails
  }
};

// Determine petition status based on signature count and threshold
export const determinePetitionStatus = (
  totalSignatures: number, 
  signaturesRequired: number, 
  originalStatus?: string
): string => {
  // If petition already has a closed status, keep it
  if (originalStatus === 'CLOTUREE') {
    return 'CLOTUREE';
  }
  
  // Check if threshold is reached
  if (totalSignatures >= signaturesRequired) {
    return 'SEUIL_ATTEINT';
  }
  
  // Default to signature collection in progress
  return originalStatus || 'SIGNATURE_EN_COURS';
};
