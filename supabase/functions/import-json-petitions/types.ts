
export interface JsonPetitionData {
  // Handle various possible field names from different JSON structures
  id?: string;
  number?: number;
  petitionNumber?: number;
  petition_number?: number;
  petition_nbr?: number;
  filingDate?: string;
  filing_date?: string;
  date?: string;
  depositDate?: string;
  officialTitle?: string;
  official_title?: string;
  title?: string;
  type?: string;
  status?: string;
  associationRole?: string;
  association_role?: string;
  associationName?: string;
  association_name?: string;
  residencyCountry?: string;
  residency_country?: string;
  country?: string;
  goal?: string;
  purpose?: string;
  signatureStartDate?: string;
  signature_start_date?: string;
  signatureFrom?: string;
  signatureEndDate?: string;
  signature_end_date?: string;
  signatureTo?: string;
  signaturesRequired?: number;
  signatures_required?: number;
  electronicalSignatureCount?: number;
  electronicSignatures?: number;
  electronic_signatures?: number;
  sign_nbr_electronic?: number;
  paperSignatureCount?: number;
  paperSignatures?: number;
  paper_signatures?: number;
  sign_nbr_paper?: number;
  motivation?: string;
  isClosed?: boolean;
  is_closed?: boolean;
  closed?: boolean;
  url?: string;
  [key: string]: any;
}

export interface ImportResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  totalRecords?: number;
  parsed?: number;
  parseErrors?: number;
  imported?: number;
  insertErrors?: number;
  thresholdReached?: number;
}

export interface ImportRequest {
  bucketName?: string;
  fileName?: string;
}
