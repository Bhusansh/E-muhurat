"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './PanchangCalendar.module.css';
import { supabase } from '../utils/supabase';

export default function PanchangCalendar() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [city, setCity] = useState('New Delhi');

  useEffect(() => {
    async function fetchPanchang() {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-11
      
      // Calculate start and end of the month
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      try {
        const { data, error } = await supabase
          .from('v_panchang_full')
          .select('*')
          .eq('reference_city', city)
          .gte('gregorian_date', startDate)
          .lte('gregorian_date', endDate)
          .order('gregorian_date', { ascending: true });

        if (data && !error) {
          setDates(data);
        } else {
          setDates([]);
        }
      } catch (err) {
        console.error("Failed to fetch panchang", err);
        setDates([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPanchang();
  }, [currentDate, city]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const yearName = currentDate.getFullYear();

  // Calculate empty cells before the first day of the month
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const emptyCells = Array.from({ length: startDay }, (_, i) => i);
  const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  return (
    <div className={`${styles.calendarContainer} glass`} id="panchang">
      <div className={styles.header}>
        <div className={styles.navGroup}>
          <button className={styles.navBtn} onClick={prevMonth} aria-label="Previous Month">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <h2 className={styles.title}>
            {monthName} <span className={styles.year}>{yearName}</span>
          </h2>
          <button className={styles.navBtn} onClick={nextMonth} aria-label="Next Month">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        <div className={styles.locationSelector}>
          <span>Panchang for</span>
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            className={styles.cityDropdown}
            aria-label="Select City"
          >
            <option value="New Delhi">New Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Chennai">Chennai</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Pune">Pune</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
        </div>
      </div>
      
      <div className={styles.calendarWrapper}>
        <div className={styles.grid}>
          {daysOfWeek.map(day => (
            <div key={day} className={styles.dayHeader}>{day}</div>
          ))}
          
          {loading ? (
            <div className={styles.loading}>
               <div className={styles.spinner}></div>
               <span>Calculating Panchang...</span>
            </div>
          ) : (
            <>
              {emptyCells.map(i => (
                <div key={`empty-${i}`} className={styles.emptyCell}></div>
              ))}
              
              {Array.from({ length: totalDays }, (_, i) => {
                const dateNum = i + 1;
                // Find matching date in data
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                const d = dates.find(x => x.gregorian_date === dateStr);
                
                if (!d) {
                  return (
                    <div key={`day-${dateNum}`} className={styles.dayCellEmpty}>
                      <div className={styles.dateNumber}>{dateNum}</div>
                    </div>
                  );
                }

                const isAuspicious = d.yoga_quality === 'Auspicious';
                
                return (
                  <Link 
                    href={`/panchang?date=${d.gregorian_date}&city=${city}`} 
                    key={d.id} 
                    className={`${styles.dayCell} ${isAuspicious ? styles.auspicious : ''}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className={styles.dateHeader}>
                      <span className={styles.dateNumber}>{dateNum}</span>
                      {isAuspicious && <span className={styles.indicatorDot}></span>}
                    </div>
                    <div className={styles.details}>
                      <div className={styles.tithi}>{d.tithi_en?.split(' ')[0] || '-'}</div>
                      <div className={styles.nakshatra}>{d.nakshatra_en?.split(' ')[0] || '-'}</div>
                    </div>
                    {isAuspicious && <div className={styles.auspiciousLabel}>Auspicious</div>}
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
