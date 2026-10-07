'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { supabase } from '../utils/supabase';
import MuhuratForm from '@/components/MuhuratForm';
import ResultsList from '@/components/ResultsList';
import PanchangCalendar from '@/components/PanchangCalendar';

export default function Home() {
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState('marriage');

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
      // Import supabase dynamically or assume it's imported at the top
      // Wait, we need to import supabase at the top of the file!
      const { data, error } = await supabase
        .from('v_panchang_full')
        .select('*')
        .eq('reference_city', formData.location)
        .gte('gregorian_date', formData.startDate)
        .lte('gregorian_date', formData.endDate)
        .eq('yoga_quality', 'Auspicious')
        .order('gregorian_date', { ascending: true })
        .limit(10); // Limit results

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedResults = data.map(d => {
          const dateObj = new Date(d.gregorian_date);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          const dateString = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          
          return {
            day: dayName,
            date: dateString,
            timeWindow: '06:00 AM - 06:00 PM', // Placeholder if time isn't in the view
            nakshatra: d.nakshatra_en || 'Unknown',
            tithi: d.tithi_en || 'Unknown',
            reason: `${d.nakshatra_en || 'This Nakshatra'} and ${d.tithi_en || 'Tithi'} make this an auspicious date for ${formData.eventType.replace('_', ' ')}.`
          };
        });
        setSearchResults(formattedResults);
      } else {
        setSearchResults([]); // No results found
      }
    } catch (err) {
      console.error("Error fetching muhurat:", err);
      // Fallback or show error
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
        
        <div className={`${styles.heroImage} glass`}>
          <div className={styles.mandala}>
            <svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="5,5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="var(--secondary)" strokeWidth="1" />
              <path d="M50 15 L55 35 L75 35 L60 45 L65 65 L50 55 L35 65 L40 45 L25 35 L45 35 Z" fill="var(--primary)" opacity="0.8" />
            </svg>
          </div>
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
