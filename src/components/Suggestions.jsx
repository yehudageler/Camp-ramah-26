import { useState } from 'react';

export default function Suggestions({
  onSubmitSuggestion
}) {
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
    <div id="suggestions" className="feedback-section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>💡</span> בואו נבנה את זה ביחד!
        </h3>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
          האתר הזה הוא של כולנו! נשמח לשמוע רעיונות לפיצ'רים חדשים, כלים שיעזרו לנו לקראת המחנה, משחקים, או סתם בדיחות שיעשו לנו שמח בלב. כל הצעה תגיע ישירות ליהודה.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: '1.2rem' }}>
          <textarea
            className="feedback-textarea"
            placeholder="ספרו לנו על רעיון, כלי, משחק או מידע שהיה עוזר לכם..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            style={{ minHeight: '120px' }}
            maxLength={500}
          />
          <button type="submit" className="btn-secondary" style={{ marginTop: '0.8rem' }}>שלח הצעה ליהודה 🚀</button>
        </form>

        {showSuccess && (
          <div className="feedback-success">
            תודה! ההצעה שלך נשלחה ישירות ליהודה 📬
          </div>
        )}
    </div>
  );
}
