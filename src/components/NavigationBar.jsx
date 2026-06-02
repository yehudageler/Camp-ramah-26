import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'home', label: 'ראשי', icon: '⛺' },
  { id: 'community', label: 'קהילה', icon: '👥' },
  { id: 'packing', label: 'רשימת ציוד', icon: '🎒' },
  // { id: 'laya-tip', label: 'כרטיס לאיה', icon: '💳' },
  // { id: 'newspaper', label: 'העיתון', icon: '🗞️' },
  { id: 'gallery', label: 'התמונה היומית', icon: '📸' },
  { id: 'suggestions', label: 'הצעות לאתר', icon: '💡' }
];

export default function NavigationBar() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      let current = 'home';
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Adjust threshold based on layout
          if (rect.top <= 200 && rect.bottom >= 200) {
            current = section.id;
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
      // Offset for sticky header if any, though we rely on scroll margin top in CSS if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
