import styles from './ResultsList.module.css';

export default function ResultsList({ results, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Calculating auspicious times...</p>
      </div>
    );
  }

  if (!results) return null;

  if (results.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>No suitable Muhurats found for the selected dates and location.</p>
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer} id="results">
      <h3 className={styles.resultsTitle}>Auspicious Dates Found</h3>
      <div className={styles.cardsGrid}>
        {results.map((result, index) => (
          <div key={index} className={`${styles.resultCard} glass`}>
            <div className={styles.dateHeader}>
              <span className={styles.day}>{result.day}</span>
              <span className={styles.date}>{result.date}</span>
            </div>
            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Time Window:</span>
                <span className={styles.value}>{result.timeWindow}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Nakshatra:</span>
                <span className={styles.value}>{result.nakshatra}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Tithi:</span>
                <span className={styles.value}>{result.tithi}</span>
              </div>
            </div>
            <div className={styles.reasonBlock}>
              <div className={styles.reasonTitle}>Why this date?</div>
              <p className={styles.reasonText}>{result.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
