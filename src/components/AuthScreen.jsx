import { useState } from 'react';
import { supabase, isSupabaseActive } from '../lib/supabase';
import { processImage } from '../lib/imageUtils';

export function AvatarSVG({ avatarType, size = 60, border = '3px solid var(--forest-green)' }) {
  if (avatarType && (avatarType.startsWith('data:image/') || avatarType.startsWith('http'))) {
    return (
      <img 
        src={avatarType} 
        alt="פרופיל" 
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: border,
          objectFit: 'cover',
          display: 'block'
        }}
      />
    );
  }

  let emoji = "🔥";
  let bgColor = "#fff3e0";
  
  if (avatarType === "pine") {
    emoji = "🌲";
    bgColor = "#e8f5e9";
  } else if (avatarType === "canoe") {
    emoji = "🛶";
    bgColor = "#e1f5fe";
  } else if (avatarType === "guitar") {
    emoji = "🎸";
    bgColor = "#f3e5f5";
  } else if (avatarType === "user") {
    emoji = "⛺";
    bgColor = "#e8f5e9";
  }
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      style={{
        borderRadius: '50%',
        border: border,
        background: bgColor,
        display: 'block'
      }}
    >
      <text x="50" y="62" fontSize="42" textAnchor="middle">{emoji}</text>
    </svg>
  );
}

export default function AuthScreen({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState("login"); // "signup" or "login"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [birthday, setBirthday] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleAuthMode = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setAuthMode(prev => prev === "signup" ? "login" : "signup");
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (authMode === "signup" && !avatar) {
      setErrorMsg("חובה להעלות תמונת פרופיל כדי להירשם! 📸");
      return;
    }

    setSubmitting(true);
    try {
      if (isSupabaseActive) {
        if (authMode === "signup") {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password
          });
          
          if (signUpError) throw signUpError;
          
          if (signUpData.user) {
            let avatarUrl = avatar;
            if (avatarFile) {
              const fileExt = avatarFile.name.split('.').pop() || 'jpg';
              const fileName = `${signUpData.user.id}-${Date.now()}.${fileExt}`;
              const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, avatarFile);
              
              if (uploadError) {
                console.error("Storage upload error:", uploadError);
              } else {
                const { data: publicUrlData } = supabase.storage
                  .from('avatars')
                  .getPublicUrl(fileName);
                avatarUrl = publicUrlData.publicUrl;
              }
            }

            // Create database profile
            const { error: profileError } = await supabase
              .from("profiles")
              .insert({
                id: signUpData.user.id,
                full_name: name,
                email: email,
                role: role,
                avatar: avatarUrl,
                birthday: birthday || null
              });
              
            if (profileError) throw profileError;
            
            setSuccessMsg("הרשמה הצליחה! אנא בדקו את האימייל לאישור החשבון (אם מופעל) או התחברו.");
            
            const user = {
              id: signUpData.user.id,
              email: email,
              name: name,
              role: role,
              avatar: avatarUrl,
              birthday: birthday
            };
            
            onAuthSuccess(user);
          }
        } else {
          // Login mode
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) throw signInError;
          
          if (signInData.user) {
            // Fetch profile
            const { data: profile, error: pError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", signInData.user.id)
              .single();
            
            if (pError) throw pError;
            
            const user = {
              id: signInData.user.id,
              email: signInData.user.email,
              name: profile?.full_name || signInData.user.email,
              role: profile?.role || "שליח/ה",
              avatar: profile?.avatar || "campfire",
              birthday: profile?.birthday
            };
            
            setSuccessMsg("התחברתם בהצלחה!");
            onAuthSuccess(user);
          }
        }
      } else {
        // Local fallback
        if (authMode === "signup") {
          const user = {
            name,
            email,
            role,
            avatar,
            birthday
          };
          localStorage.setItem("ramah_user", JSON.stringify(user));
          onAuthSuccess(user);
        } else {
          const storedUser = localStorage.getItem("ramah_user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.email === email) {
              onAuthSuccess(parsed);
            } else {
              setErrorMsg("לא נמצא משתמש מקומי תואם. אנא הירשמו קודם.");
            }
          } else {
            setErrorMsg("לא נמצא משתמש מקומי תואם. אנא הירשמו קודם.");
          }
        }
      }
    } catch (err) {
      setErrorMsg(authMode === "signup" ? "שגיאת הרשמה: " + err.message : "שגיאת התחברות: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="registration-screen" className="reg-container">
      <div className="reg-card">
        <div className="reg-header">
          <span className="reg-logo">🏕️</span>
          <h1 className="reg-title">
            {authMode === "signup" ? "קמפ רמה 2026" : "התחברות לפורטל"}
          </h1>
          <p className="reg-subtitle">
            {authMode === "signup" 
              ? "ברוכים הבאים לפורטל השליחים של וויסקונסין!" 
              : "הזינו את האימייל והסיסמה שלכם"
            }
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'var(--red-light)', 
            color: 'var(--red-warning)', 
            padding: '0.8rem', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1rem', 
            textAlign: 'center', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            border: '1px solid var(--red-warning)'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'var(--forest-green-light)', 
            color: 'var(--forest-green)', 
            padding: '0.8rem', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1rem', 
            textAlign: 'center', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            border: '1px solid var(--forest-green)'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuthSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">אימייל</label>
            <input 
              type="email" 
              id="reg-email" 
              className="form-input" 
              placeholder="israel@gmail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">סיסמה (לפחות 6 תווים)</label>
            <input 
              type="password" 
              id="reg-password" 
              className="form-input" 
              placeholder="••••••" 
              minLength="6" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
              required 
            />
          </div>

          {authMode === "signup" && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">שם מלא</label>
                <input 
                  type="text" 
                  id="reg-name" 
                  className="form-input" 
                  placeholder="ישראל ישראלי" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">תפקיד במחנה</label>
                <input 
                  type="text" 
                  id="reg-role" 
                  className="form-input" 
                  placeholder="מדריכ/ת עדה, אגם, אומנות, נגרות..." 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  maxLength={30}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-birthday">תאריך יום הולדת 🎂</label>
                <div className="date-input-wrapper">
                  <input 
                    type="date" 
                    id="reg-birthday" 
                    className="form-input date-picker-input" 
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
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
                <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  מלאו את יום ההולדת כדי שנוכל לחגוג לכם בפינת ימי הולדת השבוע! 🎉
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">העלו תמונת פרופיל כדי שכולם יראו את הפנים היפות שלכם! 📸</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="avatar-upload"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        try {
                          setErrorMsg("");
                          const processed = await processImage(file, { forceSquare: true, targetSize: 300 });
                          setAvatarFile(processed.file);
                          setAvatar(processed.dataUrl);
                        } catch (err) {
                          setErrorMsg(err.message || "שגיאה בעיבוד התמונה");
                        }
                      }
                    }}
                    style={{ display: 'none' }}
                    required
                  />
                  <label 
                    htmlFor="avatar-upload" 
                    className="tab-btn"
                    style={{
                      display: 'inline-block',
                      padding: '0.6rem 1.2rem',
                      backgroundColor: 'var(--forest-green-light)',
                      color: 'var(--forest-green)',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 'bold',
                      border: '2px solid var(--forest-green)',
                      margin: 0
                    }}
                  >
                    {avatar && avatar.startsWith('data:image/') ? "שנה תמונה 📸" : "בחר תמונת פנים 📸"}
                  </label>
                  {avatar && avatar.startsWith('data:image/') && (
                    <img 
                      src={avatar} 
                      alt="Preview" 
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--forest-green)'
                      }}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting 
              ? (authMode === "signup" ? "נרשם ומעלה תמונה... ⏳" : "מתחבר... ⏳")
              : (authMode === "signup" ? "הרשמה וכניסה למחנה! 🚀" : "התחברות 🔑")
            }
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <a 
            href="#" 
            style={{ color: 'var(--forest-green)', fontWeight: '700', textDecoration: 'none' }} 
            onClick={toggleAuthMode}
          >
            {authMode === "signup" 
              ? "יש לכם כבר משתמש? לחצו להתחברות 🔑" 
              : "אין לכם משתמש? לחצו להרשמה מהירה 📝"
            }
          </a>
        </div>
      </div>
    </section>
  );
}
