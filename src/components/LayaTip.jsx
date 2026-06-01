export default function LayaTip() {
  return (
    <div 
      className="info-card" 
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: 'var(--white-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--forest-green-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        direction: 'rtl'
      }}
    >
      <img
        src="/laya_card.png"
        alt="Laya Card"
        style={{
          width: '100px',
          height: 'auto',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          flexShrink: 0
        }}
      />
      <div style={{ flex: '1 1 280px', textAlign: 'right' }}>
        <h4 style={{ 
          color: 'var(--forest-green)', 
          margin: '0 0 0.5rem 0', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          fontSize: '1rem',
          fontFamily: 'Fredoka, sans-serif'
        }}>
          <span>💳</span> טיפ קטן ממני (מניסיון לקראת הטיסה)
        </h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          אם אתם מחפשים דרך נוחה לשלם בדולרים בארה"ב בלי עמלות המרה יקרות, כרטיס האשראי של <strong>לאיה (Laya)</strong> הוא פתרון מעולה. 
          אם תירשמו עם קוד ההטבה <strong>F7Z9E8</strong> ותבצעו רכישות ב-$500 במצטבר, גם אתם וגם אני נקבל $5 במתנה! בלי שום לחץ, רק המלצה ידידותית.
        </p>
        <div style={{ marginTop: '0.8rem' }}>
          <a 
            href="https://laya.onelink.me/5Liq?code=F7Z9E8"
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: 'var(--campfire-amber)',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--campfire-orange)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--campfire-amber)'}
          >
            להזמנת כרטיס לאיה עם קוד ההטבה 🔗
          </a>
        </div>
      </div>
    </div>
  );
}
