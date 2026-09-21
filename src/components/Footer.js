import styles from './Footer.module.css';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className={`${styles.footer} glass`}>
      <div className={styles.container}>
        <div className={styles.column}>
          <h4 className={styles.brand}>eMuhurat</h4>
          <p className={styles.description}>
            Discover the most auspicious times for your important life events. We provide precise calculations based on authentic Vedic astrology.
          </p>
        </div>
        
        <div className={styles.column}>
          <h4 className={styles.title}>Quick Links</h4>
          <ul className={styles.links}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/panchang">Daily Panchang</Link></li>
            <li><Link href="/#services">Services</Link></li>
            <li><Link href="/#calculator">Calculator</Link></li>
          </ul>
        </div>
        
        <div className={styles.column}>
          <h4 className={styles.title}>Legal</h4>
          <ul className={styles.links}>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} eMuhurat. All rights reserved.</p>
      </div>
    </footer>
  );
}
