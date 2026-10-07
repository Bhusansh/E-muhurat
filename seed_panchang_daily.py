# seed_panchang_daily.py

import openpyxl
from supabase import create_client, Client
from datetime import time as dtime

SUPABASE_URL = "https://cbghsukhyrrpztbjfapn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZ2hzdWtoeXJycHp0YmpmYXBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDUwNzgxMCwiZXhwIjoyMTA2MDgzODEwfQ.Eg25R2uK324MMtTqpYIdWSyZXNGMyIfamkGQtiLfrNE"
EXCEL_PATH   = "India_Panchang_2026_36_Reference_Cities.xlsx"
BATCH_SIZE   = 500

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_time(t_str):
    h, m = map(int, t_str.strip().split(":"))
    return dtime(h, m).isoformat()

def build_cache(table, key_col, val_col="id"):
    rows = supabase.table(table).select(f"{val_col},{key_col}").execute().data
    return {r[key_col]: r[val_col] for r in rows}

def insert_batch(table, batch, on_conflict):
    supabase.table(table).upsert(batch, on_conflict=on_conflict).execute()

print("Building lookup caches...")
locations  = build_cache("locations",  "city_name")
tithis     = build_cache("tithis",     "name")
nakshatras = build_cache("nakshatras", "name")
yogas      = build_cache("yogas",      "name")
karanas    = build_cache("karanas",    "name")
vaaras     = build_cache("vaaras",     "name")
pakshas    = build_cache("pakshas",    "name")
festivals  = build_cache("festivals",  "name")

print(f"  locations:{len(locations)} tithis:{len(tithis)} nakshatras:{len(nakshatras)}")
print(f"  yogas:{len(yogas)} karanas:{len(karanas)} vaaras:{len(vaaras)} pakshas:{len(pakshas)}")

print(f"\nReading Excel...")
wb = openpyxl.load_workbook(EXCEL_PATH, read_only=True)
ws = wb["India Panchang 2026"]

batch, fest_links, errors, total_rows = [], [], [], 0

print("Processing rows...")
for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
    date, city, day, paksha, tithi, nakshatra, pada, yoga, karana, \
        sunrise, sunset, samvat, festival = row
    if date is None:
        continue
    date_str = date.date().isoformat()
    missing = []
    if city      not in locations:  missing.append(f"location='{city}'")
    if day       not in vaaras:     missing.append(f"vaara='{day}'")
    if paksha    not in pakshas:    missing.append(f"paksha='{paksha}'")
    if tithi     not in tithis:     missing.append(f"tithi='{tithi}'")
    if nakshatra not in nakshatras: missing.append(f"nakshatra='{nakshatra}'")
    if yoga      not in yogas:      missing.append(f"yoga='{yoga}'")
    if karana    not in karanas:    missing.append(f"karana='{karana}'")
    if missing:
        errors.append(f"Row {i} [{date_str}]: {', '.join(missing)}")
        continue
    batch.append({
        "gregorian_date": date_str,
        "location_id":    locations[city],
        "vaara_id":       vaaras[day],
        "paksha_id":      pakshas[paksha],
        "tithi_id":       tithis[tithi],
        "nakshatra_id":   nakshatras[nakshatra],
        "nakshatra_pada": int(pada),
        "yoga_id":        yogas[yoga],
        "karana_id":      karanas[karana],
        "sunrise_time":   parse_time(sunrise),
        "sunset_time":    parse_time(sunset),
        "vikram_samvat":  int(samvat),
    })
    total_rows += 1
    if festival:
        fest_links.append((date_str, city, festival))
    if len(batch) >= BATCH_SIZE:
        insert_batch("panchang_daily", batch, "gregorian_date,location_id")
        print(f"  Inserted {total_rows} rows...")
        batch.clear()

if batch:
    insert_batch("panchang_daily", batch, "gregorian_date,location_id")

print(f"\nInserted {total_rows} panchang_daily rows.")
if errors:
    print(f"  {len(errors)} rows skipped:")
    for e in errors[:20]: print(" ", e)

if fest_links:
    print(f"\nLinking {len(fest_links)} festival associations...")
    all_records = supabase.table("panchang_daily").select("id,gregorian_date,location_id").execute().data
    panchang_map = {(r["gregorian_date"], r["location_id"]): r["id"] for r in all_records}
    links = []
    for date_str, city, fest_name in fest_links:
        p_id = panchang_map.get((date_str, locations.get(city)))
        f_id = festivals.get(fest_name)
        if p_id and f_id:
            links.append({"panchang_id": p_id, "festival_id": f_id})
    for start in range(0, len(links), BATCH_SIZE):
        insert_batch("panchang_festivals", links[start:start + BATCH_SIZE], "panchang_id,festival_id")
    print(f"  Linked {len(links)} festival records.")

count = supabase.table("panchang_daily").select("id", count="exact").execute().count
print(f"\nDone! panchang_daily total rows: {count}  (expected: 13140)")
