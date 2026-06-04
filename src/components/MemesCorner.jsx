import { useState, useEffect } from 'react';
import MemeCreatorModal from './MemeCreatorModal';
import { useSwipe } from '../hooks/useSwipe';
import { AvatarSVG } from './AuthScreen';
import toast from 'react-hot-toast';

export default function MemesCorner({
  currentUser,
  isAdmin,
  memes = [],
  databaseProfiles = [],
  onCreateMeme,
  onDeleteMeme,
  onToggleLike
}) {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filtering and Sorting
  const [activeTab, setActiveTab] = useState("newest"); // "newest" | "popular" | "my-memes"

  // Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Swipe for lightbox
  const lightboxSwipe = useSwipe({
    onSwipeLeft: () => {
      if (lightboxIndex < filteredMemes.length - 1) {
        setLightboxIndex(lightboxIndex + 1);
      }
    },
    onSwipeRight: () => {
      if (lightboxIndex > 0) {
        setLightboxIndex(lightboxIndex - 1);
      }
    },
  });

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      else if (e.key === 'ArrowRight' && lightboxIndex > 0) {
        setLightboxIndex(lightboxIndex - 1);
      } else if (e.key === 'ArrowLeft' && lightboxIndex < filteredMemes.length - 1) {
        setLightboxIndex(lightboxIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, lightboxIndex, memes.length]);

  const handleDownloadMeme = async (imageUrl, caption) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `meme-${caption ? caption.replace(/\s+/g, '-').slice(0, 20) : Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("המימ ירד למכשיר שלך! 📥");
    } catch (err) {
      console.error("Meme download failed:", err);
      // Fallback
      window.open(imageUrl, '_blank');
    }
  };

  const handleDeleteClick = async (memeId, imageUrl) => {
    if (!window.confirm("האם למחוק מימ זה לצמיתות?")) return;
    try {
      await onDeleteMeme(memeId, imageUrl);
      toast.success("המימ נמחק בהצלחה!");
      if (isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    } catch (err) {
      toast.error("שגיאה במחיקת המימ.");
    }
  };

  const handleSaveMeme = async (base64Url, caption) => {
    try {
      await onCreateMeme(base64Url, caption, currentUser);
      toast.success("המימ פורסם בפינה בהצלחה! 🎭");
    } catch (err) {
      toast.error("שגיאה בפרסום המימ.");
      throw err;
    }
  };

  // ── Process Memes (Filter -> Sort) ─────────────────
  const getProcessedMemes = () => {
    // 1. Initial filter (Search & Tabs)
    let result = [...memes];

    if (activeTab === "my-memes" && currentUser) {
      result = result.filter(m => m.user_id === currentUser.id);
    }

    if (searchQuery.trim() !== "") {
      const term = searchQuery.toLowerCase();
      result = result.filter(m => 
        (m.caption && m.caption.toLowerCase().includes(term)) ||
        (m.creator_name && m.creator_name.toLowerCase().includes(term))
      );
    }

    // 2. Sorting
    if (activeTab === "popular") {
      result.sort((a, b) => {
        const likesA = Array.isArray(a.liked_by) ? a.liked_by.length : 0;
        const likesB = Array.isArray(b.liked_by) ? b.liked_by.length : 0;
        return likesB - likesA; // Most liked first
      });
    } else {
      // "newest" or default "my-memes" (sorted chronologically)
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  };

  const filteredMemes = getProcessedMemes();

  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <section className="memes-section">
      
      {/* Header Area */}
      <div className="memes-header">
        <h3>
          <span>🎭</span> פינת המימים של המחנה
        </h3>
        
        <div className="memes-header-actions">
          <input
            type="text"
            placeholder="חפש מימים או יוצרים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="memes-search"
          />
          <button 
            className="create-meme-btn"
            onClick={() => setIsCreatorOpen(true)}
          >
            <span>➕</span> צור מימ חדש
          </button>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem', marginTop: '-0.3rem' }}>
        כאן יוצרים, משתפים וצוחקים ביחד! הפיקו מימים חדשים ישירות מהאתר או העלו תמונות משלכם.
      </p>

      {/* Tabs for Filtering/Sorting */}
      <div className="memes-tabs">
        <button
          className={`memes-tab-btn ${activeTab === "newest" ? "active" : ""}`}
          onClick={() => setActiveTab("newest")}
        >
          🆕 חדשים
        </button>
        <button
          className={`memes-tab-btn ${activeTab === "popular" ? "active" : ""}`}
          onClick={() => setActiveTab("popular")}
        >
          🔥 הכי פופולריים
        </button>
        {currentUser && (
          <button
            className={`memes-tab-btn ${activeTab === "my-memes" ? "active" : ""}`}
            onClick={() => setActiveTab("my-memes")}
          >
            👤 המימים שלי
          </button>
        )}
      </div>

      {/* Memes Grid */}
      <div className="memes-grid">
        {filteredMemes.length === 0 ? (
          <div className="memes-empty">
            <span style={{ fontSize: '2.5rem' }}>🤡</span>
            <h4 style={{ marginTop: '0.5rem', fontWeight: '500' }}>אין מימים מתאימים...</h4>
            <p style={{ fontSize: '0.8rem' }}>היו הראשונים להצחיק את כולם וליצור מימ ראשון!</p>
          </div>
        ) : (
          filteredMemes.map((meme, index) => {
            const likedByArray = Array.isArray(meme.liked_by) ? meme.liked_by : [];
            const hasLiked = currentUser ? likedByArray.includes(currentUser.id) : false;
            const isOwner = currentUser && (currentUser.id === meme.user_id);
            const canDelete = isOwner || isAdmin;

            // Find creator avatar SVG from profile details
            const creatorProfile = databaseProfiles.find(p => p.id === meme.user_id) || 
                                   databaseProfiles.find(p => p.full_name === meme.creator_name);
            const creatorAvatar = creatorProfile ? creatorProfile.avatar : 'counselor-1';

            return (
              <div key={meme.id} className="meme-card" style={{ animationDelay: `${index * 0.05}s` }}>
                
                {/* Instagram Header */}
                <div className="meme-card-header">
                  <div className="meme-avatar-container">
                    <AvatarSVG avatarType={creatorAvatar} size={30} />
                  </div>
                  <div className="meme-creator-info">
                    <span className="meme-card-creator-name">{meme.creator_name}</span>
                    <span className="meme-card-date">
                      {new Date(meme.created_at).toLocaleDateString("he-IL", {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                </div>

                {/* Image */}
                <div 
                  className="meme-image-container"
                  onClick={() => handleOpenLightbox(index)}
                  title="לחצו להגדלה במסך מלא 🔍"
                >
                  <img 
                    src={meme.image_url} 
                    alt={meme.caption || "מימ מחנה"} 
                    className="meme-image"
                    loading="lazy"
                  />
                </div>

                {/* Info & Actions */}
                <div className="meme-info">
                  {/* Actions Row */}
                  <div className="meme-card-actions-row">
                    <button 
                      onClick={() => onToggleLike(meme.id, currentUser?.id)}
                      className={`meme-like-btn ${hasLiked ? 'liked' : ''}`}
                      title={hasLiked ? "הסר לייק" : "לייק"}
                      disabled={!currentUser}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      <span>{likedByArray.length}</span>
                    </button>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {/* Download */}
                      <button 
                        onClick={() => handleDownloadMeme(meme.image_url, meme.caption)}
                        className="meme-action-icon-btn"
                        title="הורד מים למכשיר"
                      >
                        📥
                      </button>

                      {/* Delete */}
                      {canDelete && (
                        <button 
                          onClick={() => handleDeleteClick(meme.id, meme.image_url)}
                          className="meme-action-icon-btn delete"
                          title="מחק מימ"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {meme.caption ? (
                    <p className="meme-caption">{meme.caption}</p>
                  ) : (
                    <p className="meme-caption" style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>ללא כיתוב</p>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Creator Modal */}
      {isCreatorOpen && (
        <MemeCreatorModal
          onClose={() => setIsCreatorOpen(false)}
          onSave={handleSaveMeme}
          currentUser={currentUser}
        />
      )}

      {/* Upgraded Lightbox Modal */}
      {isLightboxOpen && filteredMemes.length > 0 && (
        <div
          className="meme-lightbox-overlay"
          onClick={() => setIsLightboxOpen(false)}
          {...lightboxSwipe}
        >
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
              width: '44px', height: '44px', color: '#fff', fontSize: '1.5rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10001
            }}
            title="סגור (Esc)"
          >
            ✕
          </button>

          {/* Nav – Next (Older) - on the left */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            disabled={lightboxIndex === filteredMemes.length - 1}
            className="meme-lightbox-nav-btn"
            style={{ position: 'absolute', left: '30px', zIndex: 10000, opacity: lightboxIndex === filteredMemes.length - 1 ? 0.3 : 1 }}
          >‹</button>

          {/* Nav – Prev (Newer) - on the right */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            disabled={lightboxIndex === 0}
            className="meme-lightbox-nav-btn"
            style={{ position: 'absolute', right: '30px', zIndex: 10000, opacity: lightboxIndex === 0 ? 0.3 : 1 }}
          >›</button>

          {/* Lightbox Content Wrapper */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '82vh',
              gap: '1rem',
              boxSizing: 'border-box',
              paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
              zIndex: 9999
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Container */}
            <div
              style={{
                flex: '1 1 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              <img
                src={filteredMemes[lightboxIndex].image_url}
                alt={filteredMemes[lightboxIndex].caption || "מימ מחנה"}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
              />
            </div>

            {/* Caption & Actions Overlay */}
            <div className="meme-lightbox-caption-overlay">
              <h4 className="meme-lightbox-caption-title">
                {filteredMemes[lightboxIndex].caption || "מימ ללא כותרת"}
              </h4>
              <div className="meme-lightbox-caption-meta">
                <span>👤 הועלה על ידי {filteredMemes[lightboxIndex].creator_name}</span>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>📅 {new Date(filteredMemes[lightboxIndex].created_at).toLocaleDateString("he-IL")}</span>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>מימ {lightboxIndex + 1} מתוך {filteredMemes.length}</span>
              </div>

              {/* Actions panel inside Lightbox */}
              <div className="meme-lightbox-caption-actions">
                <button 
                  onClick={() => onToggleLike(filteredMemes[lightboxIndex].id, currentUser?.id)}
                  className={`meme-like-btn ${currentUser && (filteredMemes[lightboxIndex].liked_by || []).includes(currentUser.id) ? 'liked' : ''}`}
                  style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)' }}
                  disabled={!currentUser}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    style={{ marginLeft: '0.3rem' }}
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  <span>{(filteredMemes[lightboxIndex].liked_by || []).length}</span>
                </button>

                <button
                  onClick={() => handleDownloadMeme(filteredMemes[lightboxIndex].image_url, filteredMemes[lightboxIndex].caption)}
                  className="tab-btn"
                  style={{ padding: '0.4rem 1rem', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: '0.85rem' }}
                >
                  📥 הורדה
                </button>

                {(isAdmin || (currentUser && currentUser.id === filteredMemes[lightboxIndex].user_id)) && (
                  <button
                    onClick={() => handleDeleteClick(filteredMemes[lightboxIndex].id, filteredMemes[lightboxIndex].image_url)}
                    className="logout-btn"
                    style={{ margin: 0, padding: '0.4rem 1rem', fontSize: '0.85rem', backgroundColor: 'var(--red-warning)' }}
                  >
                    🗑️ מחיקה
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
