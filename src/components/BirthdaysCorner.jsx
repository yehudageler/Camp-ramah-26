import { useState, useEffect } from 'react';
import { AvatarSVG } from './AuthScreen';

const HEBREW_DAYS = ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "יום שבת"];
const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

// Mock profiles with birthdays for local preview/development
const mockBirthdays = [
  {
    id: "mock-1",
    full_name: "שירה לוי",
    role: "ראש עדה",
    avatar: "canoe",
    // We will set their birthday dynamically to match "today", "tomorrow" and "in 4 days"
    birthday: "" 
  },
  {
    id: "mock-2",
    full_name: "יונתן כהן",
    role: "מדריך אגם",
    avatar: "pine",
    birthday: ""
  },
  {
    id: "mock-3",
    full_name: "נועה ברק",
    role: "מדריכת אומנות",
    avatar: "guitar",
    birthday: ""
  },
  {
    id: "mock-4",
    full_name: "גיא רפאלי",
    role: "מדריך נגרות",
    avatar: "user",
    birthday: ""
  }
];

export default function BirthdaysCorner({ databaseProfiles = [], currentUser = null }) {
  const [celebrants, setCelebrants] = useState([]);
  const [showConfetti, setShowConfetti] = useState({});

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate dates dynamically for mock users to make the UI look active
    const todayStr = getOffsetDateString(0);
    const tomorrowStr = getOffsetDateString(1);
    const inThreeDaysStr = getOffsetDateString(3);
    const inTenDaysStr = getOffsetDateString(10);

    mockBirthdays[0].birthday = todayStr; // Today
    mockBirthdays[1].birthday = tomorrowStr; // Tomorrow (This week)
    mockBirthdays[2].birthday = inThreeDaysStr; // This week
    mockBirthdays[3].birthday = inTenDaysStr; // Upcoming

    // Merge database profiles and filter duplicates
    let allProfiles = [...databaseProfiles];
    
    // Add current user if not in databaseProfiles
    if (currentUser && !allProfiles.some(p => p.id === currentUser.id)) {
      allProfiles.push({
        id: currentUser.id,
        full_name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
        birthday: currentUser.birthday
      });
    }

    // If no profiles have birthdays (e.g. database is new or empty), use mock data for demo
    const hasAnyBirthday = allProfiles.some(p => p.birthday);
    if (!hasAnyBirthday) {
      allProfiles = [...allProfiles, ...mockBirthdays];
    }

    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    const processed = allProfiles
      .filter(p => p.birthday)
      .map(p => {
        const parts = p.birthday.split('-');
        if (parts.length < 3) return null;
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        // Construct birthday dates in prev, current, next year
        const birthDateInCurrentYear = new Date(today.getFullYear(), month, day);
        const birthDateInNextYear = new Date(today.getFullYear() + 1, month, day);
        const birthDateInPrevYear = new Date(today.getFullYear() - 1, month, day);

        let targetBirthDate = birthDateInCurrentYear;
        
        // Find if it falls in the current calendar week (Sunday-Saturday)
        const isThisWeek = 
          (birthDateInCurrentYear >= sunday && birthDateInCurrentYear <= saturday) ||
          (birthDateInNextYear >= sunday && birthDateInNextYear <= saturday) ||
          (birthDateInPrevYear >= sunday && birthDateInPrevYear <= saturday);

        if (birthDateInCurrentYear >= sunday && birthDateInCurrentYear <= saturday) {
          targetBirthDate = birthDateInCurrentYear;
        } else if (birthDateInNextYear >= sunday && birthDateInNextYear <= saturday) {
          targetBirthDate = birthDateInNextYear;
        } else if (birthDateInPrevYear >= sunday && birthDateInPrevYear <= saturday) {
          targetBirthDate = birthDateInPrevYear;
        } else {
          // If not this week, find the closest upcoming birthday date
          let bDate = birthDateInCurrentYear;
          if (bDate < today) {
            bDate = birthDateInNextYear;
          }
          targetBirthDate = bDate;
        }

        const isToday = today.getMonth() === month && today.getDate() === day;
        const isMe = currentUser && p.id === currentUser.id;

        // Calculate days left from today
        const diffTime = targetBirthDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          profile: p,
          birthdayOriginal: p.birthday,
          birthdayDate: targetBirthDate,
          dayOfWeek: HEBREW_DAYS[targetBirthDate.getDay()],
          monthName: HEBREW_MONTHS[month],
          dayOfMonth: day,
          isThisWeek,
          isToday,
          isMe,
          daysLeft
        };
      })
      .filter(Boolean);

    // Sort: today first, then this week's other days, then upcoming
    processed.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return a.birthdayDate - b.birthdayDate;
    });

    setCelebrants(processed);
  }, [databaseProfiles, currentUser]);

  function getOffsetDateString(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const handleTriggerConfetti = (id) => {
    setShowConfetti(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setShowConfetti(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const thisWeekList = celebrants.filter(c => c.isThisWeek);
  const upcomingList = celebrants.filter(c => !c.isThisWeek).slice(0, 3);

  return (
    <section 
      className="birthday-section" 
      style={{
        background: 'var(--white-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-soft)',
        marginBottom: '2.5rem',
        border: '1.5px solid rgba(230, 81, 0, 0.18)',
        direction: 'rtl'
      }}
    >
      <div 
        className="section-header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <h2 className="section-title" style={{ color: 'var(--forest-green)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
          <span style={{ fontSize: '2rem' }}>🎂</span> פינת ימי הולדת השבוע!
        </h2>
        <span 
          style={{ 
            fontSize: '0.85rem', 
            color: 'var(--campfire-amber)', 
            backgroundColor: 'var(--campfire-light)', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontWeight: 'bold' 
          }}
        >
          חוגגים ביחד 🏕️
        </span>
      </div>

      {thisWeekList.length > 0 ? (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '1.5rem',
            marginBottom: upcomingList.length > 0 ? '2rem' : 0
          }}
        >
          {thisWeekList.map((c) => {
            const today = new Date();
            const isPast = c.birthdayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            return (
              <div 
                key={c.profile.id}
                onClick={() => handleTriggerConfetti(c.profile.id)}
                style={{
                  position: 'relative',
                  background: c.isToday 
                    ? 'linear-gradient(135deg, var(--campfire-light), #fff9c4)'
                    : 'var(--forest-green-light)',
                  border: c.isToday 
                    ? '2px solid var(--campfire-amber)' 
                    : '1.5px solid rgba(30, 70, 32, 0.12)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  overflow: 'hidden'
                }}
                className="birthday-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {c.isToday && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '-10px',
                      fontSize: '2rem',
                      transform: 'rotate(-15deg)',
                      animation: 'float 3s ease-in-out infinite'
                    }}
                  >
                    🎈
                  </div>
                )}
                
                <div style={{ flexShrink: 0 }}>
                  <AvatarSVG avatarType={c.profile.avatar} size={50} />
                </div>
                
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {c.profile.full_name}
                    {c.isMe && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(אתם/ן)</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {c.profile.role}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 'bold', 
                      color: c.isToday ? 'var(--campfire-amber)' : 'var(--forest-green)'
                    }}
                  >
                    {c.isToday ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        היום! 🎉 יום הולדת שמח 🥳
                      </span>
                    ) : isPast ? (
                      `חגג/ה ב${c.dayOfWeek} (${c.dayOfMonth} ב${c.monthName})`
                    ) : (
                      `חוגג/ת ב${c.dayOfWeek} (${c.dayOfMonth} ב${c.monthName})`
                    )}
                  </div>
                </div>

                {showConfetti[c.profile.id] && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0, right: 0, bottom: 0, left: 0,
                      background: 'rgba(255, 255, 255, 0.85)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: 'var(--campfire-amber)',
                      zIndex: 10,
                      animation: 'check-pop 0.3s ease'
                    }}
                  >
                    🎈✨ 🥳 מזל טוב! 🎉🎂
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            background: 'var(--cream-bg)', 
            borderRadius: 'var(--radius-md)', 
            color: 'var(--text-muted)',
            marginBottom: upcomingList.length > 0 ? '2rem' : 0,
            border: '1px dashed rgba(30, 70, 32, 0.15)'
          }}
        >
          <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem' }}>🍃</span>
          אין ימי הולדת השבוע... אבל בקרוב יש חגיגות!
        </div>
      )}

      {upcomingList.length > 0 && (
        <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '1.5rem' }}>
          <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>📅</span> ימי הולדת בקרוב:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {upcomingList.map((c) => (
              <div 
                key={c.profile.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #edf2f7'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <AvatarSVG avatarType={c.profile.avatar} size={36} />
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {c.profile.full_name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>
                      ({c.profile.role})
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  בעוד {c.daysLeft} ימים ({c.dayOfMonth} ב{c.monthName}) 🎁
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
