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
          background: 'var(--white-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-soft)',
          marginBottom: '1.5rem',
          border: '1.5px solid rgba(2, 136, 209, 0.18)'
        }}>
        <h3 style={{ color: 'var(--forest-green)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📸</span> פינת התמונה היומית
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
          כאן תעלה כל יום תמונה יפה ומרגשת מהמחנה! עקבו אחרי הרגעים המשותפים.
        </p>

        {/* Gallery Display */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {dailyPhotos.length === 0 ? (
            <div style={{
              border: '2px dashed var(--forest-green-light)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem 1rem',
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
              
              {/* Image and Attached Caption */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                zIndex: 10
              }}>
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
                    boxShadow: 'var(--shadow-md)',
                    transition: 'var(--transition)',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />

                {/* Caption Area */}
                <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                  {isEditingCaption ? (
                    <form onSubmit={handleSaveCaption} style={{ display: 'flex', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
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
                          <h4 style={{ 
                            fontFamily: "'Fredoka', cursive",
                            fontWeight: '500', 
                            fontSize: '1.3rem', 
                            margin: 0, 
                            color: 'var(--text-main)', 
                            lineHeight: '1.4'
                          }}>
                            {dailyPhotos[currentIndex].caption}
                          </h4>
                          {isAdmin && (
                            <button 
                              onClick={() => { setIsEditingCaption(true); setEditedCaption(dailyPhotos[currentIndex].caption || ""); }} 
                              style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)', opacity: 0.6 }} 
                              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseOut={(e) => e.currentTarget.style.opacity = '0.6'}
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
                              style={{ background: 'transparent', border: 'none', color: 'var(--campfire-amber)', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', transition: 'var(--transition)' }}
                              onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                            >
                              ✏️ הוספת כיתוב לתמונה
                            </button>
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Date & Carousel Controls */}
              <div style={{
                marginTop: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.8rem',
                position: 'relative',
                zIndex: 11
              }}>
                {/* Centered Date Badge */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: '0.4rem',
                  width: '100%'
                }}>
                  <span style={{ 
                    fontSize: '0.82rem', 
                    color: 'var(--text-muted)', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.35rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '50px',
                    fontWeight: '500',
                    direction: 'rtl'
                  }}>
                    <span>📅</span> הועלה ב-{new Date(dailyPhotos[currentIndex].created_at).toLocaleDateString("he-IL")}
                  </span>
                  
                  {isAdmin && (
                    <button 
                      onClick={handleDeleteCurrent}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--red-warning)',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition)',
                        opacity: 0.7
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--red-light)'; e.currentTarget.style.opacity = '1'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.opacity = '0.7'; }}
                    >
                      🗑️ מחיקת תמונה
                    </button>
                  )}
                </div>

                {/* Carousel controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginTop: '0.5rem',
                  padding: '0.6rem 1.2rem',
                  background: '#f8fafc',
                  borderRadius: '50px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                  border: '1px solid #e2e8f0'
                }}>
                  <button 
                    onClick={handlePrevPhoto} 
                    disabled={currentIndex === dailyPhotos.length - 1}
                    style={{
                      background: currentIndex === dailyPhotos.length - 1 ? 'transparent' : '#ffffff',
                      color: currentIndex === dailyPhotos.length - 1 ? '#cbd5e1' : 'var(--forest-green)',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '50px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: currentIndex === dailyPhotos.length - 1 ? 'default' : 'pointer',
                      transition: 'var(--transition)',
                      boxShadow: currentIndex === dailyPhotos.length - 1 ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>→</span> ישנות
                  </button>
                  
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '0.9rem', 
                    color: '#64748b',
                    padding: '0 0.5rem'
                  }}>
                    תמונה {currentIndex + 1} מתוך {dailyPhotos.length}
                  </div>

                  <button 
                    onClick={handleNextPhoto} 
                    disabled={currentIndex === 0}
                    style={{
                      background: currentIndex === 0 ? 'transparent' : '#ffffff',
                      color: currentIndex === 0 ? '#cbd5e1' : 'var(--forest-green)',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '50px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: currentIndex === 0 ? 'default' : 'pointer',
                      transition: 'var(--transition)',
                      boxShadow: currentIndex === 0 ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
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
            marginTop: '1rem',
            paddingTop: '1rem',
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
      <div id="suggestions" style={{ 
          scrollMarginTop: '80px',
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
