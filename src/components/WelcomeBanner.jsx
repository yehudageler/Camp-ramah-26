export default function WelcomeBanner({ currentUser }) {
  const name = currentUser?.name || 'שליח/ה';

  return (
    <section className="welcome-section">
      <div className="welcome-content">
        <h2>שלום, {name}! 👋</h2>
        <p className="welcome-text">ברוכים הבאים למחנה רמה ויסקונסין 2026 🌲⛺</p>
      </div>

      <div className="cozy-campfire-scene">
        <div className="forest-silhouettes">
          <div className="pine-tree tree-1"></div>
          <div className="pine-tree tree-2"></div>
        </div>
        <div className="campfire-wrapper">
          <div className="campfire-glow"></div>
          <div className="campfire-sparks">
            <span className="spark spark-1"></span>
            <span className="spark spark-2"></span>
            <span className="spark spark-3"></span>
            <span className="spark spark-4"></span>
            <span className="spark spark-5"></span>
          </div>
          <div className="fire-flame-rich">
            <div className="flame-layer flame-outer"></div>
            <div className="flame-layer flame-middle"></div>
            <div className="flame-layer flame-inner"></div>
          </div>
          <div className="fire-logs-rich">
            <div className="log log-left"></div>
            <div className="log log-right"></div>
          </div>
        </div>
      </div>
    </section>
  );
}


