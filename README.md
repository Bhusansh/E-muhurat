# E-muhurat

## Overview
E-muhurat is a web application designed to provide accurate Panchang (Hindu Calendar) details and Muhurat information based on different locations in India. It aims to offer an easy-to-use interface to check daily Tithi, Nakshatra, Yoga, Karana, and other astrological parameters, as well as festivals, ensuring users can find auspicious timings conveniently.

## Tech Stack
- **Frontend**: [Next.js](https://nextjs.org/) (v16.3.5) with React (v19).
- **Styling**: Vanilla CSS Modules for a highly customized, clean, and modern user interface.
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL-based Backend-as-a-Service) for fast and scalable data storage and retrieval.
- **Data Processing**: Python for data seeding and preprocessing.

## Dataset
The application relies on an extensive dataset of Panchang data spanning multiple years (e.g., 2026 to 2036). 
- **Source File**: `India_Panchang_2026_36_Reference_Cities.xlsx`
- The dataset contains daily astrological information including Sunrise, Sunset, Tithi, Nakshatra, Yoga, Karana, Paksha, Vikram Samvat, and Festivals for several reference cities across India.

## Database Schema
The database architecture uses a normalized relational model in Supabase, primarily consisting of lookup tables to minimize redundancy and main transactional tables. 

### Core Tables
1. **Lookup Tables**:
   - `locations` (Cities)
   - `tithis`
   - `nakshatras`
   - `yogas`
   - `karanas`
   - `vaaras` (Days of the week)
   - `pakshas`
   - `festivals`

2. **Main Tables**:
   - `panchang_daily`: Stores the daily parameters mapped via foreign keys to the lookup tables (e.g., `location_id`, `tithi_id`, etc.), along with specific timings (sunrise/sunset) and Gregorian dates.
   - `panchang_festivals`: A many-to-many relationship table linking specific `panchang_daily` entries to `festivals`.

## Workflow & Approach
### 1. Data Ingestion (Backend Workflow)
- The raw Excel dataset is parsed using a Python script (`seed_panchang_daily.py`) powered by the `openpyxl` library.
- The script establishes a connection to the Supabase database using the official Python client.
- It first builds an in-memory cache of all lookup tables to avoid excessive API calls.
- It iterates through the Excel rows, mapping text values to their corresponding database IDs.
- Data is batched and inserted/upserted into the `panchang_daily` table for high performance.
- Finally, it links festivals to their respective dates in the `panchang_festivals` table.

### 2. Application Flow (Frontend Workflow)
- **User Interface**: The frontend built with Next.js provides a responsive and visually appealing interface.
- **Data Fetching**: The Next.js application connects to Supabase using `@supabase/supabase-js`.
- **Querying**: When a user selects a date and location, the application queries the `panchang_daily` table. It performs joins across the normalized lookup tables to retrieve the human-readable names of the astrological properties (Tithi, Nakshatra, etc.).
- **Rendering**: The data is displayed to the user in an organized calendar/list format, complete with modern styling and micro-animations for an excellent user experience.

## Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Data Seeding** (Optional, if setting up a new DB):
   Ensure your Python environment has `openpyxl` and `supabase` installed.
   ```bash
   pip install openpyxl supabase
   python seed_panchang_daily.py
   ```
