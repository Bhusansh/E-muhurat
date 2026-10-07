import "./globals.css";
import Footer from "@/components/Footer";
import SpaceBackground from "@/components/SpaceBackground";

export const metadata = {
  title: "eMuhurat - Find Your Auspicious Time",
  description: "Discover the most auspicious Muhurats for your important life events. E-Muhurat offers precise calculations for marriage, property, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SpaceBackground />
        <header className="glass" style={{ margin: '16px 24px', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>eMuhurat</div>
          <nav>
            <ul style={{ display: 'flex', gap: '24px', listStyle: 'none' }}>
              <li><a href="#" style={{ fontWeight: 500, transition: 'color 0.2s' }}>Home</a></li>
              <li><a href="#services" style={{ fontWeight: 500, transition: 'color 0.2s' }}>Services</a></li>
              <li><a href="#about" style={{ fontWeight: 500, transition: 'color 0.2s' }}>About</a></li>
            </ul>
          </nav>
        </header>
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
