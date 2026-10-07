import styles from './page.module.css';
import Link from 'next/link';
import { supabase } from '../../utils/supabase';

export const metadata = {
  title: 'Daily Panchang - eMuhurat',
  description: 'Detailed daily Panchang including Sunrise, Sunset, Rahu Kaal, Yamaganda, and Gulika Kaal.',
};

export default async function PanchangPage({ searchParams }) {
  const params = await searchParams;
  // Since our dataset is for 2026, let's default to Jan 1, 2026 for demo purposes.
  // In production, you would use today's date: new Date().toISOString().split('T')[0]
  const dateStr = params?.date || '2026-01-01';
  const city = params?.city || 'New Delhi';

  // Fetch real data from the view we created
  const { data: dbData, error } = await supabase
    .from('v_panchang_full')
    .select('*')
    .eq('gregorian_date', dateStr)
    .eq('reference_city', city)
    .single();

  if (error || !dbData) {
    return (
      <div className="container" style={{ padding: '40px 24px' }}>
        <h2 style={{ color: 'white' }}>Panchang data not found for {city} on {dateStr}</h2>
        <Link href="/" className={styles.backBtn}>Back to Home</Link>
      </div>
    );
  }

  // Map database data to UI format
  const panchangData = {
    date: new Date(dbData.gregorian_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    day: dbData.vaara_en,
    sunrise: dbData.sunrise_time.substring(0, 5) + ' AM', 
    sunset: dbData.sunset_time.substring(0, 5) + ' PM',
    tithi: `${dbData.tithi_en} (${dbData.tithi})`,
    nakshatra: `${dbData.nakshatra_en} (${dbData.nakshatra})`,
    yoga: `${dbData.yoga_en} (${dbData.yoga}) - ${dbData.yoga_quality}`,
    karana: `${dbData.karana_en} (${dbData.karana})`,
    festivals: dbData.festivals_en ? dbData.festivals_en.join(', ') : 'None',
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className={styles.header}>
        <Link href="/" className={styles.backBtn}>Back to Home</Link>
        <h1 className={styles.title}>Detailed Daily Panchang</h1>
        <p className={styles.date}>{panchangData.day}, {panchangData.date} | {city}</p>
      </div>

      <div className={styles.grid}>
        {/* Main Details */}
        <div className={`${styles.card} glass`}>
          <h2 className={styles.cardTitle}>Panchang Elements</h2>
          <div className={styles.row}>
            <span className={styles.label}>Tithi</span>
            <span className={styles.value}>{panchangData.tithi}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Nakshatra</span>
            <span className={styles.value}>{panchangData.nakshatra}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Yoga</span>
            <span className={styles.value}>{panchangData.yoga}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Karana</span>
            <span className={styles.value}>{panchangData.karana}</span>
          </div>
        </div>

        {/* Timings */}
        <div className={`${styles.card} glass`}>
          <h2 className={styles.cardTitle}>Sun Timings & Details</h2>
          <div className={styles.row}>
            <span className={styles.label}>Sunrise</span>
            <span className={styles.value}>{panchangData.sunrise}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Sunset</span>
            <span className={styles.value}>{panchangData.sunset}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Paksha</span>
            <span className={styles.value}>{dbData.paksha}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Vikram Samvat</span>
            <span className={styles.value}>{dbData.vikram_samvat}</span>
          </div>
        </div>

        {/* Festivals & Events */}
        <div className={`${styles.card} glass ${dbData.festivals ? styles.auspiciousCard : ''}`}>
          <h2 className={styles.cardTitle}>Festivals & Vrats</h2>
          <div className={styles.row}>
            <span className={styles.label}>Events</span>
            <span className={styles.value}>{panchangData.festivals}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Auspiciousness</span>
            <span className={styles.value}>{dbData.yoga_quality} Yoga</span>
          </div>
        </div>
      </div>
    </div>
  );
}
