import { useState, useEffect } from 'react';
import { supabase, isSupabaseActive } from '../lib/supabase';

export default function ConfessionsCorner({ currentUser }) {
  const [confessions, setConfessions] = useState([]);
  const [newConfession, setNewConfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
    if (isSupabaseActive) {
      try {
        const { data, error } = await supabase
          .from('suggestions')
          .select('*')
          .like('text', '[CONFESSION]%')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setConfessions(data);
        }
      } catch (err) {
        console.error("Failed to fetch confessions", err);
      }
    } else {
      const stored = localStorage.getItem("ramah_confessions");
      if (stored) {
        setConfessions(JSON.parse(stored));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newConfession.trim()) return;

    setIsSubmitting(true);
    const confessionText = `[CONFESSION] ${newConfession.trim()}`;

    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from("suggestions").insert({
          user_id: currentUser?.id || "anonymous",
          user_name: "אנונימי 🤫",
          text: confessionText
        });

        if (!error) {
          fetchConfessions();
        }
      } catch (err) {
        console.error("Error submitting confession", err);
      }
    } else {
      const newEntry = {
        id: Date.now(),
        text: confessionText,
        user_name: "אנונימי 🤫",
        created_at: new Date().toISOString()
      };
      const updated = [newEntry, ...confessions];
      setConfessions(updated);
      localStorage.setItem("ramah_confessions", JSON.stringify(updated));
    }

    setNewConfession("");
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Fun border colors for cards
  const noteColors = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa'];

  return (
    <section className="confessions-section">
      <div className="confessions-header">
        <span className="confessions-header-icon">🤫</span>
        <div>
          <h2 className="confessions-title">פינת הוידויים</h2>
          <p className="confessions-subtitle">מה שקורה במחנה, נשאר... כאן בעילום שם!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="confessions-form">
        <textarea
          value={newConfession}
          onChange={(e) => setNewConfession(e.target.value)}
          placeholder="יש לך וידוי מצחיק? פאדיחה מהמחנה? שתף כאן (זה אנונימי 100%)..."
          className="confessions-textarea"
          maxLength={500}
          required
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`confessions-submit-btn${isSubmitting ? ' btn-loading' : ''}`}
          >
            {isSubmitting ? "שולח..." : "פרסם וידוי 🚀"}
          </button>
          {showSuccess && (
            <span className="confessions-success">הוידוי פורסם בהצלחה! 🎉</span>
          )}
        </div>
      </form>

      <div className="confessions-grid">
        {confessions.length === 0 ? (
          <p className="confessions-empty">עדיין אין וידויים... תהיו הראשונים להתוודות!</p>
        ) : (
          confessions.map((confession, index) => {
            const cleanText = confession.text.replace('[CONFESSION] ', '');
            const bgColor = noteColors[index % noteColors.length];
            return (
              <div
                key={confession.id}
                className="confession-card"
                style={{ borderRight: `4px solid ${bgColor}` }}
              >
                <p className="confession-text">"{cleanText}"</p>
                <div className="confession-date">
                  {new Date(confession.created_at).toLocaleDateString('he-IL')}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
