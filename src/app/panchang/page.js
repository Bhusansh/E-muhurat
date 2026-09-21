import styles from './page.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Daily Panchang - eMuhurat',
  description: 'Detailed daily Panchang including Sunrise, Sunset, Rahu Kaal, Yamaganda, and Gulika Kaal.',
};

export default function PanchangPage() {
  // Mock data for today's panchang
  const panchangData = {
    date: 'October 21, 2026',
    day: 'Wednesday',
    sunrise: '06:23 AM',
    sunset: '05:48 PM',
    moonrise: '11:45 AM',
    moonset: '10:30 PM',
    tithi: 'Saptami (up to 03:45 PM)',
    nakshatra: 'Punarvasu (up to 08:20 PM)',
    yoga: 'Siddhi',
    karana: 'Bava',
    rahuKaal: '12:05 PM - 01:31 PM',
    yamaganda: '07:49 AM - 09:14 AM',
    gulikaKaal: '10:40 AM - 12:05 PM',
    auspicious: true,
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className={styles.header}>
        <Link href="/" className={styles.backBtn}>Back to Home</Link>
        <h1 className={styles.title}>Detailed Daily Panchang</h1>
        <p className={styles.date}>{panchangData.day}, {panchangData.date}</p>
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
          <h2 className={styles.cardTitle}>Sun & Moon Timings</h2>
          <div className={styles.row}>
            <span className={styles.label}>Sunrise</span>
            <span className={styles.value}>{panchangData.sunrise}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Sunset</span>
            <span className={styles.value}>{panchangData.sunset}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Moonrise</span>
            <span className={styles.value}>{panchangData.moonrise}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Moonset</span>
            <span className={styles.value}>{panchangData.moonset}</span>
          </div>
        </div>

        {/* Inauspicious Timings */}
        <div className={`${styles.card} glass ${styles.inauspiciousCard}`}>
          <h2 className={styles.cardTitle}>Inauspicious Timings (Avoid)</h2>
          <div className={styles.row}>
            <span className={styles.label}>Rahu Kaal</span>
            <span className={styles.value}>{panchangData.rahuKaal}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Yamaganda</span>
            <span className={styles.value}>{panchangData.yamaganda}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Gulika Kaal</span>
            <span className={styles.value}>{panchangData.gulikaKaal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
