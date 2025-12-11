# Medicare MCP Server - Multi-Method Implementation Plan

## Status: Ready for Implementation

## Summary

Successfully removed the formulary implementation (2GB files, no API access). Now implementing **4 methods** for the `medicare_info` tool, all using CMS Socrata API.

---

## Architecture

**Pattern**: Unified tool (`medicare_info`) with method-based routing
**All methods use**: CMS Socrata API (same pattern as `search_providers`)

```typescript
medicare_info({
  method: "search_providers" | "search_prescribers" | "search_hospitals" | "search_spending",
  // ... method-specific parameters
})
```

---

## Method 1: search_providers ✅ COMPLETED

**Status**: Already implemented and working
**Dataset**: Medicare Physician & Other Practitioners
**Years**: 2013-2023

---

## Method 2: search_prescribers (NEXT TO IMPLEMENT)

### Datasets Available (4 options)

1. **Medicare Part D Prescribers - by Provider and Drug** (RECOMMENDED)
   - Dataset ID: `9552739e-3d05-4c1b-8eff-ecabf391e2e5`
   - API: `https://data.cms.gov/data-api/v1/dataset/9552739e-3d05-4c1b-8eff-ecabf391e2e5/data`
   - Fields: Provider NPI/name/location/specialty, Brand/generic drug names, Claims, Costs, Beneficiaries
   - Use case: "Which doctors prescribe semaglutide?", "Top GLP-1 prescribers in CA"

2. **Medicare Part D Prescribers - by Provider**
   - Dataset ID: `14d8e8a9-7e9b-4370-a044-bf97c46b4b44`
   - Fields: Provider-level aggregates across all drugs
   - Use case: "Top Part D prescribers by total costs"

3. **Medicare Part D Prescribers - by Geography and Drug**
   - Dataset ID: `c8ea3f8e-3a09-4fea-86f2-8902fb4b0920`
   - Fields: Geographic aggregates (state/county) + drug name
   - Use case: "GLP-1 prescribing patterns by state"

4. **Medicare Part D Opioid Prescribing Rates**
   - Dataset ID: `94d00f36-73ce-4520-9b3f-83cd3cded25c`
   - Fields: Opioid-specific geographic analysis
   - Use case: "Opioid prescribing rates in Texas"

### Recommended Implementation

**Use Dataset 1** (by Provider and Drug) as primary, with `dataset_type` parameter for flexibility.

**Parameters**:
```typescript
{
  method: "search_prescribers",
  dataset_type?: "provider_drug" | "provider" | "geography_drug" | "opioid",  // default: provider_drug
  drug_name?: string,          // Brand or generic name (e.g., "semaglutide", "Ozempic")
  provider_npi?: string,        // Prescriber NPI
  provider_type?: string,       // Specialty (e.g., "Endocrinology")
  state?: string,               // State abbreviation
  geo_level?: string,           // For geography_drug: "State", "County"
  geo_code?: string,            // For geography_drug: State/county code
  year?: string,                // Data year (defaults to latest)
  size?: number,                // Results limit (default: 10)
  offset?: number,              // Pagination offset
  sort_by?: string,             // Sort field (e.g., "Tot_Drug_Cst", "Tot_Clms")
  sort_order?: "asc" | "desc"
}
```

**Response Fields** (from Dataset 1):
```json
{
  "Prscrbr_NPI": "1003000126",
  "Prscrbr_Last_Org_Name": "Smith",
  "Prscrbr_First_Name": "John",
  "Prscrbr_City": "Bethesda",
  "Prscrbr_State_Abrvtn": "MD",
  "Prscrbr_Type": "Endocrinology",
  "Brnd_Name": "Ozempic",
  "Gnrc_Name": "Semaglutide",
  "Tot_Clms": "230",
  "Tot_30day_Fills": "245.6",
  "Tot_Day_Suply": "7350",
  "Tot_Drug_Cst": "125678.45",
  "Tot_Benes": "85"
}
```

---

## Method 3: search_hospitals

### Datasets Available (15 options - prioritize top 5)

**Priority 1: Utilization Data**
1. **Medicare Inpatient Hospitals - by Provider** (RECOMMENDED)
   - Dataset ID: `ee6fb1a5-39b9-46b3-a980-a7284551a732`
   - Use case: "Hospital discharge volumes", "Average costs by hospital"

2. **Medicare Outpatient Hospitals - by Provider and Service**
   - Dataset ID: `ccbc9a44-40d4-46b4-a709-5caa59212e50`
   - Use case: "Outpatient procedure volumes"

**Priority 2: Quality & Ownership**
3. **Hospital Enrollments**
   - Dataset ID: `f6f6505c-e8b0-4d57-b258-e2b94133aaf2`
   - Use case: "Hospital enrollment status", "Provider demographics"

4. **Hospital All Owners**
   - Dataset ID: `029c119f-f79c-49be-9100-344d31d10344`
   - Use case: "Hospital ownership information"

**Priority 3: Geographic & Service Area**
5. **Hospital Service Area**
   - Dataset ID: `8708ca8b-8636-44ed-8303-724cbfaf78ad`
   - Use case: "Hospital service area analysis", "Geographic coverage"

### Recommended Implementation

**Use `dataset_type` parameter** to route between datasets.

**Parameters**:
```typescript
{
  method: "search_hospitals",
  dataset_type?: "inpatient" | "outpatient" | "enrollments" | "owners" | "service_area",  // default: inpatient
  provider_id?: string,         // CMS Certification Number (CCN)
  hospital_name?: string,       // Hospital name (partial match)
  state?: string,               // State abbreviation
  city?: string,                // City name
  drg_code?: string,            // For inpatient: DRG code
  hcpcs_code?: string,          // For outpatient: HCPCS code
  year?: string,                // Data year
  size?: number,
  offset?: number,
  sort_by?: string,
  sort_order?: "asc" | "desc"
}
```

---

## Method 4: search_spending

### Datasets Available (4 options)

1. **Medicare Part D Spending by Drug** (RECOMMENDED)
   - Dataset ID: `7e0b4365-fd63-4a29-8f5e-e0ac9f66a81b`
   - Fields: Drug name, total spending, beneficiaries, claims
   - Use case: "GLP-1 drug spending", "Most expensive Part D drugs"

2. **Medicare Part B Spending by Drug**
   - Dataset ID: `76a714ad-3a2c-43ac-b76d-9dadf8f7d890`
   - Fields: Part B drug spending (administered in offices/outpatient)
   - Use case: "Infusion drug costs", "Injectable medication spending"

3. **Medicare Quarterly Part D Spending by Drug**
   - Dataset ID: `4ff7c618-4e40-483a-b390-c8a58c94fa15`
   - Fields: Quarterly Part D spending trends
   - Use case: "Quarterly spending trends", "Seasonal patterns"

4. **Medicare Quarterly Part B Spending by Drug**
   - Dataset ID: `bf6a5b3b-31ee-4abb-b1ad-2607a1e7510a`
   - Fields: Quarterly Part B spending trends

### Recommended Implementation

**Use `dataset_type` parameter** for Part B vs Part D, annual vs quarterly.

**Parameters**:
```typescript
{
  method: "search_spending",
  dataset_type?: "part_d" | "part_b" | "part_d_quarterly" | "part_b_quarterly",  // default: part_d
  drug_name?: string,           // Brand or generic name
  year?: string,                // Data year
  quarter?: number,             // For quarterly datasets: 1-4
  size?: number,
  offset?: number,
  sort_by?: string,             // e.g., "Tot_Spndng", "Tot_Clms", "Tot_Benes"
  sort_order?: "asc" | "desc"
}
```

---

## Implementation Steps

### Phase 1: search_prescribers
1. Add parameters to tool schema (in index.ts)
2. Create `searchPrescribers()` function (similar to `searchMedicare()`)
3. Implement dataset routing based on `dataset_type`
4. Add handler cases (MCP stdio + HTTP)
5. Test with real queries
6. Update README

### Phase 2: search_hospitals
1. Add parameters to tool schema
2. Create `searchHospitals()` function
3. Implement dataset routing
4. Add handler cases
5. Test
6. Update README

### Phase 3: search_spending
1. Add parameters to tool schema
2. Create `searchSpending()` function
3. Implement dataset routing
4. Add handler cases
5. Test
6. Update README

### Phase 4: Documentation & Testing
1. Update README with all 4 methods
2. Add example queries for each method
3. Test end-to-end with MCP client
4. Final commit

---

## Code Pattern (from search_providers)

All methods follow the same pattern:

```typescript
async function searchPrescribers(
  dataset_type: string = 'provider_drug',
  drug_name?: string,
  provider_npi?: string,
  // ... other params
  size: number = 10,
  offset: number = 0
): Promise<any> {
  // 1. Determine dataset ID
  const datasetId = getPrescriberDatasetId(dataset_type);

  // 2. Build query params
  const params = new URLSearchParams();
  params.append('size', String(size));
  params.append('offset', String(offset));

  if (drug_name) {
    // Add filter for drug name (brand or generic)
    params.append('filter', `Brnd_Name:${drug_name} OR Gnrc_Name:${drug_name}`);
  }

  // 3. Fetch from CMS API
  const url = `https://data.cms.gov/data-api/v1/dataset/${datasetId}/data?${params}`;
  const response = await fetch(url);
  const data = await response.json();

  // 4. Return formatted results
  return {
    total: data.length,
    prescribers: data
  };
}
```

---

## Testing Queries

### search_prescribers
```json
{
  "method": "search_prescribers",
  "drug_name": "semaglutide",
  "state": "CA",
  "size": 10
}
```

### search_hospitals
```json
{
  "method": "search_hospitals",
  "dataset_type": "inpatient",
  "state": "TX",
  "size": 10
}
```

### search_spending
```json
{
  "method": "search_spending",
  "drug_name": "Ozempic",
  "year": "2023"
}
```

---

## Notes

- All datasets use CMS Socrata API (no file downloads)
- Response sizes: typically 1-100KB (very fast)
- All methods share same architecture as search_providers
- Pagination supported on all methods
- Year parameter defaults to latest available

---

## Status Summary

✅ **Completed**: Formulary removal, architecture setup, placeholders
🔄 **Next**: Implement search_prescribers (highest priority)
⏳ **Pending**: search_hospitals, search_spending, documentation
