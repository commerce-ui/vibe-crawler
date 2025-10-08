#!/usr/bin/env node

import { crawl } from './crawler.js';
import { filterByContentType, groupByContentType, saveResults } from './utils.js';

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  const config = {
    url: null,
    filter: null,
    output: 'results.json',
    maxDepth: Infinity,
    saveInterval: 25,
    concurrency: 5,
    resume: false,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      config.help = true;
    } else if (arg === '--filter' || arg === '-f') {
      config.filter = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      config.output = args[++i];
    } else if (arg === '--max-depth' || arg === '-d') {
      config.maxDepth = parseInt(args[++i], 10);
    } else if (arg === '--save-interval' || arg === '-s') {
      config.saveInterval = parseInt(args[++i], 10);
    } else if (arg === '--concurrency' || arg === '-c') {
      config.concurrency = parseInt(args[++i], 10);
    } else if (arg === '--resume' || arg === '-r') {
      config.resume = true;
    } else if (!config.url && !arg.startsWith('--') && !arg.startsWith('-')) {
      config.url = arg;
    }
  }
  
  return config;
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
Web Crawler CLI - Recursively discover same-domain links and their content-types

Usage:
  node index.js <URL> [options]

Arguments:
  <URL>                    Starting URL to crawl (required)

Options:
  -f, --filter <type>      Filter results by content-type (e.g., "text/html", "image/")
  -o, --output <file>      Output file name (default: results.json)
  -d, --max-depth <num>    Maximum crawl depth (default: unlimited)
  -s, --save-interval <n>  Save progress every N URLs (default: 5)
  -c, --concurrency <num>  Number of simultaneous requests (default: 5)
  -r, --resume             Resume from previous crawl session
  -h, --help               Show this help message

Examples:
  node index.js https://example.com
  node index.js https://example.com --filter "text/html"
  node index.js https://example.com --output my-results.json
  node index.js https://example.com --max-depth 3
  node index.js https://example.com --concurrency 10
  node index.js https://example.com -c 3 -d 2 -s 5
  node index.js https://example.com --resume
  node index.js https://example.com -f "image/" -o images.json -d 2 -s 3 -c 5
  `);
}

/**
 * Display results in a formatted way
 */
function displayResultsFormatted(results, grouped) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                      CRAWL RESULTS                            ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`Total URLs found: ${results.length}\n`);
  
  console.log('Results grouped by content-type:\n');
  
  for (const [contentType, urls] of Object.entries(grouped)) {
    console.log(`\n📄 ${contentType} (${urls.length} URL${urls.length !== 1 ? 's' : ''})`);
    console.log('─'.repeat(65));
    urls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

/**
 * Main function
 */
async function main() {
  const config = parseArgs();
  
  // Show help if requested or no URL provided
  if (config.help || !config.url) {
    showHelp();
    if (!config.url && !config.help) {
      console.error('Error: URL is required\n');
      process.exit(1);
    }
    process.exit(0);
  }
  
  try {
    // Validate URL format
    new URL(config.url);
  } catch (error) {
    console.error(`Error: Invalid URL format: ${config.url}\n`);
    process.exit(1);
  }
  
  try {
    // Run the crawler with live saving
    let results = await crawl(config.url, config.maxDepth, {
      outputFile: config.output,
      saveInterval: config.saveInterval,
      concurrency: config.concurrency,
      resume: config.resume
    });
    
    // Apply filter if specified (for display only, file already has all results)
    let displayResults = results;
    if (config.filter) {
      const originalCount = results.length;
      displayResults = filterByContentType(results, config.filter);
      console.log(`🔍 Filtered by "${config.filter}": ${displayResults.length}/${originalCount} URLs\n`);
    }
    
    // Group results by content-type
    const grouped = groupByContentType(displayResults);
    
    // Display results
    displayResultsFormatted(displayResults, grouped);
    
    // Note: Results are already saved during crawl
    console.log(`✓ All results saved to ${config.output}\n`);
    
  } catch (error) {
    console.error(`\n✗ Fatal error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run the CLI
main();

