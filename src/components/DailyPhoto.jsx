import { useState, useEffect } from 'react';
import { processImage } from '../lib/imageUtils';
import toast from 'react-hot-toast';
import { useSwipe } from '../hooks/useSwipe';

export default function DailyPhoto({
  isAdmin,
  dailyPhotos = [],
  onUploadPhoto,
  onDeletePhoto,
  onUpdatePhotoCaption
}) {
  // Photo states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadCaption, setUploadCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");

  useEffect(() => {
    setIsEditingCaption(false);
    setEditedCaption(dailyPhotos[currentIndex]?.caption || "");
  }, [currentIndex, dailyPhotos]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      else if (e.key === 'ArrowRight' && currentIndex > 0) setCurrentIndex(currentIndex - 1);
      else if (e.key === 'ArrowLeft' && currentIndex < dailyPhotos.length - 1) setCurrentIndex(currentIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentIndex, dailyPhotos.length]);

  // Swipe for gallery and lightbox (RTL: swipe left = older, swipe right = newer)
  const gallerySwipe = useSwipe({
    onSwipeLeft: () => { if (currentIndex < dailyPhotos.length - 1) setCurrentIndex(currentIndex + 1); },
    onSwipeRight: () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); },
  });
  const lightboxSwipe = useSwipe({
    onSwipeLeft: () => { if (currentIndex < dailyPhotos.length - 1) setCurrentIndex(currentIndex + 1); },
    onSwipeRight: () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); },
  });

  const handleSaveCaption = async (e) => {
    e.preventDefault();
    const currentPhoto = dailyPhotos[currentIndex];
    if (currentPhoto && onUpdatePhotoCaption) {
      await onUpdatePhotoCaption(currentPhoto.id, editedCaption.trim());
      setIsEditingCaption(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const processed = await processImage(file, { maxDim: 1200 });
        setSelectedFile(processed.file);
        setPreviewUrl(processed.dataUrl);
      } catch (err) {
        console.error("Error processing photo:", err);
        toast.error("שגיאה בעיבוד התמונה. נא לנסות קובץ אחר.");
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!previewUrl) return;
    setUploading(true);
    try {
      await onUploadPhoto(selectedFile, previewUrl, uploadCaption);
      setSelectedFile(null);
      setPreviewUrl("");
      setUploadCaption("");
      setCurrentIndex(0);
      toast.success("התמונה הועלתה בהצלחה! 📸");
    } catch (err) {
      console.error("Failed to upload photo:", err);
      toast.error("שגיאה בהעלאת התמונה.");
    } finally {
      setUploading(false);
    }
  };

  const handleNextPhoto = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handlePrevPhoto = () => {
    if (currentIndex < dailyPhotos.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleDeleteCurrent = async () => {
    if (!window.confirm("האם למחוק תמונה זו לצמיתות?")) return;
    const photoToDelete = dailyPhotos[currentIndex];
    if (photoToDelete && onDeletePhoto) {
      try {
        await onDeletePhoto(photoToDelete.id);
        if (currentIndex >= dailyPhotos.length - 1 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      } catch (err) {
        console.error("Failed to delete photo:", err);
        toast.error("שגיאה במחיקת התמונה.");
      }
    }
  };

  return (
    <>
      <div className="gallery-card">
        <h3>
          <span>📸</span> פינת התמונה היומית
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
          כאן תעלה כל יום תמונה יפה ומרגשת מהמחנה! עקבו אחרי הרגעים המשותפים.
        </p>

        {/* Gallery Display */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {dailyPhotos.length === 0 ? (
            <div className="gallery-empty">
              <span style={{ fontSize: '2.5rem' }}>🏕️</span>
              <h4 style={{ marginTop: '0.5rem', fontWeight: '500' }}>אין תמונה יומית עדיין</h4>
              <p style={{ fontSize: '0.8rem' }}>יהודה יעלה תמונות בקרוב, יש למה לחכות!</p>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%' }} {...gallerySwipe}>

              {/* Image and Caption */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', width: '100%' }}>
                <img
                  src={dailyPhotos[currentIndex].image_data}
                  alt={dailyPhotos[currentIndex].caption || "תמונה יומית"}
                  className="gallery-image"
                  onClick={() => setIsLightboxOpen(true)}
                  title="לחצו להגדלה במסך מלא 🔍"
                />

                {/* Caption Area */}
                <div className="gallery-caption-area">
                  {isEditingCaption ? (
                    <form onSubmit={handleSaveCaption} className="gallery-caption-form">
                      <input
                        type="text"
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        className="add-item-input"
                        style={{ flexGrow: 1, padding: '0.6rem 0.8rem', fontSize: '1rem', margin: 0, borderRadius: 'var(--radius-sm)', border: '2px solid var(--forest-green-light)', textAlign: 'center' }}
                        placeholder="הוסיפו כיתוב לתמונה..."
                        autoFocus
                      />
                      <button type="submit" style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--forest-green)', color: '#fff', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>שמור</button>
                      <button type="button" onClick={() => setIsEditingCaption(false)} style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', backgroundColor: 'transparent', cursor: 'pointer' }}>ביטול</button>
                    </form>
                  ) : (
                    <>
                      {dailyPhotos[currentIndex].caption ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem' }}>
                          <h4 className="gallery-caption-text">{dailyPhotos[currentIndex].caption}</h4>
                          {isAdmin && (
                            <button
                              className="gallery-edit-caption-btn"
                              onClick={() => { setIsEditingCaption(true); setEditedCaption(dailyPhotos[currentIndex].caption || ""); }}
                              title="ערוך כיתוב"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      ) : (
                        isAdmin && (
                          <button
                            className="gallery-edit-caption-btn"
                            style={{ color: 'var(--campfire-amber)', fontWeight: '600', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={() => { setIsEditingCaption(true); setEditedCaption(""); }}
                          >
                            ✏️ הוספת כיתוב לתמונה
                          </button>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Date & Carousel Controls */}
              <div className="gallery-controls">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
                  <span className="gallery-date-badge">
                    <span>📅</span> הועלה ב-{new Date(dailyPhotos[currentIndex].created_at).toLocaleDateString("he-IL")}
                  </span>
                  {isAdmin && (
                    <button onClick={handleDeleteCurrent} className="gallery-delete-btn">
                      🗑️ מחיקת תמונה
                    </button>
                  )}
                </div>

                <div className="gallery-nav-container">
                  <button
                    onClick={handlePrevPhoto}
                    disabled={currentIndex === dailyPhotos.length - 1}
                    className="gallery-nav-btn"
                  >
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>→</span> ישנות
                  </button>

                  <div className="gallery-nav-count">
                    תמונה {currentIndex + 1} מתוך {dailyPhotos.length}
                  </div>

                  <button
                    onClick={handleNextPhoto}
                    disabled={currentIndex === 0}
                    className="gallery-nav-btn"
                  >
                    חדשות <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>←</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ADMIN UPLOAD FORM */}
        {isAdmin && (
          <div className="upload-section">
            <h4>🔧 העלאת תמונה יומית (מנהל בלבד)</h4>
            <form onSubmit={handleUploadSubmit} className="upload-form">
              <div className="upload-file-row">
                <input
                  type="file"
                  accept="image/*"
                  id="daily-photo-file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  required={!previewUrl}
                />
                <label
                  htmlFor="daily-photo-file"
                  className="tab-btn"
                  style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: 'var(--forest-green-light)', color: 'var(--forest-green)', cursor: 'pointer' }}
                >
                  {selectedFile ? "שנה תמונה 🖼️" : "בחר תמונה 🖼️"}
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                  {selectedFile ? selectedFile.name : "לא נבחר קובץ"}
                </span>
              </div>

              {previewUrl && (
                <div className="upload-preview">
                  <img src={previewUrl} alt="תצוגה מקדימה" />
                </div>
              )}

              <input
                type="text"
                className="add-item-input"
                placeholder="הוסיפו כיתוב מעניין לתמונה..."
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                style={{ padding: '0.5rem 0.8rem', fontSize: '0.9rem' }}
              />

              <button
                type="submit"
                className={`btn-primary${uploading ? ' btn-loading' : ''}`}
                disabled={uploading || !previewUrl}
                style={{ margin: 0, padding: '0.6rem' }}
              >
                {uploading ? "מעלה תמונה..." : "פרסם תמונה יומית 🚀"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && dailyPhotos.length > 0 && (
        <div
          className="lightbox-overlay"
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
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

          {/* Nav – Prev (Older) */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
            disabled={currentIndex === dailyPhotos.length - 1}
            className="lightbox-nav-btn"
            style={{ position: 'absolute', left: '30px', zIndex: 10000, opacity: currentIndex === dailyPhotos.length - 1 ? 0.3 : 1 }}
          >‹</button>

          {/* Nav – Next (Newer) */}
          <button
            onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
            disabled={currentIndex === 0}
            className="lightbox-nav-btn"
            style={{ position: 'absolute', right: '30px', zIndex: 10000, opacity: currentIndex === 0 ? 0.3 : 1 }}
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
                src={dailyPhotos[currentIndex].image_data}
                alt={dailyPhotos[currentIndex].caption || "תמונה יומית"}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
              />
            </div>

            {/* Frosted Glass Caption */}
            <div className="lightbox-caption-overlay">
              {dailyPhotos[currentIndex].caption ? (
                <h4 className="lightbox-caption-title">
                  {dailyPhotos[currentIndex].caption}
                </h4>
              ) : (
                <h4 className="lightbox-caption-title empty">
                  אין כיתוב לתמונה זו
                </h4>
              )}
              <div className="lightbox-caption-meta">
                <span>📅 הועלה ב-{new Date(dailyPhotos[currentIndex].created_at).toLocaleDateString("he-IL")}</span>
                <span className="lightbox-caption-separator">|</span>
                <span>תמונה {currentIndex + 1} מתוך {dailyPhotos.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
