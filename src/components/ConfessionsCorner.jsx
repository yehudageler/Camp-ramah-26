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
        // Post anonymously
        const { error } = await supabase.from("suggestions").insert({
          user_id: "anonymous_confession",
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

  // Fun background colors for sticky notes
  const noteColors = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa'];

  return (
    <section style={{
      background: 'var(--white-card)',
      borderRadius: 'var(--radius-lg)',
      padding: '2.5rem',
      boxShadow: 'var(--shadow-soft)',
      marginBottom: '2.5rem',
      border: '1.5px solid rgba(230, 81, 0, 0.18)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '2.5rem' }}>🤫</span>
        <div>
          <h2 style={{ color: 'var(--campfire-amber)', margin: 0, fontFamily: 'Fredoka' }}>פינת הוידויים</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>מה שקורה במחנה, נשאר... כאן בעילום שם!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <textarea
          value={newConfession}
          onChange={(e) => setNewConfession(e.target.value)}
          placeholder="יש לך וידוי מצחיק? פאדיחה מהמחנה? שתף כאן (זה אנונימי 100%)..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid #e2e8f0',
            fontFamily: 'inherit',
            fontSize: '1rem',
            resize: 'vertical',
            marginBottom: '1rem'
          }}
          required
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            background: 'var(--campfire-amber)',
            color: 'white',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(230, 81, 0, 0.15)',
            transition: 'var(--transition)'
          }}
          onMouseOver={(e) => {
            if(!isSubmitting) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(230, 81, 0, 0.25)';
            }
          }}
          onMouseOut={(e) => {
            if(!isSubmitting) {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(230, 81, 0, 0.15)';
            }
          }}
        >
          {isSubmitting ? "שולח..." : "פרסם וידוי 🚀"}
        </button>

        {showSuccess && (
          <span style={{ marginLeft: '1rem', color: 'var(--forest-green)', fontWeight: 'bold' }}>
            הוידוי פורסם בהצלחה! 🎉
          </span>
        )}
      </form>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {confessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>עדיין אין וידויים... תהיו הראשונים להתוודות!</p>
        ) : (
          confessions.map((confession, index) => {
            const cleanText = confession.text.replace('[CONFESSION] ', '');
            const bgColor = noteColors[index % noteColors.length];
            return (
              <div key={confession.id} style={{
                backgroundColor: 'var(--white-card)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-soft)',
                border: '1px solid #edf2f7',
                borderRight: `4px solid ${bgColor}`,
                transition: 'all 0.2s ease-in-out',
                cursor: 'default'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
              }}
              >
                
                <p style={{ 
                  margin: 0, 
                  fontSize: '1.05rem', 
                  lineHeight: '1.6',
                  color: 'var(--text-main)',
                  fontWeight: '500'
                }}>
                  "{cleanText}"
                </p>
                <div style={{ 
                  marginTop: '1.2rem', 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)',
                  textAlign: 'left',
                  borderTop: '1px solid #edf2f7',
                  paddingTop: '0.6rem'
                }}>
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
