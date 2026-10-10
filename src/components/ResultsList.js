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
                      <li key={i} className={r.good ? styles.reasonGood : styles.reasonBad} style={{ display: 'flex', alignItems: 'flex-start' }}>
                        {r.good ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }}>
                            <circle cx="12" cy="12" r="12" fill="#10b981"/>
                            <path d="M10 15.586l-3.293-3.293 1.414-1.414L10 12.758l5.879-5.879 1.414 1.414L10 15.586z" fill="#fff"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }}>
                            <circle cx="12" cy="12" r="12" fill="#ef4444"/>
                            <path d="M16 9.41L14.59 8 12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41z" fill="#fff"/>
                          </svg>
                        )}
                        <span>{r.text}</span>
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
