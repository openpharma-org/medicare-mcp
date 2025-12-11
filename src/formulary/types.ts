/**
 * Type definitions for Medicare Part D Formulary data
 */

/**
 * Basic Formulary Record (from Basic Drugs Formulary CSV)
 */
export interface FormularyRecord {
  contractId: string;
  planId: string;
  segmentId: string;
  formularyId: string;
  rxcui: string;
  drugName: string;
  ndc: string;
  tierId: string;
  tierLevel: string;
  priorAuth: string;  // Y/N
  quantityLimit: string;  // Y/N
  stepTherapy: string;  // Y/N
}

/**
 * Beneficiary Cost Record (from Beneficiary Cost CSV)
 */
export interface CostRecord {
  contractId: string;
  planId: string;
  segmentId: string;
  formularyId: string;
  tierId: string;
  costShareType: string;  // COPAY or COINSURANCE
  costShareAmount: string;
  pharmacyType: string;  // RETAIL, MAIL_ORDER, etc.
}

/**
 * Merged Formulary Entry (with cost data)
 */
export interface FormularyEntry {
  // Drug Info
  ndcCode: string;
  drugName: string;
  rxcui: string;

  // Plan Info
  contractId: string;
  planId: string;
  planName?: string;
  segmentId: string;

  // Coverage Details
  tierId: string;
  tierLevel: string;  // e.g., "Preferred Generic", "Specialty"

  // Utilization Management
  priorAuthRequired: boolean;
  quantityLimit: boolean;
  stepTherapyRequired: boolean;

  // Cost Sharing (from Beneficiary Cost file)
  copayAmount?: number;
  coinsurancePercent?: number;

  // Metadata
  formularyId: string;
  dataMonth: string;
}

/**
 * Formulary Search Parameters
 */
export interface FormularySearchParams {
  // Drug Identification (at least one required)
  drug_name?: string;
  ndc_code?: string;

  // Plan Filters
  plan_id?: string;
  plan_state?: string;
  plan_type?: 'PDP' | 'MAPD';

  // Coverage Filters
  tier?: number;
  requires_prior_auth?: boolean;
  has_quantity_limit?: boolean;
  has_step_therapy?: boolean;

  // Data Version
  month?: string;  // YYYY-MM

  // Pagination
  size?: number;
  offset?: number;
}

/**
 * Formulary Search Result
 */
export interface FormularySearchResult {
  total: number;
  formulary_entries: FormularyEntry[];
  data_source: {
    dataset: string;
    month: string;
    file_date: string;
  };
}

/**
 * Formulary Dataset (loaded in memory)
 */
export interface FormularyDataset {
  month: string;
  fileDate: string;
  formularyRecords: FormularyRecord[];
  costRecords: CostRecord[];
}

/**
 * Cache Manifest Entry
 */
export interface CacheManifestEntry {
  month: string;
  downloadDate: string;
  zipPath: string;
  extractPath: string;
  fileHashes: {
    [filename: string]: string;
  };
}

/**
 * Tier ID to Description Mapping
 */
export const TIER_DESCRIPTIONS: { [key: string]: string } = {
  '1': 'Preferred Generic',
  '2': 'Generic',
  '3': 'Preferred Brand',
  '4': 'Non-Preferred Brand',
  '5': 'Specialty Tier',
  '6': 'Select Care Drugs'
};
