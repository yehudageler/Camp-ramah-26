import React, { useState } from 'react';

export default function CampNewspaper({ isAdmin, newspaperData, onUpdateNewspaper }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    didYouKnow: newspaperData?.didYouKnow || "",
    dailyTip: newspaperData?.dailyTip || "",
    funnyStory: newspaperData?.funnyStory || ""
  });

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateNewspaper(editData);
    setIsEditing(false);
  };

  return (
    <section id="newspaper" className="newspaper-section">
      <div className="newspaper-badge">מהדורת היום!</div>

      <h3 className="newspaper-title">🗞️ עיתון המחנה</h3>

      {isAdmin && !isEditing && (
        <button
          className="newspaper-edit-btn"
          onClick={() => {
            setEditData({
              didYouKnow: newspaperData?.didYouKnow || "",
              dailyTip: newspaperData?.dailyTip || "",
              funnyStory: newspaperData?.funnyStory || ""
            });
            setIsEditing(true);
          }}
        >
          ✏️ עריכת העיתון
        </button>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="newspaper-edit-form">
          <div className="newspaper-form-group newspaper-form-group--blue">
            <label>🧐 הידעת?</label>
            <textarea
              value={editData.didYouKnow}
              onChange={e => setEditData({ ...editData, didYouKnow: e.target.value })}
            />
          </div>
          <div className="newspaper-form-group newspaper-form-group--green">
            <label>💡 טיפ יומי</label>
            <textarea
              value={editData.dailyTip}
              onChange={e => setEditData({ ...editData, dailyTip: e.target.value })}
            />
          </div>
          <div className="newspaper-form-group newspaper-form-group--amber">
            <label>😂 סיפור מצחיק מהשבוע</label>
            <textarea
              value={editData.funnyStory}
              onChange={e => setEditData({ ...editData, funnyStory: e.target.value })}
            />
          </div>
          <div className="newspaper-form-actions">
            <button type="submit" className="newspaper-save-btn">שמור גיליון</button>
            <button type="button" onClick={() => setIsEditing(false)} className="newspaper-cancel-btn">ביטול</button>
          </div>
        </form>
      ) : (
        <div className="newspaper-grid">
          <div className="newspaper-card newspaper-card--blue">
            <h4>
              <span style={{ fontSize: '1.4rem' }}>🧐</span> הידעת?
            </h4>
            <p>{newspaperData?.didYouKnow || "בקרוב נגלה לכם עובדה מעניינת על המחנה..."}</p>
          </div>

          <div className="newspaper-card newspaper-card--green">
            <h4>
              <span style={{ fontSize: '1.4rem' }}>💡</span> טיפ יומי
            </h4>
            <p>{newspaperData?.dailyTip || "טיפ חדש בדרך! שמרו על ערנות."}</p>
          </div>

          <div className="newspaper-card newspaper-card--amber">
            <h4>
              <span style={{ fontSize: '1.4rem' }}>😂</span> סיפור השבוע
            </h4>
            <p>{newspaperData?.funnyStory || "עוד לא קרה משהו מספיק מצחיק השבוע... חכו לזה!"}</p>
          </div>
        </div>
      )}
    </section>
  );
}
