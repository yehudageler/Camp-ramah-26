import { AvatarSVG } from './AuthScreen';

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

export default function BirthdaysCorner({ databaseProfiles = [], currentUser = null }) {
  // Combine users
  let allProfiles = [...databaseProfiles];
  if (currentUser && !allProfiles.some(p => p.id === currentUser.id)) {
    allProfiles.push({
      id: currentUser.id,
      full_name: currentUser.name,
      role: currentUser.role,
      avatar: currentUser.avatar,
      birthday: currentUser.birthday
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBirthdays = allProfiles
    .filter(p => p.birthday)
    .map(p => {
      const parts = p.birthday.split('-');
      if (parts.length < 3) return null;
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      // Find the next birthday occurrence
      let nextBday = new Date(today.getFullYear(), month, day);
      if (nextBday < today) {
        nextBday = new Date(today.getFullYear() + 1, month, day);
      }

      const diffTime = nextBday.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const isToday = daysLeft === 0;

      return {
        profile: p,
        daysLeft,
        isToday,
        dateStr: `${day} ב${HEBREW_MONTHS[month]}`
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3); // Get top 3

  if (upcomingBirthdays.length === 0) {
    return (
      <section 
        style={{
          background: 'var(--white-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.5rem',
          boxShadow: 'var(--shadow-soft)',
          border: '1.5px solid rgba(230, 81, 0, 0.18)',
          direction: 'rtl',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.8rem',
          height: '100%',
          textAlign: 'center'
        }}
      >
        <span style={{ fontSize: '2.5rem' }}>🎂</span>
        <h3 style={{ color: 'var(--forest-green)', margin: 0, fontSize: '1.3rem' }}>ימי הולדת קרובים</h3>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>עוד אין חגיגות קרובות, אבל שווה לחכות!</div>
      </section>
    );
  }

  return (
    <section 
      style={{
        background: 'var(--white-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.8rem 1.5rem',
        boxShadow: 'var(--shadow-soft)',
        border: '1.5px solid rgba(230, 81, 0, 0.18)',
        direction: 'rtl',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        height: '100%'
      }}
    >
      <h3 style={{ 
        color: 'var(--forest-green)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.6rem', 
        margin: 0,
        marginBottom: '0.5rem',
        fontSize: '1.3rem'
      }}>
        <span style={{ fontSize: '1.6rem' }}>🎂</span> ימי הולדת קרובים
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flexGrow: 1, justifyContent: 'center' }}>
        {upcomingBirthdays.map(b => (
          <div 
            key={b.profile.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.8rem',
              background: b.isToday ? 'linear-gradient(135deg, var(--campfire-light), #fff9c4)' : '#f8fafc',
              border: b.isToday ? '1.5px solid var(--campfire-amber)' : '1px solid #edf2f7',
              borderRadius: 'var(--radius-md)',
              transition: 'var(--transition)',
              cursor: 'default'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <AvatarSVG avatarType={b.profile.avatar} size={48} border="1.5px solid var(--forest-green)" />
            </div>
            
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.2' }}>
                {b.profile.full_name}
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                color: b.isToday ? 'var(--campfire-amber)' : 'var(--text-muted)', 
                fontWeight: b.isToday ? 'bold' : 'normal',
                marginTop: '4px'
              }}>
                {b.isToday ? 'היום! 🎉 🥳' : `בעוד ${b.daysLeft} ימים (${b.dateStr})`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
