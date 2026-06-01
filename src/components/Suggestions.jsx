import { useState } from 'react';

export default function Suggestions({ onSubmitSuggestion }) {
  const [feedback, setFeedback] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    onSubmitSuggestion(feedback.trim());
    setFeedback("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
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

        {showSuccess && (
          <div style={{
            marginTop: '1rem',
            padding: '0.8rem',
            backgroundColor: 'var(--forest-green-light)',
            color: 'var(--forest-green)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '600',
            textAlign: 'center',
            border: '1px solid rgba(30, 70, 32, 0.15)',
            animation: 'check-pop 0.3s ease-out'
          }}>
            תודה! ההצעה שלך נשלחה ישירות למנהל הפורטל 📬
          </div>
        )}
      </div>
    </section>
  );
}
