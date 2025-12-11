/**
 * Cache manager for Medicare Part D formulary data
 * Downloads and caches monthly ZIP files from data.cms.gov
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';
import unzipper from 'unzipper';
import { CacheManifestEntry } from './types.js';

const CACHE_DIR = path.join(os.homedir(), '.cache', 'medicare-mcp', 'formulary');
const MANIFEST_FILE = path.join(CACHE_DIR, 'cache-manifest.json');
const MAX_CACHE_AGE_DAYS = 30;

// CMS dataset ID for monthly formulary files
const DATASET_ID = 'cb2a224f-4d52-4cae-aa55-8c00c671384f';
const DATA_CMS_BASE_URL = 'https://data.cms.gov';

/**
 * Initialize cache directory
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Load cache manifest
 */
function loadManifest(): { [month: string]: CacheManifestEntry } {
  ensureCacheDir();
  if (fs.existsSync(MANIFEST_FILE)) {
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
  }
  return {};
}

/**
 * Save cache manifest
 */
function saveManifest(manifest: { [month: string]: CacheManifestEntry }): void {
  ensureCacheDir();
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

/**
 * Get latest formulary file info from data.cms.gov
 */
async function getLatestFormularyInfo(): Promise<{ month: string; downloadUrl: string; fileDate: string }> {
  const response = await fetch(`${DATA_CMS_BASE_URL}/data.json`);
  const data: any = await response.json();

  const monthlyFormulary = data.dataset.find(
    (d: any) => d.title === 'Monthly Prescription Drug Plan Formulary and Pharmacy Network Information'
  );

  if (!monthlyFormulary || !monthlyFormulary.distribution || monthlyFormulary.distribution.length === 0) {
    throw new Error('Could not find monthly formulary dataset');
  }

  // First distribution is latest
  const latest = monthlyFormulary.distribution[0];
  const downloadUrl = latest.downloadURL;
  const title = latest.title; // e.g., "Monthly Prescription Drug Plan Formulary and Pharmacy Network Information : 2025-11-19"
  const fileDate = title.split(':')[1]?.trim() || 'unknown';
  const month = fileDate.substring(0, 7); // YYYY-MM

  return { month, downloadUrl, fileDate };
}

/**
 * Check if cache entry is valid (exists and not too old)
 */
function isCacheValid(entry: CacheManifestEntry): boolean {
  const downloadDate = new Date(entry.downloadDate);
  const now = new Date();
  const ageInDays = (now.getTime() - downloadDate.getTime()) / (1000 * 60 * 60 * 24);

  return ageInDays < MAX_CACHE_AGE_DAYS && fs.existsSync(entry.zipPath) && fs.existsSync(entry.extractPath);
}

/**
 * Download formulary ZIP file
 */
async function downloadFormularyZip(downloadUrl: string, month: string): Promise<string> {
  const zipPath = path.join(CACHE_DIR, `${month}.zip`);

  console.error(`Downloading formulary data for ${month}...`);

  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download formulary: ${response.statusText}`);
  }

  const buffer = await response.buffer();
  fs.writeFileSync(zipPath, buffer);

  console.error(`Downloaded ${buffer.length} bytes to ${zipPath}`);

  return zipPath;
}

/**
 * Extract ZIP file
 */
async function extractZip(zipPath: string, month: string): Promise<string> {
  const extractPath = path.join(CACHE_DIR, month);

  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }

  console.error(`Extracting ZIP to ${extractPath}...`);

  await fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();

  const files = fs.readdirSync(extractPath);
  console.error(`Extracted ${files.length} files`);

  return extractPath;
}

/**
 * Get latest formulary data (cached or download)
 */
export async function getLatestFormulary(): Promise<{
  month: string;
  fileDate: string;
  extractPath: string;
}> {
  const manifest = loadManifest();

  // Try to get latest from CMS
  let latestInfo;
  try {
    latestInfo = await getLatestFormularyInfo();
  } catch (error) {
    console.error('Failed to fetch latest formulary info:', error);
    // Fall back to cached data if available
    const cachedMonths = Object.keys(manifest).sort().reverse();
    if (cachedMonths.length > 0 && isCacheValid(manifest[cachedMonths[0]])) {
      const cached = manifest[cachedMonths[0]];
      console.error(`Using cached formulary data for ${cached.month}`);
      return {
        month: cached.month,
        fileDate: cached.downloadDate.split('T')[0],
        extractPath: cached.extractPath
      };
    }
    throw new Error('Failed to fetch latest formulary info and no valid cache available');
  }

  const { month, downloadUrl, fileDate } = latestInfo;

  // Check if we have valid cached data for this month
  if (manifest[month] && isCacheValid(manifest[month])) {
    console.error(`Using cached formulary data for ${month}`);
    return {
      month,
      fileDate,
      extractPath: manifest[month].extractPath
    };
  }

  // Download and extract
  console.error(`Cache miss or invalid, downloading fresh data for ${month}...`);

  const zipPath = await downloadFormularyZip(downloadUrl, month);
  const extractPath = await extractZip(zipPath, month);

  // Update manifest
  manifest[month] = {
    month,
    downloadDate: new Date().toISOString(),
    zipPath,
    extractPath,
    fileHashes: {}
  };
  saveManifest(manifest);

  return { month, fileDate, extractPath };
}

/**
 * Clear cache (for testing/debugging)
 */
export function clearCache(): void {
  if (fs.existsSync(CACHE_DIR)) {
    fs.rmSync(CACHE_DIR, { recursive: true, force: true });
    console.error('Cache cleared');
  }
}
