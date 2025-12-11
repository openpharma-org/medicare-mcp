# Unofficial Medicare MCP Server

A Model Context Protocol (MCP) server providing access to **CMS Medicare Physician & Other Practitioners data** from 2013-2023. This server enables AI assistants and applications to search and analyze Medicare provider data, including service volumes, beneficiary demographics, and payment information.

## Features

- **Historical Data**: CMS Medicare data from 2013-2023 with automatic latest-year selection
- **Three Dataset Types**: Geography & Service, Provider & Service, and Provider demographics
- **Flexible Querying**: Advanced filtering, pagination, and field selection
- **TypeScript**: Fully typed codebase with strict mode enabled
- **Production Ready**: Docker support, health checks, and comprehensive logging

## Tool Description

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

## Configuration

### MCP Client Configuration

To use this server with Claude Desktop or other MCP clients, add the following to your MCP configuration file:

```json
{
  "mcpServers": {
    "medicare-data": {
      "command": "node",
      "args": [
        "/path/to/medicare-mcp-server/dist/index.js"
      ]
    }
  }
}
```

## Notes

### Medicare Provider Search
- The data spans from 2013 to 2023 Medicare Physician & Other Practitioners datasets
- The tool defaults to the latest available year if not specified
- Data availability may vary by year and dataset type
- Place of service codes: "F" for facility, "O" for office
- Drug indicator "Y" indicates the service involves a drug
- All monetary amounts are in USD
- Geographic codes follow standard state/county/ZIP code formats
- Results are limited to 5000 items per request