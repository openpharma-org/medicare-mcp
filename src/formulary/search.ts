/**
 * Search and filter Medicare Part D formulary data
 */

import { FormularyDataset, FormularyRecord, FormularyEntry, FormularySearchParams, FormularySearchResult, TIER_DESCRIPTIONS } from './types.js';
import { getLatestFormulary } from './cache.js';
import { loadFormularyDataset } from './parser.js';

/**
 * In-memory formulary dataset cache
 */
let cachedDataset: FormularyDataset | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

/**
 * Load or retrieve cached formulary dataset
 */
async function getFormularyDataset(): Promise<FormularyDataset> {
  const now = Date.now();

  // Return cached dataset if still valid
  if (cachedDataset && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedDataset;
  }

  // Load fresh dataset
  const { month, fileDate, extractPath } = await getLatestFormulary();
  cachedDataset = await loadFormularyDataset(extractPath, month, fileDate);
  cacheTimestamp = now;

  return cachedDataset;
}

/**
 * Convert FormularyRecord to FormularyEntry
 */
function recordToEntry(record: FormularyRecord, dataMonth: string): FormularyEntry {
  return {
    ndcCode: record.ndc,
    drugName: record.drugName,
    rxcui: record.rxcui,
    contractId: record.contractId,
    planId: record.planId,
    segmentId: record.segmentId,
    tierId: record.tierId,
    tierLevel: TIER_DESCRIPTIONS[record.tierId] || record.tierLevel || 'Unknown Tier',
    priorAuthRequired: record.priorAuth.toUpperCase() === 'Y',
    quantityLimit: record.quantityLimit.toUpperCase() === 'Y',
    stepTherapyRequired: record.stepTherapy.toUpperCase() === 'Y',
    formularyId: record.formularyId,
    dataMonth
  };
}

/**
 * Filter formulary records based on search parameters
 */
function filterRecords(records: FormularyRecord[], params: FormularySearchParams): FormularyRecord[] {
  let filtered = records;

  // Drug identification filters (at least one required)
  if (params.drug_name) {
    const searchTerm = params.drug_name.toLowerCase();
    filtered = filtered.filter(r => r.drugName.toLowerCase().includes(searchTerm));
  }

  if (params.ndc_code) {
    // Exact match for NDC code
    filtered = filtered.filter(r => r.ndc === params.ndc_code);
  }

  // Plan filters
  if (params.plan_id) {
    filtered = filtered.filter(r => r.planId === params.plan_id);
  }

  // Coverage filters
  if (params.tier !== undefined) {
    filtered = filtered.filter(r => r.tierId === String(params.tier));
  }

  if (params.requires_prior_auth !== undefined) {
    const targetValue = params.requires_prior_auth ? 'Y' : 'N';
    filtered = filtered.filter(r => r.priorAuth.toUpperCase() === targetValue);
  }

  if (params.has_quantity_limit !== undefined) {
    const targetValue = params.has_quantity_limit ? 'Y' : 'N';
    filtered = filtered.filter(r => r.quantityLimit.toUpperCase() === targetValue);
  }

  if (params.has_step_therapy !== undefined) {
    const targetValue = params.has_step_therapy ? 'Y' : 'N';
    filtered = filtered.filter(r => r.stepTherapy.toUpperCase() === targetValue);
  }

  return filtered;
}

/**
 * Search Medicare Part D formulary
 */
export async function searchFormulary(params: FormularySearchParams): Promise<FormularySearchResult> {
  // Validate: at least one drug identification parameter required (unless filtering by plan)
  if (!params.drug_name && !params.ndc_code && !params.plan_id) {
    throw new Error('At least one of drug_name, ndc_code, or plan_id is required');
  }

  // Load dataset
  const dataset = await getFormularyDataset();

  // Filter records
  let filtered = filterRecords(dataset.formularyRecords, params);

  // Get total count before pagination
  const total = filtered.length;

  // Apply pagination
  const size = params.size || 100;
  const offset = params.offset || 0;
  const paginated = filtered.slice(offset, offset + size);

  // Convert to FormularyEntry format
  const entries = paginated.map(r => recordToEntry(r, dataset.month));

  return {
    total,
    formulary_entries: entries,
    data_source: {
      dataset: 'Monthly Prescription Drug Plan Formulary and Pharmacy Network Information',
      month: dataset.month,
      file_date: dataset.fileDate
    }
  };
}

/**
 * Get formulary coverage for specific drug across all plans
 */
export async function getDrugCoverage(drugName: string): Promise<FormularySearchResult> {
  return searchFormulary({
    drug_name: drugName,
    size: 1000  // Get more results for coverage analysis
  });
}

/**
 * Get formulary for specific plan
 */
export async function getPlanFormulary(planId: string, options?: {
  tier?: number;
  size?: number;
  offset?: number;
}): Promise<FormularySearchResult> {
  return searchFormulary({
    plan_id: planId,
    tier: options?.tier,
    size: options?.size || 100,
    offset: options?.offset || 0
  });
}
