'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { supabase } from '../utils/supabase';
import MuhuratForm from '@/components/MuhuratForm';
import ResultsList from '@/components/ResultsList';
import PanchangCalendar from '@/components/PanchangCalendar';

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
      // Import dynamically to avoid top-level issues if needed, or assume it's there
      const { evaluateDay, calculateChoghadiya } = await import('../utils/muhuratLogic');
      
      // Fetch data for a 15 day window instead of strictly filtering in SQL
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
          
          // Evaluate the day based on the event rules
          const { isAuspicious, reasons } = evaluateDay(d, formData.eventType);
          
          // Calculate the Choghadiya timeslots
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
        
        // Let's sort to put Auspicious days first, then Inauspicious
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

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Begin Your Journey at the <span style={{ color: 'var(--primary)' }}>Perfect Time</span>
          </h1>
          <p className={styles.subtitle}>
            Discover precisely calculated auspicious Muhurats for marriage, griha pravesh, vehicle purchases, and other significant life milestones.
          </p>
          <div className={styles.ctaGroup}>
            <button className={styles.primaryBtn} onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}>Find a Muhurat</button>
            <button className={styles.secondaryBtn} onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>Explore Services</button>
          </div>
        </div>
        
        <div className={styles.heroImage}>
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

            {/* Outer rings */}
            <circle cx="170" cy="170" r="158" fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1" />
            <circle cx="170" cy="170" r="148" fill="none" stroke="rgba(245,158,11,0.07)" strokeWidth="0.5" />

            {/* 12 clock-like ticks on outer edge */}
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

            {/* 6 accent dots on outer ring */}
            {[0, 60, 120, 180, 240, 300].map(angle => {
              const x = 170 + 158 * Math.cos((angle - 90) * Math.PI / 180);
              const y = 170 + 158 * Math.sin((angle - 90) * Math.PI / 180);
              return <circle key={angle} cx={x} cy={y} r="2.5" fill="rgba(245,158,11,0.6)" />;
            })}

            {/* Moon orbit (dotted ring) */}
            <circle cx="170" cy="170" r="130" fill="none" stroke="rgba(245,158,11,0.22)" strokeWidth="1" strokeDasharray="5 9" />

            {/* Solid inner orbit */}
            <circle cx="170" cy="170" r="108" fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth="1" />

            {/* Innermost decorative ring */}
            <circle cx="170" cy="170" r="82" fill="none" stroke="rgba(245,158,11,0.14)" strokeWidth="1" strokeDasharray="2 7" />

            {/* 8-spoke compass lines */}
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

            {/* 4 dots on inner ring at cardinal points */}
            {[0, 90, 180, 270].map(angle => {
              const cx = 170 + 82 * Math.cos((angle - 90) * Math.PI / 180);
              const cy = 170 + 82 * Math.sin((angle - 90) * Math.PI / 180);
              return <circle key={angle} cx={cx} cy={cy} r="3.5" fill="rgba(245,158,11,0.55)" />;
            })}

            {/* Central sun / planet */}
            <circle cx="170" cy="170" r="30" fill="url(#planetGrad)" />
            <ellipse cx="162" cy="162" rx="9" ry="5" fill="rgba(255,255,255,0.1)" transform="rotate(-30,162,162)" />

            {/* Saturn ring */}
            <ellipse cx="170" cy="180" rx="46" ry="11" fill="none" stroke="rgba(245,158,11,0.35)" strokeWidth="2.5" />

            {/* Orbiting crescent Moon */}
            <g transform="rotate(-40, 170, 170)">
              <circle cx="170" cy="40" r="15" fill="url(#moonGrad)" />
              <circle cx="176" cy="40" r="12" fill="#0d0d18" />
            </g>

            {/* Small blue orbiting planet */}
            <g transform="rotate(70, 170, 170)">
              <circle cx="170" cy="40" r="8" fill="#4a6fa5" opacity="0.9" />
            </g>

            {/* Tiny gold orbiting dot */}
            <g transform="rotate(200, 170, 170)">
              <circle cx="170" cy="62" r="5" fill="#f59e0b" opacity="0.75" />
            </g>
          </svg>
          )}
        </div>
      </section>

      <PanchangCalendar />

      <section style={{ marginTop: '60px' }}>
        <MuhuratForm onSearch={handleSearch} externalEventType={selectedEventType} />
        {(isLoading || searchResults) && <ResultsList results={searchResults} isLoading={isLoading} />}
      </section>

      <section id="services" style={{ marginTop: '80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '40px' }}>Popular Services</h2>
        <div className={styles.grid}>
          {['Marriage (Vivah)', 'House Warming (Griha Pravesh)', 'Vehicle Purchase', 'Property Purchase', 'Naming Ceremony (Namakaran)'].map((service, idx) => (
            <div key={idx} className={`${styles.card} glass`}>
              <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>{service}</h3>
              <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Find the most auspicious date and time for your {service.toLowerCase()}.</p>
              <button 
                className={styles.textBtn}
                onClick={() => handleCheckDatesClick(service)}
              >
                Check Dates
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
