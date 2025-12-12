#!/usr/bin/env node

import fetch from 'node-fetch';
import 'dotenv/config';
import http from 'http';
import { URLSearchParams } from "url";
import { Tool } from "./types";
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Logging utility for consistent log format across the application
 */
const logger = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  } as const,
  level: (process.env.LOG_LEVEL || 'info') as LogLevel,
  
  formatMessage: (level: string, message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    return JSON.stringify({ timestamp, level, message, ...meta });
  },

  error: (message: string, meta?: any) => {
    if (logger.levels[logger.level as keyof typeof logger.levels] >= logger.levels.error) {
      process.stderr.write(logger.formatMessage('error', message, meta) + '\n');
    }
  },

  warn: (message: string, meta?: any) => {
    if (logger.levels[logger.level as keyof typeof logger.levels] >= logger.levels.warn) {
      process.stderr.write(logger.formatMessage('warn', message, meta) + '\n');
    }
  },

  info: (message: string, meta?: any) => {
    if (logger.levels[logger.level as keyof typeof logger.levels] >= logger.levels.info) {
      if (!USE_HTTP) {
        process.stderr.write(logger.formatMessage('info', message, meta) + '\n');
      } else {
        process.stdout.write(logger.formatMessage('info', message, meta) + '\n');
      }
    }
  },

  debug: (message: string, meta?: any) => {
    if (logger.levels[logger.level as keyof typeof logger.levels] >= logger.levels.debug) {
      if (!USE_HTTP) {
        process.stderr.write(logger.formatMessage('debug', message, meta) + '\n');
      } else {
        process.stdout.write(logger.formatMessage('debug', message, meta) + '\n');
      }
    }
  }
};

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// API configuration and environment variables
const USE_HTTP = process.env.USE_HTTP === 'true';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// CMS Medicare dataset version mapping for each dataset type
const versionMapGeography: { [year: string]: string } = {
  "2023": "ddee9e22-7889-4bef-975a-7853e4cd0fbb",
  "2022": "87304f15-9ed0-41dc-a141-6141a0327453",
  "2021": "f00f462f-bb61-48b1-a321-1c50d78ce175",
  "2020": "31eb3018-43e0-4259-a0d8-e7a1112ffd08",
  "2019": "673030ae-ceed-4561-8fca-b1275395a86a",
  "2018": "05a85700-052f-4509-af43-7042b9b35868",
  "2017": "8e96a9f2-ce6e-46fd-b30d-8c695c756bfd",
  "2016": "c7d3f18c-2f00-4553-8cd1-871b727d5cdd",
  "2015": "dbee9609-2c90-43ca-b1b8-161bd9cfcdb2",
  "2014": "28181bd2-b377-4003-b73a-4bd92d1db4a9",
  "2013": "3c2a4756-0a8c-4e4d-845a-6ad169cb13d3"
};
const versionMapProviderAndService: { [year: string]: string } = {
  "2023": "0e9f2f2b-7bf9-451a-912c-e02e654dd725",
  "2022": "e650987d-01b7-4f09-b75e-b0b075afbf98",
  "2021": "31dc2c47-f297-4948-bfb4-075e1bec3a02",
  "2020": "c957b49e-1323-49e7-8678-c09da387551d",
  "2019": "867b8ac7-ccb7-4cc9-873d-b24340d89e32",
  "2018": "fb6d9fe8-38c1-4d24-83d4-0b7b291000b2",
  "2017": "85bf3c9c-2244-490d-ad7d-c34e4c28f8ea",
  "2016": "7918e22a-fbfb-4a07-9f59-f8aab2b757d4",
  "2015": "f8cdb11a-d5f7-4fbe-aac4-05abc8ee2c83",
  "2014": "f63b48ae-946e-48f7-9f56-327a68da4e0b",
  "2013": "ad5e7548-98ab-4325-af4b-b2a7099b9351"
};
const versionMapProvider: { [year: string]: string } = {
  "2023": "8889d81e-2ee7-448f-8713-f071038289b5",
  "2022": "21555c17-ec1b-4e74-b2c6-925c6cbb3147",
  "2021": "44e0a489-666c-4ea4-a1a2-360b6cdc19db",
  "2020": "29d799aa-c660-44fe-a51a-72c4b3e661ac",
  "2019": "6a53afe5-1cbc-4b33-9dc8-926ee532dc66",
  "2018": "900850df-c9a9-47ce-a9e0-d0ceae5a811f",
  "2017": "44ea2789-993f-4d55-ac44-ed7f160b58fa",
  "2016": "2691839a-99fb-45a1-9bd9-86905ba975cc",
  "2015": "fb870c06-27f2-4e15-b556-1731d794bb5b",
  "2014": "100d9e00-03cd-4105-9f58-27f9bf9ab773",
  "2013": "483a68df-26a9-42a5-a24c-7458e5374f61"
};

function getLatestYear(versionMap: { [year: string]: string }): string {
  return Object.keys(versionMap).sort().pop()!;
}

export const MEDICARE_INFO_TOOL: Tool = {
  name: "medicare_info",
  description: "Unified tool for Medicare data operations: provider services, Part D prescribers, hospital data, and spending information. Use the method parameter to specify the operation type.",
  input_schema: {
    type: "object",
    properties: {
      method: {
        type: "string",
        description: "The operation to perform: search_providers (Medicare Physician & Other Practitioners data), search_prescribers (Part D prescriber data), search_hospitals (hospital utilization & quality data), or search_spending (drug/service spending data). Valid values: 'search_providers', 'search_prescribers', 'search_hospitals', 'search_spending'"
      },
      dataset_type: {
        type: "string",
        description: "For search_providers: Type of dataset to search. Options:\n" +
          "- 'geography_and_service': Use when you need to compare regions, analyze geographic patterns, study regional variations in healthcare delivery, understand geographic distribution of healthcare services, or calculate per-capita/per-beneficiary rates by region.\n" +
          "- 'provider_and_service': Use when you need to analyze individual provider performance, track specific procedures by provider, calculate total procedures across providers, or study provider-level service patterns and outcomes.\n" +
          "- 'provider': Use when you need to analyze provider demographics, study provider participation in Medicare, understand provider practice patterns, or examine provider-level beneficiary characteristics and risk scores."
      },
      year: {
        type: "string",
        description: "For search_providers: Year of the dataset to query (2013 to latest available year, defaults to latest year)."
      },
      hcpcs_code: {
        type: "string",
        description: "For search_providers: HCPCS code to search for (e.g., '99213' for established patient office visit)."
      },
      provider_type: {
        type: "string",
        description: "For search_providers: Type of provider to search for (e.g., 'Cardiology', 'Podiatry', 'Family Practice')."
      },
      geo_level: {
        type: "string",
        description: "For search_providers: Geographic level for filtering (e.g., 'National', 'State', 'County', 'ZIP')."
      },
      geo_code: {
        type: "string",
        description: "For search_providers: Geographic code to filter by (e.g., 'CA' for California, '06037' for Los Angeles County)."
      },
      place_of_service: {
        type: "string",
        description: "For search_providers: Place of service code to filter by (e.g., 'F' for facility, 'O' for office, 'H' for hospital)."
      },
      size: {
        type: "number",
        description: "Number of results to return (default: 10 for search_providers, 25 for search_formulary, max: 5000)."
      },
      offset: {
        type: "number",
        description: "Starting result number for pagination (default: 0)."
      },
      sort_by: {
        type: "string",
        description: "For search_providers: Field to sort results by (e.g., 'Tot_Srvcs', 'Tot_Benes', 'Tot_Mdcr_Pymt_Amt')."
      },
      sort_order: {
        type: "string",
        description: "For search_providers: Sort order ('asc' or 'desc', default: 'desc')."
      },
      drug_name: {
        type: "string",
        description: "For search_prescribers: Drug name to search for - brand or generic (e.g., 'semaglutide', 'Ozempic', 'metformin'). Searches both brand and generic names."
      },
      prescriber_type: {
        type: "string",
        description: "For search_prescribers: Prescriber specialty (e.g., 'Endocrinology', 'Family Practice', 'Internal Medicine')."
      },
      prescriber_npi: {
        type: "string",
        description: "For search_prescribers: National Provider Identifier (NPI) of the prescriber."
      },
      state: {
        type: "string",
        description: "For search_prescribers, search_hospitals: State abbreviation (e.g., 'CA', 'TX', 'NY')."
      },
      hospital_name: {
        type: "string",
        description: "For search_hospitals: Hospital name (partial match supported)."
      },
      hospital_id: {
        type: "string",
        description: "For search_hospitals: CMS Certification Number (CCN) or provider ID."
      },
      drg_code: {
        type: "string",
        description: "For search_hospitals (inpatient): Diagnosis Related Group (DRG) code."
      },
      spending_drug_name: {
        type: "string",
        description: "For search_spending: Drug name for spending analysis (brand or generic)."
      },
      spending_type: {
        type: "string",
        description: "For search_spending: Type of spending data - 'part_d' (prescription drugs), 'part_b' (administered drugs). Default: 'part_d'."
      },
      formulary_drug_name: {
        type: "string",
        description: "For search_formulary: Drug name to search for (partial match supported, e.g., 'metformin', 'insulin'). At least one of formulary_drug_name or ndc_code is required."
      },
      ndc_code: {
        type: "string",
        description: "For search_formulary: NDC (National Drug Code) for exact drug identification (e.g., '00002143380'). At least one of drug_name or ndc_code is required."
      },
      tier: {
        type: "number",
        description: "For search_formulary: Tier number to filter by (1=Preferred Generic, 2=Generic, 3=Preferred Brand, 4=Non-Preferred Brand, 5=Specialty, 6=Select Care)."
      },
      requires_prior_auth: {
        type: "boolean",
        description: "For search_formulary: Filter by prior authorization requirement (true=requires PA, false=no PA required)."
      },
      has_quantity_limit: {
        type: "boolean",
        description: "For search_formulary: Filter by quantity limit (true=has limit, false=no limit)."
      },
      has_step_therapy: {
        type: "boolean",
        description: "For search_formulary: Filter by step therapy requirement (true=requires ST, false=no ST required)."
      },
      plan_state: {
        type: "string",
        description: "For search_formulary: State abbreviation to filter plans (e.g., 'CA', 'TX', 'NY')."
      },
      plan_id: {
        type: "string",
        description: "For search_formulary: Medicare Part D plan ID to filter by specific plan."
      }
    },
    required: ["method"]
  },
  responseSchema: {
    type: "object",
    properties: {
      total: {
        type: "number",
        description: "Total number of results found"
      },
      providers: { 
        type: "array",
        description: "List of Medicare providers matching the search criteria",
        items: {
          type: "object",
          properties: {
            npi: { type: "string", description: "Provider's National Provider Identifier (NPI)" },
            provider_name: { type: "string", description: "Provider's full name" },
            provider_type: { type: "string", description: "Provider's specialty or type of practice" },
            provider_address: { type: "string", description: "Provider's street address" },
            provider_city: { type: "string", description: "Provider's city" },
            provider_state: { type: "string", description: "Provider's state (2-letter abbreviation)" },
            provider_zip: { type: "string", description: "Provider's ZIP code" },
            provider_country: { type: "string", description: "Provider's country code (typically 'US')" },
            medicare_participating: { type: "string", description: "Whether the provider participates in Medicare ('Y' for yes, 'N' for no)" },
            total_hcpcs_codes: { type: "number", description: "Total number of unique HCPCS codes used by the provider" },
            total_beneficiaries: { type: "number", description: "Total number of unique Medicare beneficiaries served" },
            total_services: { type: "number", description: "Total number of services provided" },
            total_submitted_charges: { type: "number", description: "Total amount of submitted charges in dollars" },
            total_medicare_allowed: { type: "number", description: "Total amount allowed by Medicare in dollars" },
            total_medicare_payment: { type: "number", description: "Total amount paid by Medicare in dollars" },
            total_medicare_standardized: { type: "number", description: "Total standardized Medicare payment amount in dollars (adjusted for geographic differences)" },
            beneficiary_average_age: { type: "number", description: "Average age of beneficiaries served" },
            beneficiary_age_lt_65: { type: "number", description: "Number of beneficiaries under 65 years old" },
            beneficiary_age_65_74: { type: "number", description: "Number of beneficiaries aged 65-74" },
            beneficiary_age_75_84: { type: "number", description: "Number of beneficiaries aged 75-84" },
            beneficiary_age_gt_84: { type: "number", description: "Number of beneficiaries over 84 years old" },
            beneficiary_female_count: { type: "number", description: "Number of female beneficiaries" },
            beneficiary_male_count: { type: "number", description: "Number of male beneficiaries" },
            beneficiary_race_white: { type: "number", description: "Number of white beneficiaries" },
            beneficiary_race_black: { type: "number", description: "Number of black beneficiaries" },
            beneficiary_race_api: { type: "number", description: "Number of Asian/Pacific Islander beneficiaries" },
            beneficiary_race_hispanic: { type: "number", description: "Number of Hispanic beneficiaries" },
            beneficiary_race_native: { type: "number", description: "Number of Native American beneficiaries" },
            beneficiary_race_other: { type: "number", description: "Number of beneficiaries of other races" },
            beneficiary_dual_count: { type: "number", description: "Number of dual-eligible beneficiaries (eligible for both Medicare and Medicaid)" },
            beneficiary_non_dual_count: { type: "number", description: "Number of non-dual-eligible beneficiaries" },
            beneficiary_average_risk_score: { type: "number", description: "Average risk score of beneficiaries (higher scores indicate more complex medical conditions)" }
          }
        }
      }
    }
  },
  examples: [
    {
      name: 'Search for office visit codes by state (2023 data)',
      description: 'Search for office visit codes by state (2023 data)',
      input: { "dataset_type": "geography_and_service", "year": "2023", "hcpcs_code": "99213", "geo_level": "State", "geo_code": "CA", "size": 5, "sort_by": "Tot_Srvcs", "sort_order": "desc" },
      output: { "total": 5, "providers": [{ "npi": "1234567890", "provider_name": "Dr. Jane Smith", "provider_type": "Family Practice", "provider_address": "789 Health St", "provider_city": "Los Angeles", "provider_state": "CA", "provider_zip": "90001", "provider_country": "US", "medicare_participating": "Y", "total_hcpcs_codes": 10, "total_beneficiaries": 100, "total_services": 500, "total_submitted_charges": 50000, "total_medicare_allowed": 40000, "total_medicare_payment": 35000, "total_medicare_standardized": 34000, "beneficiary_average_age": 70, "beneficiary_age_lt_65": 20, "beneficiary_age_65_74": 30, "beneficiary_age_75_84": 25, "beneficiary_age_gt_84": 25, "beneficiary_female_count": 55, "beneficiary_male_count": 45, "beneficiary_race_white": 60, "beneficiary_race_black": 10, "beneficiary_race_api": 15, "beneficiary_race_hispanic": 10, "beneficiary_race_native": 2, "beneficiary_race_other": 3, "beneficiary_dual_count": 15, "beneficiary_non_dual_count": 85, "beneficiary_average_risk_score": 1.2 }] }
    },
    {
      name: 'Search for providers by specialty with pagination',
      description: 'Search for providers by specialty with pagination',
      input: { "dataset_type": "provider", "provider_type": "Podiatry", "geo_level": "State", "geo_code": "NY", "size": 10, "offset": 20, "sort_by": "Tot_Mdcr_Pymt_Amt", "sort_order": "desc" },
      output: { "total": 10, "providers": [{ "npi": "0987654321", "provider_name": "Dr. John Doe", "provider_type": "Podiatry", "provider_address": "123 Foot Ave", "provider_city": "New York", "provider_state": "NY", "provider_zip": "10001", "provider_country": "US", "medicare_participating": "Y", "total_hcpcs_codes": 8, "total_beneficiaries": 80, "total_services": 400, "total_submitted_charges": 40000, "total_medicare_allowed": 32000, "total_medicare_payment": 28000, "total_medicare_standardized": 27000, "beneficiary_average_age": 65, "beneficiary_age_lt_65": 15, "beneficiary_age_65_74": 25, "beneficiary_age_75_84": 20, "beneficiary_age_gt_84": 20, "beneficiary_female_count": 45, "beneficiary_male_count": 35, "beneficiary_race_white": 50, "beneficiary_race_black": 8, "beneficiary_race_api": 12, "beneficiary_race_hispanic": 8, "beneficiary_race_native": 1, "beneficiary_race_other": 1, "beneficiary_dual_count": 10, "beneficiary_non_dual_count": 70, "beneficiary_average_risk_score": 1.1 }] }
    },
    {
      name: 'Search for specific procedure by place of service',
      description: 'Search for specific procedure by place of service',
      input: { "dataset_type": "provider_and_service", "hcpcs_code": "45378", "place_of_service": "O", "size": 5, "sort_by": "Tot_Srvcs", "sort_order": "desc" },
      output: { "total": 5, "providers": [{ "npi": "1122334455", "provider_name": "Dr. Alice Johnson", "provider_type": "Gastroenterology", "provider_address": "456 Digestive Blvd", "provider_city": "Chicago", "provider_state": "IL", "provider_zip": "60601", "provider_country": "US", "medicare_participating": "Y", "total_hcpcs_codes": 12, "total_beneficiaries": 120, "total_services": 600, "total_submitted_charges": 60000, "total_medicare_allowed": 48000, "total_medicare_payment": 42000, "total_medicare_standardized": 41000, "beneficiary_average_age": 68, "beneficiary_age_lt_65": 25, "beneficiary_age_65_74": 35, "beneficiary_age_75_84": 30, "beneficiary_age_gt_84": 30, "beneficiary_female_count": 60, "beneficiary_male_count": 60, "beneficiary_race_white": 70, "beneficiary_race_black": 15, "beneficiary_race_api": 20, "beneficiary_race_hispanic": 15, "beneficiary_race_native": 3, "beneficiary_race_other": 3, "beneficiary_dual_count": 20, "beneficiary_non_dual_count": 100, "beneficiary_average_risk_score": 1.3 }] }
    },
    {
      name: 'Get total knee replacement procedures in California (2023)',
      description: 'Search for all providers performing knee replacements (HCPCS 27447) in California, sorted by total services to get the top 100 providers',
      input: { "dataset_type": "provider_and_service", "year": "2023", "hcpcs_code": "27447", "geo_level": "State", "geo_code": "CA", "size": 100, "sort_by": "Tot_Srvcs", "sort_order": "desc" },
      output: { "total": 100, "providers": [{ "npi": "1234567890", "provider_name": "Dr. John Smith", "provider_type": "Orthopedic Surgery", "provider_address": "123 Medical Center Dr", "provider_city": "Los Angeles", "provider_state": "CA", "provider_zip": "90024", "provider_country": "US", "medicare_participating": "Y", "total_hcpcs_codes": 15, "total_beneficiaries": 95, "total_services": 120, "total_submitted_charges": 1200000, "total_medicare_allowed": 960000, "total_medicare_payment": 840000, "total_medicare_standardized": 820000, "beneficiary_average_age": 72, "beneficiary_age_lt_65": 15, "beneficiary_age_65_74": 35, "beneficiary_age_75_84": 30, "beneficiary_age_gt_84": 20, "beneficiary_female_count": 65, "beneficiary_male_count": 30, "beneficiary_race_white": 70, "beneficiary_race_black": 5, "beneficiary_race_api": 10, "beneficiary_race_hispanic": 10, "beneficiary_race_native": 1, "beneficiary_race_other": 4, "beneficiary_dual_count": 10, "beneficiary_non_dual_count": 85, "beneficiary_average_risk_score": 1.2 }], "total_services": 4958 }
    }
  ]
};

interface MedicareProviderGeographyResponse {
  Rndrng_Prvdr_Geo_Lvl: string;
  Rndrng_Prvdr_Geo_Cd: string;
  Rndrng_Prvdr_Geo_Desc: string;
  HCPCS_Cd: string;
  HCPCS_Desc: string;
  HCPCS_Drug_Ind: string;
  Place_Of_Srvc: string;
  Tot_Rndrng_Prvdrs: number;
  Tot_Benes: number;
  Tot_Srvcs: number;
  Tot_Bene_Day_Srvcs: number;
  Avg_Sbmtd_Chrg: number;
  Avg_Mdcr_Alowd_Amt: number;
  Avg_Mdcr_Pymt_Amt: number;
  Avg_Mdcr_Stdzd_Amt: number;
}

interface MedicareProviderIndividualResponse {
  Rndrng_NPI: string;
  Rndrng_Prvdr_Last_Org_Name: string;
  Rndrng_Prvdr_First_Name: string;
  Rndrng_Prvdr_MI: string;
  Rndrng_Prvdr_Crdntls: string;
  Rndrng_Prvdr_Ent_Cd: string;
  Rndrng_Prvdr_St1: string;
  Rndrng_Prvdr_St2: string;
  Rndrng_Prvdr_City: string;
  Rndrng_Prvdr_State_Abrvtn: string;
  Rndrng_Prvdr_State_FIPS: string;
  Rndrng_Prvdr_Zip5: string;
  Rndrng_Prvdr_RUCA: string;
  Rndrng_Prvdr_RUCA_Desc: string;
  Rndrng_Prvdr_Cntry: string;
  Rndrng_Prvdr_Type: string;
  Rndrng_Prvdr_Mdcr_Prtcptg_Ind: string;
  HCPCS_Cd: string;
  HCPCS_Desc: string;
  HCPCS_Drug_Ind: string;
  Place_Of_Srvc: string;
  Tot_Benes: number;
  Tot_Srvcs: number;
  Tot_Bene_Day_Srvcs: number;
  Avg_Sbmtd_Chrg: number;
  Avg_Mdcr_Alowd_Amt: number;
  Avg_Mdcr_Pymt_Amt: number;
  Avg_Mdcr_Stdzd_Amt: number;
}

interface MedicareProviderResponse {
  Rndrng_NPI: string;
  Rndrng_Prvdr_Last_Org_Name: string;
  Rndrng_Prvdr_First_Name: string;
  Rndrng_Prvdr_MI: string;
  Rndrng_Prvdr_Crdntls: string;
  Rndrng_Prvdr_Ent_Cd: string;
  Rndrng_Prvdr_St1: string;
  Rndrng_Prvdr_St2: string;
  Rndrng_Prvdr_City: string;
  Rndrng_Prvdr_State_Abrvtn: string;
  Rndrng_Prvdr_State_FIPS: string;
  Rndrng_Prvdr_Zip5: string;
  Rndrng_Prvdr_RUCA: string;
  Rndrng_Prvdr_RUCA_Desc: string;
  Rndrng_Prvdr_Cntry: string;
  Rndrng_Prvdr_Type: string;
  Rndrng_Prvdr_Mdcr_Prtcptg_Ind: string;
  Tot_HCPCS_Cds: string;
  Tot_Benes: number;
  Tot_Srvcs: number;
  Tot_Sbmtd_Chrg: number;
  Tot_Mdcr_Alowd_Amt: number;
  Tot_Mdcr_Pymt_Amt: number;
  Tot_Mdcr_Stdzd_Amt: number;
  Bene_Avg_Age: number;
  Bene_Age_LT_65_Cnt: number;
  Bene_Age_65_74_Cnt: number;
  Bene_Age_75_84_Cnt: number;
  Bene_Age_GT_84_Cnt: number;
  Bene_Feml_Cnt: number;
  Bene_Male_Cnt: number;
  Bene_Race_Wht_Cnt: number;
  Bene_Race_Black_Cnt: number;
  Bene_Race_API_Cnt: number;
  Bene_Race_Hspnc_Cnt: number;
  Bene_Race_NatInd_Cnt: number;
  Bene_Race_Othr_Cnt: number;
  Bene_Dual_Cnt: number;
  Bene_Ndual_Cnt: number;
  Bene_Avg_Risk_Scre: number;
}


async function searchMedicare(
  dataset_type: string = "geography_and_service",
  year?: string,
  hcpcs_code?: string,
  geo_level?: string,
  geo_code?: string,
  place_of_service?: string,
  size: number = 10,
  offset: number = 0,
  text_search?: string,
  sort?: { field: string; direction: 'asc' | 'desc' },
  provider_type?: string
) {
  let datasetVersionId: string;
  let selectedYear: string;
  if (dataset_type === "geography_and_service") {
    selectedYear = year || getLatestYear(versionMapGeography);
    datasetVersionId = versionMapGeography[selectedYear];
  } else if (dataset_type === "provider_and_service") {
    selectedYear = year || getLatestYear(versionMapProviderAndService);
    datasetVersionId = versionMapProviderAndService[selectedYear];
  } else if (dataset_type === "provider") {
    selectedYear = year || getLatestYear(versionMapProvider);
    datasetVersionId = versionMapProvider[selectedYear];
  } else {
    throw new Error(`Invalid dataset_type: ${dataset_type}`);
  }

  if (!datasetVersionId) {
    throw new Error(`Invalid year specified: ${selectedYear} for dataset_type: ${dataset_type}`);
  }

  const query = new URLSearchParams({
    size: Math.min(size, 5000).toString(),
    offset: offset.toString()
  });

  // Add filters using the CMS API filter syntax
  if (geo_level && geo_code) {
    if (dataset_type === "geography_and_service") {
      query.append("filter[Rndrng_Prvdr_Geo_Lvl]", geo_level);
      query.append("filter[Rndrng_Prvdr_Geo_Cd]", geo_code);
    } else {
      // For provider_and_service and provider datasets
      if (geo_level === "State") {
        query.append("filter[Rndrng_Prvdr_State_Abrvtn]", geo_code);
      } else if (geo_level === "County") {
        query.append("filter[Rndrng_Prvdr_State_FIPS]", geo_code);
      } else if (geo_level === "ZIP") {
        query.append("filter[Rndrng_Prvdr_Zip5]", geo_code);
      }
    }
  }

  if (hcpcs_code && (dataset_type === "geography_and_service" || dataset_type === "provider_and_service")) {
    query.append("filter[HCPCS_Cd]", hcpcs_code);
  }

  if (place_of_service && (dataset_type === "geography_and_service" || dataset_type === "provider_and_service")) {
    query.append("filter[Place_Of_Srvc]", place_of_service);
  }

  if (provider_type && (dataset_type === "provider_and_service" || dataset_type === "provider")) {
    query.append("filter[Rndrng_Prvdr_Type]", provider_type);
  }

  if (text_search) {
    // Add text search filter for relevant fields based on dataset type
    if (dataset_type === "provider" || dataset_type === "provider_and_service") {
      query.append("Rndrng_Prvdr_Last_Org_Name", text_search);
      query.append("Rndrng_Prvdr_First_Name", text_search);
    }
    if (dataset_type === "geography_and_service" || dataset_type === "provider_and_service") {
      query.append("HCPCS_Desc", text_search);
    }
  }

  if (sort) {
    query.append("sort", `${sort.direction === 'desc' ? '-' : ''}${sort.field}`);
  }

  const url = `https://data.cms.gov/data-api/v1/dataset/${datasetVersionId}/data?${query.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json() as (MedicareProviderGeographyResponse[] | MedicareProviderIndividualResponse[] | MedicareProviderResponse[]);

  return {
    total: data.length,
    providers: data.map((item) => {
      if (dataset_type === "provider") {
        const providerItem = item as MedicareProviderResponse;
        return {
          npi: providerItem.Rndrng_NPI,
          provider_name: `${providerItem.Rndrng_Prvdr_Last_Org_Name}, ${providerItem.Rndrng_Prvdr_First_Name}${providerItem.Rndrng_Prvdr_MI ? ` ${providerItem.Rndrng_Prvdr_MI}` : ''}`,
          provider_type: providerItem.Rndrng_Prvdr_Type,
          provider_address: providerItem.Rndrng_Prvdr_St1,
          provider_city: providerItem.Rndrng_Prvdr_City,
          provider_state: providerItem.Rndrng_Prvdr_State_Abrvtn,
          provider_zip: providerItem.Rndrng_Prvdr_Zip5,
          provider_country: providerItem.Rndrng_Prvdr_Cntry,
          medicare_participating: providerItem.Rndrng_Prvdr_Mdcr_Prtcptg_Ind,
          total_hcpcs_codes: parseInt(providerItem.Tot_HCPCS_Cds),
          total_beneficiaries: providerItem.Tot_Benes,
          total_services: providerItem.Tot_Srvcs,
          total_submitted_charges: providerItem.Tot_Sbmtd_Chrg,
          total_medicare_allowed: providerItem.Tot_Mdcr_Alowd_Amt,
          total_medicare_payment: providerItem.Tot_Mdcr_Pymt_Amt,
          total_medicare_standardized: providerItem.Tot_Mdcr_Stdzd_Amt,
          beneficiary_average_age: providerItem.Bene_Avg_Age,
          beneficiary_age_lt_65: providerItem.Bene_Age_LT_65_Cnt,
          beneficiary_age_65_74: providerItem.Bene_Age_65_74_Cnt,
          beneficiary_age_75_84: providerItem.Bene_Age_75_84_Cnt,
          beneficiary_age_gt_84: providerItem.Bene_Age_GT_84_Cnt,
          beneficiary_female_count: providerItem.Bene_Feml_Cnt,
          beneficiary_male_count: providerItem.Bene_Male_Cnt,
          beneficiary_race_white: providerItem.Bene_Race_Wht_Cnt,
          beneficiary_race_black: providerItem.Bene_Race_Black_Cnt,
          beneficiary_race_api: providerItem.Bene_Race_API_Cnt,
          beneficiary_race_hispanic: providerItem.Bene_Race_Hspnc_Cnt,
          beneficiary_race_native: providerItem.Bene_Race_NatInd_Cnt,
          beneficiary_race_other: providerItem.Bene_Race_Othr_Cnt,
          beneficiary_dual_count: providerItem.Bene_Dual_Cnt,
          beneficiary_non_dual_count: providerItem.Bene_Ndual_Cnt,
          beneficiary_average_risk_score: providerItem.Bene_Avg_Risk_Scre
        };
      }

      if (dataset_type === "geography_and_service") {
        const geoItem = item as MedicareProviderGeographyResponse;
        return {
          hcpcs_code: geoItem.HCPCS_Cd,
          hcpcs_desc: geoItem.HCPCS_Desc,
          hcpcs_drug_ind: geoItem.HCPCS_Drug_Ind,
          place_of_service: geoItem.Place_Of_Srvc,
          total_beneficiaries: geoItem.Tot_Benes,
          total_services: geoItem.Tot_Srvcs,
          total_beneficiary_days: geoItem.Tot_Bene_Day_Srvcs,
          avg_submitted_charge: geoItem.Avg_Sbmtd_Chrg,
          avg_medicare_allowed: geoItem.Avg_Mdcr_Alowd_Amt,
          avg_medicare_payment: geoItem.Avg_Mdcr_Pymt_Amt,
          avg_medicare_standardized: geoItem.Avg_Mdcr_Stdzd_Amt,
          geo_level: geoItem.Rndrng_Prvdr_Geo_Lvl,
          geo_code: geoItem.Rndrng_Prvdr_Geo_Cd,
          geo_desc: geoItem.Rndrng_Prvdr_Geo_Desc,
          total_providers: geoItem.Tot_Rndrng_Prvdrs
        };
      } else {
        const providerItem = item as MedicareProviderIndividualResponse;
        return {
          hcpcs_code: providerItem.HCPCS_Cd,
          hcpcs_desc: providerItem.HCPCS_Desc,
          hcpcs_drug_ind: providerItem.HCPCS_Drug_Ind,
          place_of_service: providerItem.Place_Of_Srvc,
          total_beneficiaries: providerItem.Tot_Benes,
          total_services: providerItem.Tot_Srvcs,
          total_beneficiary_days: providerItem.Tot_Bene_Day_Srvcs,
          avg_submitted_charge: providerItem.Avg_Sbmtd_Chrg,
          avg_medicare_allowed: providerItem.Avg_Mdcr_Alowd_Amt,
          avg_medicare_payment: providerItem.Avg_Mdcr_Pymt_Amt,
          avg_medicare_standardized: providerItem.Avg_Mdcr_Stdzd_Amt,
          npi: providerItem.Rndrng_NPI,
          provider_name: `${providerItem.Rndrng_Prvdr_Last_Org_Name}, ${providerItem.Rndrng_Prvdr_First_Name}${providerItem.Rndrng_Prvdr_MI ? ` ${providerItem.Rndrng_Prvdr_MI}` : ''}`,
          provider_type: providerItem.Rndrng_Prvdr_Type,
          provider_address: providerItem.Rndrng_Prvdr_St1,
          provider_city: providerItem.Rndrng_Prvdr_City,
          provider_state: providerItem.Rndrng_Prvdr_State_Abrvtn,
          provider_zip: providerItem.Rndrng_Prvdr_Zip5,
          provider_country: providerItem.Rndrng_Prvdr_Cntry,
          medicare_participating: providerItem.Rndrng_Prvdr_Mdcr_Prtcptg_Ind
        };
      }
    })
  };
}

async function searchPrescribers(
  drug_name?: string,
  prescriber_npi?: string,
  prescriber_type?: string,
  state?: string,
  size: number = 10,
  offset: number = 0,
  sort?: { field: string; direction: 'asc' | 'desc' }
): Promise<any> {
  const datasetId = '9552739e-3d05-4c1b-8eff-ecabf391e2e5'; // Medicare Part D Prescribers - by Provider and Drug

  const query = new URLSearchParams();
  query.append('size', String(size));
  query.append('offset', String(offset));

  // Add filters
  if (drug_name) {
    // Search brand name (most queries use brand name)
    query.append('filter[Brnd_Name]', drug_name);
  }
  if (prescriber_npi) {
    query.append('filter[Prscrbr_NPI]', prescriber_npi);
  }
  if (prescriber_type) {
    query.append('filter[Prscrbr_Type]', prescriber_type);
  }
  if (state) {
    query.append('filter[Prscrbr_State_Abrvtn]', state);
  }

  // Add sorting
  if (sort) {
    query.append('sort', `${sort.direction === 'desc' ? '-' : ''}${sort.field}`);
  }

  const url = `https://data.cms.gov/data-api/v1/dataset/${datasetId}/data?${query.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS API error: ${response.statusText}`);
  }

  const data = await response.json() as any[];

  return {
    total: data.length,
    prescribers: data.map((item: any) => ({
      npi: item.Prscrbr_NPI,
      prescriber_name: `${item.Prscrbr_Last_Org_Name}, ${item.Prscrbr_First_Name || ''}`,
      prescriber_type: item.Prscrbr_Type,
      city: item.Prscrbr_City,
      state: item.Prscrbr_State_Abrvtn,
      brand_name: item.Brnd_Name,
      generic_name: item.Gnrc_Name,
      total_claims: item.Tot_Clms,
      total_30day_fills: item.Tot_30day_Fills,
      total_drug_cost: item.Tot_Drug_Cst,
      total_beneficiaries: item.Tot_Benes
    }))
  };
}

async function searchHospitals(
  hospital_name?: string,
  hospital_id?: string,
  state?: string,
  city?: string,
  drg_code?: string,
  size: number = 10,
  offset: number = 0,
  sort?: { field: string; direction: 'asc' | 'desc' }
): Promise<any> {
  const datasetId = 'ee6fb1a5-39b9-46b3-a980-a7284551a732'; // Medicare Inpatient Hospitals - by Provider

  const query = new URLSearchParams();
  query.append('size', String(size));
  query.append('offset', String(offset));

  // Add filters
  if (hospital_name) {
    query.append('filter[Rndrng_Prvdr_Org_Name]', hospital_name);
  }
  if (hospital_id) {
    query.append('filter[Rndrng_Prvdr_CCN]', hospital_id);
  }
  if (state) {
    query.append('filter[Rndrng_Prvdr_State_Abrvtn]', state);
  }
  if (city) {
    query.append('filter[Rndrng_Prvdr_City]', city);
  }
  if (drg_code) {
    query.append('filter[DRG_Cd]', drg_code);
  }

  // Add sorting
  if (sort) {
    query.append('sort', `${sort.direction === 'desc' ? '-' : ''}${sort.field}`);
  }

  const url = `https://data.cms.gov/data-api/v1/dataset/${datasetId}/data?${query.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS API error: ${response.statusText}`);
  }

  const data = await response.json() as any[];

  return {
    total: data.length,
    hospitals: data.map((item: any) => ({
      ccn: item.Rndrng_Prvdr_CCN,
      hospital_name: item.Rndrng_Prvdr_Org_Name,
      street_address: item.Rndrng_Prvdr_St,
      city: item.Rndrng_Prvdr_City,
      state: item.Rndrng_Prvdr_State_Abrvtn,
      zip: item.Rndrng_Prvdr_Zip5,
      total_discharges: item.Tot_Dschrgs,
      total_beneficiaries: item.Tot_Benes,
      total_covered_charges: item.Tot_Submtd_Cvrd_Chrg,
      total_medicare_payments: item.Tot_Mdcr_Pymt_Amt,
      total_payment_amount: item.Tot_Pymt_Amt,
      average_beneficiary_age: item.Bene_Avg_Age,
      average_risk_score: item.Bene_Avg_Risk_Scre
    }))
  };
}

async function searchSpending(
  spending_drug_name?: string,
  spending_type: string = 'part_d',
  year?: string,
  size: number = 10,
  offset: number = 0,
  sort?: { field: string; direction: 'asc' | 'desc' }
): Promise<any> {
  const datasetMap: Record<string, string> = {
    'part_d': '7e0b4365-fd63-4a29-8f5e-e0ac9f66a81b', // Medicare Part D Spending by Drug
    'part_b': '76a714ad-3a2c-43ac-b76d-9dadf8f7d890'  // Medicare Part B Spending by Drug
  };

  const datasetId = datasetMap[spending_type] || datasetMap['part_d'];

  const query = new URLSearchParams();
  query.append('size', String(size));
  query.append('offset', String(offset));

  // Add filters
  if (spending_drug_name) {
    query.append('filter[Brnd_Name]', spending_drug_name);
  }

  // Add sorting (default to most recent year spending)
  if (sort) {
    query.append('sort', `${sort.direction === 'desc' ? '-' : ''}${sort.field}`);
  } else {
    // Default sort by 2023 spending descending
    query.append('sort', '-Tot_Spndng_2023');
  }

  const url = `https://data.cms.gov/data-api/v1/dataset/${datasetId}/data?${query.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS API error: ${response.statusText}`);
  }

  const data = await response.json() as any[];

  // Transform the wide-format data into long-format with year breakdowns
  const drugs = data.map((item: any) => {
    const drugInfo: any = {
      brand_name: item.Brnd_Name,
      generic_name: item.Gnrc_Name,
      manufacturer: item.Mftr_Name,
      spending_by_year: {} as any
    };

    // Extract all available years from the data (2019-2023 for Part D)
    const years = ['2019', '2020', '2021', '2022', '2023'];

    years.forEach(yr => {
      if (item[`Tot_Spndng_${yr}`]) {
        drugInfo.spending_by_year[yr] = {
          total_spending: item[`Tot_Spndng_${yr}`],
          total_claims: item[`Tot_Clms_${yr}`],
          total_beneficiaries: item[`Tot_Benes_${yr}`],
          total_dosage_units: item[`Tot_Dsg_Unts_${yr}`],
          avg_spending_per_claim: item[`Avg_Spnd_Per_Clm_${yr}`],
          avg_spending_per_beneficiary: item[`Avg_Spnd_Per_Bene_${yr}`],
          avg_spending_per_dosage_unit: item[`Avg_Spnd_Per_Dsg_Unt_Wghtd_${yr}`]
        };
      }
    });

    // If year filter specified, return only that year's data
    if (year && drugInfo.spending_by_year[year]) {
      return {
        brand_name: drugInfo.brand_name,
        generic_name: drugInfo.generic_name,
        manufacturer: drugInfo.manufacturer,
        year: year,
        ...drugInfo.spending_by_year[year]
      };
    }

    return drugInfo;
  });

  return {
    total: data.length,
    spending_type: spending_type,
    year_filter: year || 'all',
    drugs: drugs
  };
}

/**
 * Search Medicare Part D Formulary data from local files
 * Uses RxNorm API to lookup RXCUI from drug names, then searches formulary
 */
async function searchFormulary(
  drug_name?: string,
  ndc_code?: string,
  tier?: number,
  requires_prior_auth?: boolean,
  has_quantity_limit?: boolean,
  has_step_therapy?: boolean,
  plan_state?: string,
  plan_id?: string,
  size: number = 25,
  offset: number = 0
): Promise<any> {
  // Support both .txt and .txt.gz files
  const formularyBasePath = path.join(__dirname, 'data', 'formulary', 'formulary.txt');
  const plansBasePath = path.join(__dirname, 'data', 'formulary', 'plans.txt');

  const formularyPath = fs.existsSync(formularyBasePath + '.gz') ? formularyBasePath + '.gz' : formularyBasePath;
  const plansPath = fs.existsSync(plansBasePath + '.gz') ? plansBasePath + '.gz' : plansBasePath;

  if (!fs.existsSync(formularyPath)) {
    throw new Error(`Formulary data file not found at ${formularyPath}`);
  }

  // If drug name provided, lookup RXCUI codes from RxNorm API
  let targetRxcuis: string[] = [];
  if (drug_name) {
    try {
      const rxnormUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drug_name)}`;
      const rxnormResponse = await fetch(rxnormUrl);
      const rxnormData = await rxnormResponse.json() as any;

      if (rxnormData.drugGroup?.conceptGroup) {
        for (const group of rxnormData.drugGroup.conceptGroup) {
          if (group.conceptProperties) {
            targetRxcuis = group.conceptProperties.map((prop: any) => prop.rxcui);
            break;
          }
        }
      }

      if (targetRxcuis.length === 0) {
        return {
          total: 0,
          offset: offset,
          limit: size,
          drug_name_searched: drug_name,
          rxcuis_found: [],
          message: `No RXCUI codes found for drug name: ${drug_name}`,
          formulary_entries: []
        };
      }
    } catch (error) {
      throw new Error(`RxNorm API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Load plan info for state filtering and plan name lookups
  const planMap = new Map<string, any>();
  const validFormularyIds = new Set<string>();

  if (fs.existsSync(plansPath)) {
    // Handle both .txt and .txt.gz files
    const planFileStream = fs.createReadStream(plansPath);
    const planStream = plansPath.endsWith('.gz') ? planFileStream.pipe(zlib.createGunzip()) : planFileStream;
    const planRL = readline.createInterface({ input: planStream, crlfDelay: Infinity });
    let isFirstLine = true;

    for await (const line of planRL) {
      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }
      const values = line.split('|');
      const formularyId = values[5]; // FORMULARY_ID
      const state = values[10]; // STATE

      // Apply state filter if specified
      if (plan_state && state !== plan_state) {
        continue;
      }

      validFormularyIds.add(formularyId);

      if (!planMap.has(formularyId)) {
        planMap.set(formularyId, {
          contract_id: values[0],
          plan_id: values[1],
          plan_name: values[4],
          formulary_id: formularyId,
          state: state
        });
      }
    }
  }

  // Stream through formulary file and apply filters
  // Handle both .txt and .txt.gz files
  const formularyFileStream = fs.createReadStream(formularyPath);
  const formularyStream = formularyPath.endsWith('.gz') ? formularyFileStream.pipe(zlib.createGunzip()) : formularyFileStream;
  const rl = readline.createInterface({ input: formularyStream, crlfDelay: Infinity });

  const results: any[] = [];
  let matchCount = 0;
  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;
    if (lineNum === 1) continue; // Skip header

    const values = line.split('|');
    const formularyId = values[0];
    const rxcui = values[3];
    const ndc = values[4];
    const tierValue = values[5];
    const quantityLimitYN = values[6];
    const priorAuthYN = values[9];
    const stepTherapyYN = values[10];

    // Apply filters
    let matches = true;

    // Filter by formulary ID (from plan/state filter)
    if (plan_state && !validFormularyIds.has(formularyId)) {
      matches = false;
    }

    // Filter by plan ID
    if (plan_id && formularyId !== plan_id) {
      matches = false;
    }

    // Filter by RXCUI (from drug name lookup)
    if (drug_name && targetRxcuis.length > 0 && !targetRxcuis.includes(rxcui)) {
      matches = false;
    }

    // Filter by NDC
    if (ndc_code && ndc !== ndc_code) {
      matches = false;
    }

    // Filter by tier
    if (tier !== undefined && tierValue !== String(tier)) {
      matches = false;
    }

    // Filter by prior authorization
    if (requires_prior_auth !== undefined) {
      const hasPriorAuth = priorAuthYN === 'Y';
      if (requires_prior_auth !== hasPriorAuth) {
        matches = false;
      }
    }

    // Filter by quantity limit
    if (has_quantity_limit !== undefined) {
      const hasQL = quantityLimitYN === 'Y';
      if (has_quantity_limit !== hasQL) {
        matches = false;
      }
    }

    // Filter by step therapy
    if (has_step_therapy !== undefined) {
      const hasST = stepTherapyYN === 'Y';
      if (has_step_therapy !== hasST) {
        matches = false;
      }
    }

    if (matches) {
      matchCount++;

      // Apply pagination
      if (matchCount > offset && results.length < size) {
        const planInfo = planMap.get(formularyId);
        results.push({
          formulary_id: formularyId,
          plan_name: planInfo?.plan_name || 'Unknown',
          state: planInfo?.state || 'Unknown',
          rxcui: rxcui,
          ndc: ndc,
          tier_level: parseInt(tierValue),
          quantity_limit: quantityLimitYN === 'Y',
          quantity_limit_amount: values[7],
          quantity_limit_days: values[8],
          prior_authorization: priorAuthYN === 'Y',
          step_therapy: stepTherapyYN === 'Y'
        });
      }

      // Stop if we have enough results
      if (results.length >= size) {
        break;
      }
    }
  }

  return {
    total: matchCount,
    offset: offset,
    limit: size,
    drug_name_searched: drug_name,
    rxcuis_found: targetRxcuis,
    formulary_entries: results
  };
}


function sendError(res: http.ServerResponse, message: string, code: number = 400) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message, code }));
}

async function runServer() {
  if (!USE_HTTP) {
    // MCP mode (stdio only)
    const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
    const { CallToolRequestSchema, ListToolsRequestSchema, McpError } = await import('@modelcontextprotocol/sdk/types.js');

    // Initialize server without any console output
    const transport = new StdioServerTransport();
    const server = new Server(
      { name: "mcp-healthcare-data", version: "0.2.14" },
      { capabilities: { tools: {} } }
    );

    // Set up request handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: MEDICARE_INFO_TOOL.name,
          description: MEDICARE_INFO_TOOL.description,
          inputSchema: MEDICARE_INFO_TOOL.input_schema
        }
      ]
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params?.name;
      const args = request.params?.arguments;
      try {
        switch (toolName) {
          case 'medicare_info': {
            const method = (args as any)?.method;

            switch (method) {
              case 'search_providers': {
                const result = await searchMedicare(
                  (args as any)?.dataset_type,
                  (args as any)?.year,
                  (args as any)?.hcpcs_code,
                  (args as any)?.geo_level,
                  (args as any)?.geo_code,
                  (args as any)?.place_of_service,
                  (args as any)?.size,
                  (args as any)?.offset,
                  (args as any)?.text_search,
                  (args as any)?.sort,
                  (args as any)?.provider_type
                );
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], isError: false };
              }

              case 'search_prescribers': {
                const result = await searchPrescribers(
                  (args as any)?.drug_name,
                  (args as any)?.prescriber_npi,
                  (args as any)?.prescriber_type,
                  (args as any)?.state,
                  (args as any)?.size,
                  (args as any)?.offset,
                  (args as any)?.sort
                );
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], isError: false };
              }

              case 'search_hospitals': {
                const result = await searchHospitals(
                  (args as any)?.hospital_name,
                  (args as any)?.hospital_id,
                  (args as any)?.state,
                  (args as any)?.city,
                  (args as any)?.drg_code,
                  (args as any)?.size,
                  (args as any)?.offset,
                  (args as any)?.sort
                );
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], isError: false };
              }

              case 'search_spending': {
                const result = await searchSpending(
                  (args as any)?.spending_drug_name,
                  (args as any)?.spending_type,
                  (args as any)?.year,
                  (args as any)?.size,
                  (args as any)?.offset,
                  (args as any)?.sort
                );
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], isError: false };
              }

              case 'search_formulary': {
                const result = await searchFormulary(
                  (args as any)?.formulary_drug_name,
                  (args as any)?.ndc_code,
                  (args as any)?.tier,
                  (args as any)?.requires_prior_auth,
                  (args as any)?.has_quantity_limit,
                  (args as any)?.has_step_therapy,
                  (args as any)?.plan_state,
                  (args as any)?.plan_id,
                  (args as any)?.size,
                  (args as any)?.offset
                );
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], isError: false };
              }

              default:
                throw new McpError(-32602, `Unknown method: ${method}. Valid methods: search_providers, search_prescribers, search_hospitals, search_spending, search_formulary`);
            }
          }
          default:
            throw new McpError(-32603, 'Unknown tool');
        }
      } catch (error) {
        throw new McpError(-32603, error instanceof Error ? error.message : String(error));
      }
    });

    await server.connect(transport);
  } else {
    const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
      const method = req.method || '';
      const url = req.url || '';

      // Health check endpoint
      if (method === 'GET' && url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }

      // List tools endpoint
      if (method === 'POST' && url === '/list_tools') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          tools: [
            {
              name: MEDICARE_INFO_TOOL.name,
              description: MEDICARE_INFO_TOOL.description,
              input_schema: MEDICARE_INFO_TOOL.input_schema,
              responseSchema: MEDICARE_INFO_TOOL.responseSchema
            }
          ]
        }));
        return;
      }

      // Helper to parse JSON body
      const parseBody = (req: http.IncomingMessage) => new Promise<any>((resolve, reject) => {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', () => {
          try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
        });
      });

      // Routing for all tools
      if (method === 'POST') {
        let data: any;
        let result: any;
        try {
          data = await parseBody(req);
          const url = req.url || '';
          if (url === '/medicare_info') {
            const methodName = data.method;

            switch (methodName) {
              case 'search_providers':
                result = await searchMedicare(data.dataset_type, data.year, data.hcpcs_code, data.geo_level, data.geo_code, data.place_of_service, data.size, data.offset, data.text_search, data.sort, data.provider_type);
                break;
              case 'search_prescribers':
                result = await searchPrescribers(data.drug_name, data.prescriber_npi, data.prescriber_type, data.state, data.size, data.offset, data.sort);
                break;
              case 'search_hospitals':
                result = await searchHospitals(data.hospital_name, data.hospital_id, data.state, data.city, data.drg_code, data.size, data.offset, data.sort);
                break;
              case 'search_spending':
                result = await searchSpending(data.spending_drug_name, data.spending_type, data.year, data.size, data.offset, data.sort);
                break;
              case 'search_formulary':
                result = await searchFormulary(data.formulary_drug_name, data.ndc_code, data.tier, data.requires_prior_auth, data.has_quantity_limit, data.has_step_therapy, data.plan_state, data.plan_id, data.size, data.offset);
                break;
              default:
                sendError(res, `Unknown method: ${methodName}`, 400);
                return;
            }
          } else {
            sendError(res, 'Not found', 404);
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err) {
          sendError(res, err instanceof Error ? err.message : String(err));
        }
      } else {
        sendError(res, 'Not found', 404);
      }
    });
    server.listen(PORT, () => {
      // Server is running
    });
  }
}

// Handle errors silently using logger
runServer().catch((error) => {
  logger.error('Server error:', { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});






