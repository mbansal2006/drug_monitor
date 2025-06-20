
// Type definitions for our CSV data structures
export interface Location {
  location_id: string;
  duns_number: string;
  address: string;
  firm_name: string;
  country: string;
  state_or_region: string;
  postal_code: string;
  full_country_name: string;
  risk_score: number;
  taa_compliant: boolean;
  is_five_eyes: boolean;
  is_nato: boolean;
  is_mnna: boolean;
  is_oecd: boolean;
  is_quad: boolean;
  has_bis_ns1: boolean;
  has_bis_rs1: boolean;
  ofac_sanctioned: boolean;
  has_export_ban_history: boolean;
  engages_in_dumping: boolean;
  quality_risk_flag: boolean;
  oai_count: number;
}

export interface Drug {
  drug_id: string;
  drug_name: string;
  therapeutic_categories: string;
  shortage_status: string;
  shortage_start: string;
  shortage_end: string;
  update_type: string;
  update_date: string;
  fda_essential: number;
  reason: string;
}

export interface Manufacturer {
  manufacturer_name: string;
  dummy: string;
}

export interface NDC {
  ndc_id: string;
  ndc_code: string;
  proprietary_name: string;
  drug_dosage: string;
  drug_strength: string;
  drug_id: string;
  manufacturer_name: string;
}

export interface NDCLocationLink {
  ndc_id: string;
  ndc_code: string;
  location_id: string;
}

export interface CountryRiskData {
  country: string;
  avgRiskScore: number;
  locationCount: number;
  oaiCount: number;
  taaCompliant: boolean;
  ndcCount: number;
}
