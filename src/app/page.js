'use client';

import { useState } from 'react';
import styles from './page.module.css';
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

  const handleSearch = (formData) => {
    setIsLoading(true);
    setSearchResults(null);
    
    // Simulate API call
    setTimeout(() => {
      // Mock results
      setSearchResults([
        { day: 'Thursday', date: '22 Oct', timeWindow: '09:30 AM - 11:45 AM', nakshatra: 'Rohini', tithi: 'Panchami', reason: 'Rohini Nakshatra combined with Panchami Tithi forms an extremely auspicious Amrit Siddhi Yoga, perfect for long-lasting success.' },
        { day: 'Monday', date: '26 Oct', timeWindow: '06:15 AM - 08:30 AM', nakshatra: 'Mrigashirsha', tithi: 'Navami', reason: 'The presence of Mrigashirsha Nakshatra brings gentle and creative energy, highly favored for starting new peaceful ventures.' },
        { day: 'Friday', date: '30 Oct', timeWindow: '10:00 AM - 01:15 PM', nakshatra: 'Pushya', tithi: 'Trayodashi', reason: 'Pushya is the most auspicious Nakshatra. Combined with Friday (Venus), it brings immense wealth, harmony, and prosperity.' }
      ]);
      setIsLoading(false);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 1500);
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
