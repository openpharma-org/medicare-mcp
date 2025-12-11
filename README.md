# Healthcare Data MCP Server

This server provides access to healthcare data through seven main tools:

1. `nlm_search_icd10`: Search for ICD-10-CM codes using the National Library of Medicine (NLM) API
2. `nlm_search_npi_org`: Search for healthcare providers using the National Library of Medicine's (NLM) National Provider Identifier (NPI) database (organizations)
3. `nlm_search_npi_ind`: Search for individual healthcare providers using the National Library of Medicine's (NLM) National Provider Identifier (NPI) database (individuals)
4. `cms_search_providers`: Search Medicare Physician & Other Practitioners data for 2023 using the Centers for Medicare & Medicaid Services (CMS) database
5. `nlm_search_hcpcs`: Search for HCPCS codes using the National Library of Medicine (NLM) API
6. `nlm_search_icd9_diagnoses`: Search for ICD-9-CM diagnoses using the National Library of Medicine (NLM) API
7. `nlm_search_icd9_procedures`: Search for ICD-9-CM procedures using the National Library of Medicine (NLM) API

## About this Server
- **Project:** `healthcare_data_mcp_server`
- **Version:** 0.2.14
- **License:** MIT

## Tool Descriptions

### NLM ICD-10-CM Search

The `nlm_search_icd10` tool provides access to the National Library of Medicine's (NLM) ICD-10-CM code database.

#### Parameters

- `terms` (string, required): The search string for which to find matches in the list
- `maxList` (number, default: 500): Specifies the number of results requested, up to the upper limit of 500
- `count` (number, default: 500): The number of results to retrieve (page size)
- `offset` (number, default: 0): The starting result number (0-based) to retrieve
- `q` (string): An optional, additional query string used to further constrain the results
- `df` (string, default: "code,name"): A comma-separated list of display fields
- `sf` (string, default: "code,name"): A comma-separated list of fields to be searched
- `cf` (string, default: "code"): A field to regard as the 'code' for the returned item data
- `ef` (string): A comma-separated list of additional fields to be returned for each retrieved list item

#### Example Queries

1. Search for tuberculosis-related diagnoses:
```bash
curl -X POST http://localhost:3005/nlm_search_icd10 \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "tuberc"
  }'
```

2. Search for specific respiratory tuberculosis diagnoses:
```bash
curl -X POST http://localhost:3005/nlm_search_icd10 \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "tuberc",
    "q": "code:A15*"
  }'
```

### NLM ICD-9-CM Diagnoses Search

The `nlm_search_icd9_diagnoses` tool provides access to the National Library of Medicine's (NLM) ICD-9-CM diagnosis code database. ICD-9-CM (International Classification of Diseases, Ninth Revision, Clinical Modification) is a medical coding system for classifying diagnoses and reasons for visits in U.S. health care settings.

#### Parameters

- `terms` (string, required): The search string (e.g., part of a code or name) for which to find matches in the list. Multiple words are ANDed together.
- `maxList` (number, default: 7, max: 500): Maximum number of results to return.
- `count` (number, default: 7, max: 500): Number of results per page. Use for pagination.
- `offset` (number, default: 0): Starting result number. Use for pagination. (offset + count <= 7,500)
- `q` (string): Additional query constraints. See Elasticsearch query string syntax.
- `df` (string, default: code_dotted,long_name): Comma-separated list of fields to display in results.
- `sf` (string, default: code,code_dotted,short_name,long_name): Comma-separated list of fields to search in.
- `cf` (string, default: code): Field to regard as the 'code' for the returned item data.
- `ef` (string): Comma-separated list of extra fields to include. Can use aliases with colon syntax: `field_name:alias`.

#### Field Descriptions
- `code`: The ICD-9-CM diagnosis code, e.g., 0011, V092
- `code_dotted`: The decimal version of the ICD-9-CM diagnosis code, e.g., 001.1, V09.2
- `short_name`: The abbreviated name of the diagnosis
- `long_name`: The full name of the diagnosis

#### Example Queries

1. Search for diabetes codes (top 3 results):
```bash
curl -X POST http://localhost:3005/nlm_search_icd9_diagnoses \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "diabetes",
    "count": 3
  }'
```
Output:
```json
{
  "total": 72,
  "codes": [
    { "code": "253.5", "code_dotted": "253.5", "short_name": "", "long_name": " Diabetes insipidus" },
    { "code": "648.01", "code_dotted": "648.01", "short_name": "", "long_name": " Diabetes mellitus of mother, complicating pregnancy, childbirth, or the puerperium, delivered, with or without mention of antepartum condition" },
    { "code": "648.03", "code_dotted": "648.03", "short_name": "", "long_name": " Diabetes mellitus of mother, complicating pregnancy, childbirth, or the puerperium, antepartum condition or complication" }
  ]
}
```

2. Search for codes starting with 08 (top 2 results):
```bash
curl -X POST http://localhost:3005/nlm_search_icd9_diagnoses \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "08",
    "count": 2
  }'
```
Output:
```json
{
  "total": 51,
  "codes": [
    { "code": "080", "code_dotted": "080", "short_name": "", "long_name": " Louse-borne (epidemic) typhus" },
    { "code": "081.0", "code_dotted": "081.0", "short_name": "", "long_name": " Murine (endemic) typhus" }
  ]
}
```

3. Search for diagnoses containing 'brai' and return short names (top 2 results):
```bash
curl -X POST http://localhost:3005/nlm_search_icd9_diagnoses \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "brai",
    "ef": "short_name",
    "count": 2
  }'
```
Output:
```json
{
  "total": 120,
  "codes": [
    { "code": "006.5", "code_dotted": "006.5", "short_name": " Amebic brain abscess", "long_name": " Amebic brain abscess" },
    { "code": "013.20", "code_dotted": "013.20", "short_name": " Tuberculoma brain-unspec", "long_name": " Tuberculoma of brain, unspecified" }
  ]
}
```

### NLM ICD-9-CM Procedures Search

The `nlm_search_icd9_procedures` tool provides access to the National Library of Medicine's (NLM) ICD-9-CM procedure code database. ICD-9-CM (International Classification of Diseases, Ninth Revision, Clinical Modification) is a medical coding system for classifying procedures and reasons for visits in U.S. health care settings.

#### Parameters

- `terms` (string, required): The search string (e.g., part of a code or name) for which to find matches in the list. Multiple words are ANDed together.
- `maxList` (number, default: 7, max: 500): Maximum number of results to return.
- `count` (number, default: 7, max: 500): Number of results per page. Use for pagination.
- `offset` (number, default: 0): Starting result number. Use for pagination. (offset + count <= 7,500)
- `q` (string): Additional query constraints. See Elasticsearch query string syntax.
- `df` (string, default: code_dotted,long_name): Comma-separated list of fields to display in results.
- `sf` (string, default: code,code_dotted,short_name,long_name): Comma-separated list of fields to search in.
- `cf` (string, default: code): Field to regard as the 'code' for the returned item data.
- `ef` (string): Comma-separated list of extra fields to include. Can use aliases with colon syntax: `field_name:alias`.

#### Field Descriptions
- `code`: The ICD-9-CM procedure code, e.g., 210, 0780
- `code_dotted`: The decimal version of the ICD-9-CM procedure code, e.g., 21.0, 07.80
- `short_name`: The abbreviated name of the procedure
- `long_name`: The full name of the procedure

#### Example Queries

1. Search for procedures starting with 08 (top 3 results):
```bash
curl -X POST http://localhost:3005/nlm_search_icd9_procedures \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "08",
    "count": 3
  }'
```
Output:
```json
{
  "total": 49,
  "codes": [
    { "code": "08.01", "code_dotted": "08.01", "short_name": "", "long_name": "Incision of lid margin" },
    { "code": "08.02", "code_dotted": "08.02", "short_name": "", "long_name": "Severing of blepharorrhaphy" },
    { "code": "08.09", "code_dotted": "08.09", "short_name": "", "long_name": "Other incision of eyelid" }
  ]
}
```

2. Search for procedures containing 'brai' and return short names (top 3 results):
```bash
curl -X POST http://localhost:3005/nlm_search_icd9_procedures \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "brai",
    "ef": "short_name",
    "count": 3
  }'
```
Output:
```json
{
  "total": 20,
  "codes": [
    { "code": "00.19", "code_dotted": "00.19", "short_name": "BBBD via infusion", "long_name": "Disruption of blood brain barrier via infusion [BBBD]" },
    { "code": "01.13", "code_dotted": "01.13", "short_name": "Closed brain biopsy", "long_name": "Closed [percutaneous] [needle] biopsy of brain" },
    { "code": "01.14", "code_dotted": "01.14", "short_name": "Open brain biopsy", "long_name": "Open biopsy of brain" }
  ]
}
```

3. Search for heart procedures with short names (top 5 results):
```bash
curl -X POST http://localhost:3005/nlm_search_icd9_procedures \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "heart",
    "count": 5,
    "ef": "short_name"
  }'
```
Output:
```json
{
  "total": 61,
  "codes": [
    { "code": "37.51", "code_dotted": "37.51", "short_name": "Heart transplantation", "long_name": "Heart transplantation" },
    { "code": "35.95", "code_dotted": "35.95", "short_name": "Heart repair revision", "long_name": "Revision of corrective procedure on heart" },
    { "code": "36.39", "code_dotted": "36.39", "short_name": "Oth heart revascular", "long_name": "Other heart revascularization" },
    { "code": "37.32", "code_dotted": "37.32", "short_name": "Heart aneurysm excision", "long_name": "Excision of aneurysm of heart" },
    { "code": "37.92", "code_dotted": "37.92", "short_name": "Injection into heart", "long_name": "Injection of therapeutic substance into heart" }
  ]
}
```

4. Search for fracture procedures with code filtering (79.x codes):
```bash
curl -X POST http://localhost:3005/nlm_search_icd9_procedures \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "fracture",
    "q": "code:79*",
    "count": 4
  }'
```
Output:
```json
{
  "total": 50,
  "codes": [
    { "code": "79.60", "code_dotted": "79.60", "short_name": "", "long_name": "Open fx site debride NOS" },
    { "code": "79.61", "code_dotted": "79.61", "short_name": "", "long_name": "Debrid open fx-humerus" },
    { "code": "79.65", "code_dotted": "79.65", "short_name": "", "long_name": "Debrid opn fx-femur" },
    { "code": "79.01", "code_dotted": "79.01", "short_name": "", "long_name": "Closed fx reduct humerus" }
  ]
}
```

5. Search for joint replacement procedures with pagination:
```bash
curl -X POST http://localhost:3005/nlm_search_icd9_procedures \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "replacement",
    "count": 5,
    "offset": 0,
    "ef": "short_name"
  }'
```
Output:
```json
{
  "total": 149,
  "codes": [
    { "code": "81.51", "code_dotted": "81.51", "short_name": "Total hip replacement", "long_name": "Total hip replacement" },
    { "code": "81.52", "code_dotted": "81.52", "short_name": "Partial hip replacement", "long_name": "Partial hip replacement" },
    { "code": "81.54", "code_dotted": "81.54", "short_name": "Total knee replacement", "long_name": "Total knee replacement" },
    { "code": "81.56", "code_dotted": "81.56", "short_name": "Total ankle replacement", "long_name": "Total ankle replacement" },
    { "code": "81.73", "code_dotted": "81.73", "short_name": "Total wrist replacement", "long_name": "Total wrist replacement" }
  ]
}
```

6. Search for endoscopic GI procedures with complex filtering:
```bash
curl -X POST http://localhost:3005/nlm_search_icd9_procedures \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "endoscopic",
    "q": "code:45* OR code:44*",
    "count": 3,
    "ef": "short_name"
  }'
```
Output:
```json
{
  "total": 9,
  "codes": [
    { "code": "44.32", "code_dotted": "44.32", "short_name": "Percu gastrojejunostomy", "long_name": "Percu gastrojejunostomy" },
    { "code": "44.22", "code_dotted": "44.22", "short_name": "Endoscop dilate pylorus", "long_name": "Endoscop dilate pylorus" },
    { "code": "44.14", "code_dotted": "44.14", "short_name": "Closed gastric biopsy", "long_name": "Closed gastric biopsy" }
  ]
}
```

### NLM NPI Provider Search

The `nlm_search_npi_org` tool provides access to the National Library of Medicine's (NLM) National Provider Identifier (NPI) database, allowing searches for healthcare providers by name, location, provider type, and other criteria.

#### Parameters

- `terms` (string, required): Search terms (name, NPI, or other identifiers). Multiple words are ANDed together
- `maxList` (number, default: 500): Maximum number of results to return
- `count` (number, default: 500): Number of results per page. Use for pagination
- `offset` (number, default: 0): Starting result number. Use for pagination
- `q` (string): Additional query constraints. Examples:
  - `addr_practice.city:Bethesda`
  - `provider_type:Physician`
  - `provider_type:Organization`
  - `addr_practice.state:NY AND provider_type:Individual`
- `df` (string): Comma-separated list of fields to display in results
- `sf` (string): Comma-separated list of fields to search in
- `ef` (string): Comma-separated list of extra fields to include

#### Example Queries

1. Search for providers in Bethesda:
```bash
curl -X POST http://localhost:3005/nlm_search_npi_org \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "john",
    "q": "addr_practice.city:Bethesda AND provider_type:Physician",
    "sf": "NPI,name.full,provider_type,addr_practice.city",
    "df": "NPI,name.full,provider_type,addr_practice"
  }'
```

2. Search for organizations with detailed address:
```bash
curl -X POST http://localhost:3005/nlm_search_npi_org \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "hospital",
    "q": "provider_type:Organization",
    "ef": "taxonomy,addr_practice",
    "df": "NPI,name.full,provider_type,addr_practice,taxonomy",
    "count": 2
  }'
```

### NLM NPI Individual Provider Search

The `nlm_search_npi_ind` tool provides access to the National Library of Medicine's (NLM) National Provider Identifier (NPI) database for individual providers. This tool supports advanced queries using hierarchical fields, dot notation, and array indices for both searching and display.

#### Parameters

- `terms` (string, required): Search terms (name, NPI, or other identifiers). Multiple words are ANDed together.
- `maxList` (number, default: 7, max: 500): Maximum number of results to return.
- `count` (number, default: 7, max: 500): Number of results per page. Use for pagination.
- `offset` (number, default: 0): Starting result number. Use for pagination. (offset + count <= 7,500)
- `q` (string): Additional query constraints. Examples:
  - `addr_practice.city:Bethesda`
  - `provider_type:Physician`
  - `gender:F`
  - `addr_practice.state:NY AND provider_type:Physician`
- `df` (string): Comma-separated list of fields to display in results. Supports dot notation and array indices (e.g., `licenses[0].taxonomy.code`).
- `sf` (string): Comma-separated list of fields to search in. Supports dot notation and array indices.
- `cf` (string): Field to regard as the 'code' for the returned item data (default: NPI).
- `ef` (string): Comma-separated list of extra fields to include. Can use aliases with colon syntax: `field_name:alias`.

#### Example Queries

1. Search for individual providers named 'smith' (limit 2):
```bash
curl -X POST http://localhost:3005/nlm_search_npi_ind \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "smith",
    "count": 2
  }'
```
Output:
```json
{
  "total": 10000,
  "providers": [
    { "NPI": "1871139162", "name": "DONTHI, ANKITH", "provider_type": "Nurse Practitioner", "address": "111 OTIS SMITH DR OTIS SMITH, CLARKSVILLE, TN 37043" },
    { "NPI": "1508500414", "name": "ABIOYE, ABIODUN", "provider_type": "Physician/Internal Medicine", "address": "7301 ROGERS AVE MERCY FORT SMITH, FORT SMITH, AR 72903" }
  ]
}
```

2. Search for female physicians (limit 2):
```bash
curl -X POST http://localhost:3005/nlm_search_npi_ind \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "smith",
    "q": "gender:F AND provider_type:Physician",
    "count": 2
  }'
```
Output:
```json
{
  "total": 4086,
  "providers": [
    { "NPI": "1861724221", "name": "CRANE, NICOLE", "provider_type": "Physician Assistant", "address": "303 SMITH ST, LAGRANGE, GA 30240" },
    { "NPI": "1316918568", "name": "VERNAY, KATHRYN", "provider_type": "Physician Assistant", "address": "1351 SMITH ST, FABIUS, NY 13063" }
  ]
}
```

3. Providers in Boston with a secondary language/other ID (limit 2):
```bash
curl -X POST http://localhost:3005/nlm_search_npi_ind \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "boston",
    "q": "addr_practice.city:Boston AND other_ids.id:*",
    "df": "name.full,addr_practice.full,other_ids[0].id",
    "sf": "addr_practice.city,other_ids.id",
    "count": 2
  }'
```
Output:
```json
{
  "total": 5638,
  "providers": [
    { "NPI": "1497028419", "name": "185 PILGRIM RD, BOSTON, MA 02215", "provider_type": "F336459-1", "address": "" },
    { "NPI": "1811991201", "name": "300 LONGWOOD AVE FEGAN 3, BOSTON, MA 02115", "provider_type": "286370099", "address": "" }
  ]
}
```

### CMS Medicare Provider Search

The `cms_search_providers` tool provides access to Medicare Physician & Other Practitioners data using the Centers for Medicare & Medicaid Services (CMS) database. This data includes information about services and procedures provided to Original Medicare Part B beneficiaries. The tool supports data from 2013 to the latest available year, defaulting to the latest year if not specified.

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
- `year` (optional): Year of the dataset to query (2023 to latest available year, defaults to latest year). Note that data availability may vary by year and dataset type.
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
  "sort": "Tot_Srvcs",
  "order": "desc",
  "limit": 10
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

4. Compare average Medicare payments for specific procedures across ZIP codes:
```json
{
  "dataset_type": "geography_and_service",
  "geo_level": "ZIP",
  "hcpcs_code": "99214",
  "year": 2023,
  "sort": "Avg_Mdcr_Pymt_Amt",
  "order": "desc",
  "limit": 5
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
  "sort": "Tot_Srvcs",
  "order": "desc",
  "limit": 10
}
```

2. Search for cardiologists performing specific procedures:
```json
{
  "dataset_type": "provider_and_service",
  "provider_type": "Cardiology",
  "hcpcs_code": "93010",
  "year": 2023,
  "sort": "Tot_Srvcs",
  "order": "desc"
}
```

3. Find providers in a specific ZIP code performing office visits:
```json
{
  "dataset_type": "provider_and_service",
  "geo_level": "ZIP",
  "geo_code": "90210",
  "hcpcs_code": "99213",
  "year": 2023
}
```

4. Compare providers' Medicare payment amounts for specific procedures:
```json
{
  "dataset_type": "provider_and_service",
  "hcpcs_code": "27130",
  "year": 2023,
  "sort": "Avg_Mdcr_Pymt_Amt",
  "order": "desc",
  "limit": 5
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
  "sort": "Tot_Srvcs",
  "order": "desc",
  "limit": 10
}
```

2. Search for providers by specialty with beneficiary demographics:
```json
{
  "dataset_type": "provider",
  "provider_type": "Orthopedic Surgery",
  "year": 2023,
  "sort": "Tot_Benes",
  "order": "desc"
}
```

3. Find providers in a specific county with high-risk beneficiaries:
```json
{
  "dataset_type": "provider",
  "geo_level": "County",
  "geo_code": "06037",
  "year": 2023,
  "sort": "Bene_Avg_Risk_Scre",
  "order": "desc"
}
```

4. Compare providers' Medicare payment patterns:
```json
{
  "dataset_type": "provider",
  "year": 2023,
  "sort": "Tot_Mdcr_Pymt_Amt",
  "order": "desc",
  "limit": 5
}
```

#### Common Use Cases

1. **Geographic Analysis**
   - Compare healthcare utilization across different regions
   - Identify areas with high or low service volumes
   - Analyze regional variations in Medicare payments
   - Track service patterns by geographic level
   - **Tools:** `cms_search_providers` (geography_and_service dataset)

2. **Provider Analysis**
   - Identify high-volume providers
   - Compare provider practice patterns
   - Analyze provider-level beneficiary characteristics
   - Track provider participation in Medicare
   - **Tools:** `cms_search_providers` (provider dataset), `nlm_search_npi_org`

3. **Service Analysis**
   - Compare utilization of specific procedures
   - Analyze Medicare payment patterns
   - Track service volumes over time
   - Identify trends in healthcare delivery
   - **Tools:** `cms_search_providers` (provider_and_service dataset), `nlm_search_hcpcs`

4. **Beneficiary Analysis**
   - Analyze beneficiary demographics
   - Track risk scores and health status
   - Compare dual-eligible vs. non-dual-eligible populations
   - Monitor age and gender distributions
   - **Tools:** `cms_search_providers` (provider dataset)

5. **Payment Analysis**
   - Compare submitted charges vs. Medicare payments
   - Analyze payment variations by region
   - Track standardized payment amounts
   - Monitor Medicare payment trends
   - **Tools:** `cms_search_providers` (geography_and_service dataset, provider_and_service dataset)

#### Combined Tool Use Cases

1. **Provider and Service Analysis**
   - **Use Case:** Analyze a provider's performance across multiple services and compare with regional averages.
   - **Tools:**
     - `nlm_search_npi_org`: Retrieve provider details and specialties.
     - `cms_search_providers` (provider_and_service dataset): Analyze the provider's service volumes and Medicare payments.
     - `cms_search_providers` (geography_and_service dataset): Compare the provider's performance with regional averages.

2. **Comprehensive Healthcare Utilization Analysis**
   - **Use Case:** Analyze healthcare utilization patterns across different regions and providers, including specific procedures and diagnoses.
   - **Tools:**
     - `nlm_search_icd10`: Retrieve relevant ICD-10 codes for specific diagnoses.
     - `nlm_search_hcpcs`: Retrieve relevant HCPCS codes for specific procedures.
     - `cms_search_providers` (geography_and_service dataset): Analyze regional utilization patterns.
     - `cms_search_providers` (provider_and_service dataset): Analyze provider-level utilization patterns.

3. **Beneficiary and Provider Analysis**
   - **Use Case:** Analyze beneficiary demographics and risk scores for specific providers, and compare with regional averages.
   - **Tools:**
     - `cms_search_providers` (provider dataset): Retrieve beneficiary demographics and risk scores for specific providers.
     - `cms_search_providers` (geography_and_service dataset): Compare with regional averages.

4. **Payment and Service Analysis**
   - **Use Case:** Analyze Medicare payment patterns for specific services across different regions and providers.
   - **Tools:**
     - `nlm_search_hcpcs`: Retrieve relevant HCPCS codes for specific services.
     - `cms_search_providers` (geography_and_service dataset): Analyze regional payment patterns.
     - `cms_search_providers` (provider_and_service dataset): Analyze provider-level payment patterns.

### NLM HCPCS Search

The `nlm_search_hcpcs` tool provides access to the National Library of Medicine's (NLM) HCPCS code database.

#### Parameters

- `terms` (string, required): The search string for which to find matches in the list
- `maxList` (number, default: 500): Specifies the number of results requested, up to the upper limit of 500
- `count` (number, default: 500): The number of results to retrieve (page size)
- `offset` (number, default: 0): The starting result number (0-based) to retrieve
- `q` (string): An optional, additional query string used to further constrain the results
- `df` (string, default: "code,name"): A comma-separated list of display fields
- `sf` (string, default: "code,name"): A comma-separated list of fields to be searched
- `cf` (string, default: "code"): A field to regard as the 'code' for the returned item data
- `ef` (string): A comma-separated list of additional fields to be returned for each retrieved list item

#### Example Queries

1. Search for wheelchair-related HCPCS codes:
```bash
curl -X POST http://localhost:3005/nlm_search_hcpcs \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "wheelchair",
    "maxList": 3
  }'
```

2. Search for specific HCPCS codes with pagination:
```bash
curl -X POST http://localhost:3005/nlm_search_hcpcs \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "wheelchair",
    "maxList": 2,
    "count": 2,
    "offset": 2
  }'
```

3. Search for air-related HCPCS codes with a custom query filter:
```bash
curl -X POST http://localhost:3005/nlm_search_hcpcs \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "air",
    "maxList": 2,
    "count": 2,
    "offset": 0,
    "q": "code:A*"
  }'
```

4. Search for bed-related HCPCS codes with custom display and extra fields:
```bash
curl -X POST http://localhost:3005/nlm_search_hcpcs \
  -H "Content-Type: application/json" \
  -d '{
    "terms": "bed",
    "maxList": 2,
    "count": 2,
    "offset": 0,
    "q": "code:E*",
    "df": "code,short_desc,long_desc",
    "sf": "code,short_desc,long_desc",
    "cf": "code",
    "ef": "long_desc"
  }'
```

## API Endpoints

- `POST /nlm_search_icd10`
- `POST /nlm_search_npi_org`
- `POST /cms_search_providers`
- `POST /nlm_search_hcpcs`

## Usage

### HTTP Mode

To run the server in HTTP mode:

```bash
USE_HTTP=true PORT=3005 npm start
```

The server will be available at `http://localhost:3005` with the following endpoints:
- `POST /nlm_search_icd10`
- `POST /nlm_search_npi_org`
- `POST /cms_search_providers`
- `POST /nlm_search_hcpcs`
- `GET /health` (health check endpoint)

### MCP Mode

To run the server in MCP mode:

```bash
npm start
```

The server will communicate via stdin/stdout using the Model Context Protocol.

## Notes

### ICD-10-CM Search
- Results are limited to 500 items per request
- The search is case-insensitive
- Multiple words in the search terms are ANDed together

### NPI Search
- Results are limited to 500 items per request
- The search is case-insensitive
- Multiple words in the search terms are ANDed together
- Provider types include: Physician, Organization, Individual, etc.

### Medicare Provider Search
- The data is from the 2023 Medicare Physician & Other Practitioners dataset
- Place of service codes: "F" for facility, "O" for office
- Drug indicator "Y" indicates the service involves a drug
- All monetary amounts are in USD
- Geographic codes follow standard state/county/ZIP code formats
- Results are limited to 5000 items per request

### HCPCS Search
- Results are limited to 500 items per request
- The search is case-insensitive
- Multiple words in the search terms are ANDed together
- Custom display and extra fields can be specified for detailed results

## Terms of Service

This server is provided as-is, without any warranty. The data is sourced from the National Library of Medicine and Centers for Medicare & Medicaid Services. Please refer to their respective terms of service for usage restrictions and requirements.