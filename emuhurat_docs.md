# eMuhurat — Complete Project Documentation

> **Version:** 0.1.0 | **Stack:** Next.js 16 + Supabase + Python | **Last Updated:** October 2026

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Dataset & Sources](#3-dataset--sources)
4. [Database Architecture](#4-database-architecture)
5. [Algorithms & Calculations](#5-algorithms--calculations)
6. [Frontend Workflow](#6-frontend-workflow)
7. [Backend / Seeding Workflow](#7-backend--seeding-workflow)
8. [Known Bugs](#8-known-bugs)
9. [Remaining Features](#9-remaining-features)
10. [Running the Project](#10-running-the-project)

---

## 1. Project Overview

**eMuhurat** is a Vedic astrology web application that helps users find the most auspicious dates and time windows for major life events such as:
- Marriage (Vivah)
- House Warming (Griha Pravesh)
- Vehicle Purchase
- Property Purchase
- Naming Ceremony (Namakaran)

It combines a 10-year pre-computed Panchang dataset with real-time Choghadiya time-window calculations to present accurate, location-specific Muhurat recommendations.

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | [Next.js](https://nextjs.org/) | 16.3.5 | Full-stack React framework with SSR/SSG |
| **UI Library** | React | 19.2.8 | Component rendering |
| **Styling** | Vanilla CSS Modules | — | Scoped, modular styling per component |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) | — | Cloud database + real-time queries |
| **DB Client (Frontend)** | `@supabase/supabase-js` | ^2.117.2 | JS client for Supabase |
| **Data Seeding** | Python 3 | — | Excel parsing and bulk DB insertion |
| **Excel Parsing** | `openpyxl` | — | Read `.xlsx` Panchang dataset |
| **DB Client (Python)** | `supabase-py` | — | Python client for Supabase |
| **Fonts** | Google Fonts (Outfit) | — | Modern, clean typography |
| **Linting** | ESLint + eslint-config-next | ^9 | Code quality |

---

## 3. Dataset & Sources

### Primary Dataset
- **File:** `India_Panchang_2026_36_Reference_Cities.xlsx`
- **Coverage:** Year 2026 to 2036 (10 years)
- **Scope:** 36 reference cities across India
- **Total rows (expected):** ~13,140 in `panchang_daily` (365 days × 36 cities)

### Columns in the Excel
| Column | Description |
|---|---|
| `date` | Gregorian date (Python `datetime`) |
| `city` | City name matching `locations.city_name` |
| `day` | Weekday name (Vaara) in English |
| `paksha` | Shukla (waxing) or Krishna (waning) |
| `tithi` | Lunar day (Sanskrit name) |
| `nakshatra` | Lunar mansion (Sanskrit name) |
| `pada` | Nakshatra quarter (1–4) |
| `yoga` | Astrological yoga name |
| `karana` | Half-tithi (Karan) name |
| `sunrise` | Sunrise time `HH:MM` |
| `sunset` | Sunset time `HH:MM` |
| `samvat` | Vikram Samvat year |
| `festival` | Festival name if any (may be blank) |

### Are the 10 Years Accurate?
**Yes.** Panchang is derived from the precise orbital mechanics of the Sun and Moon. Because celestial mechanics follow Newtonian/Keplerian physics, future dates can be mathematically computed with millisecond precision using tools like the **Swiss Ephemeris** or NASA JPL data. The data for 2036 is just as accurate as data for 2026 — it is not an estimate.

---

## 4. Database Architecture

All tables live in Supabase's public PostgreSQL schema.

### Lookup Tables (Normalized Reference Data)

| Table | Key Column | Description |
|---|---|---|
| `locations` | `city_name` | 36 Indian cities with coordinates |
| `tithis` | `name` | 30 lunar days (Pratipada → Amavasya) |
| `nakshatras` | `name` | 27 lunar mansions |
| `yogas` | `name` | 27 yogas with `quality` field (Auspicious/Inauspicious) |
| `karanas` | `name` | 11 Karanas (Bava, Balava, etc.) |
| `vaaras` | `name` | 7 weekdays |
| `pakshas` | `name` | Shukla Paksha / Krishna Paksha |
| `festivals` | `name`, `en_name`, `type` | Named festivals (National/Regional) |

### Main Tables

**`panchang_daily`** — Core fact table. One row per city per day.
```
id, gregorian_date, year, month, day_of_month,
location_id → locations.id,
vaara_id    → vaaras.id,
paksha_id   → pakshas.id,
tithi_id    → tithis.id,
nakshatra_id → nakshatras.id,
nakshatra_pada,
yoga_id     → yogas.id,
karana_id   → karanas.id,
sunrise_time, sunset_time,
vikram_samvat
```

**`panchang_festivals`** — Many-to-many bridge between days and festivals.
```
panchang_id → panchang_daily.id,
festival_id → festivals.id,
UNIQUE(panchang_id, festival_id)
```

### Database View

**`v_panchang_full`** — A pre-built PostgreSQL VIEW that joins all lookup tables. This is the **only** table the frontend queries, returning human-readable strings like `tithi_en`, `nakshatra_en`, `yoga_en`, `yoga_quality`, `festivals_en[]`, `reference_city`, etc.

---

## 5. Algorithms & Calculations

### 5.1 Five Panchang Elements (Pancha-anga)
The core of all decisions. These are derived from astronomical positions of the Sun and Moon:

| Element | Derivation | Example |
|---|---|---|
| **Tithi** (Lunar Day) | Angular separation of Moon from Sun ÷ 12° | Shukla Navami |
| **Nakshatra** (Lunar Mansion) | Moon's longitude across 27 × 13°20' sectors | Shravana |
| **Yoga** | (Sun longitude + Moon longitude) ÷ 13°20' | Shula |
| **Karana** | Half a Tithi — 2 per lunar day | Kaulava |
| **Vaara** (Weekday) | Vedic day runs sunrise to sunrise, not midnight | Tuesday |

### 5.2 Event Rule Matrix
**File:** `src/utils/muhuratLogic.js`

Each event type has a defined set of acceptable Vaaras, Nakshatras, and Tithis. A day is marked "Auspicious" only if **all three** match.

```
EVENT_RULES = {
  marriage: {
    good_vaara:     [Monday, Wednesday, Thursday, Friday],
    good_nakshatra: [Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta,
                     Swati, Anuradha, Mula, Uttara Ashadha, Uttara Bhadrapada, Revati],
    good_tithi:     [2, 3, 5, 7, 10, 11, 13]
  },
  griha_pravesh: { ... },
  vehicle:       { ... },
  property:      { ... },
  namakaran:     { ... }
}
```

**Source authority:** Traditional Vedic astrology texts (Muhurta Chintamani, Jataka Parijata). Rules are commonly agreed upon across major Panchang providers (DrikPanchang, AstroSage).

### 5.3 Choghadiya Algorithm (Daytime Time Windows)
**File:** `src/utils/muhuratLogic.js` → `calculateChoghadiya()`

Choghadiya divides the **daytime** into 8 equal segments to identify the best/worst hourly windows.

**Steps:**
1. Parse `sunrise_time` and `sunset_time` from the database (stored as `HH:MM:SS`)
2. Calculate **Daytime Duration** = `sunset - sunrise` (in milliseconds)
3. Divide by 8 → **one Choghadiya block** ≈ 90 minutes (varies by season & location)
4. Look up the sequence for the day's **Vaara** (weekday):

| Vaara | Sequence (Block 1 → Block 8) |
|---|---|
| Sunday | Udveg → Char → Labh → Amrit → Kaal → Shubh → Rog → Udveg |
| Monday | Amrit → Kaal → Shubh → Rog → Udveg → Char → Labh → Amrit |
| Tuesday | Rog → Udveg → Char → Labh → Amrit → Kaal → Shubh → Rog |
| Wednesday | Labh → Amrit → Kaal → Shubh → Rog → Udveg → Char → Labh |
| Thursday | Shubh → Rog → Udveg → Char → Labh → Amrit → Kaal → Shubh |
| Friday | Char → Labh → Amrit → Kaal → Shubh → Rog → Udveg → Char |
| Saturday | Kaal → Shubh → Rog → Udveg → Char → Labh → Amrit → Kaal |

5. Classify each block:
   - **Auspicious (Green):** Amrit, Shubh, Labh, Char
   - **Inauspicious (Red):** Kaal, Rog, Udveg

**Output:** Array of 8 objects `{ name, type, startTime, endTime }` shown in the results UI.

**Source:** [Wikipedia — Choghadiya](https://en.wikipedia.org/wiki/Choghadiya), DrikPanchang methodology.

### 5.4 Vikram Samvat Conversion
```
Vikram Samvat = Gregorian Year + 57  (before Hindu New Year in April)
Vikram Samvat = Gregorian Year + 56  (before Jan 1 of next Gregorian year, after Hindu New Year)
```
Stored directly in `panchang_daily.vikram_samvat` from the source dataset.

### 5.5 Auspiciousness Scoring (Day Evaluation)
```
evaluateDay(dayData, eventType):
  1. Check Vaara → good_vaara for that event?  ✅ / ❌
  2. Check Nakshatra → good_nakshatra?          ✅ / ❌
  3. Extract Tithi number from text             ✅ / ❌
  4. isAuspicious = ALL three pass
  5. Return { isAuspicious, reasons[] }
```

---

## 6. Frontend Workflow

```
User Action
    │
    ▼
MuhuratForm (Event, City, Date Range)
    │
    ▼
handleSearch() in page.js
    │
    ├── Supabase query: v_panchang_full
    │   .eq('reference_city', city)
    │   .gte('gregorian_date', startDate)
    │   .lte('gregorian_date', endDate)
    │   .limit(100)
    │
    ├── evaluateDay(d, eventType)    ← muhuratLogic.js
    │   Returns: isAuspicious, reasons[]
    │
    ├── calculateChoghadiya(date, sunrise, sunset, vaara)  ← muhuratLogic.js
    │   Returns: 8 time blocks with name/type/startTime/endTime
    │
    └── setSearchResults(sortedResults)
             │
             ▼
        ResultsList.js
        ┌─ Day card (Auspicious 🟢 / Avoid 🔴)
        │   ├─ Nakshatra & Tithi summary
        │   └─ [Expand] → Reasons + Choghadiya grid
        └─ ...
```

**Panchang Calendar (Homepage):**
- Queries `v_panchang_full` for the visible month + city
- Highlights days where `yoga_quality = 'Auspicious'`
- Each day links to `/panchang?date=YYYY-MM-DD&city=CityName`

**Daily Panchang Page (`/panchang`):**
- Server-side rendered (Next.js async page)
- Fetches `.single()` record for `date + city`
- Displays: Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset, Paksha, Vikram Samvat, Festivals

---

## 7. Backend / Seeding Workflow

**File:** `seed_panchang_daily.py`

```
1. Connect to Supabase (service_role key)
2. Build in-memory lookup caches for all lookup tables
3. Load Excel: openpyxl.load_workbook(EXCEL_PATH)
4. For each row:
   a. Validate all foreign keys exist in caches
   b. Build panchang_daily record with IDs
   c. Add to batch (BATCH_SIZE = 500)
   d. On batch full: upsert to panchang_daily ON CONFLICT (gregorian_date, location_id)
5. After all rows: link festivals via panchang_festivals table
   a. Build full panchang_map { (date, location_id): panchang_id }
   b. For each festival row: insert panchang_festivals { panchang_id, festival_id }
```

**⚠️ Known Issue in Seeder:** Festival links are created only for the city that has the festival marked in the Excel. For national festivals (Diwali, Dussehra), a one-time SQL fix was applied:

```sql
INSERT INTO panchang_festivals (panchang_id, festival_id)
SELECT DISTINCT pd2.id, pf.festival_id
FROM panchang_festivals pf
JOIN panchang_daily pd  ON pd.id = pf.panchang_id
JOIN panchang_daily pd2 ON pd2.gregorian_date = pd.gregorian_date
WHERE NOT EXISTS (
  SELECT 1 FROM panchang_festivals pf2
  WHERE pf2.panchang_id = pd2.id AND pf2.festival_id = pf.festival_id
)
ON CONFLICT (panchang_id, festival_id) DO NOTHING;
```

---

## 8. Known Bugs

| # | Bug | File | Severity |
|---|---|---|---|
| B1 | Sunrise hardcodes `+ ' AM'` and Sunset `+ ' PM'` regardless of actual time | `panchang/page.js` L38-39 | 🔴 High — displays wrong AM/PM |
| B2 | Panchang calendar city dropdown only has 8 cities; dataset has 36 | `PanchangCalendar.js` | 🟡 Medium |
| B3 | Seeding script links festivals to one city only — future re-seeds will break | `seed_panchang_daily.py` | 🟡 Medium |
| B4 | Header nav links (Services, About) point to `#` — non-functional | `layout.js` | 🟡 Medium |
| B5 | Night Choghadiya not calculated (sunset → next sunrise) | `muhuratLogic.js` | 🟡 Medium |
| B6 | Muhurat results limit 100 records — may miss dates in very long ranges | `page.js` | 🟠 Low |

---

## 9. Remaining Features

### 🔴 High Priority

| Feature | Description |
|---|---|
| **Rahu Kalam** | A ~90 min inauspicious period every day, calculated from sunrise based on weekday. Every Panchang app shows this. Formula: `(Rahu index for weekday × day-duration/8)`. Should appear on the daily Panchang page. |
| **Yamagandam & Gulika Kalam** | Similar inauspicious periods. These are standard Panchang elements users will expect. |
| **Today's Panchang on Homepage** | A quick-view card on the homepage showing today's Tithi, Nakshatra, and any festivals. Makes the app feel live and useful every day. |

### 🟡 Medium Priority

| Feature | Description |
|---|---|
| **Night Choghadiya** | Sunset → next sunrise divided into 8 blocks with a shifted sequence. Currently only daytime is shown. |
| **Mobile responsiveness** | The 7-column calendar grid uses `min-width: 800px` and breaks on mobile. Needs a mobile-friendly card list or horizontal scroll fix. |
| **Month/Year jump selector** | Clicking next/prev month is tedious for navigating 10 years of data. A dropdown year+month picker is needed. |
| **"Jump to today" button** | A quick button to snap back to the current month on the calendar. |

### 🟠 Low Priority

| Feature | Description |
|---|---|
| **Privacy Policy / Terms of Service pages** | Footer links currently point to `#`. Stubs needed. |
| **Contact Us page** | Basic contact/feedback form. |
| **More cities** | Expose all 36 cities from the dataset in both the Panchang calendar and Muhurat form dropdowns. |
| **Expand Muhurat form result filter** | Allow filtering results to show only Auspicious or only Inauspicious days. |

### 🔵 Future / Advanced

| Feature | Description |
|---|---|
| **Personalized Muhurat (Birth Chart)** | Input user's Rashi (Moon sign) and Nakshatra to calculate Tara Balam — further refining which dates are personally auspicious for that specific individual. |
| **Lagna Calculation** | For premium accuracy on critical events (especially marriage), calculating the exact rising sign (Lagna) for a specific hour using Swiss Ephemeris. |
| **Push Notifications** | Notify users of upcoming auspicious dates for their saved events. |

---

## 10. Running the Project

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account with the schema set up

### Frontend (Next.js)
```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env.local:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start dev server
npm run dev
# → http://localhost:3000
```

### Data Seeding (Python)
```bash
pip install openpyxl supabase

# Edit SUPABASE_URL and SUPABASE_KEY in the script
python seed_panchang_daily.py

# After seeding, run the festival propagation SQL in Supabase SQL Editor
# (see Section 7 above)
```

### Production Build
```bash
npm run build
npm run start
```

---

*Documentation maintained alongside the codebase. Update this file whenever significant changes are made to algorithms, schema, or feature set.*
