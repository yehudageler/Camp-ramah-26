import { useState, useEffect } from 'react';
import { supabase, isSupabaseActive } from './lib/supabase';
import AuthScreen, { AvatarSVG } from './components/AuthScreen';
import Countdown from './components/Countdown';
import CommunityWall from './components/CommunityWall';
import PackingList from './components/PackingList';
import LayaTip from './components/LayaTip';
import { processImage } from './lib/imageUtils';
import { defaultPackingList } from './constants/packingList';
import Suggestions from './components/Suggestions';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [databaseProfiles, setDatabaseProfiles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [checkedStates, setCheckedStates] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [packingStates, setPackingStates] = useState([]);
  const [dailyPhotos, setDailyPhotos] = useState([]);

  const syncData = async (user) => {
    try {
      // 1. Fetch other profiles for Community Wall
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*");
      if (!pError) {
        setDatabaseProfiles(profiles || []);
      }
      
      // 2. Fetch suggestions
      const { data: sugs, error: sError } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false });
      if (!sError) {
        setSuggestions(sugs || []);
      }

      // 3. Fetch packing states for current user
      const { data: pState, error: psError } = await supabase
        .from("packing_states")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (!psError && pState) {
        setCheckedStates(pState.checked_items || {});
        setCustomItems(pState.custom_items || []);
      }

      // 4. If admin, fetch all packing states for tracking
      if (user.email === 'geleryehuda@gmail.com') {
        const { data: allStates, error: allError } = await supabase
          .from("packing_states")
          .select("*");
        if (!allError) {
          setPackingStates(allStates || []);
        }
      }

      // 5. Fetch daily photos
      const { data: photos, error: phError } = await supabase
        .from("daily_photos")
        .select("*")
        .order("created_at", { ascending: false });
      if (!phError) {
        setDailyPhotos(photos || []);
      }
    } catch (err) {
      console.error("Failed to sync data from Supabase:", err);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      if (isSupabaseActive) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Fetch current user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const user = {
            id: session.user.id,
            email: session.user.email,
            name: profile?.full_name || session.user.email,
            role: profile?.role || "שליח/ה",
            avatar: profile?.avatar || "campfire"
          };
          setCurrentUser(user);
          await syncData(user);
        }
      } else {
        // Local storage fallback loading
        const storedUser = localStorage.getItem("ramah_user");
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
        
        const storedChecked = localStorage.getItem("ramah_checked_states");
        if (storedChecked) {
          setCheckedStates(JSON.parse(storedChecked));
        }
        
        const storedCustom = localStorage.getItem("ramah_custom_items");
        if (storedCustom) {
          setCustomItems(JSON.parse(storedCustom));
        }

        const storedSuggestions = localStorage.getItem("ramah_suggestions");
        if (storedSuggestions) {
          setSuggestions(JSON.parse(storedSuggestions));
        }

        const storedPhotos = localStorage.getItem("ramah_daily_photos");
        if (storedPhotos) {
          setDailyPhotos(JSON.parse(storedPhotos));
        }
      }
      setLoading(false);
    };

    initApp();
  }, []);

  const handleAuthSuccess = async (user) => {
    setCurrentUser(user);
    if (isSupabaseActive) {
      await syncData(user);
    } else {
      // Load fallback items
      const storedChecked = localStorage.getItem("ramah_checked_states");
      if (storedChecked) setCheckedStates(JSON.parse(storedChecked));
      
      const storedCustom = localStorage.getItem("ramah_custom_items");
      if (storedCustom) setCustomItems(JSON.parse(storedCustom));

      const storedSuggestions = localStorage.getItem("ramah_suggestions");
      if (storedSuggestions) setSuggestions(JSON.parse(storedSuggestions));
    }
  };

  const logoutUser = async () => {
    if (isSupabaseActive) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("ramah_user");
    setCurrentUser(null);
    setCheckedStates({});
    setCustomItems([]);
    setDatabaseProfiles([]);
    setSuggestions([]);
  };

  const handleToggleItem = async (itemId) => {
    const newCheckedStates = {
      ...checkedStates,
      [itemId]: !checkedStates[itemId]
    };
    setCheckedStates(newCheckedStates);

    if (isSupabaseActive && currentUser?.id) {
      try {
        await supabase.from("packing_states").upsert({
          user_id: currentUser.id,
          checked_items: newCheckedStates,
          custom_items: customItems,
          updated_at: new Date()
        });
      } catch (err) {
        console.error("Error saving packing item:", err);
      }
    } else {
      localStorage.setItem("ramah_checked_states", JSON.stringify(newCheckedStates));
    }
  };

  const handleAddItem = async (itemText) => {
    const newItem = {
      id: "custom_" + Date.now(),
      text: itemText
    };
    const newCustomItems = [...customItems, newItem];
    setCustomItems(newCustomItems);

    if (isSupabaseActive && currentUser?.id) {
      try {
        await supabase.from("packing_states").upsert({
          user_id: currentUser.id,
          checked_items: checkedStates,
          custom_items: newCustomItems,
          updated_at: new Date()
        });
      } catch (err) {
        console.error("Error adding packing item:", err);
      }
    } else {
      localStorage.setItem("ramah_custom_items", JSON.stringify(newCustomItems));
    }
  };

  const handleSubmitSuggestion = async (text) => {
    const newSuggestion = {
      text: text,
      date: new Date().toLocaleDateString("he-IL")
    };
    const newSuggestions = [...suggestions, newSuggestion];
    setSuggestions(newSuggestions);

    if (isSupabaseActive && currentUser?.id) {
      try {
        await supabase.from("suggestions").insert({
          user_id: currentUser.id,
          user_name: currentUser.name || "שליח/ה",
          text: text
        });
      } catch (err) {
        console.error("Error submitting suggestion:", err);
      }
    } else {
      localStorage.setItem("ramah_suggestions", JSON.stringify(newSuggestions));
    }
  };

  const handleUploadPhoto = async (fileObj, previewUrl, caption) => {
    if (isSupabaseActive) {
      try {
        let imageUrl = previewUrl; // Fallback
        if (fileObj) {
          const fileExt = fileObj.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('daily-photos')
            .upload(fileName, fileObj);
          
          if (uploadError) {
            console.error("Daily photo upload error:", uploadError);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('daily-photos')
              .getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
          }
        }

        const { data, error } = await supabase
          .from("daily_photos")
          .insert({
            image_data: imageUrl,
            caption: caption
          })
          .select()
          .single();
          
        if (error) throw error;
        setDailyPhotos(prev => [data, ...prev]);
      } catch (err) {
        console.error("Error uploading daily photo:", err);
      }
    } else {
      const localPhoto = {
        id: Date.now(),
        image_data: previewUrl,
        caption: caption,
        created_at: new Date().toISOString()
      };
      const updatedPhotos = [localPhoto, ...dailyPhotos];
      setDailyPhotos(updatedPhotos);
      localStorage.setItem("ramah_daily_photos", JSON.stringify(updatedPhotos));
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const photoToDelete = dailyPhotos.find(p => p.id === photoId);
    if (!photoToDelete) return;

    if (isSupabaseActive) {
      try {
        const { error } = await supabase
          .from("daily_photos")
          .delete()
          .eq("id", photoId);
        if (error) throw error;
        
        // Remove file from storage if it belongs to Supabase Storage
        if (photoToDelete.image_data && photoToDelete.image_data.includes('/public/daily-photos/')) {
          const parts = photoToDelete.image_data.split('/public/daily-photos/');
          if (parts.length > 1) {
            const fileName = parts[1];
            await supabase.storage.from('daily-photos').remove([fileName]);
          }
        }
        
        setDailyPhotos(prev => prev.filter(p => p.id !== photoId));
      } catch (err) {
        console.error("Error deleting daily photo:", err);
      }
    } else {
      const updatedPhotos = dailyPhotos.filter(p => p.id !== photoId);
      setDailyPhotos(updatedPhotos);
      localStorage.setItem("ramah_daily_photos", JSON.stringify(updatedPhotos));
    }
  };

  const handleDeletePackingItem = async (itemId) => {
    const newCheckedStates = {
      ...checkedStates,
      [itemId]: 'deleted'
    };
    setCheckedStates(newCheckedStates);

    const newCustomItems = customItems.filter(item => item.id !== itemId);
    setCustomItems(newCustomItems);

    if (isSupabaseActive && currentUser?.id) {
      try {
        await supabase.from("packing_states").upsert({
          user_id: currentUser.id,
          checked_items: newCheckedStates,
          custom_items: newCustomItems,
          updated_at: new Date()
        });
      } catch (err) {
        console.error("Error deleting packing item:", err);
      }
    } else {
      localStorage.setItem("ramah_checked_states", JSON.stringify(newCheckedStates));
      localStorage.setItem("ramah_custom_items", JSON.stringify(newCustomItems));
    }
  };

  const handleUpdateAvatar = async (fileObj) => {
    if (!currentUser) return;
    
    if (isSupabaseActive) {
      try {
        const fileExt = fileObj.name.split('.').pop() || 'jpg';
        const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
        
        // 1. Upload new avatar
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, fileObj);
          
        if (uploadError) throw uploadError;
        
        // 2. Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        const newAvatarUrl = publicUrlData.publicUrl;
        
        const oldAvatar = currentUser.avatar;
        
        // 3. Update profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ avatar: newAvatarUrl })
          .eq("id", currentUser.id);
          
        if (profileError) throw profileError;
        
        // 4. Update currentUser state
        setCurrentUser(prev => ({ ...prev, avatar: newAvatarUrl }));
        
        // 5. Refresh database profiles list
        setDatabaseProfiles(prev => prev.map(p => p.id === currentUser.id ? { ...p, avatar: newAvatarUrl } : p));
        
        // 6. Delete old avatar from storage
        if (oldAvatar && oldAvatar.includes('/public/avatars/')) {
          const parts = oldAvatar.split('/public/avatars/');
          if (parts.length > 1) {
            const oldFileName = parts[1];
            await supabase.storage.from('avatars').remove([oldFileName]);
          }
        }
      } catch (err) {
        console.error("Failed to update avatar:", err);
        alert("שגיאה בעדכון תמונת הפרופיל: " + err.message);
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        const updatedUser = { ...currentUser, avatar: base64 };
        setCurrentUser(updatedUser);
        localStorage.setItem("ramah_user", JSON.stringify(updatedUser));
        setDatabaseProfiles(prev => prev.map(p => p.id === currentUser.id ? { ...p, avatar: base64 } : p));
      };
      reader.readAsDataURL(fileObj);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק משתמש זה? כל נתוני האריזה והפרופיל שלו יימחקו מהקיר.")) return;
    
    if (isSupabaseActive) {
      try {
        const profileToDelete = databaseProfiles.find(p => p.id === userId);
        
        // 1. Delete packing state
        await supabase.from("packing_states").delete().eq("user_id", userId);
        // 2. Delete profile
        const { error } = await supabase.from("profiles").delete().eq("id", userId);
        if (error) throw error;
        
        // 3. Delete avatar from Storage if it exists
        if (profileToDelete && profileToDelete.avatar && profileToDelete.avatar.includes('/public/avatars/')) {
          const parts = profileToDelete.avatar.split('/public/avatars/');
          if (parts.length > 1) {
            const fileName = parts[1];
            await supabase.storage.from('avatars').remove([fileName]);
          }
        }
        
        // 4. Update local states
        setDatabaseProfiles(prev => prev.filter(p => p.id !== userId));
        setPackingStates(prev => prev.filter(state => state.user_id !== userId));
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    } else {
      setDatabaseProfiles(prev => prev.filter(p => p.id !== userId));
    }
  };

  const handleDeleteSuggestion = async (suggestionId) => {
    if (!window.confirm("האם למחוק הצעה זו?")) return;
    
    if (isSupabaseActive) {
      try {
        const { error } = await supabase.from("suggestions").delete().eq("id", suggestionId);
        if (error) throw error;
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      } catch (err) {
        console.error("Failed to delete suggestion:", err);
      }
    } else {
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    }
  };

  const getProgressPercentage = () => {
    const activeLists = ["clothing", "wearables", "miscellaneous", "niceToHave"];
    let totalItems = 0;
    let checkedCount = 0;
    
    activeLists.forEach(category => {
      const list = defaultPackingList[category] || [];
      list.forEach(item => {
        if (checkedStates[item.id] !== 'deleted') {
          totalItems++;
          if (checkedStates[item.id] === true) {
            checkedCount++;
          }
        }
      });
    });
    
    customItems.forEach(item => {
      if (checkedStates[item.id] !== 'deleted') {
        totalItems++;
        if (checkedStates[item.id] === true) {
          checkedCount++;
        }
      }
    });
    
    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--forest-green)' }}>
        <h2>טוען פורטל קמפ רמה... 🏕️</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Supabase Status Banner (Shown if configuration is missing or inactive) */}
      {!isSupabaseActive && (
        <div id="db-status-banner" style={{ backgroundColor: 'var(--campfire-light)', border: '2px solid var(--campfire-amber)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--campfire-amber)', fontWeight: 600 }}>
          ⚠️ האתר עובד במצב מקומי בלבד. כדי לסנכרן בין השליחים, יש להזין את פרטי Supabase בקובץ config.js.
        </div>
      )}

      {!currentUser ? (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      ) : (
        <main>
          {/* Top Navigation & User profile widget */}
          <header className="dashboard-header">
            <div className="user-profile-widget">
              <div 
                id="user-avatar-container"
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  width: '60px',
                  height: '60px'
                }}
                title="לחצו לעדכון תמונת הפרופיל 📸"
              >
                <AvatarSVG avatarType={currentUser.avatar} size={60} />
                <label 
                  htmlFor="header-avatar-upload"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    borderRadius: '50%',
                    margin: 0
                  }}
                  className="avatar-hover-overlay"
                >
                  📸
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  id="header-avatar-upload"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        const processed = await processImage(file, { forceSquare: true, targetSize: 300 });
                        await handleUpdateAvatar(processed.file);
                      } catch (err) {
                        alert(err.message || "שגיאה בעיבוד התמונה");
                      }
                    }
                  }}
                />
              </div>
              <div className="user-info-text">
                <div className="user-name" id="display-name">{currentUser.name}</div>
                <div className="user-role" id="display-role">{currentUser.role}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              {currentUser.email === 'geleryehuda@gmail.com' && (
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  style={{
                    backgroundColor: 'var(--forest-green)',
                    color: 'var(--white-card)',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontFamily: 'Fredoka, sans-serif'
                  }}
                >
                  🛠️ פאנל ניהול
                </button>
              )}
              <button className="logout-btn" onClick={logoutUser}>התנתק 🚪</button>
            </div>
          </header>

          <Countdown />

          <CommunityWall 
            currentUser={currentUser}
            databaseProfiles={databaseProfiles}
            packingProgress={getProgressPercentage()}
          />

          <PackingList 
            checkedStates={checkedStates}
            customItems={customItems}
            onToggleItem={handleToggleItem}
            onDeleteItem={handleDeletePackingItem}
            onAddItem={handleAddItem}
            progressPercentage={getProgressPercentage()}
          />

          <LayaTip />

          <Suggestions 
            isAdmin={currentUser.email === 'geleryehuda@gmail.com'}
            dailyPhotos={dailyPhotos}
            onUploadPhoto={handleUploadPhoto}
            onDeletePhoto={handleDeletePhoto}
            onSubmitSuggestion={handleSubmitSuggestion}
          />
        </main>
      )}

      {showAdminPanel && (
        <AdminPanel 
          suggestions={suggestions}
          counselors={databaseProfiles}
          packingStates={packingStates}
          defaultPackingList={defaultPackingList}
          onDeleteUser={handleDeleteUser}
          onDeleteSuggestion={handleDeleteSuggestion}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </div>
  );
}
