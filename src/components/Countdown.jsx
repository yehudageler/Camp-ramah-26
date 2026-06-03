import { useState, useEffect } from 'react';

export default function Countdown() {
  const targetDate = new Date("2026-06-07T16:00:00-05:00").getTime();
  const [timeLeft, setTimeLeft] = useState(targetDate - new Date().getTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(targetDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft <= 0) {
    return (
      <section className="countdown-section">
        <h2 className="countdown-title">הספירה לאחור לפתיחת המחנה! 🚀</h2>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', margin: '2rem 0' }}>
          המחנה התחיל! 🎉 Have an amazing summer!
        </div>
        <div className="campfire-animation">
          <div className="fire-flame"></div>
          <div className="fire-logs"></div>
        </div>
      </section>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <section className="countdown-section">
      <h2 className="countdown-title">הספירה לאחור לפתיחת המחנה! 🚀</h2>
      
      <div className="countdown-grid" id="countdown-timer">
        <div className="countdown-card">
          <span className="countdown-value">{String(days).padStart(2, "0")}</span>
          <span className="countdown-label">ימים</span>
        </div>
        <div className="countdown-card">
          <span className="countdown-value">{String(hours).padStart(2, "0")}</span>
          <span className="countdown-label">שעות</span>
        </div>
        <div className="countdown-card">
          <span className="countdown-value">{String(minutes).padStart(2, "0")}</span>
          <span className="countdown-label">דקות</span>
        </div>
        <div className="countdown-card">
          <span className="countdown-value">{String(seconds).padStart(2, "0")}</span>
          <span className="countdown-label">שניות</span>
        </div>
      </div>

      <div className="countdown-subtitle">
        סורי צוותי אגם ומחנאות, אנחנו הכי חשובים 😉
      </div>

      {/* Pure CSS Cozy Campfire visual */}
      <div className="campfire-animation">
        <div className="fire-flame"></div>
        <div className="fire-logs"></div>
      </div>
    </section>
  );
}
