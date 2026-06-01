import { useState } from 'react';
import { defaultPackingList } from '../constants/packingList';

export default function PackingList({ checkedStates, customItems, onToggleItem, onDeleteItem, onAddItem, progressPercentage }) {
  const [currentTab, setCurrentTab] = useState("clothing");
  const [customInput, setCustomInput] = useState("");

  const listItems = (currentTab === "custom"
    ? customItems
    : (defaultPackingList[currentTab] || []))
    .filter(item => checkedStates[item.id] !== 'deleted');

  const isWarning = currentTab === "warning";

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onAddItem(customInput.trim());
    setCustomInput("");
  };

  return (
    <section className="packing-section">
      <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
        <span>🎒</span> מה לארוז למחנה?
      </h2>

      <div className="packing-tip-box">
        <span style={{ fontSize: '1.5rem' }}>💡</span>
        <p className="packing-tip-text">
          תמיד אפשר לקנות ולהזמין למחנה הכל, אל תילחצו אם שכחתם משהו - תמיד יש פתרון!
        </p>
      </div>

      {/* Packing progress tracker */}
      <div className="progress-container">
        <div className="progress-header">
          <span>אחוז אריזה מתוך הציוד הנדרש:</span>
          <span id="progress-percentage">{progressPercentage}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      {/* Category Tabs */}
      <nav className="packing-tabs" role="tablist">
        <button className={`tab-btn ${currentTab === 'clothing' ? 'active' : ''}`} onClick={() => setCurrentTab('clothing')}>👚 בגדים</button>
        <button className={`tab-btn ${currentTab === 'wearables' ? 'active' : ''}`} onClick={() => setCurrentTab('wearables')}>👟 פרטי לבוש ונעליים</button>
        <button className={`tab-btn ${currentTab === 'miscellaneous' ? 'active' : ''}`} onClick={() => setCurrentTab('miscellaneous')}>🧭 שונות</button>
        <button className={`tab-btn ${currentTab === 'niceToHave' ? 'active' : ''}`} onClick={() => setCurrentTab('niceToHave')}>☕ נחמד שיש (לא חובה)</button>
        <button className={`tab-btn ${currentTab === 'custom' ? 'active' : ''}`} onClick={() => setCurrentTab('custom')}>➕ ציוד אישי שלי</button>
        <button className={`tab-btn ${currentTab === 'warning' ? 'active' : ''}`} style={{ backgroundColor: 'var(--red-light)', color: 'var(--red-warning)' }} onClick={() => setCurrentTab('warning')}>🚫 מה לא להביא!</button>
      </nav>

      {/* Dynamic list display */}
      <div className="checklist-container">
        <div className={`checklist-group ${isWarning ? 'warning-group' : ''}`}>
          {listItems.map((item) => {
            const isChecked = !!checkedStates[item.id];
            return (
              <div
                key={item.id}
                className={`check-item ${isChecked ? 'checked' : ''} ${isWarning ? 'warning-item' : ''}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}
              >
                <div
                  onClick={() => !isWarning && onToggleItem(item.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexGrow: 1 }}
                >
                  <div className="custom-checkbox"></div>
                  <span className="check-item-text">{item.text}</span>
                </div>

                {!isWarning && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="delete-item-btn"
                    title="מחק פריט ✕"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
          {listItems.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              אין פריטים ברשימה זו עדיין. {currentTab === "custom" ? "הוסיפו פריט משלכם למטה!" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Add custom item form */}
      {currentTab === "custom" && (
        <form className="add-item-form" onSubmit={handleAddSubmit}>
          <input
            type="text"
            className="add-item-input"
            placeholder="הוסיפו פריט אישי שלכם לרשימה..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            required
          />
          <button type="submit" className="btn-add-item">הוסף פריט ➕</button>
        </form>
      )}

      {/* Laya card recommendation tip */}
      {!isWarning && (
        <div style={{
          marginTop: '2.5rem',
          padding: '1.2rem',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--forest-green-light)',
          display: 'flex',
          gap: '1.2rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <img
            src="/laya_card.png"
            alt="Laya Card"
            style={{
              width: '90px',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              flexShrink: 0
            }}
          />
          <div style={{ flex: '1 1 240px' }}>
            <h4 style={{ color: 'var(--forest-green)', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
              💳 טיפ קטן ממני (מניסיון לקראת הטיסה)
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              אם אתם מחפשים דרך נוחה לשלם בדולרים בארה"ב בלי עמלות המרה יקרות, כרטיס האשראי של <strong>לאיה (Laya)</strong> הוא פתרון מעולה.
              בנוסף, אם תירשמו דרך הלינק הזה, גם אתם וגם אני נקבל 5$ במתנה אחרי שתשתמשו ב-100$ הראשונים שלכם במחנה. בלי שום לחץ, רק המלצה ידידותית!
            </p>
            <div style={{ marginTop: '0.6rem' }}>
              <a
                href="#" // User can customize this URL easily
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--campfire-amber)',
                  fontWeight: 'bold',
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                להזמנת כרטיס לאיה וקבלת ההטבה 🔗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
