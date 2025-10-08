# Quick Start Guide

## Instalacja

```bash
# 1. Zainstaluj zależności
npm install

# 2. Gotowe do użycia!
```

## Podstawowe Przykłady

### 1. Najprostszy crawl
```bash
node index.js https://example.com
```
- Crawluje całą domenę rekursywnie
- Zapisuje co 5 URLi do `results.json`
- Bezpieczne - nie stracisz postępu

### 2. Z limitem głębokości
```bash
node index.js https://example.com --max-depth 3
```
- Crawluje tylko 3 poziomy w głąb
- Szybsze dla dużych stron

### 3. Znajdź konkretny typ contentu
```bash
# Wszystkie obrazy
node index.js https://example.com --filter "image/"

# Tylko HTML strony
node index.js https://example.com --filter "text/html"

# Pliki CSS
node index.js https://example.com --filter "text/css"
```

### 4. Bezpieczny crawl z wznawianiem
```bash
# Rozpocznij crawl
node index.js https://duza-strona.com -o mycrawl.json

# Jeśli się przerwie (błąd, Ctrl+C), wznów:
node index.js https://duza-strona.com --resume -o mycrawl.json
```

### 5. Pełna kontrola
```bash
node index.js https://example.com \
  --max-depth 5 \
  --save-interval 10 \
  --output my-results.json \
  --filter "text/html"
```

## Skróty Opcji

| Pełna nazwa | Skrót | Przykład |
|-------------|-------|----------|
| `--filter` | `-f` | `-f "image/"` |
| `--output` | `-o` | `-o out.json` |
| `--max-depth` | `-d` | `-d 3` |
| `--save-interval` | `-s` | `-s 10` |
| `--concurrency` | `-c` | `-c 10` |
| `--resume` | `-r` | `-r` |
| `--help` | `-h` | `-h` |

## Częste Scenariusze

### Mała strona (< 100 stron)
```bash
node index.js https://small-site.com
# Użyj domyślnych ustawień
```

### Średnia strona (100-1000 stron)
```bash
node index.js https://medium-site.com -d 5 -s 10
# Ogranicz głębokość, zapisuj co 10 URLi
```

### Duża strona (1000+ stron)
```bash
node index.js https://huge-site.com -d 3 -s 5 -c 10 -o huge.json
# Płytki crawl, częste zapisy, szybkie pobieranie (10 równocześnie)
# Przerwij w każdej chwili i wznów z --resume
```

### Maksymalna szybkość (własny serwer)
```bash
node index.js https://mysite.com -c 20 -d 5
# 20 równoczesnych requestów - bardzo szybkie!
# Używaj TYLKO dla własnych serwerów
```

### Niestabilna sieć
```bash
node index.js https://example.com -s 3
# Bardzo częste zapisy (co 3 URLe)
```

### Testowanie
```bash
# Test płytki
node index.js https://example.com -d 2 -o test.json

# Obejrzyj wyniki...

# Crawluj głębiej
node index.js https://example.com -d 5 --resume -o test.json
```

## Wyniki

### Gdzie są zapisane?
Domyślnie: `results.json` w bieżącym katalogu

### Co zawiera plik?
```json
{
  "crawledAt": "2025-10-08T12:00:00.000Z",
  "startUrl": "https://example.com",
  "totalUrls": 47,
  "groupedByContentType": {
    "text/html": ["https://...", "https://..."],
    "image/jpeg": ["https://..."]
  },
  "allResults": [
    { "url": "https://...", "contentType": "text/html" }
  ]
}
```

### Jak sprawdzić postęp?
```bash
# Policz znalezione URLe
cat results.json | grep '"url"' | wc -l

# Sprawdź status
cat results.json | grep "inProgress"

# Zobacz typy contentu
cat results.json | grep "groupedByContentType" -A 20
```

## Pomoc

```bash
# Wyświetl wszystkie opcje
node index.js --help

# Przykłady użycia
cat README.md

# Szczegóły live save
cat LIVE-SAVE-GUIDE.md
```

## Tips & Tricks

1. **Zawsze używaj nazwanego pliku dla dużych crawli**
   ```bash
   node index.js https://site.com -o site-crawl-2024.json
   ```

2. **Monitor postępu w czasie rzeczywistym**
   ```bash
   watch -n 5 "cat results.json | grep 'totalUrls'"
   ```

3. **Interrupt i Resume są Twoimi przyjaciółmi**
   - Naciśnij Ctrl+C w każdej chwili
   - Postęp jest zapisany
   - Wznów z `--resume`

4. **Filtruj po fakcie**
   ```bash
   # Crawl zapisuje WSZYSTKO
   node index.js https://site.com -o all.json
   
   # Filtruj w linii komend
   cat all.json | jq '.allResults[] | select(.contentType | contains("image"))'
   ```

5. **Testuj na małej głębokości**
   ```bash
   # Najpierw test
   node index.js https://unknown-site.com -d 2
   
   # Jak wygląda dobra, idź głębiej
   node index.js https://unknown-site.com --resume -d 10
   ```

## Export do CSV (Spreadsheet)

Po crawlowaniu możesz wyeksportować wyniki do CSV dla Excel/Google Sheets:

```bash
# 1. Crawluj stronę
node index.js https://example.com -o mycrawl.json

# 2. Eksportuj do CSV
node json-to-csv.js mycrawl.json mycrawl.csv

# 3. Otwórz w Excel lub Google Sheets
```

### Format CSV

Plik zawiera 4 kolumny:
- **DOMAIN** - domena (np. "lupine.de")
- **CONTENT_TYPE** - typ contentu (np. "text/html")
- **CURRENT_URL** - pełny URL
- **TARGET_URL** - pusta kolumna do ręcznego wypełnienia

### Przykład

```csv
DOMAIN,CONTENT_TYPE,CURRENT_URL,TARGET_URL
example.com,text/html,https://example.com,
example.com,text/html,https://example.com/about,
example.com,image/jpeg,https://example.com/photo.jpg,
```

### Zastosowania

1. **Planowanie redirectów** - wypełnij kolumnę TARGET_URL
2. **Audyt contentu** - analizuj typy plików
3. **Inwentaryzacja** - zobacz wszystkie assety
4. **Analiza w Excel** - pivot tables, filtrowanie

### Szybki workflow

```bash
# Crawl → CSV → Analysis
node index.js https://mysite.com -o site.json && \
node json-to-csv.js site.json site.csv
# Teraz otwórz site.csv w Excel
```

## Gotowy do startu? 🚀

```bash
# Crawl
node index.js https://twoja-strona.com

# Export do CSV (opcjonalnie)
node json-to-csv.js results.json
```

Miłego crawlowania! 🕷️

