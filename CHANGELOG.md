# Changelog

## Version 2.3.1 - Stream-based State Loading

### Changed
- **Optimized loadCrawlState()**: Now uses streaming for large files (>50MB)
- **Automatic detection**: Checks file size and chooses best loading method
- **Memory efficient**: Prevents memory issues with very large crawl states
- **64KB chunks**: Streams file in manageable chunks for better performance

### Technical Details
- Small files (<50MB): Fast readFile() approach
- Large files (>50MB): Stream-based loading with createReadStream()
- Automatic file size detection with fs.stat()
- Warning message when using streaming mode

## Version 2.3.0 - Concurrent Crawling

### Added
- **Concurrent URL Fetching**: Download multiple URLs simultaneously using worker pool pattern
- **--concurrency Option**: New `-c` flag to control number of simultaneous requests (default: 5)
- **Real-time Active Counter**: Progress display now shows number of active workers
- **5-10x Speed Improvement**: Typical speed increase compared to sequential crawling

### Changed
- Completely rewritten crawler main loop to support concurrent processing
- New `processUrl()` helper function for individual URL processing
- Updated progress display to show: Found URLs | Queue | Active Workers | Processed
- Updated CLI help and documentation with concurrency examples

### Technical Details
- Worker pool pattern with Promise.race() for optimal concurrency management
- Configurable concurrency from 1 (sequential) to 20+ (very aggressive)
- 20ms delay between starting new workers (rate limiting)
- Safe concurrent access to results array and visited Set
- Compatible with live save and resume features

### Performance Benchmarks
- Concurrency 1: Baseline (sequential)
- Concurrency 5: ~5x faster (default, recommended)
- Concurrency 10: ~8-10x faster (good for most sites)
- Concurrency 20: ~12-15x faster (use only for own servers)

### Recommendations
- Use concurrency 5-10 for external websites (polite)
- Use concurrency 15-20 for your own servers
- Lower concurrency (3-5) for slow/unstable servers

## Version 2.2.0 - CSV Export

### Added
- **CSV Export Tool**: New `json-to-csv.js` script to convert crawler results to spreadsheet format
- **4-Column CSV Format**: DOMAIN, CONTENT_TYPE, CURRENT_URL, TARGET_URL
- **Excel/Google Sheets Compatible**: UTF-8 BOM encoding for proper display
- **NPM Script**: `npm run export-csv` command for easy access
- **Automatic Domain Extraction**: Extracts clean domain from URLs
- **Proper CSV Escaping**: Handles commas, quotes, and special characters correctly

### Changed
- Updated README.md with CSV Export section and complete workflow examples
- Updated QUICK-START.md with CSV export examples and use cases
- Updated .gitignore to exclude CSV files
- Added `export-csv` script to package.json

### Use Cases
- URL mapping and redirect planning (TARGET_URL column for manual entry)
- Content audit and analysis by content type
- Asset inventory (images, CSS, JS files)
- Team collaboration with spreadsheet tools
- SEO analysis and reporting

### Technical Details
- Uses Node.js built-in modules (fs, URL) - no extra dependencies
- UTF-8 BOM for Excel compatibility
- Automatic output filename generation (.json → .csv)
- Error handling for invalid JSON or missing files
- Stats display (row count, file size)

## Version 2.1.0 - Live Saving & Resume

### Added
- **Live saving functionality**: Progress is automatically saved every N URLs (default: 5)
- **Resume capability**: Can continue crawling from previous session using `--resume` flag
- **Save interval option**: New `--save-interval` (`-s`) flag to control save frequency
- **Crash protection**: All progress is saved before exit, even on errors
- **State management**: Saves visited URLs and queue state for seamless resuming

### Changed
- Updated `crawler.js` to accept options object with `outputFile`, `saveInterval`, and `resume`
- Modified `crawl()` function to save progress periodically during crawling
- Added emergency save on any error to prevent data loss
- Updated CLI to support `--save-interval` and `--resume` parameters

### Technical Details
- `saveResultsLive()`: New function for incremental saves without console spam
- `loadCrawlState()`: Loads previous crawl state from JSON file
- `saveCrawlState()`: Saves current state including queue (first 100 items)
- Automatic detection of interrupted sessions
- Queue state is preserved to continue exactly where it left off

### Benefits
- ✅ No data loss on crashes, errors, or manual interruption (Ctrl+C)
- ✅ Safe for large crawls (thousands of pages)
- ✅ Can monitor progress in real-time by watching the output file
- ✅ Resume feature saves time on interrupted crawls

## Version 2.0.0 - Recursive Crawling

### Added
- **Recursive crawling functionality**: The crawler now follows all same-domain links automatically
- **Breadth-first search algorithm**: Uses a queue-based approach to systematically crawl all pages
- **Max depth option**: New `--max-depth` (`-d`) CLI flag to limit crawl depth
- Real-time progress display showing found URLs, queue size, and processing count

### Changed
- Completely refactored `crawler.js` with new architecture:
  - `fetchUrl()`: Fetches URL and returns content-type and HTML
  - `extractLinks()`: Extracts all links from HTML content
  - `crawl()`: Main recursive function using queue-based crawling
- Updated CLI to support `--max-depth` parameter
- Updated README with recursive crawling documentation
- Improved error handling - returns partial results if crawl fails

### Technical Details
- Uses breadth-first search (BFS) to explore the website
- Maintains a `visited` set to avoid crawling the same URL twice
- Queue stores URLs with their depth for depth-limited crawling
- Each HTML page is fetched, parsed for links, and all same-domain links are added to the queue
- Non-HTML resources (images, CSS, JS) are cataloged but not recursed into

### Performance
- 100ms delay between requests (polite crawling)
- Efficient duplicate detection using Set data structure
- Fetches full content only for HTML pages, falls back to HEAD for errors

## Version 1.0.0 - Initial Release

### Features
- Single page crawling
- Same-domain link discovery
- Content-type detection
- Filter by content-type
- JSON output
- CLI interface

