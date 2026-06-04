import { useState } from 'react';
import { ADMIN_EMAIL } from '../hooks/useAuth';

export default function AdminPanel({ suggestions, counselors, packingStates, defaultPackingList, onDeleteUser, onDeleteSuggestion, onClose }) {
  const [activeTab, setActiveTab] = useState("suggestions");

  const calculateProgress = (userId, customItems = []) => {
    const userState = packingStates.find(state => state.user_id === userId);
    const checkedStates = userState?.checked_items || {};
    const userCustomItems = userState?.custom_items || customItems || [];

    const activeLists = ["clothing", "wearables", "miscellaneous", "niceToHave"];
    let totalItems = userCustomItems.length;
    let checkedCount = 0;

    activeLists.forEach(category => {
      const list = defaultPackingList[category] || [];
      totalItems += list.length;
      list.forEach(item => {
        if (checkedStates[item.id]) checkedCount++;
      });
    });

    userCustomItems.forEach(item => {
      if (checkedStates[item.id]) checkedCount++;
    });

    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  };

  const totalUsers = counselors.length;
  const totalSuggestions = suggestions.length;
  const avgProgress = counselors.length > 0
    ? Math.round(counselors.reduce((acc, c) => acc + calculateProgress(c.id), 0) / counselors.length)
    : 0;

  const getProgressColor = (p) =>
    p > 70 ? 'var(--forest-green)' : p > 30 ? 'var(--lake-blue)' : 'var(--campfire-amber)';

  return (
    <div className="admin-overlay">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h2>🛠️ פאנל ניהול – קמפ רמה 2026</h2>
            <p>שלום יהודה 👋 כאן תוכל לראות הצעות וסטטיסטיקות אריזה בזמן אמת.</p>
          </div>
          <button className="admin-close-btn" onClick={onClose} aria-label="סגור פאנל">✕</button>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card admin-stat-card--green">
            <span style={{ fontSize: '1.5rem' }}>👥</span>
            <h4>סה"כ שליחים רשומים</h4>
            <div className="admin-stat-value">{totalUsers}</div>
          </div>
          <div className="admin-stat-card admin-stat-card--amber">
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <h4>הצעות שהתקבלו</h4>
            <div className="admin-stat-value">{totalSuggestions}</div>
          </div>
          <div className="admin-stat-card admin-stat-card--blue">
            <span style={{ fontSize: '1.5rem' }}>🎒</span>
            <h4>ממוצע אריזה כללי</h4>
            <div className="admin-stat-value">{avgProgress}%</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`admin-tab${activeTab === "suggestions" ? ' active' : ''}`}
          >
            💡 הצעות לשיפור ({totalSuggestions})
          </button>
          <button
            onClick={() => setActiveTab("counselors")}
            className={`admin-tab${activeTab === "counselors" ? ' active' : ''}`}
          >
            📋 מעקב אריזה ושליחים ({totalUsers})
          </button>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          {activeTab === "suggestions" ? (
            <div>
              {suggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <h3>אין הצעות כרגע 💭</h3>
                  <p>הצעות שיישלחו על ידי השליחים יופיעו כאן מיד.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {suggestions.map((s, index) => (
                    <div key={s.id || index} className="admin-suggestion-item">
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontSize: '1.1rem', margin: '0 0 0.8rem 0', fontWeight: '500' }}>"{s.text}"</p>
                        <div className="admin-suggestion-meta">
                          <span>👤 מאת: <strong>{s.user_name}</strong></span>
                          <span>📅 תאריך: {s.created_at ? new Date(s.created_at).toLocaleString("he-IL") : "חדש"}</span>
                        </div>
                      </div>
                      <button onClick={() => onDeleteSuggestion(s.id)} className="admin-delete-btn">
                        🗑️ מחק
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Desktop: Table */}
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="admin-th">שם מלא</th>
                      <th className="admin-th">אימייל</th>
                      <th className="admin-th">תפקיד במחנה</th>
                      <th className="admin-th admin-td--center">אחוז אריזה</th>
                      <th className="admin-th admin-td--center">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counselors.map((c) => {
                      const progress = calculateProgress(c.id);
                      return (
                        <tr key={c.id} className="admin-tr">
                          <td className="admin-td" style={{ fontWeight: 'bold' }}>{c.full_name}</td>
                          <td className="admin-td" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.email}</td>
                          <td className="admin-td">
                            <span className="admin-role-badge">{c.role}</span>
                          </td>
                          <td className="admin-td admin-td--center">
                            <div className="admin-progress-wrap">
                              <div className="admin-progress-bar-bg">
                                <div
                                  className="admin-progress-bar-fill"
                                  style={{ width: `${progress}%`, backgroundColor: getProgressColor(progress) }}
                                />
                              </div>
                              <span style={{ fontWeight: 'bold', minWidth: '35px' }}>{progress}%</span>
                            </div>
                          </td>
                          <td className="admin-td admin-td--center">
                            {c.email !== ADMIN_EMAIL ? (
                              <button onClick={() => onDeleteUser(c.id)} className="admin-delete-btn">
                                🗑️ הסר משתמש
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>מנהל</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="admin-cards">
                {counselors.map((c) => {
                  const progress = calculateProgress(c.id);
                  return (
                    <div key={c.id} className="admin-counselor-card">
                      <div className="admin-counselor-info">
                        <div className="admin-counselor-name">{c.full_name}</div>
                        <div className="admin-counselor-email">{c.email}</div>
                        <span className="admin-role-badge">{c.role}</span>
                        <div className="admin-progress-wrap" style={{ marginTop: '0.5rem', justifyContent: 'flex-start' }}>
                          <div className="admin-progress-bar-bg">
                            <div
                              className="admin-progress-bar-fill"
                              style={{ width: `${progress}%`, backgroundColor: getProgressColor(progress) }}
                            />
                          </div>
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{progress}%</span>
                        </div>
                      </div>
                      <div className="admin-counselor-actions">
                        {c.email !== ADMIN_EMAIL ? (
                          <button onClick={() => onDeleteUser(c.id)} className="admin-delete-btn">
                            🗑️ הסר
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>מנהל</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
