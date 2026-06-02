import { useState } from 'react';
import { AvatarSVG } from './AuthScreen';
import { processImage } from '../lib/imageUtils';

export default function ProfileEditModal({ currentUser, onClose, onSave }) {
  const [name, setName] = useState(currentUser.name || "");
  const [role, setRole] = useState(currentUser.role || "");
  const [birthday, setBirthday] = useState(currentUser.birthday || "");
  const [avatar, setAvatar] = useState(currentUser.avatar || "user");
  const [avatarFile, setAvatarFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessing(true);
    try {
      const processed = await processImage(file, { forceSquare: true, targetSize: 300 });
      // Use the base64 preview for instant visual feedback inside the modal
      setAvatar(processed.preview);
      // Keep the processed File object to upload on save
      setAvatarFile(processed.file);
    } catch (err) {
      console.error("Image processing failed:", err);
      alert("עיבוד התמונה נכשל. נסה תמונה אחרת.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      alert("נא למלא שם ותפקיד");
      return;
    }

    onSave({
      name: name.trim(),
      role: role.trim(),
      birthday: birthday || null,
      avatar: avatar,
      avatarFile: avatarFile // Will be null if the user didn't select a new photo
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">⚙️ עדכון פרטי פרופיל</h3>
          <button className="close-x-btn" onClick={onClose} aria-label="סגור">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar / Photo Upload section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '0.8rem' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <AvatarSVG avatarType={avatar} size={100} />
              {processing && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  color: 'var(--forest-green)'
                }}>
                  מעבד...
                </div>
              )}
            </div>
            
            <label 
              htmlFor="modal-photo-upload" 
              className="btn-secondary"
              style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.9rem', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: 0
              }}
            >
              📸 העלאת תמונת פרופיל
            </label>
            <input 
              type="file" 
              id="modal-photo-upload" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              disabled={processing}
            />
          </div>

          {/* Form Fields */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-name">שם מלא</label>
            <input 
              type="text" 
              id="edit-name" 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-role">תפקיד במחנה</label>
            <input 
              type="text" 
              id="edit-role" 
              className="form-input" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-birthday">תאריך יום הולדת 🎂</label>
            <div className="date-input-wrapper">
              <input 
                type="date" 
                id="edit-birthday" 
                className="form-input date-picker-input" 
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
              <svg 
                className="date-input-icon"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ margin: 0, flex: 1 }}
              disabled={processing}
            >
              שמור שינויים 💾
            </button>
            <button 
              type="button" 
              className="logout-btn" 
              style={{ margin: 0, flex: 1, padding: '1rem', border: '1px solid #cbd5e1' }}
              onClick={onClose}
            >
              ביטול ❌
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
