import React, { useState } from 'react';

export default function CampNewspaper({ isAdmin, newspaperData, onUpdateNewspaper }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    didYouKnow: newspaperData?.didYouKnow || "",
    dailyTip: newspaperData?.dailyTip || "",
    funnyStory: newspaperData?.funnyStory || ""
  });

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateNewspaper(editData);
    setIsEditing(false);
  };

  return (
    <section id="newspaper" className="newspaper-section" style={{
      background: 'linear-gradient(135deg, #fffde7, #fff9c4)',
      borderRadius: 'var(--radius-lg)',
      padding: '2.5rem 2rem',
      boxShadow: 'var(--shadow-md)',
      marginBottom: '2.5rem',
      border: '2px solid #fbc02d',
      direction: 'rtl',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative element */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '-30px',
        background: '#e53935',
        color: 'white',
        padding: '0.4rem 3rem',
        fontWeight: 'bold',
        transform: 'rotate(40deg)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        fontFamily: "'Fredoka', cursive",
        zIndex: 2,
        letterSpacing: '1px'
      }}>
        מהדורת היום!
      </div>

      <h3 style={{ 
        color: '#d84315', 
        marginBottom: '1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.6rem',
        fontSize: '1.8rem',
        fontFamily: "'Fredoka', cursive",
        marginTop: '0'
      }}>
        🗞️ עיתון המחנה
      </h3>

      {isAdmin && !isEditing && (
        <button 
          onClick={() => {
            setEditData({
              didYouKnow: newspaperData?.didYouKnow || "",
              dailyTip: newspaperData?.dailyTip || "",
              funnyStory: newspaperData?.funnyStory || ""
            });
            setIsEditing(true);
          }}
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '1.5rem',
            background: 'white',
            border: '1px solid #ddd',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: 'var(--shadow-sm)',
            fontWeight: 'bold',
            zIndex: 10
          }}
        >
          ✏️ עריכת העיתון
        </button>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', position: 'relative', zIndex: 5 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: '#1565c0' }}>🧐 הידעת?</label>
            <textarea 
              value={editData.didYouKnow} 
              onChange={e => setEditData({...editData, didYouKnow: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #bbdefb', minHeight: '60px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: '#2e7d32' }}>💡 טיפ יומי</label>
            <textarea 
              value={editData.dailyTip} 
              onChange={e => setEditData({...editData, dailyTip: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #c8e6c9', minHeight: '60px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: '#f57c00' }}>😂 סיפור מצחיק מהשבוע</label>
            <textarea 
              value={editData.funnyStory} 
              onChange={e => setEditData({...editData, funnyStory: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ffe0b2', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" style={{ padding: '0.6rem 1.5rem', background: 'var(--forest-green)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>שמור גיליון</button>
            <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '0.6rem 1.5rem', background: 'transparent', color: 'var(--text-main)', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}>ביטול</button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', position: 'relative', zIndex: 5 }}>
          {/* Did you know card */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', borderRight: '4px solid #1e88e5', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ color: '#1565c0', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 0, marginBottom: '0.8rem', fontSize: '1.2rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🧐</span> הידעת?
            </h4>
            <p style={{ margin: 0, lineHeight: '1.6', color: '#334155', fontSize: '0.95rem' }}>
              {newspaperData?.didYouKnow || "בקרוב נגלה לכם עובדה מעניינת על המחנה..."}
            </p>
          </div>

          {/* Daily tip card */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', borderRight: '4px solid #43a047', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 0, marginBottom: '0.8rem', fontSize: '1.2rem' }}>
              <span style={{ fontSize: '1.4rem' }}>💡</span> טיפ יומי
            </h4>
            <p style={{ margin: 0, lineHeight: '1.6', color: '#334155', fontSize: '0.95rem' }}>
              {newspaperData?.dailyTip || "טיפ חדש בדרך! שמרו על ערנות."}
            </p>
          </div>

          {/* Funny story card */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', borderRight: '4px solid #fb8c00', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ color: '#e65100', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 0, marginBottom: '0.8rem', fontSize: '1.2rem' }}>
              <span style={{ fontSize: '1.4rem' }}>😂</span> סיפור השבוע
            </h4>
            <p style={{ margin: 0, lineHeight: '1.6', color: '#334155', fontSize: '0.95rem' }}>
              {newspaperData?.funnyStory || "עוד לא קרה משהו מספיק מצחיק השבוע... חכו לזה!"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
