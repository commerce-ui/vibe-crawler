#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';

/**
 * Extract domain from URL
 * @param {string} urlString - Full URL
 * @returns {string} - Domain (hostname without www)
 */
function extractDomain(urlString) {
  try {
    const url = new URL(urlString);
    let hostname = url.hostname;
    // Remove www. prefix if present
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    return hostname;
  } catch (error) {
    return 'invalid-url';
  }
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 * @param {string} field - Field value
 * @returns {string} - Escaped field
 */
function escapeCsvField(field) {
  if (field == null) return '';
  
  const fieldStr = String(field);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
    return '"' + fieldStr.replace(/"/g, '""') + '"';
  }
  
  return fieldStr;
}

/**
 * Convert JSON crawler results to CSV
 * @param {string} inputFile - Input JSON file path
 * @param {string} outputFile - Output CSV file path
 */
async function convertJsonToCsv(inputFile, outputFile) {
  try {
    console.log(`\n📄 Reading JSON file: ${inputFile}`);
    
    // Read and parse JSON
    const jsonContent = await readFile(inputFile, 'utf-8');
    const data = JSON.parse(jsonContent);
    
    // Extract results array
    const results = data.allResults || [];
    
    if (results.length === 0) {
      console.error('⚠️  No results found in JSON file (allResults array is empty)');
      process.exit(1);
    }
    
    console.log(`✓ Found ${results.length} URLs to convert\n`);
    
    // Build CSV content
    const csvRows = [];
    
    // Header row
    csvRows.push('DOMAIN,CONTENT_TYPE,CURRENT_URL,TARGET_URL');
    
    // Data rows
    for (const result of results) {
      const domain = extractDomain(result.url);
      const contentType = result.contentType || 'unknown';
      const currentUrl = result.url;
      const targetUrl = ''; // Empty for manual filling
      
      const row = [
        escapeCsvField(domain),
        escapeCsvField(contentType),
        escapeCsvField(currentUrl),
        escapeCsvField(targetUrl)
      ].join(',');
      
      csvRows.push(row);
    }
    
    // Join all rows with newlines
    const csvContent = csvRows.join('\n');
    
    // Add UTF-8 BOM for Excel compatibility
    const bom = '\uFEFF';
    const finalContent = bom + csvContent;
    
    // Write to file
    console.log(`💾 Writing CSV file: ${outputFile}`);
    await writeFile(outputFile, finalContent, 'utf-8');
    
    console.log(`✓ CSV file created successfully!`);
    console.log(`\nStats:`);
    console.log(`  - Total rows: ${results.length + 1} (including header)`);
    console.log(`  - Columns: DOMAIN, CONTENT_TYPE, CURRENT_URL, TARGET_URL`);
    console.log(`  - File size: ${Math.round(finalContent.length / 1024)} KB`);
    console.log(`\n✓ Done! You can now open ${outputFile} in Excel or Google Sheets.\n`);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`✗ Error: File not found: ${inputFile}`);
    } else if (error instanceof SyntaxError) {
      console.error(`✗ Error: Invalid JSON format in ${inputFile}`);
    } else {
      console.error(`✗ Error: ${error.message}`);
    }
    process.exit(1);
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
JSON to CSV Converter - Export crawler results to spreadsheet

Usage:
  node json-to-csv.js <input.json> [output.csv]

Arguments:
  <input.json>    Input JSON file from web crawler (required)
  [output.csv]    Output CSV file name (optional, default: same name as input with .csv extension)

Examples:
  node json-to-csv.js results.json
  node json-to-csv.js lupine_old_de.json lupine_urls.csv
  npm run export-csv results.json

Output Format:
  CSV with 4 columns:
  - DOMAIN         : Domain extracted from URL (e.g., "lupine.de")
  - CONTENT_TYPE   : Content type (e.g., "text/html", "image/jpeg")
  - CURRENT_URL    : Full URL from crawler
  - TARGET_URL     : Empty column for manual data entry
  `);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.json$/i, '.csv');

// Run conversion
convertJsonToCsv(inputFile, outputFile);

