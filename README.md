# Unofficial Medicare MCP Server

A Model Context Protocol (MCP) server providing comprehensive access to **CMS Medicare data** via the Socrata API, including physician/practitioner services, prescriber data, hospital utilization, and drug spending. This server enables AI assistants and applications to search and analyze Medicare payment, utilization, and coverage information.

## Features

- **Provider Data**: CMS Medicare Physician & Other Practitioners data from 2013-2023 with automatic latest-year selection
- **Prescriber Data**: Medicare Part D prescriber information by drug, provider, and geography
- **Hospital Data**: Medicare inpatient hospital utilization and payment data
- **Drug Spending**: Medicare Part D and Part B drug spending trends
- **Formulary Data**: Medicare Part D plan formulary coverage with automated monthly updates
- **Flexible Querying**: Advanced filtering, pagination, and field selection
- **TypeScript**: Fully typed codebase with strict mode enabled
- **Production Ready**: Docker support, health checks, and comprehensive logging
- **Unified Tool Interface**: Single `medicare_info` tool with method-based routing for different data types
- **Automated Updates**: GitHub Actions workflow for daily formulary data checks and updates

## Tool Description

### Medicare Info Tool

The `medicare_info` tool provides unified access to Medicare data using the `method` parameter to select the operation type:

1. **`search_providers`**: Medicare Physician & Other Practitioners data (2013-2023)
2. **`search_prescribers`**: Medicare Part D prescriber data by drug, provider NPI, specialty, and state
3. **`search_hospitals`**: Medicare inpatient hospital utilization and payment data
4. **`search_spending`**: Medicare Part D and Part B drug spending trends
5. **`search_formulary`**: Medicare Part D plan formulary coverage (tier, prior auth, quantity limits, step therapy)

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
