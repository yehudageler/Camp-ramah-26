import { useState } from 'react';
import { AvatarSVG } from './AuthScreen';
import { processImage } from '../lib/imageUtils';
import toast from 'react-hot-toast';

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
      // Fix: use dataUrl (not preview which doesn't exist)
      setAvatar(processed.dataUrl);
      setAvatarFile(processed.file);
    } catch (err) {
      console.error("Image processing failed:", err);
      toast.error("עיבוד התמונה נכשל. נסה תמונה אחרת.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      toast.error("נא למלא שם ותפקיד");
      return;
    }

    onSave({
      name: name.trim(),
      role: role.trim(),
      birthday: birthday || null,
      avatar: avatar,
      avatarFile: avatarFile
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
          <div className="modal-avatar-section">
            <div className="modal-avatar-wrapper">
              <AvatarSVG avatarType={avatar} size={100} />
              {processing && (
                <div className="modal-avatar-processing">
                  מעבד...
                </div>
              )}
            </div>

            <label
              htmlFor="modal-photo-upload"
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}
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
              maxLength={50}
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
              maxLength={30}
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
          <div className="modal-action-btns">
            <button
              type="submit"
              className={`btn-primary${processing ? ' btn-loading' : ''}`}
              style={{ margin: 0, flex: 1 }}
              disabled={processing}
            >
              {processing ? 'שומר...' : 'שמור שינויים 💾'}
            </button>
            <button
              type="button"
              className="modal-cancel-btn"
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
