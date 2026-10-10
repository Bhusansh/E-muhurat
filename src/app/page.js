'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';
import { supabase } from '../utils/supabase';
import MuhuratForm from '@/components/MuhuratForm';
import ResultsList from '@/components/ResultsList';
import PanchangCalendar from '@/components/PanchangCalendar';
import { FadeInView, StaggerContainer, StaggerItem, ScaleIn } from '@/components/AnimatedSection';

export default function Home() {
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState('marriage');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const serviceToEventValue = {
    'Marriage (Vivah)': 'marriage',
    'House Warming (Griha Pravesh)': 'griha_pravesh',
    'Vehicle Purchase': 'vehicle',
    'Property Purchase': 'property',
    'Naming Ceremony (Namakaran)': 'namakaran'
  };

  const handleCheckDatesClick = (service) => {
    setSelectedEventType(serviceToEventValue[service] || 'marriage');
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async (formData) => {
    setIsLoading(true);
    setSearchResults(null);

    try {
      const { evaluateDay, calculateChoghadiya } = await import('../utils/muhuratLogic');
      
      const { data, error } = await supabase
        .from('v_panchang_full')
        .select('*')
        .eq('reference_city', formData.location)
        .gte('gregorian_date', formData.startDate)
        .lte('gregorian_date', formData.endDate)
        .order('gregorian_date', { ascending: true })
        .limit(100); 

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedResults = data.map(d => {
          const dateObj = new Date(d.gregorian_date);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          const dateString = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
          
          const { isAuspicious, reasons } = evaluateDay(d, formData.eventType);
          
          const choghadiyas = calculateChoghadiya(
            d.gregorian_date, 
            d.sunrise_time, 
            d.sunset_time, 
            d.vaara_en
          );
          
          return {
            id: d.id,
            day: dayName,
            date: dateString,
            isAuspicious,
            reasons,
            choghadiyas,
            nakshatra: d.nakshatra_en || 'Unknown',
            tithi: d.tithi_en || 'Unknown',
          };
        });
        
        const sortedResults = formattedResults.sort((a, b) => (a.isAuspicious === b.isAuspicious) ? 0 : a.isAuspicious ? -1 : 1);
        setSearchResults(sortedResults);
      } else {
        setSearchResults([]); 
      }
    } catch (err) {
      console.error("Error fetching muhurat:", err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Hero text animation variants
  const heroTitleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className={styles.title}>
            Begin Your Journey at the{' '}
            <motion.span
              style={{ color: 'var(--primary)', display: 'inline-block' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              Perfect Time
            </motion.span>
          </h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Discover precisely calculated auspicious Muhurats for marriage, griha pravesh, vehicle purchases, and other significant life milestones.
          </motion.p>
          <motion.div
            className={styles.ctaGroup}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.button
              className={styles.primaryBtn}
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              Find a Muhurat
            </motion.button>
            <motion.button
              className={styles.secondaryBtn}
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              Explore Services
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.heroImage}
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {isMounted && (
            <svg width="340" height="340" viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 60s linear infinite' }}>
              <defs>
                <radialGradient id="planetGrad" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#92400e" stopOpacity="0.95" />
                </radialGradient>
                <radialGradient id="moonGrad" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#e8e0c8" />
                  <stop offset="100%" stopColor="#9ca3af" />
                </radialGradient>
              </defs>

              <circle cx="170" cy="170" r="158" fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1" />
              <circle cx="170" cy="170" r="148" fill="none" stroke="rgba(245,158,11,0.07)" strokeWidth="0.5" />

              {Array.from({length:12}, (_,i) => {
                const angle = i * 30 * Math.PI / 180;
                const r1 = 150, r2 = 158;
                return (
                  <line key={i}
                    x1={170 + r1 * Math.sin(angle)} y1={170 - r1 * Math.cos(angle)}
                    x2={170 + r2 * Math.sin(angle)} y2={170 - r2 * Math.cos(angle)}
                    stroke="rgba(245,158,11,0.45)" strokeWidth={i % 3 === 0 ? 2 : 1}
                  />
                );
              })}

              {[0, 60, 120, 180, 240, 300].map(angle => {
                const x = 170 + 158 * Math.cos((angle - 90) * Math.PI / 180);
                const y = 170 + 158 * Math.sin((angle - 90) * Math.PI / 180);
                return <circle key={angle} cx={x} cy={y} r="2.5" fill="rgba(245,158,11,0.6)" />;
              })}

              <circle cx="170" cy="170" r="130" fill="none" stroke="rgba(245,158,11,0.22)" strokeWidth="1" strokeDasharray="5 9" />
              <circle cx="170" cy="170" r="108" fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth="1" />
              <circle cx="170" cy="170" r="82" fill="none" stroke="rgba(245,158,11,0.14)" strokeWidth="1" strokeDasharray="2 7" />

              {[0,45,90,135,180,225,270,315].map(angle => (
                <line
                  key={angle}
                  x1={170 + 34 * Math.cos(angle * Math.PI / 180)}
                  y1={170 + 34 * Math.sin(angle * Math.PI / 180)}
                  x2={170 + 76 * Math.cos(angle * Math.PI / 180)}
                  y2={170 + 76 * Math.sin(angle * Math.PI / 180)}
                  stroke="rgba(245,158,11,0.28)"
                  strokeWidth="1"
                />
              ))}

              {[0, 90, 180, 270].map(angle => {
                const cx = 170 + 82 * Math.cos((angle - 90) * Math.PI / 180);
                const cy = 170 + 82 * Math.sin((angle - 90) * Math.PI / 180);
                return <circle key={angle} cx={cx} cy={cy} r="3.5" fill="rgba(245,158,11,0.55)" />;
              })}

              <circle cx="170" cy="170" r="30" fill="url(#planetGrad)" />
              <ellipse cx="162" cy="162" rx="9" ry="5" fill="rgba(255,255,255,0.1)" transform="rotate(-30,162,162)" />

              <ellipse cx="170" cy="180" rx="46" ry="11" fill="none" stroke="rgba(245,158,11,0.35)" strokeWidth="2.5" />

              <g transform="rotate(-40, 170, 170)">
                <circle cx="170" cy="40" r="15" fill="url(#moonGrad)" />
                <circle cx="176" cy="40" r="12" fill="#0d0d18" />
              </g>

              <g transform="rotate(70, 170, 170)">
                <circle cx="170" cy="40" r="8" fill="#4a6fa5" opacity="0.9" />
              </g>

              <g transform="rotate(200, 170, 170)">
                <circle cx="170" cy="62" r="5" fill="#f59e0b" opacity="0.75" />
              </g>
            </svg>
          )}
        </motion.div>
      </section>

      {/* ── CALENDAR ── */}
      <FadeInView delay={0.05}>
        <PanchangCalendar />
      </FadeInView>

      {/* ── MUHURAT FORM ── */}
      <FadeInView delay={0.05} style={{ marginTop: '60px' }}>
        <section>
          <MuhuratForm onSearch={handleSearch} externalEventType={selectedEventType} />

          <AnimatePresence mode="wait">
            {(isLoading || searchResults) && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <ResultsList results={searchResults} isLoading={isLoading} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </FadeInView>

      {/* ── SERVICES ── */}
      <section id="services" style={{ marginTop: '80px' }}>
        <FadeInView>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '40px' }}>Popular Services</h2>
        </FadeInView>
        <StaggerContainer className={styles.grid} staggerDelay={0.08}>
          {['Marriage (Vivah)', 'House Warming (Griha Pravesh)', 'Vehicle Purchase', 'Property Purchase', 'Naming Ceremony (Namakaran)'].map((service, idx) => (
            <StaggerItem key={idx}>
              <motion.div
                className={`${styles.card} glass`}
                whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(245,158,11,0.15)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>{service}</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Find the most auspicious date and time for your {service.toLowerCase()}.</p>
                <motion.button
                  className={styles.textBtn}
                  onClick={() => handleCheckDatesClick(service)}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  Check Dates →
                </motion.button>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </div>
  );
}
