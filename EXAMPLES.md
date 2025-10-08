# Przykłady Użycia

## Przykład 1: Podstawowy Crawl

### Komenda
```bash
node index.js https://example.com
```

### Output
```
🕷️  Starting recursive crawl from: https://example.com
💾 Live saving enabled (every 5 URLs)

📡 Crawling... Found: 47 URLs | Queue: 3 | Processed: 45

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

📄 image/jpeg (15 URLs)
─────────────────────────────────────────────────────────────────
  1. https://example.com/images/photo1.jpg
  2. https://example.com/images/photo2.jpg
  ...

📄 text/css (8 URLs)
─────────────────────────────────────────────────────────────────
  1. https://example.com/css/style.css
  2. https://example.com/css/theme.css
  ...

═══════════════════════════════════════════════════════════════

✓ All results saved to results.json
```

---

## Przykład 2: Crawl z Resume (Przerwany)

### Komenda - Pierwsza próba
```bash
node index.js https://large-site.com -o large.json -s 10
```

### Output (przerwany po 50 URLach)
```
🕷️  Starting recursive crawl from: https://large-site.com
💾 Live saving enabled (every 10 URLs)

📡 Crawling... Found: 50 URLs | Queue: 127 | Processed: 48
^C
✗ Error during crawl: ...

💾 Progress saved before exit (50 URLs)
```

### Komenda - Wznowienie
```bash
node index.js https://large-site.com --resume -o large.json
```

### Output - Resume
```
🕷️  Starting recursive crawl from: https://large-site.com
🔄 Attempting to resume from previous session...
✓ Found previous session with 50 URLs
✓ Resuming with 127 URLs in queue
💾 Live saving enabled (every 5 URLs)

📡 Crawling... Found: 234 URLs | Queue: 0 | Processed: 232

✓ Crawl complete! Found 234 URLs total.
```

---

## Przykład 3: Filtrowanie po Content-Type

### Komenda - Tylko obrazy
```bash
node index.js https://photo-site.com --filter "image/" -o images.json
```

### Output
```
🕷️  Starting recursive crawl from: https://photo-site.com
💾 Live saving enabled (every 5 URLs)

📡 Crawling... Found: 156 URLs | Queue: 0 | Processed: 154

✓ Crawl complete! Found 156 URLs total.

🔍 Filtered by "image/": 89/156 URLs

═══════════════════════════════════════════════════════════════
                      CRAWL RESULTS                            
═══════════════════════════════════════════════════════════════

Total URLs found: 89

Results grouped by content-type:

📄 image/jpeg (45 URLs)
─────────────────────────────────────────────────────────────────
  1. https://photo-site.com/gallery/photo1.jpg
  2. https://photo-site.com/gallery/photo2.jpg
  ...

📄 image/png (32 URLs)
─────────────────────────────────────────────────────────────────
  1. https://photo-site.com/icons/icon1.png
  2. https://photo-site.com/icons/icon2.png
  ...

📄 image/gif (12 URLs)
─────────────────────────────────────────────────────────────────
  1. https://photo-site.com/animations/anim1.gif
  ...
```

---

## Przykład 4: Limit Głębokości

### Komenda
```bash
node index.js https://deep-site.com --max-depth 2 -o shallow.json
```

### Output
```
🕷️  Starting recursive crawl from: https://deep-site.com
💾 Live saving enabled (every 5 URLs)

📡 Crawling... Found: 23 URLs | Queue: 0 | Processed: 23

✓ Crawl complete! Found 23 URLs total.

Total URLs found: 23
```

**Uwaga:** Crawler zatrzymał się na głębokości 2 (strona główna → linki → linki z tych linków)

---

## Przykład 5: Niestandardowy Interval Zapisu

### Komenda
```bash
node index.js https://example.com --save-interval 3 -o frequent.json
```

### Output
```
🕷️  Starting recursive crawl from: https://example.com
💾 Live saving enabled (every 3 URLs)

📡 Crawling... Found: 47 URLs | Queue: 3 | Processed: 45

✓ Crawl complete! Found 47 URLs total.
```

**Rezultat:** Plik `frequent.json` był aktualizowany co 3 znalezione URLe zamiast domyślnych 5.

---

## Przykład 6: Złożona Komenda

### Komenda
```bash
node index.js https://complex-site.com \
  --max-depth 4 \
  --save-interval 15 \
  --output complex-crawl.json \
  --filter "text/html"
```

### Output
```
🕷️  Starting recursive crawl from: https://complex-site.com
💾 Live saving enabled (every 15 URLs)

📡 Crawling... Found: 312 URLs | Queue: 0 | Processed: 310

✓ Crawl complete! Found 312 URLs total.

🔍 Filtered by "text/html": 87/312 URLs

═══════════════════════════════════════════════════════════════
                      CRAWL RESULTS                            
═══════════════════════════════════════════════════════════════

Total URLs found: 87

Results grouped by content-type:

📄 text/html (87 URLs)
─────────────────────────────────────────────────────────────────
  1. https://complex-site.com
  2. https://complex-site.com/page1
  ...
```

---

## Przykład 7: Plik Wynikowy (results.json)

```json
{
  "crawledAt": "2025-10-08T14:30:00.000Z",
  "lastUpdated": "2025-10-08T14:35:22.000Z",
  "startUrl": "https://example.com",
  "maxDepth": "unlimited",
  "totalUrls": 47,
  "inProgress": false,
  "completedAt": "2025-10-08T14:35:22.000Z",
  "allResults": [
    {
      "url": "https://example.com",
      "contentType": "text/html"
    },
    {
      "url": "https://example.com/style.css",
      "contentType": "text/css"
    },
    {
      "url": "https://example.com/image.jpg",
      "contentType": "image/jpeg"
    },
    {
      "url": "https://example.com/about",
      "contentType": "text/html"
    }
  ]
}
```

---

## Przykład 8: Error Handling

### Komenda
```bash
node index.js https://unreliable-site.com -o errors.json
```

### Output (niektóre URLe failują)
```
🕷️  Starting recursive crawl from: https://unreliable-site.com
💾 Live saving enabled (every 5 URLs)

📡 Crawling... Found: 28 URLs | Queue: 5 | Processed: 26

✓ Crawl complete! Found 28 URLs total.

Total URLs found: 28

Results grouped by content-type:

📄 text/html (15 URLs)
...

📄 error (3 URLs)
─────────────────────────────────────────────────────────────────
  1. https://unreliable-site.com/broken-link
  2. https://unreliable-site.com/timeout-page
  3. https://unreliable-site.com/404-not-found
```

### W pliku JSON
```json
{
  "allResults": [
    {
      "url": "https://unreliable-site.com/broken-link",
      "contentType": "error"
    }
  ]
}
```

---

## Przykład 9: Live Monitoring

### Terminal 1 - Crawling
```bash
node index.js https://huge-site.com -o huge.json -s 20
```

### Terminal 2 - Monitoring
```bash
# Obserwuj rozmiar pliku
watch -n 2 "ls -lh huge.json"

# Liczenie URLi
watch -n 2 "cat huge.json | grep -o '\"url\"' | wc -l"

# Sprawdź czy completed
watch -n 5 "cat huge.json | grep 'inProgress'"
```

---

## Przykład 10: Help

### Komenda
```bash
node index.js --help
```

### Output
```
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
  -r, --resume             Resume from previous crawl session
  -h, --help               Show this help message

Examples:
  node index.js https://example.com
  node index.js https://example.com --filter "text/html"
  node index.js https://example.com --output my-results.json
  node index.js https://example.com --max-depth 3
  node index.js https://example.com --save-interval 10
  node index.js https://example.com --resume
  node index.js https://example.com -f "image/" -o images.json -d 2 -s 3
```

---

## Wskazówki

1. **Zawsze używaj `-o` dla nazwanych projektów**
   - Łatwiej zarządzać wieloma crawlami
   - Możesz wznowić konkretny crawl

2. **Adjust save-interval dla wydajności**
   - Małe wartości (1-5): Bezpieczniejsze, więcej zapisów
   - Duże wartości (20-50): Szybsze, mniej operacji I/O

3. **Użyj --max-depth dla eksploracji**
   - Najpierw przetestuj z `-d 2`
   - Potem zwiększ jeśli potrzeba

4. **Resume jest Twoim przyjacielem**
   - Możesz przerwać w każdej chwili (Ctrl+C)
   - Wznów później bez utraty danych

5. **Filter na końcu**
   - Pełny crawl zapisuje wszystko
   - Filter tylko zmienia wyświetlanie
   - Możesz przefiltrować JSON później narzędziami jak `jq`

