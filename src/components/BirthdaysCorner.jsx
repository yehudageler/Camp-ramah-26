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
    .slice(0, 2);

  if (upcomingBirthdays.length === 0) {
    return (
      <section className="birthdays-section birthdays-section--empty">
        <span className="birthdays-icon">🎂</span>
        <h3 className="birthdays-title">ימי הולדת קרובים</h3>
        <p className="birthdays-empty">עוד אין חגיגות קרובות, אבל שווה לחכות!</p>
      </section>
    );
  }

  return (
    <section className="birthdays-section">
      <div className="birthdays-header">
        <span className="birthdays-icon">🎂</span>
        <div>
          <h3 className="birthdays-title">ימי הולדת קרובים</h3>
        </div>
      </div>

      <div className="birthdays-list">
        {upcomingBirthdays.map(b => (
          <div
            key={b.profile.id}
            className={`birthday-item${b.isToday ? ' birthday-item--today' : ''}`}
          >
            <div style={{ flexShrink: 0 }}>
              <AvatarSVG
                avatarType={b.profile.avatar}
                size={48}
                border={b.isToday ? '2px solid var(--campfire-amber)' : '2px solid var(--forest-green-light)'}
              />
            </div>

            <div className="birthday-info">
              <div className="birthday-name">{b.profile.full_name}</div>
              <div
                className="birthday-date"
                style={{ color: b.isToday ? 'var(--campfire-amber)' : undefined, fontWeight: b.isToday ? 'bold' : undefined }}
              >
                {b.isToday ? 'היום! 🎉 🥳' : `בעוד ${b.daysLeft} ימים (${b.dateStr})`}
              </div>
            </div>

            {b.isToday && <span className="birthday-emoji">🎂</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
