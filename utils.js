import { writeFile, readFile, access, stat } from 'fs/promises';
import { createReadStream } from 'fs';
import { constants } from 'fs';

/**
 * Check if two URLs belong to the same domain
 * @param {string} baseUrl - The base URL
 * @param {string} targetUrl - The target URL to check
 * @returns {boolean} - True if same domain, false otherwise
 */
export function isSameDomain(baseUrl, targetUrl) {
  try {
    const baseHostname = new URL(baseUrl).hostname;
    const targetHostname = new URL(targetUrl).hostname;
    return baseHostname === targetHostname;
  } catch (error) {
    return false;
  }
}

/**
 * Filter results by a specific content-type
 * @param {Array} results - Array of {url, contentType} objects
 * @param {string} contentType - Content-type to filter by (can be partial match)
 * @returns {Array} - Filtered results
 */
export function filterByContentType(results, contentType) {
  if (!contentType) return results;
  
  const normalizedFilter = contentType.toLowerCase();
  return results.filter(item => 
    item.contentType && item.contentType.toLowerCase().includes(normalizedFilter)
  );
}

/**
 * Group results by content-type
 * @param {Array} results - Array of {url, contentType} objects
 * @returns {Object} - Object with content-types as keys and arrays of URLs as values
 */
export function groupByContentType(results) {
  const grouped = {};
  
  for (const item of results) {
    const contentType = item.contentType || 'unknown';
    if (!grouped[contentType]) {
      grouped[contentType] = [];
    }
    grouped[contentType].push(item.url);
  }
  
  // Sort by number of URLs (descending)
  const sorted = Object.entries(grouped)
    .sort((a, b) => b[1].length - a[1].length)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  
  return sorted;
}

/**
 * Save results to a JSON file
 * @param {Array|Object} results - Data to save
 * @param {string} filename - Output filename
 */
export async function saveResults(results, filename = 'results.json') {
  try {
    await writeFile(filename, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n✓ Results saved to ${filename}`);
  } catch (error) {
    console.error(`✗ Error saving results: ${error.message}`);
  }
}

/**
 * Normalize URL - convert relative URLs to absolute
 * @param {string} url - URL to normalize
 * @param {string} baseUrl - Base URL for relative URLs
 * @returns {string|null} - Normalized URL or null if invalid
 */
export function normalizeUrl(url, baseUrl) {
  try {
    // Remove hash fragments
    const cleanUrl = url.split('#')[0];
    if (!cleanUrl) return null;
    
    // Create absolute URL
    const absoluteUrl = new URL(cleanUrl, baseUrl);
    return absoluteUrl.href;
  } catch (error) {
    return null;
  }
}

/**
 * Save results incrementally (live save)
 * @param {Array} results - Current results array
 * @param {string} filename - Output filename
 * @param {Object} metadata - Additional metadata to save
 * @param {boolean} silent - If true, don't log messages
 */
export async function saveResultsLive(results, filename, metadata = {}, silent = true) {
  try {
    const data = {
      ...metadata,
      lastUpdated: new Date().toISOString(),
      totalUrls: results.length,
      allResults: results
    };
    
    await writeFile(filename, JSON.stringify(data, null, 2), 'utf-8');
    
    if (!silent) {
      console.log(`\n💾 Progress saved to ${filename}`);
    }
  } catch (error) {
    if (!silent) {
      console.error(`✗ Error saving progress: ${error.message}`);
    }
  }
}

/**
 * Load previous crawl state from file using streaming for large files
 * @param {string} filename - State filename
 * @returns {Promise<Object|null>} - Previous state or null if not found
 */
export async function loadCrawlState(filename) {
  try {
    await access(filename, constants.R_OK);
    
    // Check file size
    const stats = await stat(filename);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    // For large files (>50MB), use streaming to avoid memory issues
    if (fileSizeMB > 50) {
      console.log(`⚠️  Large file detected (${fileSizeMB.toFixed(1)}MB), using streaming...`);
      return await loadCrawlStateStream(filename);
    }
    
    // For smaller files, use simple approach (faster)
    const content = await readFile(filename, 'utf-8');
    const data = JSON.parse(content);
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Load crawl state using streaming (for large files)
 * @param {string} filename - State filename
 * @returns {Promise<Object|null>} - Previous state or null if not found
 */
async function loadCrawlStateStream(filename) {
  try {
    let data = '';
    const stream = createReadStream(filename, { 
      encoding: 'utf-8',
      highWaterMark: 64 * 1024 // 64KB chunks
    });
    
    // Read file in chunks
    for await (const chunk of stream) {
      data += chunk;
    }
    
    // Parse complete JSON
    return JSON.parse(data);
  } catch (error) {
    console.error(`⚠️  Error loading state with streaming: ${error.message}`);
    return null;
  }
}

/**
 * Save crawl state (visited URLs, queue, results)
 * @param {string} filename - State filename
 * @param {Object} state - State object containing visited, queue, results
 */
export async function saveCrawlState(filename, state) {
  try {
    await writeFile(filename, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error(`✗ Error saving state: ${error.message}`);
  }
}

