import { useState, useEffect } from 'react';
import CounselorCard from './CounselorCard';

const mockCounselors = [];

export default function CommunityWall({ currentUser, databaseProfiles }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const [viewMode, setViewMode] = useState("grid");

  // Reset pagination when searching
  useEffect(() => {
    setDisplayCount(10);
  }, [searchQuery]);

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

  // Sort alphabetically by name (current user first)
  uniqueCounselors.sort((a, b) => {
    if (a.isCurrentUser && !b.isCurrentUser) return -1;
    if (!a.isCurrentUser && b.isCurrentUser) return 1;
    return a.name.localeCompare(b.name, 'he');
  });

  // Filter based on search query
  const filteredCounselors = uniqueCounselors.filter(c => {
    const text = (c.name + " " + c.role).toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  // Pagination logic
  const displayedCounselors = filteredCounselors.slice(0, displayCount);
  const hasMore = displayCount < filteredCounselors.length;

  return (
    <section className="community-section">
      <div className="section-header">
        <h2 className="section-title">
          <span>👥</span> קיר השליחים של וויסקונסין
        </h2>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="תצוגת כרטיסיות"
            >
              ▦
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="תצוגת רשימה"
            >
              ☰
            </button>
          </div>

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
      </div>

      <div className={viewMode === 'grid' ? "community-grid" : "community-list"}>
        {displayedCounselors.map((c, i) => (
          <CounselorCard key={c.id || c.name || i} counselor={c} mode={viewMode} />
        ))}
        {filteredCounselors.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            לא נמצאו שליחים התואמים את החיפוש.
          </div>
        )}
      </div>
      
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '0.8rem 2.5rem', borderRadius: '30px' }}
            onClick={() => setDisplayCount(prev => prev + 10)}
          >
            הצג עוד שליחים 👇
          </button>
        </div>
      )}
    </section>
  );
}
