# ASP Pricing Implementation Guide

## Overview
Medicare Part B Average Sales Price (ASP) pricing data for physician-administered drugs. ASP determines Medicare reimbursement rates (typically ASP × 106%).

## Data Source
- **URL**: https://www.cms.gov/medicare/payment/part-b-drugs/asp-pricing-files
- **Update Frequency**: Quarterly (January, April, July, October)
- **Latest**: January 2026 (preliminary, released 12/09/2025)
- **Historical**: Available back to January 2005

## File Structure

### Files in Each Quarterly ZIP
1. **ASP Pricing File** - Payment limits for Medicare Part B drugs
2. **NOC Pricing File** - Not Otherwise Classified pricing
3. **NDC-HCPCS Crosswalk** - Maps NDCs to HCPCS billing codes

### ASP Pricing File Columns
```
HCPCS Code | Short Descriptor | Dosage | Payment Limit | Notes
J0185      | Inj aprepitant  | 1 MG   | 1.641        |
J0202      | Inj alemtuzumab | 1 MG   | 2429.891     |
```

### NDC-HCPCS Crosswalk Columns
- HCPCS Code
- Short Descriptor
- Code Dosage Descriptor
- Labeler Name
- 11-Digit NDC (xxxxx-xxxx-xx)
- Drug Name
- Package Size
- Package Quantity
- Billable Units Per Package
- Billable Units Per NDC

## Implementation Plan

### Phase 1: Manual Setup (Required First Step)
1. Visit https://www.cms.gov/medicare/payment/part-b-drugs/asp-pricing-files
2. Download latest quarterly ZIP file (e.g., `January_2026_ASP_Pricing_File.zip`)
3. Extract and inspect actual file format (.xlsx, .csv, or .txt)
4. Save to `data/asp/` directory
5. Document exact column names and data types

### Phase 2: Parser Implementation
```typescript
// Similar to formulary parser structure

interface ASPPricingRecord {
  hcpcs_code: string;           // e.g., "J0185"
  short_descriptor: string;      // e.g., "Inj., aprepitant, 1 mg"
  dosage: string;                // e.g., "1 MG"
  payment_limit: number;         // e.g., 1.641
  notes?: string;                // Optional
  quarter: string;               // e.g., "2026Q1"
  effective_start: Date;
  effective_end: Date;
}

// Functions to implement:
// - parseASPFile(filePath: string): ASPPricingRecord[]
// - loadASPData(quarter: string): ASPPricingRecord[]
// - searchByHCPCS(code: string, quarter?: string): ASPPricingRecord[]
// - getASPTrend(code: string, startQ: string, endQ: string): ASPPricingRecord[]
```

### Phase 3: Method Implementation
Replace placeholder functions in index.ts:

```typescript
async function getAspPricing(
  hcpcs_code: string,
  quarter?: string
): Promise<any> {
  const latestQuarter = quarter || getCurrentQuarter();
  const aspData = await loadASPData(latestQuarter);
  const result = aspData.find(r => r.hcpcs_code === hcpcs_code);

  if (!result) {
    throw new Error(`HCPCS code ${hcpcs_code} not found in ${latestQuarter} ASP data`);
  }

  return {
    hcpcs_code: result.hcpcs_code,
    drug_name: result.short_descriptor,
    dosage: result.dosage,
    payment_limit: result.payment_limit,
    asp_calculated: result.payment_limit / 1.06, // Reverse calculate ASP
    quarter: result.quarter,
    effective_dates: {
      start: result.effective_start,
      end: result.effective_end
    },
    notes: result.notes
  };
}

async function getAspTrend(
  hcpcs_code: string,
  start_quarter: string,
  end_quarter: string
): Promise<any> {
  // Load data for all quarters in range
  // Return time series of payment limits
}
```

### Phase 4: Automated Updates
```typescript
// Add GitHub Action or scheduled task to:
// 1. Check CMS website quarterly
// 2. Download new ZIP files
// 3. Parse and commit to data/asp/
// 4. Similar to formulary update workflow
```

## Directory Structure
```
data/
  asp/
    2026Q1_ASP_Pricing.txt.gz        # Compressed pricing file
    2026Q1_NDC_HCPCS_Crosswalk.txt.gz
    2025Q4_ASP_Pricing.txt.gz
    2025Q3_ASP_Pricing.txt.gz
    .last-update                      # Timestamp of last check
```

## Key Implementation Notes

1. **File Format**: Unknown until manual download - could be .xlsx, .csv, or .txt
2. **Compression**: Use gzip like formulary data to save space
3. **Caching**: Load parsed data into memory on startup
4. **Quarterly Updates**: Released ~2 weeks before quarter start
5. **Payment Calculation**: Payment Limit = ASP × 1.06 (in most cases)
6. **Historical Data**: Keep 2-3 years for trend analysis
7. **Validation**: Compare against published CMS examples

## Use Cases Supported

1. **Current ASP Lookup**:
   ```json
   {"method": "get_asp_pricing", "hcpcs_code": "J9035"}
   ```

2. **Pricing Trends**:
   ```json
   {"method": "get_asp_trend", "hcpcs_code": "J9035", "start_quarter": "2023Q1", "end_quarter": "2025Q4"}
   ```

3. **Drug Comparisons**:
   ```json
   {"method": "compare_asp_pricing", "hcpcs_codes": ["J9035", "J9299", "J9310"], "quarter": "2025Q4"}
   ```

## Business Value

- **Pricing Intelligence**: Track Medicare Part B reimbursement rates
- **Revenue Forecasting**: ASP × volume = revenue projections
- **Competitive Analysis**: Compare reimbursement across competing drugs
- **Gross-to-Net Modeling**: ASP trends inform rebate strategies
- **Market Access**: Monitor pricing relative to competitors

## Next Steps

1. **Manual Download Required**: Get actual file from CMS to determine format
2. **Contact CMS**: Email sec303aspdata@cms.hhs.gov for technical specs
3. **Parser Development**: Build based on actual file structure
4. **Testing**: Validate against known drug prices
5. **Automation**: Add quarterly update workflow

## References

- ASP Pricing Files: https://www.cms.gov/medicare/payment/part-b-drugs/asp-pricing-files
- ASP Reporting: https://www.cms.gov/medicare/payment/part-b-drugs/asp-reporting
- FAQ: https://www.cms.gov/files/document/frequently-asked-questions-faqs-asp-data-collection.pdf
