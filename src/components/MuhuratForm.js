'use client';

import { useState, useEffect } from 'react';
import styles from './MuhuratForm.module.css';

export default function MuhuratForm({ onSearch, externalEventType }) {
  const [formData, setFormData] = useState({
    eventType: 'marriage',
    location: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (externalEventType) {
      setFormData(prev => ({ ...prev, eventType: externalEventType }));
    }
  }, [externalEventType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('Error: "To Date" cannot be earlier than "From Date".');
      return;
    }
    console.log('Searching for Muhurat:', formData);
    if (onSearch) {
      onSearch(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`${styles.formContainer} glass`} id="calculator">
      <h2 className={styles.formTitle}>Find Your Auspicious Time</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="eventType">Event Type</label>
          <select 
            id="eventType" 
            name="eventType" 
            value={formData.eventType}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="marriage">Marriage (Vivah)</option>
            <option value="griha_pravesh">House Warming (Griha Pravesh)</option>
            <option value="vehicle">Vehicle Purchase</option>
            <option value="property">Property Purchase</option>
            <option value="namakaran">Naming Ceremony (Namakaran)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Location (City)</label>
          <input 
            type="text" 
            id="location" 
            name="location" 
            list="cities"
            placeholder="e.g. Mumbai, Delhi"
            value={formData.location}
            onChange={handleChange}
            className={styles.input}
            required
            autoComplete="off"
          />
          <datalist id="cities">
            <option value="Mumbai" />
            <option value="Delhi" />
            <option value="Bangalore" />
            <option value="Hyderabad" />
            <option value="Chennai" />
            <option value="Kolkata" />
            <option value="Pune" />
            <option value="Ahmedabad" />
          </datalist>
        </div>

        <div className={styles.dateRow}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate">From Date</label>
            <input 
              type="date" 
              id="startDate" 
              name="startDate" 
              value={formData.startDate}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="endDate">To Date</label>
            <input 
              type="date" 
              id="endDate" 
              name="endDate" 
              value={formData.endDate}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Calculate Muhurats
        </button>
      </form>
    </div>
  );
}
