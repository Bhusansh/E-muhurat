import styles from './PanchangCalendar.module.css';

export default function PanchangCalendar() {
  // Mock data for a calendar week
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = [
    { date: 15, tithi: 'Pratipada', nakshatra: 'Ashwini', auspicious: true },
    { date: 16, tithi: 'Dwitiya', nakshatra: 'Bharani', auspicious: false },
    { date: 17, tithi: 'Tritiya', nakshatra: 'Krittika', auspicious: false },
    { date: 18, tithi: 'Chaturthi', nakshatra: 'Rohini', auspicious: false },
    { date: 19, tithi: 'Panchami', nakshatra: 'Mrigashirsha', auspicious: true },
    { date: 20, tithi: 'Shashthi', nakshatra: 'Ardra', auspicious: false },
    { date: 21, tithi: 'Saptami', nakshatra: 'Punarvasu', auspicious: true },
  ];

  return (
    <div className={`${styles.calendarContainer} glass`} id="panchang">
      <div className={styles.header}>
        <h2 className={styles.title}>Weekly Panchang Overview</h2>
        <span className={styles.month}>October 2026</span>
      </div>
      
      <div className={styles.grid}>
        {days.map(day => (
          <div key={day} className={styles.dayHeader}>{day}</div>
        ))}
        
        {dates.map((d, i) => (
          <div key={i} className={`${styles.dayCell} ${d.auspicious ? styles.auspicious : ''}`}>
            <div className={styles.dateNumber}>{d.date}</div>
            <div className={styles.details}>
              <div className={styles.tithi}>{d.tithi}</div>
              <div className={styles.nakshatra}>{d.nakshatra}</div>
            </div>
            {d.auspicious && <div className={styles.indicator}>Auspicious</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
