import { useState } from 'react';
import styles from './ResultsList.module.css';

export default function ResultsList({ results, isLoading }) {
  const [expandedDate, setExpandedDate] = useState(null);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Calculating accurate Panchang and Choghadiya timings...</p>
      </div>
    );
  }

  if (!results) return null;

  if (results.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>No results found for the selected dates and location.</p>
      </div>
    );
  }

  const toggleExpand = (id) => {
    if (expandedDate === id) setExpandedDate(null);
    else setExpandedDate(id);
  };

  return (
    <div className={styles.resultsContainer} id="results">
      <h3 className={styles.resultsTitle}>Detailed Panchang & Muhurat Results</h3>
      <p className={styles.resultsSubtitle}>Based on exact planetary alignments and Choghadiya calculations.</p>
      
      <div className={styles.cardsGrid}>
        {results.map((result) => (
          <div 
            key={result.id} 
            className={`${styles.resultCard} glass ${result.isAuspicious ? styles.auspiciousCard : styles.inauspiciousCard}`}
          >
            <div className={styles.cardHeader} onClick={() => toggleExpand(result.id)}>
              <div className={styles.dateInfo}>
                <span className={styles.day}>{result.day}</span>
                <span className={styles.date}>{result.date}</span>
                <span className={`${styles.badge} ${result.isAuspicious ? styles.badgeGood : styles.badgeBad}`}>
                  {result.isAuspicious ? '✓ Auspicious' : '✕ Avoid'}
                </span>
              </div>
              <div className={styles.expandIcon}>
                {expandedDate === result.id ? '▲' : '▼'}
              </div>
            </div>

            <div className={styles.summaryDetails}>
              <div><strong>Nakshatra:</strong> {result.nakshatra.split(' ')[0]}</div>
              <div><strong>Tithi:</strong> {result.tithi.split(' ')[0]}</div>
            </div>

            {expandedDate === result.id && (
              <div className={styles.expandedContent}>
                <div className={styles.reasonBlock}>
                  <h4 className={styles.sectionTitle}>Why is this day {result.isAuspicious ? 'Good' : 'Bad'}?</h4>
                  <ul className={styles.reasonList}>
                    {result.reasons.map((r, i) => (
                      <li key={i} className={r.good ? styles.reasonGood : styles.reasonBad}>
                        {r.good ? '✅ ' : '❌ '}{r.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.choghadiyaBlock}>
                  <h4 className={styles.sectionTitle}>Daytime Choghadiya (Muhurat Windows)</h4>
                  <div className={styles.choghadiyaGrid}>
                    {result.choghadiyas.map((ch, i) => (
                      <div 
                        key={i} 
                        className={`${styles.choghadiyaItem} ${ch.type === 'Good' ? styles.cGood : ch.type === 'Bad' ? styles.cBad : styles.cNeutral}`}
                      >
                        <div className={styles.cTime}>{ch.startTime} - {ch.endTime}</div>
                        <div className={styles.cName}>{ch.name}</div>
                        <div className={styles.cDesc}>{ch.type === 'Good' ? 'Auspicious' : ch.type === 'Bad' ? 'Avoid' : 'Neutral'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
