import { useState, useEffect } from 'react';
import { processImage } from '../lib/imageUtils';

export default function Suggestions({ 
  isAdmin, 
  dailyPhotos = [], 
  onUploadPhoto, 
  onDeletePhoto, 
  onUpdatePhotoCaption,
  onSubmitSuggestion 
}) {
  const [feedback, setFeedback] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Photo states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadCaption, setUploadCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");

  useEffect(() => {
    setIsEditingCaption(false);
    setEditedCaption(dailyPhotos[currentIndex]?.caption || "");
  }, [currentIndex, dailyPhotos]);

  const handleSaveCaption = async (e) => {
    e.preventDefault();
    const currentPhoto = dailyPhotos[currentIndex];
    if (currentPhoto && onUpdatePhotoCaption) {
      await onUpdatePhotoCaption(currentPhoto.id, editedCaption.trim());
      setIsEditingCaption(false);
    }
  };

  // 1. Submit suggestion
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    onSubmitSuggestion(feedback.trim());
    setFeedback("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  // 2. Handle image file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const processed = await processImage(file, { maxDim: 1200 });
        setSelectedFile(processed.file);
        setPreviewUrl(processed.dataUrl);
      } catch (err) {
        console.error("Error processing photo:", err);
        alert("שגיאה בעיבוד התמונה. נא לנסות קובץ אחר.");
      }
    }
  };

  // 3. Handle image upload submission
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!previewUrl) return;

    setUploading(true);
    try {
      await onUploadPhoto(selectedFile, previewUrl, uploadCaption);
      setSelectedFile(null);
      setPreviewUrl("");
      setUploadCaption("");
      setCurrentIndex(0); // Reset viewer to see the newly uploaded newest photo
    } catch (err) {
      console.error("Failed to upload photo:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleNextPhoto = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentIndex < dailyPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDeleteCurrent = async () => {
    if (!window.confirm("האם למחוק תמונה זו לצמיתות?")) return;
    const photoToDelete = dailyPhotos[currentIndex];
    if (photoToDelete && onDeletePhoto) {
      try {
        await onDeletePhoto(photoToDelete.id);
        // Adjust index if we deleted the last photo
        if (currentIndex >= dailyPhotos.length - 1 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      } catch (err) {
        console.error("Failed to delete photo:", err);
      }
    }
  };

  return (
    <section className="suggestions-section">
      
      {/* 📸 DAILY PHOTO GALLERY CARD */}
      <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '400px',
          background: 'var(--white-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-soft)',
          marginBottom: '2.5rem',
          border: '1.5px solid rgba(2, 136, 209, 0.18)'
        }}>
        <h3 style={{ color: 'var(--forest-green)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📸</span> פינת התמונה היומית
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
          כאן תעלה כל יום תמונה יפה ומרגשת מהמחנה! עקבו אחרי הרגעים המשותפים.
        </p>

        {/* Gallery Display */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {dailyPhotos.length === 0 ? (
            <div style={{
              border: '2px dashed var(--forest-green-light)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              backgroundColor: '#fafbf9'
            }}>
              <span style={{ fontSize: '2.5rem' }}>🏕️</span>
              <h4 style={{ marginTop: '0.5rem', fontWeight: '500' }}>אין תמונה יומית עדיין</h4>
              <p style={{ fontSize: '0.8rem' }}>יהודה יעלה תמונות בקרוב, יש למה לחכות!</p>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%' }}>
              
              {/* Image Frame */}
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                backgroundColor: '#fff',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-soft)',
                transition: 'transform 0.2s ease-in-out',
                zIndex: 10
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img 
                  src={dailyPhotos[currentIndex].image_data} 
                  alt={dailyPhotos[currentIndex].caption || "תמונה יומית"} 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '480px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 24px rgba(30, 70, 32, 0.08)',
                    border: '2px solid var(--forest-green-light)'
                  }}
                />
              </div>

              {/* Caption & Date & Controls Card */}
              <div style={{
                marginTop: '1.5rem',
                backgroundColor: 'var(--white-card)',
                padding: '1.2rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-soft)',
                border: '1.5px solid rgba(30, 70, 32, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                position: 'relative',
                zIndex: 11
              }}>
                {/* Top row: Date and Delete button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '0.8rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📅 <span style={{ fontWeight: '500' }}>הועלה ב- {new Date(dailyPhotos[currentIndex].created_at).toLocaleDateString("he-IL")}</span>
                  </span>
                  {isAdmin && (
                    <button 
                      onClick={handleDeleteCurrent}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--red-warning)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.3rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--red-light)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      🗑️ מחיקה
                    </button>
                  )}
                </div>

                {/* Caption area */}
                <div>
                {isEditingCaption ? (
                  <form onSubmit={handleSaveCaption} style={{ display: 'flex', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      value={editedCaption} 
                      onChange={(e) => setEditedCaption(e.target.value)} 
                      className="add-item-input"
                      style={{ flexGrow: 1, padding: '0.6rem 0.8rem', fontSize: '1rem', margin: 0, borderRadius: 'var(--radius-sm)', border: '2px solid var(--forest-green-light)' }}
                      placeholder="הוסיפו כיתוב לתמונה..."
                      autoFocus
                    />
                    <button type="submit" style={{ padding: '0.6rem 1rem', backgroundColor: 'var(--forest-green)', color: '#fff', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>שמור</button>
                    <button type="button" onClick={() => setIsEditingCaption(false)} style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', backgroundColor: 'transparent', cursor: 'pointer' }}>ביטול</button>
                  </form>
                ) : (
                  <>
                    {dailyPhotos[currentIndex].caption ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <p style={{ fontWeight: '600', fontSize: '1.1rem', margin: 0, color: 'var(--text-main)', lineHeight: '1.4' }}>
                          {dailyPhotos[currentIndex].caption}
                        </p>
                        {isAdmin && (
                          <button 
                            onClick={() => { setIsEditingCaption(true); setEditedCaption(dailyPhotos[currentIndex].caption || ""); }} 
                            style={{ background: 'var(--forest-green-light)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'var(--transition)' }} 
                            title="ערוך כיתוב"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    ) : (
                      isAdmin && (
                        <div>
                          <button 
                            onClick={() => { setIsEditingCaption(true); setEditedCaption(""); }} 
                            style={{ background: 'transparent', border: '2px dashed var(--campfire-amber)', color: 'var(--campfire-amber)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', width: '100%', justifyContent: 'center', transition: 'var(--transition)' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--campfire-light)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            ✏️ הוספת כיתוב לתמונה
                          </button>
                        </div>
                      )
                    )}
                  </>
                )}
                </div>

                {/* Carousel controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.5rem',
                  paddingTop: '0.8rem',
                  borderTop: '1px dashed #edf2f7'
                }}>
                  <button 
                    onClick={handlePrevPhoto} 
                    disabled={currentIndex === dailyPhotos.length - 1}
                    style={{
                      background: 'var(--forest-green-light)',
                      color: 'var(--forest-green)',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '0.5rem 1rem',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      opacity: currentIndex === dailyPhotos.length - 1 ? 0.4 : 1,
                      cursor: currentIndex === dailyPhotos.length - 1 ? 'not-allowed' : 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>→</span> ישנות
                  </button>
                  
                  <div style={{ 
                    background: '#f8fafc', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '20px',
                    fontWeight: 'bold', 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)',
                    border: '1px solid #edf2f7'
                  }}>
                    {currentIndex + 1} / {dailyPhotos.length}
                  </div>

                  <button 
                    onClick={handleNextPhoto} 
                    disabled={currentIndex === 0}
                    style={{
                      background: 'var(--forest-green-light)',
                      color: 'var(--forest-green)',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '0.5rem 1rem',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      opacity: currentIndex === 0 ? 0.4 : 1,
                      cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                      transition: 'var(--transition)'
                    }}
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
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--forest-green-light)'
          }}>
            <h4 style={{ color: 'var(--campfire-amber)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              🔧 העלאת תמונה יומית (מנהל בלבד)
            </h4>
            
            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--forest-green-light)',
                    color: 'var(--forest-green)',
                    cursor: 'pointer'
                  }}
                >
                  {selectedFile ? "שנה תמונה 🖼️" : "בחר תמונה 🖼️"}
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                  {selectedFile ? selectedFile.name : "לא נבחר קובץ"}
                </span>
              </div>

              {previewUrl && (
                <div style={{ 
                  position: 'relative', 
                  width: '120px', 
                  maxHeight: '120px', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  border: '1px solid var(--forest-green-light)',
                  backgroundColor: '#1a202c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '0.5rem'
                }}>
                  <img 
                    src={previewUrl} 
                    alt="תצוגה מקדימה" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '120px', 
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block'
                    }} 
                  />
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
                className="btn-primary" 
                disabled={uploading || !previewUrl}
                style={{ margin: 0, padding: '0.6rem' }}
              >
                {uploading ? "מעלה תמונה..." : "פרסם תמונה יומית 🚀"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 💡 WARM SUGGESTIONS CARD */}
      <div style={{ 
          background: 'var(--white-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-soft)',
          marginBottom: '2.5rem',
          border: '1.5px solid rgba(30, 70, 32, 0.15)'
        }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>💡</span> בואו נבנה את זה ביחד!
        </h3>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
          האתר הזה הוא של כולנו! נשמח לשמוע רעיונות לפיצ'רים חדשים, כלים שיעזרו לנו לקראת המחנה, משחקים, או סתם בדיחות שיעשו לנו שמח בלב. כל הצעה תגיע ישירות ליהודה.
        </p>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '1.2rem' }}>
          <textarea 
            className="feedback-textarea" 
            placeholder="ספרו לנו על רעיון, כלי, משחק או מידע שהיה עוזר לכם או מצחיק אותנו..." 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            style={{ minHeight: '120px' }}
          ></textarea>
          <button type="submit" className="btn-secondary" style={{ marginTop: '0.8rem' }}>שלח הצעה ליהודה 🚀</button>
        </form>

        {showSuccess && (
          <div style={{
            marginTop: '1rem',
            padding: '0.8rem',
            backgroundColor: 'var(--forest-green-light)',
            color: 'var(--forest-green)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '600',
            textAlign: 'center',
            border: '1px solid rgba(30, 70, 32, 0.15)',
            animation: 'check-pop 0.3s ease-out'
          }}>
            תודה! ההצעה שלך נשלחה ישירות ליהודה 📬
          </div>
        )}
      </div>
    </section>
  );
}
