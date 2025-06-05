
export interface Petition {
  id: string;
  petition_nbr: number;
  filing_date: string;
  official_title: string;
  type: string;
  status: string;
  association_role?: string | null;
  association_name?: string | null;
  residency_country: string;
  goal?: string | null;
  sign_nbr_electronic?: number | null;
  sign_nbr_paper?: number | null;
  motivation?: string | null;
  created_at: string;
  updated_at: string;
}
