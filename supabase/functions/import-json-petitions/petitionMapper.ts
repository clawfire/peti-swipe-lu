
import { JsonPetitionData } from './types.ts';
import { parseDate } from './dateUtils.ts';
import { calculateSignaturesRequired, determinePetitionStatus } from './petitionProcessor.ts';

const getFieldValue = (data: JsonPetitionData, ...fieldNames: string[]): any => {
  for (const fieldName of fieldNames) {
    if (data[fieldName] !== undefined && data[fieldName] !== null && data[fieldName] !== '') {
      return data[fieldName];
    }
  }
  return null;
};

export const mapJsonToPetition = (jsonData: JsonPetitionData, index: number): any | null => {
  try {
    console.log(`Processing record ${index}:`, JSON.stringify(jsonData, null, 2));

    // Get title from multiple possible field names
    const officialTitle = getFieldValue(jsonData, 'officialTitle', 'official_title', 'title');
    if (!officialTitle) {
      console.warn(`Record ${index}: Missing official title`);
      return null;
    }

    // Get date from multiple possible field names - try depositDate first, then others
    const filingDateStr = getFieldValue(jsonData, 'depositDate', 'filingDate', 'filing_date', 'date');
    let parsedFilingDate = null;
    
    if (filingDateStr) {
      parsedFilingDate = parseDate(filingDateStr);
      if (!parsedFilingDate) {
        console.warn(`Record ${index}: Invalid filing date: "${filingDateStr}"`);
      }
    }

    // If no filing date is found, use current date as fallback
    if (!parsedFilingDate) {
      parsedFilingDate = new Date().toISOString().split('T')[0];
      console.warn(`Record ${index}: No valid filing date found, using current date as fallback`);
    }

    // Get signature counts
    const signElectronic = getFieldValue(jsonData, 'electronicalSignatureCount', 'electronicSignatures', 'electronic_signatures', 'sign_nbr_electronic') || 0;
    const signPaper = getFieldValue(jsonData, 'paperSignatureCount', 'paperSignatures', 'paper_signatures', 'sign_nbr_paper') || 0;
    const totalSignatures = signElectronic + signPaper;

    // Calculate signatures required based on filing date
    const signaturesRequired = calculateSignaturesRequired(parsedFilingDate);

    // Get original status and determine final status
    const originalStatus = getFieldValue(jsonData, 'status');
    const finalStatus = determinePetitionStatus(totalSignatures, signaturesRequired, originalStatus);

    // Get other fields with fallbacks
    const type = getFieldValue(jsonData, 'type') || 'Unknown';
    const residencyCountry = getFieldValue(jsonData, 'residencyCountry', 'residency_country', 'country') || 'Luxembourg';

    // Build the petition object
    const petition = {
      external_id: getFieldValue(jsonData, 'id') || null,
      petition_nbr: getFieldValue(jsonData, 'number', 'petitionNumber', 'petition_number', 'petition_nbr') || null,
      filing_date: parsedFilingDate,
      official_title: officialTitle,
      title: officialTitle, // Map to the single title field
      type: type,
      status: finalStatus, // Use calculated status
      association_role: getFieldValue(jsonData, 'associationRole', 'association_role') || null,
      association_name: getFieldValue(jsonData, 'associationName', 'association_name') || null,
      residency_country: residencyCountry,
      purpose: getFieldValue(jsonData, 'goal', 'purpose') || null,
      signature_start_date: parseDate(getFieldValue(jsonData, 'signatureFrom', 'signatureStartDate', 'signature_start_date')),
      signature_end_date: parseDate(getFieldValue(jsonData, 'signatureTo', 'signatureEndDate', 'signature_end_date')),
      signatures_required: signaturesRequired, // Set calculated signatures required
      sign_nbr_electronic: signElectronic,
      sign_nbr_paper: signPaper,
      motivation: getFieldValue(jsonData, 'motivation') || null,
      is_closed: getFieldValue(jsonData, 'isClosed', 'is_closed', 'closed') || false,
      url: getFieldValue(jsonData, 'url') || null,
    };

    console.log(`Record ${index}: Successfully parsed petition with ${totalSignatures}/${signaturesRequired} signatures, status: ${finalStatus}:`, JSON.stringify(petition, null, 2));
    return petition;

  } catch (error) {
    console.error(`Record ${index}: Parsing error:`, error);
    return null;
  }
};
