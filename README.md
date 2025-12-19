# Unofficial Medicare MCP Server

A Model Context Protocol (MCP) server providing comprehensive access to **CMS Medicare data** via the Socrata API, including physician/practitioner services, prescriber data, hospital utilization, and drug spending. This server enables AI assistants and applications to search and analyze Medicare payment, utilization, and coverage information.

## Features

- **Provider Data**: CMS Medicare Physician & Other Practitioners data from 2013-2023 with automatic latest-year selection
- **Prescriber Data**: Medicare Part D prescriber information by drug, provider, and geography
- **Hospital Data**: Medicare inpatient hospital utilization and payment data
- **Hospital Quality Metrics**: Star ratings, readmission rates, mortality rates, and hospital-acquired infections (HAI)
- **Drug Spending**: Medicare Part D and Part B drug spending trends
- **Formulary Data**: Medicare Part D plan formulary coverage with automated monthly updates
- **ASP Pricing**: Medicare Part B Average Sales Price data for physician-administered drugs
- **Flexible Querying**: Advanced filtering, pagination, and field selection
- **TypeScript**: Fully typed codebase with strict mode enabled
- **Production Ready**: Health checks and comprehensive logging
- **Unified Tool Interface**: Single `medicare_info` tool with method-based routing for different data types
- **Automated Updates**: GitHub Actions workflows for data freshness
  - Formulary: Monthly checks on the 15th (after CMS releases)
  - ASP Pricing: Quarterly checks on 15th of Jan/Apr/Jul/Oct

## Usage

```json
{
  "mcpServers": {
    "medicare-mcp-server": {
      "command": "node",
      "args": ["/path/to/medicare-mcp-server/build/index.js"]
    }
  }
}
```

## Tool Description

### Medicare Info Tool

The `medicare_info` tool provides unified access to Medicare data using the `method` parameter to select the operation type:

1. **`search_providers`**: Medicare Physician & Other Practitioners data (2013-2023)
2. **`search_prescribers`**: Medicare Part D prescriber data by drug, provider NPI, specialty, and state
3. **`search_hospitals`**: Medicare inpatient hospital utilization and payment data
4. **`search_spending`**: Medicare Part D and Part B drug spending trends
5. **`search_formulary`**: Medicare Part D plan formulary coverage (tier, prior auth, quantity limits, step therapy)
6. **`get_hospital_star_rating`**: Hospital overall quality star ratings (1-5 stars)
7. **`get_readmission_rates`**: Hospital 30-day readmission rates by condition
8. **`get_hospital_infections`**: Hospital-acquired infections (HAI) data
9. **`get_mortality_rates`**: Hospital 30-day mortality rates by condition
10. **`search_hospitals_by_quality`**: Search hospitals by quality metrics and filters
11. **`compare_hospitals`**: Compare multiple hospitals across quality metrics
12. **`get_vbp_scores`**: Hospital Value-Based Purchasing (VBP) performance scores
13. **`get_hcahps_scores`**: Patient experience (HCAHPS) survey scores
14. **`get_asp_pricing`**: Get ASP pricing for Medicare Part B drugs
15. **`get_asp_trend`**: Track ASP pricing changes over multiple quarters
16. **`compare_asp_pricing`**: Compare ASP pricing across multiple drugs

---

## Method 1: search_providers

Search Medicare Physician & Other Practitioners data using the Centers for Medicare & Medicaid Services (CMS) database. This data includes information about services and procedures provided to Original Medicare Part B beneficiaries. The tool supports data from 2013 to the latest available year, defaulting to the latest year if not specified.

#### Parameters

- `dataset_type` (required): Type of dataset to search
  - `geography_and_service`: Use when you need to:
    - Compare regions
    - Analyze geographic patterns
    - Study regional variations in healthcare delivery
    - Understand geographic distribution of healthcare services
    - Calculate per-capita/per-beneficiary rates by region
  - `provider_and_service`: Use when you need to:
    - Analyze individual provider performance
    - Track specific procedures by provider
    - Calculate total procedures across providers
    - Study provider-level service patterns and outcomes
  - `provider`: Use when you need to:
    - Analyze provider demographics
    - Study provider participation in Medicare
    - Understand provider practice patterns
    - Examine provider-level beneficiary characteristics and risk scores
- `year` (optional): Year of the dataset to query (2013 to 2023, defaults to latest year). Note that data availability may vary by year and dataset type.
- `hcpcs_code` (optional): HCPCS code to search for (e.g., '99213' for established patient office visit). Can be used to analyze specific procedures or services.
- `provider_type` (optional): Type of provider to search for (e.g., 'Cardiology', 'Podiatry', 'Family Practice'). Supports partial matches and is case-insensitive.
- `geo_level` (optional): Geographic level for filtering (e.g., "National", "State", "County", "ZIP"). Use with geo_code to filter results by specific geographic areas.
- `geo_code` (optional): Geographic code to filter by (e.g., 'CA' for California, '06037' for Los Angeles County). Must match the geo_level specified.
- `place_of_service` (optional): Place of service code to filter by (e.g., 'F' for facility, 'O' for office, 'H' for hospital). See CMS documentation for complete list of codes.
- `size` (optional): Number of results to return (default: 10, max: 5000). Use with offset for pagination of large result sets.
- `offset` (optional): Starting result number for pagination (default: 0). Use with size to navigate through large result sets.
- `sort_by` (optional): Field to sort results by. Common fields include 'Tot_Srvcs' (total services), 'Tot_Benes' (total beneficiaries), 'Tot_Mdcr_Pymt_Amt' (total Medicare payment).
- `sort_order` (optional): Sort order ("asc" or "desc", default: "desc").

#### Response Fields

The response fields vary by dataset type:

##### For `geography_and_service` dataset:
- `Rndrng_Prvdr_Geo_Lvl`: Geographic level (National, State, County, ZIP)
- `Rndrng_Prvdr_Geo_Cd`: Geographic code (e.g., 'CA' for California)
- `Rndrng_Prvdr_Geo_Desc`: Geographic description
- `HCPCS_Cd`: HCPCS code
- `HCPCS_Desc`: Description of the service/procedure
- `HCPCS_Drug_Ind`: Indicates if the service is drug-related
- `Place_Of_Srvc`: Place of service code
- `Tot_Rndrng_Prvdrs`: Total number of rendering providers
- `Tot_Benes`: Total number of beneficiaries
- `Tot_Srvcs`: Total number of services
- `Tot_Bene_Day_Srvcs`: Total beneficiary days of service
- `Avg_Sbmtd_Chrg`: Average submitted charge
- `Avg_Mdcr_Alowd_Amt`: Average Medicare allowed amount
- `Avg_Mdcr_Pymt_Amt`: Average Medicare payment amount
- `Avg_Mdcr_Stdzd_Amt`: Average standardized Medicare payment amount

##### For `provider_and_service` dataset:
- `Rndrng_NPI`: Provider's National Provider Identifier
- `Rndrng_Prvdr_Last_Org_Name`: Provider's last name or organization name
- `Rndrng_Prvdr_First_Name`: Provider's first name
- `Rndrng_Prvdr_MI`: Provider's middle initial
- `Rndrng_Prvdr_Crdntls`: Provider's credentials
- `Rndrng_Prvdr_Ent_Cd`: Provider's entity type
- `Rndrng_Prvdr_St1`: Provider's street address
- `Rndrng_Prvdr_City`: Provider's city
- `Rndrng_Prvdr_State_Abrvtn`: Provider's state
- `Rndrng_Prvdr_Zip5`: Provider's ZIP code
- `Rndrng_Prvdr_Type`: Provider's specialty/type
- `Rndrng_Prvdr_Mdcr_Prtcptg_Ind`: Medicare participating indicator
- `HCPCS_Cd`: HCPCS code
- `HCPCS_Desc`: Description of the service/procedure
- `Place_Of_Srvc`: Place of service code
- `Tot_Benes`: Total number of beneficiaries
- `Tot_Srvcs`: Total number of services
- `Tot_Bene_Day_Srvcs`: Total beneficiary days of service
- `Avg_Sbmtd_Chrg`: Average submitted charge
- `Avg_Mdcr_Alowd_Amt`: Average Medicare allowed amount
- `Avg_Mdcr_Pymt_Amt`: Average Medicare payment amount
- `Avg_Mdcr_Stdzd_Amt`: Average standardized Medicare payment amount

##### For `provider` dataset:
- `Rndrng_NPI`: Provider's National Provider Identifier
- `Rndrng_Prvdr_Last_Org_Name`: Provider's last name or organization name
- `Rndrng_Prvdr_First_Name`: Provider's first name
- `Rndrng_Prvdr_MI`: Provider's middle initial
- `Rndrng_Prvdr_Crdntls`: Provider's credentials
- `Rndrng_Prvdr_Ent_Cd`: Provider's entity type
- `Rndrng_Prvdr_St1`: Provider's street address
- `Rndrng_Prvdr_City`: Provider's city
- `Rndrng_Prvdr_State_Abrvtn`: Provider's state
- `Rndrng_Prvdr_Zip5`: Provider's ZIP code
- `Rndrng_Prvdr_Type`: Provider's specialty/type
- `Rndrng_Prvdr_Mdcr_Prtcptg_Ind`: Medicare participating indicator
- `Tot_HCPCS_Cds`: Total number of unique HCPCS codes
- `Tot_Benes`: Total number of beneficiaries
- `Tot_Srvcs`: Total number of services
- `Tot_Sbmtd_Chrg`: Total submitted charges
- `Tot_Mdcr_Alowd_Amt`: Total Medicare allowed amount
- `Tot_Mdcr_Pymt_Amt`: Total Medicare payment amount
- `Tot_Mdcr_Stdzd_Amt`: Total standardized Medicare payment amount
- `Bene_Avg_Age`: Average beneficiary age
- `Bene_Age_LT_65_Cnt`: Number of beneficiaries under 65
- `Bene_Age_65_74_Cnt`: Number of beneficiaries aged 65-74
- `Bene_Age_75_84_Cnt`: Number of beneficiaries aged 75-84
- `Bene_Age_GT_84_Cnt`: Number of beneficiaries over 84
- `Bene_Feml_Cnt`: Number of female beneficiaries
- `Bene_Male_Cnt`: Number of male beneficiaries
- `Bene_Race_Wht_Cnt`: Number of white beneficiaries
- `Bene_Race_Black_Cnt`: Number of black beneficiaries
- `Bene_Race_API_Cnt`: Number of Asian/Pacific Islander beneficiaries
- `Bene_Race_Hspnc_Cnt`: Number of Hispanic beneficiaries
- `Bene_Race_NatInd_Cnt`: Number of Native American beneficiaries
- `Bene_Race_Othr_Cnt`: Number of beneficiaries of other races
- `Bene_Dual_Cnt`: Number of dual-eligible beneficiaries
- `Bene_Ndual_Cnt`: Number of non-dual-eligible beneficiaries
- `Bene_Avg_Risk_Scre`: Average beneficiary risk score

#### Example Queries

##### Geography and Service Dataset Examples

1. Find all office visits (HCPCS 99213) in California for 2023:
```json
{
  "dataset_type": "geography_and_service",
  "geo_level": "State",
  "geo_code": "CA",
  "hcpcs_code": "99213",
  "year": 2023
}
```

2. Compare knee replacement procedures (HCPCS 27447) across different states:
```json
{
  "dataset_type": "geography_and_service",
  "geo_level": "State",
  "hcpcs_code": "27447",
  "year": 2023,
  "sort_by": "Tot_Srvcs",
  "sort_order": "desc",
  "size": 10
}
```

3. Analyze Medicare spending on specific procedures in Los Angeles County:
```json
{
  "dataset_type": "geography_and_service",
  "geo_level": "County",
  "geo_code": "06037",
  "hcpcs_code": "27130",
  "year": 2023
}
```

##### Provider and Service Dataset Examples

1. Find providers performing knee replacements in California:
```json
{
  "dataset_type": "provider_and_service",
  "geo_level": "State",
  "geo_code": "CA",
  "hcpcs_code": "27447",
  "year": 2023,
  "sort_by": "Tot_Srvcs",
  "sort_order": "desc",
  "size": 10
}
```

2. Search for cardiologists performing specific procedures:
```json
{
  "dataset_type": "provider_and_service",
  "provider_type": "Cardiology",
  "hcpcs_code": "93010",
  "year": 2023,
  "sort_by": "Tot_Srvcs",
  "sort_order": "desc"
}
```

##### Provider Dataset Examples

1. Find top providers by total services in California:
```json
{
  "dataset_type": "provider",
  "geo_level": "State",
  "geo_code": "CA",
  "year": 2023,
  "sort_by": "Tot_Srvcs",
  "sort_order": "desc",
  "size": 10
}
```

2. Search for providers by specialty with beneficiary demographics:
```json
{
  "dataset_type": "provider",
  "provider_type": "Orthopedic Surgery",
  "year": 2023,
  "sort_by": "Tot_Benes",
  "sort_order": "desc"
}
```

#### Common Use Cases

1. **Geographic Analysis**
   - Compare healthcare utilization across different regions
   - Identify areas with high or low service volumes
   - Analyze regional variations in Medicare payments
   - Track service patterns by geographic level

2. **Provider Analysis**
   - Identify high-volume providers
   - Compare provider practice patterns
   - Analyze provider-level beneficiary characteristics
   - Track provider participation in Medicare

3. **Service Analysis**
   - Compare utilization of specific procedures
   - Analyze Medicare payment patterns
   - Track service volumes over time
   - Identify trends in healthcare delivery

4. **Beneficiary Analysis**
   - Analyze beneficiary demographics
   - Track risk scores and health status
   - Compare dual-eligible vs. non-dual-eligible populations
   - Monitor age and gender distributions

5. **Payment Analysis**
   - Compare submitted charges vs. Medicare payments
   - Analyze payment variations by region
   - Track standardized payment amounts
   - Monitor Medicare payment trends

---

## Method 2: search_prescribers

Search Medicare Part D prescriber data to analyze drug prescribing patterns by provider, specialty, geography, and drug name. This method provides access to CMS Part D Prescribers - by Provider and Drug dataset.

### Parameters

- **`method`** (required): Must be set to `"search_prescribers"`
- **`drug_name`** (optional): Drug brand name to search for (e.g., 'Ozempic', 'Humira', 'Eliquis'). Searches brand names only.
- **`prescriber_npi`** (optional): National Provider Identifier (NPI) of the prescriber
- **`prescriber_type`** (optional): Prescriber specialty (e.g., 'Endocrinology', 'Family Practice', 'Internal Medicine')
- **`state`** (optional): State abbreviation (e.g., 'CA', 'TX', 'NY')
- **`size`** (optional): Number of results to return (default: 10)
- **`offset`** (optional): Starting result number for pagination (default: 0)

### Response Format

```json
{
  "total": 3,
  "prescribers": [
    {
      "npi": "1003002049",
      "prescriber_name": "Srinivasan, Lakshmi",
      "prescriber_type": "Endocrinology",
      "city": "Fremont",
      "state": "CA",
      "brand_name": "Ozempic",
      "generic_name": "Semaglutide",
      "total_claims": "113",
      "total_30day_fills": "230.7",
      "total_drug_cost": "236624.18",
      "total_beneficiaries": "25"
    }
  ]
}
```

### Example Queries

#### 1. Find California prescribers of Ozempic
```json
{
  "method": "search_prescribers",
  "drug_name": "Ozempic",
  "state": "CA",
  "size": 10
}
```

#### 2. Find endocrinologists prescribing GLP-1 drugs in Texas
```json
{
  "method": "search_prescribers",
  "prescriber_type": "Endocrinology",
  "state": "TX",
  "size": 20
}
```

#### 3. Lookup specific prescriber by NPI
```json
{
  "method": "search_prescribers",
  "prescriber_npi": "1003002049"
}
```

---

## Method 3: search_hospitals

Search Medicare inpatient hospital utilization and payment data. This method provides access to CMS Medicare Inpatient Hospitals - by Provider dataset, showing discharge volumes, charges, and payment amounts.

### Parameters

- **`method`** (required): Must be set to `"search_hospitals"`
- **`hospital_name`** (optional): Hospital name (partial match supported, e.g., 'MAYO', 'Memorial')
- **`hospital_id`** (optional): CMS Certification Number (CCN) or provider ID
- **`state`** (optional): State abbreviation (e.g., 'TX', 'CA', 'NY')
- **`city`** (optional): City name
- **`drg_code`** (optional): Diagnosis Related Group (DRG) code
- **`size`** (optional): Number of results to return (default: 10)
- **`offset`** (optional): Starting result number for pagination (default: 0)

### Response Format

```json
{
  "total": 3,
  "hospitals": [
    {
      "ccn": "450002",
      "hospital_name": "The Hospitals Of Providence Memorial Campus",
      "street_address": "2001 N Oregon St",
      "city": "El Paso",
      "state": "TX",
      "zip": "79902",
      "total_discharges": "950"
    }
  ]
}
```

### Example Queries

#### 1. Find Texas hospitals
```json
{
  "method": "search_hospitals",
  "state": "TX",
  "size": 10
}
```

#### 2. Search for Mayo Clinic facilities
```json
{
  "method": "search_hospitals",
  "hospital_name": "MAYO",
  "size": 10
}
```

#### 3. Find hospitals in specific city
```json
{
  "method": "search_hospitals",
  "city": "Houston",
  "state": "TX",
  "size": 20
}
```

---

## Method 4: search_spending

Search Medicare Part D and Part B drug spending trends. This method provides access to CMS drug spending datasets showing total spending, claims, beneficiaries, and average costs per claim and per beneficiary.

### Parameters

- **`method`** (required): Must be set to `"search_spending"`
- **`spending_drug_name`** (optional): Drug brand name to search for (e.g., 'Ozempic', 'Humira', 'Eliquis')
- **`spending_type`** (optional): Type of spending data - 'part_d' (prescription drugs) or 'part_b' (administered drugs). Default: 'part_d'
- **`year`** (optional): Data year to filter by
- **`size`** (optional): Number of results to return (default: 10)
- **`offset`** (optional): Starting result number for pagination (default: 0)

### Response Format

```json
{
  "total": 2,
  "spending_type": "part_d",
  "drugs": [
    {
      "brand_name": "Ozempic",
      "generic_name": "Semaglutide",
      "year": "2022",
      "total_spending": "5234567890.45",
      "total_claims": "1234567",
      "total_beneficiaries": "234567",
      "average_spending_per_claim": "4238.12",
      "average_spending_per_beneficiary": "22314.56"
    }
  ]
}
```

### Example Queries

#### 1. Find Part D spending for Ozempic
```json
{
  "method": "search_spending",
  "spending_drug_name": "Ozempic",
  "spending_type": "part_d",
  "size": 5
}
```

#### 2. Get Part B drug spending trends
```json
{
  "method": "search_spending",
  "spending_type": "part_b",
  "size": 20
}
```

#### 3. Find spending for specific year
```json
{
  "method": "search_spending",
  "spending_drug_name": "Humira",
  "year": "2022"
}
```

---

## Method 5: search_formulary

Search Medicare Part D plan formulary coverage using local CMS formulary data files. Returns drug coverage information including tier level, prior authorization requirements, quantity limits, and step therapy requirements across Medicare Part D plans.

#### Parameters

- `formulary_drug_name` (optional): Drug name to search for (partial match supported, e.g., 'metformin', 'insulin'). Uses RxNorm API to convert drug names to RXCUI codes. At least one of `formulary_drug_name` or `ndc_code` is required.
- `ndc_code` (optional): NDC (National Drug Code) for exact drug identification (e.g., '00002143380'). At least one of `formulary_drug_name` or `ndc_code` is required.
- `tier` (optional): Tier number to filter by:
  - 1 = Preferred Generic
  - 2 = Generic
  - 3 = Preferred Brand
  - 4 = Non-Preferred Brand
  - 5 = Specialty
  - 6 = Select Care
- `requires_prior_auth` (optional): Filter by prior authorization requirement (true=requires PA, false=no PA required)
- `has_quantity_limit` (optional): Filter by quantity limit (true=has limit, false=no limit)
- `has_step_therapy` (optional): Filter by step therapy requirement (true=requires ST, false=no ST required)
- `plan_state` (optional): State abbreviation to filter plans (e.g., 'CA', 'TX', 'NY')
- `plan_id` (optional): Medicare Part D plan ID to filter by specific plan
- `size` (optional): Number of results to return (default: 25, max: 5000)
- `offset` (optional): Starting result number for pagination (default: 0)

#### Response Fields

- `total`: Total number of matching formulary entries
- `offset`: Starting position for pagination
- `limit`: Maximum results returned
- `drug_name_searched`: Drug name that was searched (if provided)
- `rxcuis_found`: Array of RXCUI codes found for the drug name
- `formulary_entries`: Array of formulary entries with:
  - `formulary_id`: Plan formulary ID
  - `plan_name`: Medicare Part D plan name
  - `state`: State where plan is available
  - `rxcui`: RxNorm Concept Unique Identifier
  - `ndc`: National Drug Code
  - `tier_level`: Tier number (1-6)
  - `quantity_limit`: Whether quantity limit applies (boolean)
  - `quantity_limit_amount`: Maximum quantity allowed
  - `quantity_limit_days`: Days supply for quantity limit
  - `prior_authorization`: Whether prior authorization required (boolean)
  - `step_therapy`: Whether step therapy required (boolean)

#### Example Queries

##### 1. Search by drug name
```json
{
  "method": "search_formulary",
  "formulary_drug_name": "metformin",
  "size": 10
}
```

##### 2. Find drugs without prior authorization in California
```json
{
  "method": "search_formulary",
  "formulary_drug_name": "insulin",
  "plan_state": "CA",
  "requires_prior_auth": false,
  "size": 20
}
```

##### 3. Search by NDC code
```json
{
  "method": "search_formulary",
  "ndc_code": "00002143380",
  "size": 5
}
```

##### 4. Find specialty tier drugs (tier 5)
```json
{
  "method": "search_formulary",
  "formulary_drug_name": "Humira",
  "tier": 5
}
```

---

## Method 6: get_hospital_star_rating

Get hospital overall quality star ratings (1-5 stars) from CMS Hospital Care Compare. Star ratings provide a comprehensive measure of hospital quality based on multiple clinical domains including mortality, safety, readmission, patient experience, and timely & effective care.

### Parameters

- **`method`** (required): Must be set to `"get_hospital_star_rating"`
- **`quality_hospital_id`** (optional): CMS Certification Number (CCN) to lookup specific hospital (e.g., '050146')
- **`quality_state`** (optional): State abbreviation to filter hospitals (e.g., 'CA', 'TX', 'NY')
- **`size`** (optional): Number of results to return (default: 10)
- **`offset`** (optional): Starting result number for pagination (default: 0)

### Response Format

```json
{
  "total": 2,
  "hospitals": [
    {
      "facility_id": "050002",
      "facility_name": "ST ROSE HOSPITAL",
      "address": "27200 CALAROGA AVE",
      "city": "HAYWARD",
      "state": "CA",
      "zip_code": "94545",
      "hospital_overall_rating": "1",
      "hospital_type": "Acute Care Hospitals",
      "hospital_ownership": "Voluntary non-profit - Church",
      "emergency_services": false,
      "mortality_measures_count": "7",
      "safety_measures_count": "8",
      "readmission_measures_count": "11",
      "patient_experience_measures_count": "8"
    }
  ]
}
```

### Example Queries

#### 1. Get star ratings for California hospitals
```json
{
  "method": "get_hospital_star_rating",
  "quality_state": "CA",
  "size": 10
}
```

#### 2. Lookup specific hospital by CCN
```json
{
  "method": "get_hospital_star_rating",
  "quality_hospital_id": "050146"
}
```

### Use Cases

- **Provider Network Selection**: Identify high-quality hospitals (4-5 stars) for preferred networks
- **Quality Benchmarking**: Compare hospital performance against competitors
- **Market Analysis**: Analyze quality distribution across geographic markets
- **Contracting Strategy**: Target high-performing hospitals for value-based contracts

---

## Method 7: get_readmission_rates

Get hospital 30-day readmission rates by medical condition from CMS Unplanned Hospital Visits dataset. Readmission rates indicate how often patients return to the hospital within 30 days of discharge.

### Parameters

- **`method`** (required): Must be set to `"get_readmission_rates"`
- **`quality_hospital_id`** (optional): CMS Certification Number (CCN) to lookup specific hospital
- **`quality_state`** (optional): State abbreviation to filter hospitals
- **`condition`** (optional): Medical condition to filter by:
  - `heart_attack` - Heart attack (AMI) 30-day readmission
  - `heart_failure` - Heart failure 30-day readmission
  - `pneumonia` - Pneumonia 30-day readmission
  - `copd` - COPD 30-day readmission
  - `cabg` - CABG surgery 30-day readmission
  - `hip_knee` - Hip/knee replacement 30-day readmission
- **`size`** (optional): Number of results to return (default: 10)
- **`offset`** (optional): Starting result number for pagination (default: 0)

### Response Format

```json
{
  "total": 2,
  "readmissions": [
    {
      "facility_id": "050002",
      "facility_name": "ST ROSE HOSPITAL",
      "state": "CA",
      "measure_id": "EDAC_30_HF",
      "measure_name": "Hospital return days for heart failure patients",
      "compared_to_national": "More Days Than Average per 100 Discharges",
      "score": "29.4",
      "denominator": "135",
      "lower_estimate": "9.4",
      "higher_estimate": "51.4",
      "number_of_patients": "103",
      "number_of_patients_returned": "43",
      "start_date": "07/01/2021",
      "end_date": "06/30/2024"
    }
  ]
}
```

### Example Queries

#### 1. Get heart failure readmissions in California
```json
{
  "method": "get_readmission_rates",
  "quality_state": "CA",
  "condition": "heart_failure",
  "size": 20
}
```

#### 2. Get all readmission measures for a specific hospital
```json
{
  "method": "get_readmission_rates",
  "quality_hospital_id": "050146",
  "size": 50
}
```

### Use Cases

- **Drug Market Sizing**: Identify hospitals with high HF readmissions for heart failure drug targeting
- **Value-Based Contracting**: Partner with hospitals to reduce readmissions through better medication management
- **Quality Improvement Programs**: Target hospitals with high readmission rates for clinical support programs
- **Competitive Intelligence**: Analyze readmission patterns to identify unmet medical needs

---

## Method 8: get_hospital_infections

Get hospital-acquired infection (HAI) data including CLABSI, CAUTI, SSI, C.diff, and MRSA from CMS Healthcare Associated Infections dataset. Returns Standardized Infection Ratios (SIR) comparing observed vs. predicted infections.

### Parameters

- **`method`** (required): Must be set to `"get_hospital_infections"`
- **`quality_hospital_id`** (optional): CMS Certification Number (CCN) to lookup specific hospital
- **`quality_state`** (optional): State abbreviation to filter hospitals
- **`infection_type`** (optional): Type of infection to filter by:
  - `CLABSI` - Central Line Associated Bloodstream Infection
  - `CAUTI` - Catheter-Associated Urinary Tract Infection
  - `SSI` - Surgical Site Infection
  - `CDIFF` - Clostridium Difficile Infection
  - `MRSA` - Methicillin-Resistant Staphylococcus Aureus
- **`size`** (optional): Number of results to return (default: 10)
- **`offset`** (optional): Starting result number for pagination (default: 0)

### Response Format

```json
{
  "total": 2,
  "infections": [
    {
      "facility_id": "050002",
      "facility_name": "ST ROSE HOSPITAL",
      "state": "CA",
      "measure_id": "HAI_1_SIR",
      "measure_name": "Central Line Associated Bloodstream Infection (ICU + select Wards)",
      "compared_to_national": "No Different than National Benchmark",
      "score": "0.000",
      "start_date": "01/01/2024",
      "end_date": "12/31/2024"
    }
  ]
}
```

### Example Queries

#### 1. Get CLABSI data for California hospitals
```json
{
  "method": "get_hospital_infections",
  "quality_state": "CA",
  "infection_type": "CLABSI",
  "size": 20
}
```

#### 2. Get all HAI data for a specific hospital
```json
{
  "method": "get_hospital_infections",
  "quality_hospital_id": "050146"
}
```

### Use Cases

- **Antibiotic Market Targeting**: Identify hospitals with high infection rates for antimicrobial stewardship programs
- **Infection Control Budget Analysis**: Estimate hospital spending on infection prevention
- **Quality Improvement Partnerships**: Partner with high-infection hospitals for clinical programs
- **Device Market Sizing**: Analyze infection burden for medical device targeting (central lines, catheters)

---

## Method 9: get_mortality_rates

Get hospital 30-day mortality rates by medical condition from CMS Complications and Deaths dataset. Mortality rates show risk-adjusted death rates within 30 days of hospital admission.

### Parameters

- **`method`** (required): Must be set to `"get_mortality_rates"`
- **`quality_hospital_id`** (optional): CMS Certification Number (CCN) to lookup specific hospital
- **`quality_state`** (optional): State abbreviation to filter hospitals
- **`condition`** (optional): Medical condition to filter by:
  - `heart_attack` - Heart attack (AMI) 30-day mortality
  - `heart_failure` - Heart failure 30-day mortality
  - `pneumonia` - Pneumonia 30-day mortality
  - `cabg` - CABG surgery 30-day mortality
  - `copd` - COPD 30-day mortality
  - `stroke` - Stroke 30-day mortality
- **`size`** (optional): Number of results to return (default: 10)
- **`offset`** (optional): Starting result number for pagination (default: 0)

### Response Format

```json
{
  "total": 5,
  "mortality": [
    {
      "facility_id": "050146",
      "facility_name": "CEDARS-SINAI MEDICAL CENTER",
      "state": "CA",
      "measure_id": "MORT_30_AMI",
      "measure_name": "Acute Myocardial Infarction (AMI) 30-Day Mortality Rate",
      "compared_to_national": "No Different than National Rate",
      "score": "13.8",
      "denominator": "450",
      "lower_estimate": "11.2",
      "higher_estimate": "16.8",
      "start_date": "07/01/2020",
      "end_date": "06/30/2023"
    }
  ]
}
```

### Example Queries

#### 1. Get heart attack mortality rates in California
```json
{
  "method": "get_mortality_rates",
  "quality_state": "CA",
  "condition": "heart_attack",
  "size": 20
}
```

#### 2. Get all mortality measures for a hospital
```json
{
  "method": "get_mortality_rates",
  "quality_hospital_id": "050146"
}
```

### Use Cases

- **Outcomes-Based Contracting**: Identify hospitals with better mortality outcomes for partnerships
- **Clinical Trial Site Selection**: Select high-quality hospitals for better patient outcomes
- **Drug Efficacy Targeting**: Target hospitals with high mortality for drugs that improve survival
- **Quality Benchmarking**: Compare hospital performance on life-threatening conditions

---

## Method 10: search_hospitals_by_quality

Search and filter hospitals by quality metrics including minimum star ratings and geographic filters.

### Parameters

- **`method`** (required): Must be set to `"search_hospitals_by_quality"`
- **`quality_state`** (optional): State abbreviation to filter hospitals
- **`min_star_rating`** (optional): Minimum star rating (1-5) to filter hospitals
- **`size`** (optional): Number of results to return (default: 10)
- **`offset`** (optional): Starting result number for pagination (default: 0)

### Response Format

```json
{
  "total": 5,
  "hospitals": [
    {
      "facility_id": "050146",
      "facility_name": "CEDARS-SINAI MEDICAL CENTER",
      "address": "8700 BEVERLY BLVD",
      "city": "LOS ANGELES",
      "state": "CA",
      "zip_code": "90048",
      "hospital_overall_rating": "5",
      "hospital_type": "Acute Care Hospitals",
      "hospital_ownership": "Voluntary non-profit - Private",
      "emergency_services": true
    }
  ]
}
```

### Example Queries

#### 1. Find 4-5 star hospitals in California
```json
{
  "method": "search_hospitals_by_quality",
  "quality_state": "CA",
  "min_star_rating": 4,
  "size": 50
}
```

#### 2. Find all 5-star hospitals nationwide
```json
{
  "method": "search_hospitals_by_quality",
  "min_star_rating": 5,
  "size": 100
}
```

### Use Cases

- **Network Development**: Build preferred provider networks with high-quality hospitals
- **Market Entry Strategy**: Identify top-performing hospitals for initial launch partnerships
- **Geographic Expansion**: Find quality hospitals in new markets
- **Competitive Analysis**: Analyze quality distribution in target markets

---

## Method 11: compare_hospitals

Compare multiple hospitals across quality metrics including star ratings, readmission rates, mortality rates, and infection rates.

### Parameters

- **`method`** (required): Must be set to `"compare_hospitals"`
- **`hospital_ids`** (required): Array of hospital CCN IDs to compare
- **`metrics`** (optional): Array of metrics to compare. Options:
  - `star_rating` - Overall quality star rating
  - `readmission_rate` - 30-day readmission rates
  - `mortality_rate` - 30-day mortality rates
  - `infection_rate` - Hospital-acquired infection rates
  - If not specified, returns all metrics
- **`size`** (optional): Number of results per metric (default: 100)

### Response Format

```json
{
  "hospitals": [
    {
      "facility_id": "050146",
      "facility_name": "CEDARS-SINAI MEDICAL CENTER",
      "star_rating": "5",
      "readmissions": [
        {
          "measure_id": "READM_30_HF",
          "measure_name": "Heart failure 30-day readmission",
          "score": "21.2",
          "compared_to_national": "Better than National Rate"
        }
      ],
      "mortality": [
        {
          "measure_id": "MORT_30_AMI",
          "measure_name": "Heart attack 30-day mortality",
          "score": "13.8",
          "compared_to_national": "No Different than National Rate"
        }
      ],
      "infections": [
        {
          "measure_id": "HAI_1_SIR",
          "measure_name": "CLABSI",
          "score": "0.326",
          "compared_to_national": "No Different than National Benchmark"
        }
      ]
    }
  ]
}
```

### Example Queries

#### 1. Compare three hospitals across all metrics
```json
{
  "method": "compare_hospitals",
  "hospital_ids": ["050146", "050660", "050116"]
}
```

#### 2. Compare hospitals on star rating and readmissions only
```json
{
  "method": "compare_hospitals",
  "hospital_ids": ["050146", "050660"],
  "metrics": ["star_rating", "readmission_rate"]
}
```

### Use Cases

- **Contracting Decisions**: Compare quality metrics before finalizing hospital contracts
- **Competitive Benchmarking**: Analyze how target hospitals compare to competitors
- **Market Analysis**: Compare quality across hospitals in same geographic market
- **Performance Tracking**: Monitor quality changes over time for partner hospitals

---

## Method 12: get_vbp_scores

Get Hospital Value-Based Purchasing (VBP) performance scores from CMS. VBP scores measure hospital performance across four domains: Clinical Outcomes, Person & Community Engagement (patient experience), Safety, and Efficiency/Cost Reduction.

### Parameters

- **`method`** (required): Must be set to `"get_vbp_scores"`
- **`quality_hospital_id`** (optional): CMS Certification Number (CCN) to lookup specific hospital
- **`quality_state`** (optional): State abbreviation to filter hospitals
- **`vbp_domain`** (optional): Filter by VBP domain:
  - `clinical_outcomes` - Clinical outcomes domain score only
  - `person_community_engagement` - Patient experience domain score only
  - `safety` - Safety domain score only
  - `efficiency_cost_reduction` - Efficiency/cost reduction domain score only
  - `all` or omit - Return all domain scores (default)
- **`size`** (optional): Number of results to return (default: 10)
- **`offset`** (optional): Starting result number for pagination (default: 0)

### Response Format

```json
{
  "total": 2,
  "vbp_scores": [
    {
      "facility_id": "050211",
      "facility_name": "ALAMEDA HOSPITAL",
      "state": "CA",
      "fiscal_year": "2025",
      "total_performance_score": "25.041666666667",
      "clinical_outcomes_score": "1.666666666667",
      "person_community_engagement_score": "2.750000000000",
      "safety_score": "20.625000000000",
      "efficiency_cost_reduction_score": "0.000000000000"
    }
  ]
}
```

### Example Queries

#### 1. Get all VBP scores for California hospitals
```json
{
  "method": "get_vbp_scores",
  "quality_state": "CA",
  "size": 20
}
```

#### 2. Get safety domain scores only
```json
{
  "method": "get_vbp_scores",
  "quality_state": "CA",
  "vbp_domain": "safety",
  "size": 10
}
```

#### 3. Get VBP scores for specific hospital
```json
{
  "method": "get_vbp_scores",
  "quality_hospital_id": "050146"
}
```

### Use Cases

- **Payment Adjustment Analysis**: VBP scores directly affect Medicare payments (+/- 2%)
- **Quality Performance Benchmarking**: Compare hospital performance across quality domains
- **Value-Based Contracting**: Identify high-performing hospitals for partnerships
- **Market Analysis**: Analyze quality-based payment adjustments in target markets

---

## Method 13: get_hcahps_scores

Get Hospital Consumer Assessment of Healthcare Providers and Systems (HCAHPS) patient experience scores. HCAHPS is a standardized survey measuring patients' perspectives on hospital care.

### Parameters

- **`method`** (required): Must be set to `"get_hcahps_scores"`
- **`quality_hospital_id`** (optional): CMS Certification Number (CCN) to lookup specific hospital
- **`quality_state`** (optional): State abbreviation to filter hospitals
- **`hcahps_measure`** (optional): Filter by specific HCAHPS measure (e.g., `H_COMP_1_A_P` for nurse communication, `H_HSP_RATING_9_10` for hospital rating 9-10)
- **`size`** (optional): Number of results to return (default: 10)
- **`offset`** (optional): Starting result number for pagination (default: 0)

### Response Format

```json
{
  "total": 2,
  "hcahps_scores": [
    {
      "facility_id": "050002",
      "facility_name": "ST ROSE HOSPITAL",
      "state": "CA",
      "measure_id": "H_COMP_1_A_P",
      "measure_question": "Patients who reported that their nurses \"Always\" communicated well",
      "answer_description": "Nurses \"always\" communicated well",
      "answer_percent": "71",
      "star_rating": "Not Applicable",
      "linear_mean_value": "Not Applicable",
      "number_of_surveys": "380",
      "response_rate_percent": "21",
      "start_date": "01/01/2024",
      "end_date": "12/31/2024"
    }
  ]
}
```

### Common HCAHPS Measures

- **`H_COMP_1_A_P`**: Nurses always communicated well
- **`H_COMP_2_A_P`**: Doctors always communicated well
- **`H_COMP_3_A_P`**: Staff always explained medicines
- **`H_COMP_5_A_P`**: Staff always helped with bathroom needs
- **`H_COMP_6_Y_P`**: Room always kept clean
- **`H_COMP_7_A_P`**: Area around room always kept quiet at night
- **`H_HSP_RATING_9_10`**: Hospital rating 9-10 (highest)
- **`H_RECMND_DY`**: Would definitely recommend hospital

### Example Queries

#### 1. Get all HCAHPS scores for a hospital
```json
{
  "method": "get_hcahps_scores",
  "quality_hospital_id": "050146",
  "size": 50
}
```

#### 2. Get nurse communication scores for California
```json
{
  "method": "get_hcahps_scores",
  "quality_state": "CA",
  "hcahps_measure": "H_COMP_1_A_P",
  "size": 20
}
```

#### 3. Get hospital recommendation rates
```json
{
  "method": "get_hcahps_scores",
  "quality_state": "NY",
  "hcahps_measure": "H_RECMND_DY"
}
```

### Use Cases

- **Patient Experience Programs**: Identify hospitals with low patient satisfaction for improvement programs
- **Competitive Analysis**: Compare patient experience scores across competing hospitals
- **Quality Improvement Targeting**: Focus on specific dimensions (communication, cleanliness, quiet, pain management)
- **Star Rating Analysis**: HCAHPS scores contribute 25% to overall hospital star rating

---

## Method 14: get_asp_pricing

Get Average Sales Price (ASP) pricing for Medicare Part B drugs.

### Parameters
- **`method`** (required): Must be set to `"get_asp_pricing"`
- **`hcpcs_code_asp`** (required): HCPCS code for Part B drug (e.g., "J9035" for Bevacizumab)
- **`quarter`** (optional): Quarter for ASP data (e.g., "2026Q1", "2025Q4"). Defaults to current quarter.

### Response Fields
- **`hcpcs_code`**: HCPCS billing code
- **`short_descriptor`**: Drug name/description
- **`dosage`**: Dosage unit (e.g., "10 MG")
- **`payment_limit`**: Medicare payment limit (ASP × 1.06)
- **`asp_calculated`**: Calculated Average Sales Price
- **`medicare_reimbursement`**: Amount Medicare pays
- **`patient_coinsurance`**: Patient 20% coinsurance amount
- **`effective_period`**: Quarter and date range
- **`quarter`**: Data quarter (YYYYQN format)
- **`notes`**: Additional CMS notes
- **`found`**: Boolean indicating if drug was found

### Example Requests

#### 1. Get current ASP for Bevacizumab
```json
{
  "method": "get_asp_pricing",
  "hcpcs_code_asp": "J9035"
}
```

#### 2. Get ASP for specific quarter
```json
{
  "method": "get_asp_pricing",
  "hcpcs_code_asp": "J0202",
  "quarter": "2026Q1"
}
```

### Use Cases

- **Reimbursement Analysis**: Determine Medicare payment rates for Part B drugs
- **Patient Cost Estimation**: Calculate patient out-of-pocket costs (20% coinsurance)
- **Revenue Forecasting**: ASP × expected volume = revenue projections
- **Price Transparency**: Track Medicare pricing for physician-administered drugs

---

## Method 15: get_asp_trend

Track ASP pricing changes over multiple quarters for trend analysis.

### Parameters
- **`method`** (required): Must be set to `"get_asp_trend"`
- **`hcpcs_code_asp`** (required): HCPCS code for Part B drug
- **`start_quarter`** (required): Starting quarter (e.g., "2025Q1")
- **`end_quarter`** (required): Ending quarter (e.g., "2026Q1")

### Response Fields
- **`hcpcs_code`**: HCPCS billing code
- **`drug_name`**: Drug name from first available quarter
- **`start_quarter`**: Requested start quarter
- **`end_quarter`**: Requested end quarter
- **`data_points`**: Number of quarters with available data
- **`trend_data`**: Array of quarterly data points with:
  - `quarter`: Quarter identifier
  - `payment_limit`: Medicare payment limit
  - `asp_calculated`: Average Sales Price
  - `dosage`: Dosage unit
  - `dates`: Quarter date range
- **`analysis`**: Statistical analysis:
  - `min_price`: Lowest price in range
  - `max_price`: Highest price in range
  - `avg_price`: Average price across quarters
  - `price_change_percent`: Percentage change from first to last quarter
  - `price_volatility`: Price variation as percentage

### Example Requests

#### 1. Track pricing over one year
```json
{
  "method": "get_asp_trend",
  "hcpcs_code_asp": "J9035",
  "start_quarter": "2025Q1",
  "end_quarter": "2026Q1"
}
```

#### 2. Long-term trend analysis
```json
{
  "method": "get_asp_trend",
  "hcpcs_code_asp": "J0202",
  "start_quarter": "2024Q1",
  "end_quarter": "2026Q1"
}
```

### Use Cases

- **Price Trend Analysis**: Identify drugs with increasing/decreasing prices
- **Gross-to-Net Modeling**: Track pricing trends for rebate strategy planning
- **Budget Planning**: Forecast future drug costs based on historical trends
- **Market Access**: Monitor pricing relative to competitors over time

---

## Method 16: compare_asp_pricing

Compare ASP pricing across multiple drugs for competitive analysis.

### Parameters
- **`method`** (required): Must be set to `"compare_asp_pricing"`
- **`hcpcs_codes`** (required): Array of HCPCS codes to compare (e.g., ["J9035", "J9299", "J0202"])
- **`quarter`** (optional): Quarter for comparison (e.g., "2026Q1"). Defaults to current quarter.

### Response Fields
- **`quarter`**: Data quarter
- **`effective_period`**: Quarter date range
- **`drugs_compared`**: Number of drugs requested
- **`drugs_found`**: Number of drugs found in data
- **`comparisons`**: Array of drug data:
  - `hcpcs_code`: HCPCS billing code
  - `drug_name`: Drug description
  - `dosage`: Dosage unit
  - `payment_limit`: Medicare payment limit
  - `asp_calculated`: Average Sales Price
  - `patient_coinsurance`: Patient cost
  - `notes`: CMS notes
  - `found`: false if drug not found
- **`analysis`**: Comparison statistics:
  - `lowest_price`: Minimum price among drugs
  - `highest_price`: Maximum price among drugs
  - `average_price`: Mean price
  - `price_range`: Price spread (max - min)

### Example Requests

#### 1. Compare oncology drugs
```json
{
  "method": "compare_asp_pricing",
  "hcpcs_codes": ["J9035", "J9299", "J9310"],
  "quarter": "2026Q1"
}
```

#### 2. Compare biosimilars
```json
{
  "method": "compare_asp_pricing",
  "hcpcs_codes": ["Q5117", "Q5119", "Q5120"]
}
```

### Use Cases

- **Competitive Pricing**: Compare reimbursement rates across competing therapies
- **Formulary Decisions**: Evaluate cost differences for P&T committee decisions
- **Biosimilar Analysis**: Compare pricing between reference products and biosimilars
- **Portfolio Management**: Analyze pricing across drug portfolio

---

## Data Sources

### Hospital Quality Data
All hospital quality data comes from CMS Provider Data Catalog (data.cms.gov):

- **Hospital General Information** (xubh-q36u): Star ratings and hospital characteristics
- **Unplanned Hospital Visits** (632h-zaca): 30-day readmission rates
- **Healthcare Associated Infections** (77hc-ibv8): HAI/infection data
- **Complications and Deaths** (ynj2-r877): 30-day mortality rates
- **Hospital Value-Based Purchasing** (ypbt-wvdk): VBP performance scores
- **Patient Survey HCAHPS** (dgck-syfz): Patient experience scores

Data is updated quarterly by CMS and accessed via public API (no authentication required).

### ASP Pricing Data
Medicare Part B Average Sales Price (ASP) pricing data:

- **Source**: CMS Medicare Part B ASP Pricing Files
- **URL**: https://www.cms.gov/medicare/payment/part-b-drugs/asp-pricing-files
- **Update Frequency**: Quarterly (January, April, July, October)
- **Current Data**: January 2026 (preliminary)
- **Format**: CSV files with HCPCS codes, payment limits, and dosage information
- **Coverage**: Physician-administered drugs (Part B), vaccines, immunizations
- **Automation**: GitHub Actions workflow checks for new quarters monthly
- **Storage**: `data/asp/{QUARTER}_ASP_Pricing.csv.gz` (dynamic quarter-based filenames)

ASP data is automatically downloaded, cleaned, compressed, and committed when new quarters are released.
