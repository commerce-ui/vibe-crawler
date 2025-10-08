# Web Crawler CLI

A Node.js command-line tool for recursively crawling websites, discovering all same-domain links, and capturing their content-types. Built with Cheerio and Axios.

## Features

- 🕷️ **Recursive crawling** - Follows all same-domain links automatically
- ⚡ **Concurrent fetching** - Download multiple URLs simultaneously (5-10x faster!)
- 💾 **Live saving** - Automatically saves progress every N URLs (no data loss on errors!)
- 🔄 **Resume capability** - Continue crawling from where you left off
- 📄 Captures content-type for each URL (using efficient GET/HEAD requests)
- 🗂️ Groups and orders results by content-type
- 🔍 Filter results by specific content-type
- 🎯 Configurable maximum crawl depth and concurrency
- 🤝 Polite crawling with controlled request rate
- 🎯 CLI interface for easy usage

## Quick Start

**🚀 Want to start immediately?** Check out [QUICK-START.md](QUICK-START.md) for quick examples!

**💾 Want to learn about live saving?** Read [LIVE-SAVE-GUIDE.md](LIVE-SAVE-GUIDE.md) for details!

**📖 Want to see real examples?** Browse [EXAMPLES.md](EXAMPLES.md) for sample outputs and use cases!

**📊 Need CSV export for Excel?** Check [CSV-EXPORT-GUIDE.md](CSV-EXPORT-GUIDE.md) for complete guide!

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

## Usage

### Basic Usage

Crawl a website and see all same-domain URLs grouped by content-type:

```bash
node index.js https://example.com
```

### Filter by Content-Type

Show only URLs with a specific content-type:

```bash
node index.js https://example.com --filter "text/html"
node index.js https://example.com --filter "image/"
node index.js https://example.com -f "application/json"
```

### Custom Output File

Specify a custom output filename:

```bash
node index.js https://example.com --output my-results.json
node index.js https://example.com -o crawl-data.json
```

### Limit Crawl Depth

Control how deep the crawler should go (useful for large websites):

```bash
node index.js https://example.com --max-depth 2
node index.js https://example.com -d 3
```

### Concurrent Crawling (Speed Control)

Control how many URLs are fetched simultaneously (default: 5):

```bash
# Faster crawling - 10 simultaneous requests
node index.js https://example.com --concurrency 10

# Conservative - 3 simultaneous requests  
node index.js https://example.com -c 3

# Maximum speed - 20 simultaneous requests (use only for your own servers!)
node index.js https://example.com -c 20
```

**Performance:** Concurrency of 5-10 typically gives **5-10x speed improvement** over sequential crawling!

### Live Saving (Auto-save progress)

The crawler automatically saves progress every 5 URLs by default. You can change this:

```bash
node index.js https://example.com --save-interval 10
node index.js https://example.com -s 20  # Save every 20 URLs
```

**Benefits:**
- ✅ No data loss if the crawler crashes or is interrupted
- ✅ You can monitor progress by watching the output file
- ✅ Large crawls are safe - you won't lose hours of work

### Resume Crawling

If your crawl was interrupted, resume from where you left off:

```bash
node index.js https://example.com --resume
node index.js https://example.com -r  # Short version
```

The crawler will:
1. Load previously discovered URLs (with automatic streaming for large files >50MB)
2. Skip already crawled pages
3. Continue with remaining URLs in the queue

**Note:** For very large crawls (50MB+ state files), the resume will automatically use streaming to load efficiently.

### Combining Options

You can combine multiple options:

```bash
node index.js https://example.com -f "image/" -o images.json -d 2
node index.js https://example.com -d 3 -s 10 -o crawl.json
node index.js https://example.com --resume --max-depth 5
```

### Help

Show help message:

```bash
node index.js --help
```

## Command-Line Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `<URL>` | - | Starting URL to crawl (required) | - |
| `--filter <type>` | `-f` | Filter results by content-type | None |
| `--output <file>` | `-o` | Output file name | `results.json` |
| `--max-depth <num>` | `-d` | Maximum crawl depth | Unlimited |
| `--save-interval <n>` | `-s` | Save progress every N URLs | 5 |
| `--concurrency <num>` | `-c` | Simultaneous requests | 5 |
| `--resume` | `-r` | Resume from previous session | false |
| `--help` | `-h` | Show help message | - |

## Output Format

The tool saves results to a JSON file with the following structure:

```json
{
  "crawledAt": "2025-10-08T12:34:56.789Z",
  "startUrl": "https://example.com",
  "filter": null,
  "totalUrls": 15,
  "groupedByContentType": {
    "text/html": [
      "https://example.com",
      "https://example.com/about"
    ],
    "image/jpeg": [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg"
    ],
    "text/css": [
      "https://example.com/style.css"
    ]
  },
  "allResults": [
    { "url": "https://example.com", "contentType": "text/html" },
    { "url": "https://example.com/about", "contentType": "text/html" },
    { "url": "https://example.com/photo1.jpg", "contentType": "image/jpeg" }
  ]
}
```

## How It Works

1. **Check for Resume**: If `--resume` is used, loads previous session state
2. **Fetch Starting Page**: The crawler fetches the HTML from the starting URL
3. **Extract Links**: Using Cheerio, it parses the HTML and extracts all links (`<a>`, `<img>`, `<link>`, `<script>` tags)
4. **Filter Same-Domain**: Only links from the same domain are kept
5. **Recursive Crawling**: For each HTML page discovered, the crawler repeats the process, following all same-domain links
6. **Breadth-First Search**: Uses a queue-based approach to crawl pages systematically
7. **Live Saving**: Every N URLs, progress is automatically saved to the output file
8. **Get Content-Types**: For each discovered URL, content-type is captured during the fetch
9. **Error Handling**: If any error occurs, partial results are immediately saved
10. **Group & Display**: Results are grouped by content-type and displayed in the console
11. **Final Save**: Complete data is saved to the JSON file

## Examples

### Example 1: Recursively crawl and see all content types

```bash
node index.js https://example.com
```

Output:
```
🕷️  Starting recursive crawl from: https://example.com

📡 Crawling... Found: 47 URLs | Queue: 3 | Processing: 45

✓ Crawl complete! Found 47 URLs total.

═══════════════════════════════════════════════════════════════
                      CRAWL RESULTS                            
═══════════════════════════════════════════════════════════════

Total URLs found: 47

Results grouped by content-type:

📄 text/html (12 URLs)
─────────────────────────────────────────────────────────────────
  1. https://example.com
  2. https://example.com/about
  3. https://example.com/contact
  ...
```

### Example 2: Find all images

```bash
node index.js https://example.com --filter "image/" --output images.json
```

This will show only URLs with content-types starting with "image/" and save them to `images.json`.

### Example 3: Find all API endpoints

```bash
node index.js https://api.example.com --filter "application/json"
```

### Example 4: Safe crawling with live save

```bash
# Start crawl with frequent saves (every 3 URLs)
node index.js https://example.com -s 3 -o mycrawl.json

# If it crashes or you stop it (Ctrl+C), resume it:
node index.js https://example.com -r -o mycrawl.json
```

This is especially useful for:
- Large websites (hundreds or thousands of pages)
- Unstable network connections
- Testing/debugging (stop and resume anytime)

## CSV Export

After crawling, you can export the results to a CSV spreadsheet for easy analysis in Excel or Google Sheets.

### Usage

```bash
# Basic export (creates results.csv from results.json)
node json-to-csv.js results.json

# Export with custom output name
node json-to-csv.js lupine_old_de.json lupine_urls.csv

# Using npm script
npm run export-csv results.json output.csv
```

### Output Format

The CSV file contains 4 columns:

| Column | Description |
|--------|-------------|
| **DOMAIN** | Domain extracted from URL (e.g., "lupine.de") |
| **CONTENT_TYPE** | Content type (e.g., "text/html", "image/jpeg") |
| **CURRENT_URL** | Full URL from crawler |
| **TARGET_URL** | Empty column for manual data entry (redirects, mappings, etc.) |

### Example Output

```csv
DOMAIN,CONTENT_TYPE,CURRENT_URL,TARGET_URL
lupine.de,text/html,https://www.lupine.de,
lupine.de,text/html,https://www.lupine.de/about,
lupine.de,image/jpeg,https://www.lupine.de/photo.jpg,
```

### Use Cases

- **URL Mapping**: Plan redirects for site migrations (fill in TARGET_URL column)
- **Content Audit**: Analyze site structure by content type
- **Asset Inventory**: Track all images, CSS, JS files
- **Manual Review**: Share with team for collaborative analysis
- **Excel Analysis**: Pivot tables, filtering, sorting
- **SEO Analysis**: Identify page types, content distribution

### Complete Workflow

```bash
# 1. Crawl the site
node index.js https://example.com -o site-crawl.json

# 2. Export to CSV
node json-to-csv.js site-crawl.json site-analysis.csv

# 3. Open in Excel/Google Sheets for analysis
# 4. Fill in TARGET_URL column for redirect planning
```

## Limitations

- Only crawls links from the same domain as the starting URL (no external domains)
- Adds a 100ms delay between requests to be polite to servers
- Uses GET requests to fetch content and extract links from HTML pages
- Large websites may take significant time to crawl completely (use `--max-depth` to limit)
- Does not respect robots.txt (consider adding this for production use)

## Dependencies

- **cheerio** (^1.0.0-rc.12) - Fast, flexible HTML parsing
- **axios** (^1.6.0) - Promise-based HTTP client

## License

ISC

## Author

Created as a local web crawler tool for discovering and analyzing same-domain resources by content-type.

