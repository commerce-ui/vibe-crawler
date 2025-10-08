# CSV Export - Przewodnik

## 📊 Co to jest CSV Export?

CSV Export to narzędzie do konwersji wyników crawlera (JSON) na format spreadsheet (CSV), który możesz otworzyć w Excel, Google Sheets lub innych programach arkuszowych.

## 🎯 Po co to?

### Główne zastosowania:

1. **Planowanie Redirectów (Site Migration)**
   - Masz wszystkie URLe ze starej strony
   - Wypełniasz kolumnę TARGET_URL nowymi URLami
   - Przekazujesz do developerów lub import do narzędzi

2. **Content Audit**
   - Zobacz jakie typy contentu masz na stronie
   - Filtruj po content-type
   - Pivot tables w Excel

3. **Inwentaryzacja Assetów**
   - Wszystkie obrazy, CSS, JS
   - Grupowanie po typach
   - Identyfikacja brakujących plików

4. **Współpraca z Zespołem**
   - Arkusz łatwo udostępnić
   - Każdy może dodawać notatki
   - Śledzenie postępu

5. **Analiza SEO**
   - Struktura URLi
   - Rozkład content-type
   - Identyfikacja problemów

## 🚀 Jak używać?

### Podstawowy Workflow

```bash
# Krok 1: Crawluj stronę
node index.js https://twoja-strona.com -o crawl.json

# Krok 2: Eksportuj do CSV
node json-to-csv.js crawl.json crawl.csv

# Krok 3: Otwórz w Excel lub Google Sheets
```

### Zaawansowane Użycie

```bash
# Automatyczny pipeline
node index.js https://site.com -o site.json && node json-to-csv.js site.json

# Z NPM script
npm run export-csv results.json output.csv

# Tylko określone głębokości
node index.js https://site.com -d 3 -o shallow.json
node json-to-csv.js shallow.json shallow.csv
```

## 📋 Format CSV

### Kolumny

| Kolumna | Opis | Przykład | Edytowalna? |
|---------|------|----------|-------------|
| **DOMAIN** | Domena wyekstrahowana z URL | `lupine.de` | ❌ |
| **CONTENT_TYPE** | Typ contentu z crawlera | `text/html` | ❌ |
| **CURRENT_URL** | Pełny URL znaleziony | `https://lupine.de/about` | ❌ |
| **TARGET_URL** | Nowy URL (redirect mapping) | *pusta - TY wypełniasz* | ✅ |

### Przykładowy Plik

```csv
DOMAIN,CONTENT_TYPE,CURRENT_URL,TARGET_URL
lupine.de,text/html,https://www.lupine.de,
lupine.de,text/html,https://www.lupine.de/about,https://new-site.com/about-us
lupine.de,text/html,https://www.lupine.de/products,https://new-site.com/shop
lupine.de,image/jpeg,https://www.lupine.de/photo.jpg,https://cdn.new-site.com/images/photo.jpg
```

## 💡 Praktyczne Scenariusze

### Scenariusz 1: Migracja Strony

**Problem:** Przenosisz stronę na nową domenę/platformę i musisz zmapować URLe.

**Rozwiązanie:**
```bash
# 1. Crawluj starą stronę
node index.js https://old-site.com -o old-site.json

# 2. Eksportuj do CSV
node json-to-csv.js old-site.json old-to-new-mapping.csv

# 3. Otwórz w Excel
# 4. W kolumnie TARGET_URL wpisz nowe URLe
# 5. Przekaż do dev team lub import do redirect tool
```

**W Excel:**
- Użyj formuł do automatycznego mapowania (np. `SUBSTITUTE`)
- Filtry dla różnych sekcji strony
- Warunkowe formatowanie dla pustych TARGET_URL

### Scenariusz 2: Content Audit

**Problem:** Chcesz zobaczyć jakie typy contentu masz na stronie.

**Rozwiązanie:**
```bash
# Crawl i export
node index.js https://mysite.com -o site.json
node json-to-csv.js site.json site.csv

# W Excel:
# - Pivot Table po CONTENT_TYPE
# - Policz ile każdego typu
# - Filtruj po domenie
```

### Scenariusz 3: Znajdź Wszystkie Obrazy

**Problem:** Potrzebujesz listy wszystkich obrazów do optymalizacji.

**Rozwiązanie:**
```bash
# Crawl
node index.js https://mysite.com -o site.json
node json-to-csv.js site.json site.csv

# W Excel/Google Sheets:
# - Filtruj CONTENT_TYPE zawiera "image"
# - Kopiuj do nowego arkusza
# - Dodaj kolumny: "Size", "Alt Text", "Optimized?"
```

### Scenariusz 4: Broken Links Inventory

**Problem:** Znalazłeś błędy w crawlu, chcesz je przeanalizować.

**Rozwiązanie:**
```bash
node index.js https://mysite.com -o site.json
node json-to-csv.js site.json site.csv

# W Excel:
# - Filtruj CONTENT_TYPE = "error"
# - Zobacz które URLe failują
# - W TARGET_URL wpisz "DELETE", "FIX", lub nowy URL
```

## 🔧 Excel Tips & Tricks

### 1. Auto-fill TARGET_URL

Dla prostych redirectów (np. zmiana domeny):

```excel
# W kolumnie TARGET_URL (D2):
=SUBSTITUTE(C2, "old-domain.com", "new-domain.com")
```

### 2. Conditional Formatting

Podświetl wiersze bez TARGET_URL:

1. Zaznacz kolumnę TARGET_URL
2. Conditional Formatting → Highlight Cells → Is Empty
3. Wybierz kolor (np. żółty)

### 3. Pivot Table Analysis

Analiza content-type:

1. Insert → Pivot Table
2. Rows: CONTENT_TYPE
3. Values: Count of CURRENT_URL
4. Zobacz rozkład typów contentu

### 4. Filter Views

Utwórz widoki dla różnych teamów:

- **SEO Team**: Tylko text/html
- **Dev Team**: Tylko text/css, text/javascript
- **Design Team**: Tylko image/*

## 📤 Import do Narzędzi

### Import do Screaming Frog

1. Export CSV z crawlera
2. W Screaming Frog: Mode → List
3. Upload → CSV file
4. Mapuj kolumny

### Import do Redirect Manager

Większość redirect plugins/tools akceptuje CSV:

```csv
Old URL,New URL,Type
https://old.com/page1,https://new.com/page1,301
https://old.com/page2,https://new.com/page2,301
```

Po prostu rename kolumn z naszego CSV:
- CURRENT_URL → Old URL
- TARGET_URL → New URL
- Dodaj kolumnę Type = 301

### Import do Google Sheets

1. Google Sheets → File → Import
2. Upload CSV
3. Import location: "Replace current sheet"
4. Separator: Comma
5. ✓ Convert text to numbers/dates: No

## ⚠️ Uwagi

### Encoding

Plik jest zapisany z UTF-8 BOM, więc polskie znaki (ą, ć, ę, etc.) wyświetlą się poprawnie w Excel.

### Excel w macOS

Jeśli Excel nie otwiera poprawnie:
1. Import Data → From Text
2. Wybierz CSV
3. Delimiter: Comma
4. File Origin: UTF-8

### Google Sheets

Google Sheets automatycznie wykrywa encoding - po prostu otwórz lub import.

### Duże Pliki

Dla bardzo dużych crawli (10k+ URLs):
- Excel może być wolny - użyj Google Sheets
- Lub podziel CSV na mniejsze pliki
- Lub użyj narzędzi CLI (awk, csvkit)

## 🎓 Przykłady Formuł Excel

### Ekstrakcja Path z URL

```excel
# Wyciągnij tylko ścieżkę (bez domeny)
=RIGHT(C2, LEN(C2) - FIND("/", C2, 9))
```

### Check if URL contains keyword

```excel
# TRUE/FALSE czy URL zawiera "blog"
=IF(ISNUMBER(SEARCH("blog", C2)), "YES", "NO")
```

### Count URLs by domain

```excel
# W nowej kolumnie
=COUNTIF(A:A, A2)
```

### Auto-generate redirect rules

```excel
# Nginx format: "rewrite ^OLD$ NEW permanent;"
="rewrite ^" & RIGHT(C2, LEN(C2) - FIND("com", C2) + 1) & "$ " & D2 & " permanent;"
```

## 📚 Dalsze Kroki

Po wypełnieniu TARGET_URL:

1. **Przekaż do deweloperów**
   - Możesz dać im cały CSV
   - Lub wyeksportuj tylko kolumny CURRENT_URL, TARGET_URL

2. **Import do narzędzi**
   - Redirect managers (Yoast, Redirection plugin)
   - .htaccess generator
   - Nginx config generator

3. **Dokumentacja**
   - Zachowaj CSV jako dokumentację migracji
   - Dodaj do repo jako reference

4. **Testing**
   - Po wdrożeniu redirectów, crawluj ponownie
   - Sprawdź czy redirect chain działa

## 🆘 Troubleshooting

### Problem: CSV nie otwiera się poprawnie

**Rozwiązanie:** Import zamiast Open
- Excel: Data → From Text → UTF-8
- Google Sheets: File → Import

### Problem: Polskie znaki są dziwne

**Rozwiązanie:** Sprawdź encoding
- Plik ma UTF-8 BOM
- Przy imporcie wybierz UTF-8

### Problem: Za dużo wierszy dla Excel

**Rozwiązanie:** Podziel plik
```bash
# Linux/macOS
split -l 50000 large.csv part_

# Windows - użyj Python script lub Google Sheets
```

### Problem: Chcę tylko HTML strony

**Rozwiązanie:** Filtruj w Excel
- AutoFilter
- CONTENT_TYPE = "text/html"
- Copy filtered → New sheet

## ✅ Podsumowanie

CSV Export to potężne narzędzie do:
- ✅ Migracji stron (redirect mapping)
- ✅ Content audits
- ✅ Team collaboration
- ✅ SEO analysis
- ✅ Asset inventory

**Podstawowy workflow:**
1. Crawl: `node index.js URL -o file.json`
2. Export: `node json-to-csv.js file.json file.csv`
3. Otwórz w Excel/Google Sheets
4. Wypełnij TARGET_URL
5. Przekaż do zespołu lub import

**Gotowy do eksportu?** 🚀

```bash
node json-to-csv.js results.json
```

