import axios from 'axios';
import * as cheerio from 'cheerio';
import { isSameDomain, normalizeUrl, saveResultsLive, loadCrawlState } from './utils.js';

/**
 * Fetch a URL and get its content-type and HTML content
 * @param {string} url - URL to fetch
 * @returns {Promise<Object>} - {contentType, html}
 */
async function fetchUrl(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebCrawlerBot/1.0)'
      },
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400 // Accept redirects and success codes
    });
    
    const contentType = response.headers['content-type']?.split(';')[0].trim() || 'unknown';
    return { contentType, html: response.data };
  } catch (error) {
    // Try HEAD request as fallback
    try {
      const headResponse = await axios.head(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebCrawlerBot/1.0)'
        },
        timeout: 5000,
        maxRedirects: 5
      });
      
      const contentType = headResponse.headers['content-type']?.split(';')[0].trim() || 'unknown';
      return { contentType, html: null };
    } catch (headError) {
      return { contentType: 'error', html: null };
    }
  }
}

/**
 * Extract all links from HTML content
 * @param {string} html - HTML content
 * @param {string} baseUrl - Base URL for resolving relative links
 * @param {string} startUrl - Starting URL for domain checking
 * @param {Set} visited - Set of already visited URLs
 * @returns {Array} - Array of normalized URLs
 */
function extractLinks(html, baseUrl, startUrl, visited) {
  const $ = cheerio.load(html);
  const links = new Set();
  
  // Extract all href attributes from anchor tags
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (href) {
      const normalizedUrl = normalizeUrl(href, baseUrl);
      if (normalizedUrl && 
          isSameDomain(startUrl, normalizedUrl) && 
          !visited.has(normalizedUrl)) {
        links.add(normalizedUrl);
      }
    }
  });
  
  // Also check for resources in img, link, script tags
  $('img[src], link[href], script[src]').each((_, element) => {
    const src = $(element).attr('src') || $(element).attr('href');
    if (src) {
      const normalizedUrl = normalizeUrl(src, baseUrl);
      if (normalizedUrl && 
          isSameDomain(startUrl, normalizedUrl) && 
          !visited.has(normalizedUrl)) {
        links.add(normalizedUrl);
      }
    }
  });
  
  return Array.from(links);
}

/**
 * Process a single URL: fetch, extract links, add to results
 * @param {Object} item - {url, depth}
 * @param {string} startUrl - Starting URL for domain checking
 * @param {Set} visited - Set of visited URLs
 * @param {Array} results - Results array
 * @param {Array} queue - Queue array
 * @returns {Promise<Object>} - {url, contentType, newLinks}
 */
async function processUrl(item, startUrl, visited, results, queue) {
  const { url, depth } = item;
  
  try {
    const { contentType, html } = await fetchUrl(url);
    
    const result = { url, contentType };
    
    // Extract links if HTML
    let newLinks = [];
    if (html && contentType.includes('text/html')) {
      newLinks = extractLinks(html, url, startUrl, visited);
    }
    
    return { result, newLinks, depth };
  } catch (error) {
    return { result: { url, contentType: 'error' }, newLinks: [], depth };
  }
}

/**
 * Main recursive crawler function
 * @param {string} startUrl - The starting URL to crawl
 * @param {number} maxDepth - Maximum crawl depth (default: unlimited)
 * @param {Object} options - Crawler options
 * @param {string} options.outputFile - File to save live results
 * @param {number} options.saveInterval - Save every N URLs (default: 5)
 * @param {boolean} options.resume - Try to resume from previous state
 * @param {number} options.concurrency - Number of concurrent requests (default: 5)
 * @returns {Promise<Array>} - Array of {url, contentType} objects
 */
export async function crawl(startUrl, maxDepth = Infinity, options = {}) {
  const {
    outputFile = 'results.json',
    saveInterval = 5,
    resume = false,
    concurrency = 5
  } = options;
  
  console.log(`\n🕷️  Starting recursive crawl from: ${startUrl}`);
  if (resume) {
    console.log(`🔄 Attempting to resume from previous session...`);
  }
  console.log(`💾 Live saving enabled (every ${saveInterval} URLs)`);
  console.log(`⚡ Concurrency: ${concurrency} simultaneous requests\n`);
  
  let results = [];
  let visited = new Set();
  let queue = [{ url: startUrl, depth: 0 }];
  let totalProcessed = 0;
  
  // Try to resume from previous state
  if (resume) {
    const previousState = await loadCrawlState(outputFile);
    if (previousState && previousState.startUrl === startUrl) {
      console.log(`✓ Found previous session with ${previousState.allResults?.length || 0} URLs`);
      results = previousState.allResults || [];
      visited = new Set(results.map(r => r.url));
      totalProcessed = results.length;
      
      // Rebuild queue from unvisited URLs (if we saved queue state)
      if (previousState.queue && previousState.queue.length > 0) {
        queue = previousState.queue;
        console.log(`✓ Resuming with ${queue.length} URLs in queue\n`);
      } else {
        console.log(`✓ Starting fresh from saved URLs\n`);
      }
    } else {
      console.log(`⚠️  No valid previous state found, starting fresh\n`);
    }
  }
  
  const metadata = {
    crawledAt: new Date().toISOString(),
    startUrl,
    maxDepth: maxDepth === Infinity ? 'unlimited' : maxDepth
  };
  
  // Save initial state
  await saveResultsLive(results, outputFile, metadata, true);
  
  try {
    // Process the queue with concurrent workers
    const activePromises = new Set();
    
    while (queue.length > 0 || activePromises.size > 0) {
      // Fill worker pool up to concurrency limit
      while (activePromises.size < concurrency && queue.length > 0) {
        const item = queue.shift();
        
        // Skip if already visited or max depth reached
        if (visited.has(item.url) || item.depth > maxDepth) {
          continue;
        }
        
        visited.add(item.url);
        totalProcessed++;
        
        // Create promise for this URL
        const promise = processUrl(item, startUrl, visited, results, queue)
          .then(async ({ result, newLinks, depth }) => {
            // Add to results
            results.push(result);
            
            // Add new links to queue
            for (const link of newLinks) {
              if (!visited.has(link)) {
                queue.push({ url: link, depth: depth + 1 });
              }
            }
            
            // Save results periodically
            if (results.length % saveInterval === 0) {
              await saveResultsLive(results, outputFile, {
                ...metadata,
                queue: queue.slice(0, 100),
                inProgress: true
              }, true);
            }
            
            // Remove from active promises
            activePromises.delete(promise);
            
            // Update progress
            process.stdout.write(`\r📡 Crawling... Found: ${results.length} URLs | Queue: ${queue.length} | Active: ${activePromises.size} | Processed: ${totalProcessed}`);
          })
          .catch(async (error) => {
            // On error, still remove from active promises
            activePromises.delete(promise);
            console.error(`\n⚠️  Error processing URL: ${error.message}`);
          });
        
        activePromises.add(promise);
        
        // Small delay between starting new requests
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      // Wait for at least one promise to complete before continuing
      if (activePromises.size > 0) {
        await Promise.race(activePromises);
      }
    }
    
    // Final save
    await saveResultsLive(results, outputFile, {
      ...metadata,
      completedAt: new Date().toISOString(),
      inProgress: false
    }, false);
    
    console.log('\n');
    console.log(`✓ Crawl complete! Found ${results.length} URLs total.\n`);
    return results;
    
  } catch (error) {
    console.error(`\n✗ Error during crawl: ${error.message}\n`);
    
    // Emergency save on error
    await saveResultsLive(results, outputFile, {
      ...metadata,
      error: error.message,
      erroredAt: new Date().toISOString(),
      inProgress: false
    }, false);
    
    console.log(`💾 Progress saved before exit (${results.length} URLs)\n`);
    
    // Return partial results
    return results;
  }
}

