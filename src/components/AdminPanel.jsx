import { useState } from 'react';

export default function AdminPanel({ suggestions, counselors, packingStates, defaultPackingList, onClose }) {
  const [activeTab, setActiveTab] = useState("suggestions"); // "suggestions" or "counselors"

  // 1. Calculate packing progress for a given user
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
        if (checkedStates[item.id]) {
          checkedCount++;
        }
      });
    });
    
    userCustomItems.forEach(item => {
      if (checkedStates[item.id]) {
        checkedCount++;
      }
    });
    
    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  };

  // 2. Stats
  const totalUsers = counselors.length;
  const totalSuggestions = suggestions.length;
  
  const avgProgress = counselors.length > 0 
    ? Math.round(counselors.reduce((acc, c) => acc + calculateProgress(c.id), 0) / counselors.length) 
    : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(32, 42, 37, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem',
      direction: 'rtl'
    }}>
      <div style={{
        backgroundColor: 'var(--cream-bg)',
        width: '100%',
        maxWidth: '900px',
        height: '90vh',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '3px solid var(--forest-green)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'var(--forest-green)',
          color: 'var(--white-card)',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontFamily: 'Fredoka', margin: 0, fontSize: '1.8rem' }}>🛠️ פאנל ניהול - קמפ רמה 2026</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>שלום יהודה 👋 כאן תוכל לראות הצעות וסטטיסטיקות אריזה בזמן אמת.</p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'var(--white-card)',
              fontSize: '1.5rem',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ✕
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          padding: '1.5rem 2rem',
          backgroundColor: 'var(--white-card)',
          borderBottom: '1px solid var(--forest-green-light)'
        }}>
          <div style={{
            background: 'var(--forest-green-light)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid rgba(30, 70, 32, 0.15)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>👥</span>
            <h4 style={{ margin: '4px 0', color: 'var(--forest-green)' }}>סה"כ שליחים רשומים</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalUsers}</div>
          </div>
          <div style={{
            background: 'var(--campfire-light)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid rgba(230, 81, 0, 0.15)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <h4 style={{ margin: '4px 0', color: 'var(--campfire-amber)' }}>הצעות שהתקבלו</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalSuggestions}</div>
          </div>
          <div style={{
            background: 'var(--lake-light)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid rgba(2, 136, 209, 0.15)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🎒</span>
            <h4 style={{ margin: '4px 0', color: 'var(--lake-blue)' }}>ממוצע אריזה כללי</h4>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{avgProgress}%</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid var(--forest-green-light)',
          background: 'var(--white-card)',
          padding: '0 2rem'
        }}>
          <button 
            onClick={() => setActiveTab("suggestions")}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === "suggestions" ? '4px solid var(--forest-green)' : '4px solid transparent',
              color: activeTab === "suggestions" ? 'var(--forest-green)' : 'var(--text-muted)',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            💡 הצעות לשיפור ({totalSuggestions})
          </button>
          <button 
            onClick={() => setActiveTab("counselors")}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === "counselors" ? '4px solid var(--forest-green)' : '4px solid transparent',
              color: activeTab === "counselors" ? 'var(--forest-green)' : 'var(--text-muted)',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            📋 מעקב אריזה ושליחים ({totalUsers})
          </button>
        </div>

        {/* Content Area */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '2rem'
        }}>
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
                    <div key={s.id || index} style={{
                      backgroundColor: 'var(--white-card)',
                      padding: '1.2rem',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      border: '1px solid var(--forest-green-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontSize: '1.1rem', margin: '0 0 0.8rem 0', fontWeight: '500' }}>"{s.text}"</p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <span>👤 מאת: <strong>{s.user_name}</strong></span>
                          <span>📅 תאריך: {new Date(s.created_at || Date.now()).toLocaleString("he-IL")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{
                backgroundColor: 'var(--white-card)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--forest-green-light)'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'right'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: 'var(--forest-green-light)',
                      color: 'var(--forest-green)',
                      fontWeight: 'bold',
                      borderBottom: '2px solid rgba(30, 70, 32, 0.15)'
                    }}>
                      <th style={{ padding: '1rem' }}>שם מלא</th>
                      <th style={{ padding: '1rem' }}>אימייל</th>
                      <th style={{ padding: '1rem' }}>תפקיד במחנה</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>אחוז אריזה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counselors.map((c) => {
                      const progress = calculateProgress(c.id);
                      return (
                        <tr key={c.id} style={{
                          borderBottom: '1px solid var(--forest-green-light)'
                        }}>
                          <td style={{ padding: '1rem', fontWeight: 'bold' }}>{c.full_name}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              background: 'var(--campfire-light)',
                              color: 'var(--campfire-amber)',
                              padding: '2px 8px',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}>{c.role}</span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '60px',
                                backgroundColor: '#edf2f7',
                                height: '8px',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${progress}%`,
                                  backgroundColor: progress > 70 ? 'var(--forest-green)' : progress > 30 ? 'var(--lake-blue)' : 'var(--campfire-amber)',
                                  height: '100%'
                                }}></div>
                              </div>
                              <span style={{ fontWeight: 'bold', minWidth: '35px' }}>{progress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
