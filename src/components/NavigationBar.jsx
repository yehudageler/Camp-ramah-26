import { useState, useEffect, useRef } from 'react';

const SECTIONS = [
  { id: 'home', label: 'ראשי', icon: '⛺' },
  { id: 'gallery', label: 'התמונה היומית', icon: '📸' },
  { id: 'community', label: 'קהילה', icon: '👥' },
  { id: 'packing', label: 'רשימת ציוד', icon: '🎒' },
  // { id: 'laya-tip', label: 'כרטיס לאיה', icon: '💳' },
  // { id: 'newspaper', label: 'העיתון', icon: '🗞️' },
  { id: 'suggestions', label: 'הצעות לאתר', icon: '💡' }
];

export default function NavigationBar() {
  const [activeSection, setActiveSection] = useState('home');
  const isManualScroll = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      // If we are currently programmatically scrolling, ignore scroll events
      if (isManualScroll.current) return;

      // If we are close to the top of the page, default to 'home'
      if (window.scrollY < 100) {
        setActiveSection('home');
        return;
      }

      // Check if we are at the bottom of the page (generous 150px threshold for mobile/bounce)
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 150);
      if (isAtBottom) {
        setActiveSection('suggestions');
        return;
      }

      let current = 'home';
      let minDistance = Infinity;

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Distance from the optimal focus line (120px from top of viewport)
          const distance = Math.abs(rect.top - 120);
          
          // Section must be inside viewport
          if (rect.top <= 300 && rect.bottom >= 80) {
            if (distance < minDistance) {
              minDistance = distance;
              current = section.id;
            }
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      isManualScroll.current = true;
      setActiveSection(id);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Re-enable scroll spy after the smooth scroll finishes (1000ms is standard)
      setTimeout(() => {
        isManualScroll.current = false;
      }, 1000);
    }
  };

  return (
    <nav className="floating-nav">
      <ul className="nav-list">
        {SECTIONS.map(sec => (
          <li key={sec.id}>
            <button 
              className={`nav-btn ${activeSection === sec.id ? 'active' : ''}`}
              onClick={() => scrollToSection(sec.id)}
              title={sec.label}
            >
              <div className="nav-icon-wrapper">
                <span className="nav-icon">{sec.icon}</span>
              </div>
              <span className="nav-label">{sec.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
