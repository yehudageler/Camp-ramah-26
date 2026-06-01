import { useState } from 'react';

export default function Suggestions({ suggestions, onSubmitSuggestion }) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    onSubmitSuggestion(feedback.trim());
    setFeedback("");
  };

  return (
    <section className="suggestions-section">
      {/* Future Features List */}
      <div className="info-card">
        <h3 style={{ color: 'var(--forest-green)', marginBottom: '0.8rem' }}>✨ מה מתוכנן לשלב הבא?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.2rem' }}>האתר נמצא כרגע בגרסת פיילוט ראשונית. הנה הפיצ'רים שיושקו בקרוב:</p>
        <ul className="coming-soon-list">
          <li>מילון הסלנג העברי-אנגלי-קמפי של רמה</li>
          <li>מפת סודות וטיפים של המחנה (מבוסס מיקום)</li>
          <li>לוח סאונדים וציטוטים מוכרים מהמחנה</li>
          <li>מחולל רעיונות לפעולות ערב לחוצות</li>
        </ul>
      </div>

      {/* Suggestions input box */}
      <div className="feedback-card">
        <h3>💡 איזה פיצ'רים בא לכם שיהיו באתר?</h3>
        <p>יש לכם רעיון מגניב שיעזור לשליחים? תכתבו לנו אותו כאן ונפתח אותו בשלבים הבאים!</p>
        
        <form onSubmit={handleSubmit}>
          <textarea 
            className="feedback-textarea" 
            placeholder="ספרו לנו על פיצ'ר, כלי, משחק או מידע שהיה עוזר לכם לקראת המחנה..." 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          ></textarea>
          <button type="submit" className="btn-secondary">שלח הצעה 🚀</button>
        </form>

        <div className="suggestions-list-preview">
          {suggestions.length === 0 ? (
            <h4 style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.85rem' }}>
              אין הצעות קודמות עדיין. תהיו הראשונים להציע!
            </h4>
          ) : (
            <>
              <h4>הצעות שהתקבלו לאחרונה:</h4>
              {suggestions.slice(-3).reverse().map((s, index) => (
                <div className="suggestion-bubble" key={index}>
                  <strong>[{s.date}]</strong> {s.text}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
