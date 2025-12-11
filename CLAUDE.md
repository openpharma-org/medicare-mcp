# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Healthcare Data MCP Server - A Model Context Protocol (MCP) server providing access to healthcare data from National Library of Medicine (NLM) and Centers for Medicare & Medicaid Services (CMS) APIs. The server operates in two modes: MCP mode (stdio) for AI assistants, and HTTP mode for direct API access.

## Development Commands

### Building
```bash
npm run build          # Compile TypeScript to dist/
npm run watch         # Watch mode for development
```

### Running
```bash
npm start             # MCP mode (stdio)
USE_HTTP=true PORT=3005 npm start  # HTTP mode
```

### Code Quality
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm test              # Run tests (currently placeholder)
npm run clean         # Remove build artifacts
```

### Publishing
```bash
npm run check-publish # Pre-publish validation (lint + build + checks)
```

## Architecture

### Core Structure

The codebase is a flat structure with TypeScript files in the root:

- **index.ts** (~3500 lines): Main server implementation containing:
  - Tool definitions for all 7 healthcare data APIs
  - API request handlers
  - MCP server setup
  - HTTP server setup (optional mode)
  - Logging infrastructure
  - CMS dataset version mappings (2013-2023)

- **util.ts**: Utility functions for data transformation:
  - `cleanObject()` / `deepCleanObject()`: Remove null/undefined values
  - `pickBySchema()`: Extract fields matching a schema
  - `flattenArraysInObject()`: Flatten nested arrays for display
  - `createError()`: Standardized error creation

- **types.d.ts**: Tool interface definition with input schema, response schema, and examples

### Two-Mode Operation

1. **MCP Mode** (default): Uses stdio transport for communication with AI assistants via Model Context Protocol
2. **HTTP Mode**: Runs Express server with REST endpoints when `USE_HTTP=true`

Configuration via environment variables:
- `USE_HTTP`: Enable HTTP mode (default: false)
- `PORT`: HTTP server port (default: 3000)
- `TRANSPORT`: MCP transport type (default: 'stdio')
- `LOG_LEVEL`: Logging verbosity (default: 'info')

### Seven Healthcare Tools

1. **nlm_search_icd10**: ICD-10-CM diagnosis codes
2. **nlm_search_icd9_diagnoses**: ICD-9-CM diagnosis codes
3. **nlm_search_icd9_procedures**: ICD-9-CM procedure codes
4. **nlm_search_npi_org**: NPI organization provider search
5. **nlm_search_npi_ind**: NPI individual provider search
6. **nlm_search_hcpcs**: HCPCS procedure codes
7. **cms_search_providers**: Medicare provider data with three dataset types:
   - `geography_and_service`: Regional analysis
   - `provider_and_service`: Provider-specific procedure data
   - `provider`: Provider demographics and beneficiary characteristics

### CMS Dataset Versioning

CMS data is organized by year (2013-2023) with different resource IDs for each dataset type. Version maps are maintained at the top of index.ts:
- `versionMapGeography`: Geography and service datasets
- `versionMapProviderAndService`: Provider and service datasets
- `versionMapProvider`: Provider datasets

The `getLatestYear()` function defaults to the most recent year if not specified.

### Tool Structure

Each tool follows this pattern in index.ts:
1. Tool definition object with:
   - `input_schema`: Parameter definitions with types, descriptions, defaults
   - `responseSchema`: Expected response structure
   - `examples`: Real-world usage examples
2. Request handler function that:
   - Builds API request with query parameters
   - Fetches data from external API
   - Transforms response using util functions
   - Returns formatted result

### Logging

Custom logger in index.ts writes JSON-formatted logs:
- Respects `LOG_LEVEL` environment variable
- Routes to stderr in MCP mode, stdout in HTTP mode
- Includes timestamp and metadata

## Key Patterns

### Adding a New Tool

1. Define the tool object following the Tool interface pattern
2. Add to the TOOLS array
3. Implement the corresponding `handle{ToolName}Request()` function
4. Register in the request handler switch statement
5. If HTTP mode needed, add Express route

### API Request Pattern

```typescript
const params = new URLSearchParams({ /* query params */ });
const url = `${API_BASE_URL}/search?${params.toString()}`;
const response = await fetch(url);
const data = await response.json();
// Transform with util functions
return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
```

### Response Transformation

Use utility functions to clean and format API responses:
- `pickBySchema()`: Select specific fields from API response
- `flattenArraysInObject()`: Convert nested structures for readability
- `deepCleanObject()`: Remove null/undefined for cleaner output

## Important Conventions

- All TypeScript files are in the root directory (not src/)
- Compiled output goes to dist/
- Package is published as ES modules (type: "module" in package.json)
- The main entry point (dist/index.js) must be executable (chmod +x)
- No test framework is currently configured (tests are placeholder)