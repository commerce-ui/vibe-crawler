# Live Save & Resume - Przewodnik

## 🎯 Po co Live Saving?

Live saving chroni Twoje dane przed utratą w przypadku:
- ❌ Awarii programu
- ❌ Błędu sieciowego
- ❌ Przerwania (Ctrl+C)
- ❌ Awarii systemu
- ❌ Timeout na dużych stronach

## 💾 Jak działa Live Saving?

Crawler automatycznie zapisuje postęp **co 5 znalezionych URLi** (domyślnie).

```bash
# Podstawowe użycie - automatyczny zapis co 5 URLi
node index.js https://example.com

# Częstszy zapis - co 3 URLi (bezpieczniejsze)
node index.js https://example.com --save-interval 3

# Rzadszy zapis - co 20 URLi (szybsze, mniej operacji I/O)
node index.js https://example.com --save-interval 20
```

### Co jest zapisywane?

Plik JSON zawiera:
- ✅ Wszystkie znalezione URLe z content-type
- ✅ Metadata (data rozpoczęcia, URL startowy, max depth)
- ✅ Stan kolejki (pierwsze 100 URLi do odwiedzenia)
- ✅ Status crawlowania (`inProgress: true/false`)
- ✅ Informacje o błędach (jeśli wystąpiły)

## 🔄 Wznawianie Crawlowania

### Scenariusz 1: Crawler się zawiesił

```bash
# Pierwsze uruchomienie
node index.js https://example.com -o mycrawl.json

# ... crawler się zawiesza po 50 URLach ...

# Wznów od miejsca przerwania
node index.js https://example.com --resume -o mycrawl.json
```

### Scenariusz 2: Celowe przerwanie (Ctrl+C)

```bash
# Zacznij crawlować
node index.js https://duza-strona.com -o duza.json

# Naciśnij Ctrl+C aby przerwać...

# Później wróć i dokończ
node index.js https://duza-strona.com --resume -o duza.json
```

### Scenariusz 3: Testowanie z resume

```bash
# Crawluj tylko 2 poziomy, zapisuj często
node index.js https://example.com -d 2 -s 3 -o test.json

# Sprawdź wyniki, potem crawluj głębiej
node index.js https://example.com -d 5 --resume -o test.json
```

## 📊 Monitorowanie Postępu

Możesz oglądać plik wynikowy w czasie rzeczywistym:

```bash
# Terminal 1: Uruchom crawlera
node index.js https://example.com -o results.json

# Terminal 2: Obserwuj postęp
watch -n 2 "cat results.json | grep -o '\"url\"' | wc -l"

# Lub po prostu otwórz results.json w edytorze
```

## ⚙️ Zaawansowane Użycie

### Bardzo duża strona, maksymalne bezpieczeństwo

```bash
# Zapisuj co 1 URL, bez limitu głębokości
node index.js https://ogromna-strona.com -s 1 -o ogromna.json
```

### Szybki crawl z okazjonalnym zapisem

```bash
# Zapisuj co 50 URLi, max 3 poziomy
node index.js https://example.com -s 50 -d 3 -o szybki.json
```

### Crawl tylko obrazów z resumem

```bash
# Pierwszy run
node index.js https://example.com -f "image/" -o obrazy.json

# Jeśli przerwane, wznów
node index.js https://example.com --resume -o obrazy.json

# Uwaga: filter działa tylko na wyświetlaniu, plik ma wszystkie URLe
```

## 🔍 Sprawdzanie Stanu Pliku

Plik wynikowy zawiera pole `inProgress`:
- `"inProgress": true` - Crawl był przerwany
- `"inProgress": false` - Crawl zakończony prawidłowo

```bash
# Sprawdź czy crawl jest kompletny
cat results.json | grep "inProgress"

# Sprawdź ile URLi znaleziono
cat results.json | grep "totalUrls"

# Sprawdź czy były błędy
cat results.json | grep "error"
```

## 💡 Najlepsze Praktyki

1. **Dla małych stron** (< 100 stron):
   ```bash
   node index.js https://small-site.com
   # Domyślne ustawienia są OK
   ```

2. **Dla średnich stron** (100-1000 stron):
   ```bash
   node index.js https://medium-site.com -s 10 -d 5
   # Zapisuj co 10 URLi, max 5 poziomów
   ```

3. **Dla dużych stron** (1000+ stron):
   ```bash
   node index.js https://huge-site.com -s 5 -d 3 -o huge.json
   # Częste zapisy, ogranicz głębokość
   # Możesz przerwać i wznowić w dowolnym momencie
   ```

4. **Dla niestabilnej sieci**:
   ```bash
   node index.js https://example.com -s 3
   # Bardzo częste zapisy
   ```

## 🚨 Troubleshooting

### Problem: Resume nie działa

**Sprawdź:**
1. Czy używasz tego samego pliku output (`-o`)
2. Czy URL startowy jest identyczny
3. Czy plik JSON nie jest uszkodzony

```bash
# Waliduj JSON
cat results.json | python -m json.tool > /dev/null
echo $?  # Powinno być 0
```

### Problem: Zbyt duży plik JSON

**Rozwiązanie:** Zwiększ save-interval

```bash
# Zamiast co 5 URLi, zapisuj co 50
node index.js https://example.com -s 50
```

### Problem: Chcę zacząć od nowa

**Rozwiązanie:** Po prostu usuń stary plik

```bash
rm results.json
node index.js https://example.com
```

## 📝 Format Pliku State

```json
{
  "crawledAt": "2025-10-08T12:00:00.000Z",
  "lastUpdated": "2025-10-08T12:05:30.000Z",
  "startUrl": "https://example.com",
  "maxDepth": "unlimited",
  "totalUrls": 47,
  "inProgress": true,
  "queue": [
    { "url": "https://example.com/page", "depth": 1 }
  ],
  "allResults": [
    { "url": "https://example.com", "contentType": "text/html" },
    { "url": "https://example.com/style.css", "contentType": "text/css" }
  ]
}
```

## 🎉 Podsumowanie

Live saving i resume to kluczowe funkcje dla:
- ✅ Bezpieczeństwa danych
- ✅ Długotrwałych crawlów
- ✅ Eksperymentowania (start-stop-resume)
- ✅ Monitorowania postępu
- ✅ Odzyskiwania po błędach

**Crawluj bez obaw - Twoje dane są bezpieczne!** 💪

