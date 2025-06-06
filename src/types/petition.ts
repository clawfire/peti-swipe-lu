
export interface Petition {
  id: string;
  petition_nbr?: number | null;
  filing_date: string;
  official_title: string;
  title_de?: string | null;
  title_en?: string | null;
  title_fr?: string | null;
  type: string;
  status: string;
  association_role?: string | null;
  association_name?: string | null;
  residency_country: string;
  purpose?: string | null;
  signature_start_date?: string | null;
  signature_end_date?: string | null;
  signatures_required?: number | null;
  sign_nbr_electronic?: number | null;
  sign_nbr_paper?: number | null;
  motivation?: string | null;
  is_closed?: boolean | null;
  url?: string | null;
  external_id?: string | null;
  created_at: string;
  updated_at: string;
  goal?: string | null; // Add the goal field for compatibility
}
