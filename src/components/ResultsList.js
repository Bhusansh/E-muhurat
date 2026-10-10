import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ResultsList.module.css';

// ── Individual date card ──────────────────────────────────────────────────────
function DateCard({ result, expandedDate, toggleExpand }) {
  return (
    <motion.div
      className={`${styles.resultCard} glass ${result.isAuspicious ? styles.auspiciousCard : styles.inauspiciousCard}`}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
      }}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    >
      <div className={styles.cardHeader} onClick={() => toggleExpand(result.id)}>
        <div className={styles.dateInfo}>
          <span className={styles.day}>{result.day}</span>
          <span className={styles.date}>{result.date}</span>
        </div>
        <motion.div
          className={styles.expandIcon}
          animate={{ rotate: expandedDate === result.id ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          ▼
        </motion.div>
      </div>

      <div className={styles.summaryDetails}>
        <div><strong>Nakshatra:</strong> {result.nakshatra.split(' ')[0]}</div>
        <div><strong>Tithi:</strong> {result.tithi.split(' ')[0]}</div>
      </div>

      <AnimatePresence initial={false}>
        {expandedDate === result.id && (
          <motion.div
            className={styles.expandedContent}
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Collapsible group ─────────────────────────────────────────────────────────
function GroupSection({ title, count, isOpen, onToggle, children, accentColor, icon }) {
  return (
    <div className={styles.groupSection}>
      <motion.button
        className={styles.groupHeader}
        style={{ '--accent': accentColor }}
        onClick={onToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className={styles.groupHeaderLeft}>
          <span className={styles.groupIcon}>{icon}</span>
          <span className={styles.groupTitle}>{title}</span>
          <span className={styles.groupCount} style={{ background: accentColor }}>{count}</span>
        </div>
        <motion.span
          className={styles.groupChevron}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="group-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <motion.div
              className={styles.cardsGrid}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
              style={{ paddingTop: '12px' }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ResultsList ──────────────────────────────────────────────────────────
export default function ResultsList({ results, isLoading }) {
  const [expandedDate, setExpandedDate] = useState(null);
  const [auspiciousOpen, setAuspiciousOpen] = useState(true);
  const [inauspiciousOpen, setInauspiciousOpen] = useState(false);

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
    setExpandedDate(prev => prev === id ? null : id);
  };

  const auspicious = results.filter(r => r.isAuspicious);
  const inauspicious = results.filter(r => !r.isAuspicious);

  return (
    <div className={styles.resultsContainer} id="results">
      <h3 className={styles.resultsTitle}>Panchang &amp; Muhurat Results</h3>
      <p className={styles.resultsSubtitle}>Based on exact planetary alignments and Choghadiya calculations.</p>

      <div className={styles.groupsWrapper}>
        {/* ── Auspicious group ── */}
        <GroupSection
          title="Auspicious Days"
          count={auspicious.length}
          isOpen={auspiciousOpen}
          onToggle={() => setAuspiciousOpen(p => !p)}
          accentColor="#22c55e"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#22c55e"/>
              <path d="M10 15.586l-3.293-3.293 1.414-1.414L10 12.758l5.879-5.879 1.414 1.414L10 15.586z" fill="#fff"/>
            </svg>
          }
        >
          {auspicious.length === 0 ? (
            <p className={styles.emptyGroup}>No auspicious days found in this range.</p>
          ) : (
            auspicious.map(result => (
              <DateCard key={result.id} result={result} expandedDate={expandedDate} toggleExpand={toggleExpand} />
            ))
          )}
        </GroupSection>

        {/* ── Inauspicious group ── */}
        <GroupSection
          title="Days to Avoid"
          count={inauspicious.length}
          isOpen={inauspiciousOpen}
          onToggle={() => setInauspiciousOpen(p => !p)}
          accentColor="#ef4444"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#ef4444"/>
              <path d="M16 9.41L14.59 8 12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41z" fill="#fff"/>
            </svg>
          }
        >
          {inauspicious.length === 0 ? (
            <p className={styles.emptyGroup}>No inauspicious days in this range.</p>
          ) : (
            inauspicious.map(result => (
              <DateCard key={result.id} result={result} expandedDate={expandedDate} toggleExpand={toggleExpand} />
            ))
          )}
        </GroupSection>
      </div>
    </div>
  );
}
