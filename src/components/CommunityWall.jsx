import { useState } from 'react';
import CounselorCard from './CounselorCard';

const mockCounselors = [];

export default function CommunityWall({ currentUser, databaseProfiles, packingProgress }) {
  const [searchQuery, setSearchQuery] = useState("");

  const allCounselors = [];

  // Add DB profiles if active, else fallback to current user
  if (databaseProfiles && databaseProfiles.length > 0) {
    databaseProfiles.forEach(p => {
      const isMe = currentUser && p.id === currentUser.id;
      allCounselors.push({
        id: p.id,
        name: p.full_name + (isMe ? " (אתם/ן)" : ""),
        role: p.role,
        avatar: p.avatar,
        isCurrentUser: isMe,
        funStats: {
          "סטטוס אריזה": isMe ? `${packingProgress}%` : "ממוצעת",
          "סובלנות ליתושים": isMe ? "בתהליכי הסתגלות" : "ממוצעת",
          "התמכרות לקמפינג": "65%",
          "שיר מועדף": "שיר השליחים 🎸"
        }
      });
    });
  } else if (currentUser) {
    allCounselors.push({
      id: "me",
      name: currentUser.name + " (אתם/ן)",
      role: currentUser.role,
      avatar: currentUser.avatar,
      isCurrentUser: true,
      funStats: {
        "סטטוס אריזה": `${packingProgress}%`,
        "סובלנות ליתושים": "בתהליכי הסתגלות",
        "התמכרות לקמפינג": "50%",
        "שיר מועדף": "פעולת שכבה!"
      }
    });
  }

  // Combine with mock counselors
  allCounselors.push(...mockCounselors);

  // De-duplicate by name
  const uniqueCounselors = [];
  const namesSeen = new Set();
  allCounselors.forEach(c => {
    if (!namesSeen.has(c.name)) {
      namesSeen.add(c.name);
      uniqueCounselors.push(c);
    }
  });

  // Filter based on search query
  const filteredCounselors = uniqueCounselors.filter(c => {
    const text = (c.name + " " + c.role).toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <section className="community-section">
      <div className="section-header">
        <h2 className="section-title">
          <span>👥</span> קיר השליחים של וויסקונסין
        </h2>
        <div className="search-box">
          <input 
            type="text" 
            className="search-input" 
            placeholder="חפשו שליחים לפי שם או תפקיד..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="community-grid">
        {filteredCounselors.map((c, i) => (
          <CounselorCard key={c.id || c.name || i} counselor={c} />
        ))}
        {filteredCounselors.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            לא נמצאו שליחים התואמים את החיפוש.
          </div>
        )}
      </div>
    </section>
  );
}
