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

  const [selectedDateDetails, setSelectedDateDetails] = useState(null);

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
          // If no date is selected, or if we switched months, select the first auspicious date or just the 1st
          const firstAuspicious = data.find(d => d.yoga_quality === 'Auspicious');
          if (firstAuspicious) {
            setSelectedDateDetails(firstAuspicious);
          } else if (data.length > 0) {
            setSelectedDateDetails(data[0]);
          }
        } else {
          setDates([]);
          setSelectedDateDetails(null);
        }
      } catch (err) {
        console.error("Failed to fetch panchang", err);
        setDates([]);
        setSelectedDateDetails(null);
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
                
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;

                if (!d) {
                  return (
                    <div key={`day-${dateNum}`} className={`${styles.dayCellEmpty} ${isToday ? styles.today : ''}`}>
                      <span className={styles.dateNumber}>{dateNum}</span>
                    </div>
                  );
                }

                const isAuspicious = d.yoga_quality === 'Auspicious';
                const isSelected = selectedDateDetails?.gregorian_date === d.gregorian_date;
                
                return (
                  <div 
                    key={d.gregorian_date} 
                    className={`${styles.dayCell} ${isAuspicious ? styles.auspicious : ''} ${isSelected ? styles.selectedDay : ''} ${isToday ? styles.today : ''}`}
                    onClick={() => setSelectedDateDetails(d)}
                  >
                    <span className={styles.dateNumber}>{dateNum}</span>
                    {isAuspicious && <span className={styles.indicatorDot}></span>}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Selected Date Details Panel */}
        {!loading && selectedDateDetails && (
          <div className={styles.detailsPanel}>
            <div className={styles.detailsHeader}>
              <div className={styles.detailsDate}>
                {new Date(selectedDateDetails.gregorian_date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              {selectedDateDetails.yoga_quality === 'Auspicious' && (
                <div className={styles.detailsAuspiciousBadge}>Auspicious Day</div>
              )}
            </div>
            
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Tithi</span>
                <span className={styles.detailValue}>{selectedDateDetails.tithi_en?.split(' ')[0] || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Nakshatra</span>
                <span className={styles.detailValue}>{selectedDateDetails.nakshatra_en?.split(' ')[0] || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Sunrise</span>
                <span className={styles.detailValue}>{selectedDateDetails.sunrise_time || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Sunset</span>
                <span className={styles.detailValue}>{selectedDateDetails.sunset_time || '-'}</span>
              </div>
            </div>

            <Link href={`/panchang?date=${selectedDateDetails.gregorian_date}&city=${city}`} className={styles.viewFullBtn}>
              View Full Panchang & Muhurat Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
