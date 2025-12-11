/**
 * CSV parser for Medicare Part D formulary files
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'fast-csv';
import { FormularyRecord, FormularyDataset } from './types.js';

/**
 * Parse Basic Drugs Formulary CSV
 *
 * Note: We're looking for files matching "Formulary*" or "formulary*" pattern
 * Actual CMS file names may vary (e.g., "Formulary_2026.csv", "formulary.csv")
 */
export async function parseFormularyCSV(extractPath: string): Promise<FormularyRecord[]> {
  const files = fs.readdirSync(extractPath);

  // Find formulary file (case-insensitive, various naming patterns)
  const formularyFile = files.find(f =>
    f.toLowerCase().includes('formulary') &&
    f.toLowerCase().endsWith('.csv') &&
    !f.toLowerCase().includes('cost') &&
    !f.toLowerCase().includes('excluded')
  );

  if (!formularyFile) {
    throw new Error(`Formulary CSV not found in ${extractPath}. Files: ${files.join(', ')}`);
  }

  const filePath = path.join(extractPath, formularyFile);
  console.error(`Parsing formulary file: ${formularyFile}`);

  const records: FormularyRecord[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ headers: true, ignoreEmpty: true }))
      .on('error', (error: Error) => reject(error))
      .on('data', (row: any) => {
        // CMS column names (actual names may vary - handle variations)
        const record: FormularyRecord = {
          contractId: row.Contract_ID || row.ContractID || row.contract_id || '',
          planId: row.Plan_ID || row.PlanID || row.plan_id || '',
          segmentId: row.Segment_ID || row.SegmentID || row.segment_id || '',
          formularyId: row.Formulary_ID || row.FormularyID || row.formulary_id || '',
          rxcui: row.RxCUI || row.RXCUI || row.rxcui || '',
          drugName: row.Drug_Name || row.DrugName || row.drug_name || '',
          ndc: row.NDC || row.ndc || '',
          tierId: row.Tier_ID || row.TierID || row.tier_id || '',
          tierLevel: row.Tier_Level || row.TierLevel || row.tier_level || row.Tier || '',
          priorAuth: row.Prior_Authorization || row.PriorAuth || row.prior_auth || row.PA || '',
          quantityLimit: row.Quantity_Limit || row.QuantityLimit || row.quantity_limit || row.QL || '',
          stepTherapy: row.Step_Therapy || row.StepTherapy || row.step_therapy || row.ST || ''
        };

        records.push(record);
      })
      .on('end', (rowCount: number) => {
        console.error(`Parsed ${records.length} formulary records from ${rowCount} rows`);
        resolve(records);
      });
  });
}

/**
 * Load formulary dataset from extracted files
 *
 * For now, we'll focus on just the Basic Formulary file.
 * Cost data can be added later as Phase 2 enhancement.
 */
export async function loadFormularyDataset(
  extractPath: string,
  month: string,
  fileDate: string
): Promise<FormularyDataset> {
  console.error(`Loading formulary dataset for ${month}...`);

  const formularyRecords = await parseFormularyCSV(extractPath);

  return {
    month,
    fileDate,
    formularyRecords,
    costRecords: []  // TODO: Parse beneficiary cost file in future
  };
}
