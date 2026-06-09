import { useState } from 'react';
import { ADMIN_EMAIL } from '../hooks/useAuth';

export default function AdminPanel({ suggestions, counselors, dailyPhotos = [], onDeleteUser, onDeleteSuggestion, onClose }) {
  const [activeTab, setActiveTab] = useState("suggestions");

  const totalUsers = counselors.length;
  const totalSuggestions = suggestions.length;
  const totalPhotos = dailyPhotos.length;

  return (
    <div className="admin-overlay">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h2>🛠️ פאנל ניהול – קמפ רמה 2026</h2>
            <p>שלום יהודה 👋 כאן תוכל לראות הצעות וסטטיסטיקות בזמן אמת.</p>
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
            <span style={{ fontSize: '1.5rem' }}>📸</span>
            <h4>תמונות שהועלו לגלריה</h4>
            <div className="admin-stat-value">{totalPhotos}</div>
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
            📋 ניהול שליחים רשומים ({totalUsers})
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
                      <th className="admin-th admin-td--center">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counselors.map((c) => {
                      return (
                        <tr key={c.id} className="admin-tr">
                          <td className="admin-td" style={{ fontWeight: 'bold' }}>{c.full_name}</td>
                          <td className="admin-td" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.email}</td>
                          <td className="admin-td">
                            <span className="admin-role-badge">{c.role}</span>
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
                  return (
                    <div key={c.id} className="admin-counselor-card">
                      <div className="admin-counselor-info">
                        <div className="admin-counselor-name">{c.full_name}</div>
                        <div className="admin-counselor-email">{c.email}</div>
                        <span className="admin-role-badge">{c.role}</span>
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
