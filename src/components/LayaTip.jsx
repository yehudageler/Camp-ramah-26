export default function LayaTip() {
  return (
    <div className="laya-tip-card">
      <img
        src="/laya_card.png"
        alt="Laya Card"
        className="laya-tip-img"
      />
      <div className="laya-tip-content">
        <h4 className="laya-tip-title">
          <span>💳</span> טיפ קטן ממני (מניסיון לקראת הטיסה)
        </h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          אם אתם מחפשים דרך נוחה לשלם בדולרים בארה"ב בלי עמלות המרה יקרות, כרטיס האשראי של <strong>לאיה (Laya)</strong> הוא פתרון מעולה.
          אם תירשמו עם קוד ההטבה <strong>F7Z9E8</strong> ותשתמשו בו ב-$500 במצטבר, גם אתם וגם אני נקבל $5 במתנה! בלי לחץ, רק הצעה ידידותית 😉
        </p>
        <div style={{ marginTop: '0.8rem' }}>
          <a
            href="https://laya.onelink.me/5Liq?code=F7Z9E8"
            target="_blank"
            rel="noopener noreferrer"
            className="laya-tip-link"
          >
            להזמנת כרטיס לאיה עם קוד ההטבה 🔗
          </a>
        </div>
      </div>
    </div>
  );
}
