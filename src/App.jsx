import { useEffect, useState } from 'react';
import { isSupabaseActive } from './lib/dataService';
import { useAuth, ADMIN_EMAIL } from './hooks/useAuth';
import { usePackingList } from './hooks/usePackingList';
import { useSuggestions } from './hooks/useSuggestions';
import { useDailyPhotos } from './hooks/useDailyPhotos';
import { useProfiles } from './hooks/useProfiles';
import { useMemes } from './hooks/useMemes';
import AuthScreen, { AvatarSVG } from './components/AuthScreen';
import Countdown from './components/Countdown';
import CommunityWall from './components/CommunityWall';
import PackingList from './components/PackingList';
import LayaTip from './components/LayaTip';
import Suggestions from './components/Suggestions';
import DailyPhoto from './components/DailyPhoto';
import MemesCorner from './components/MemesCorner';
import AdminPanel from './components/AdminPanel';
import ConfessionsCorner from './components/ConfessionsCorner';
import BirthdaysCorner from './components/BirthdaysCorner';
import ProfileEditModal from './components/ProfileEditModal';
import NavigationBar from './components/NavigationBar';
import CampNewspaper from './components/CampNewspaper';
import { defaultPackingList } from './constants/packingList';

export default function App() {
  // ── Hooks ────────────────────────────────────────
  const {
    currentUser, setCurrentUser, loading, isAdmin,
    initAuth, handleAuthSuccess, logoutUser,
    handleSaveProfile, handleUpdateAvatar
  } = useAuth();

  const {
    checkedStates, customItems,
    loadPackingData, handleToggleItem, handleAddItem,
    handleDeletePackingItem, getProgressPercentage, resetPacking
  } = usePackingList();

  const {
    suggestions,
    loadSuggestions, handleSubmitSuggestion, handleDeleteSuggestion,
    resetSuggestions
  } = useSuggestions();

  const {
    dailyPhotos,
    loadDailyPhotos, handleUploadPhoto, handleDeletePhoto, handleUpdatePhotoCaption
  } = useDailyPhotos();

  const {
    databaseProfiles, packingStates,
    loadProfiles, loadPackingStatesAdmin,
    updateProfileInState, handleDeleteUser, resetProfiles
  } = useProfiles();

  const {
    memes, loadMemes, handleCreateMeme, handleDeleteMeme, handleToggleMemeLike, resetMemes
  } = useMemes();

  // ── Local UI state ───────────────────────────────
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [newspaperData, setNewspaperData] = useState(null);

  // ── Init ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const user = await initAuth();
      if (user && isSupabaseActive) {
        // Load all data in parallel
        await Promise.all([
          loadProfiles(),
          loadSuggestions(),
          loadPackingData(user.id),
          loadDailyPhotos(),
          loadMemes(),
          ...(user.email === ADMIN_EMAIL ? [loadPackingStatesAdmin()] : [])
        ]);
      } else if (user && !isSupabaseActive) {
        // Local mode – load from localStorage
        await loadPackingData(user.id);
        await loadSuggestions();
        await loadDailyPhotos();
        await loadMemes();

        const storedNewspaper = localStorage.getItem("ramah_newspaper");
        if (storedNewspaper) setNewspaperData(JSON.parse(storedNewspaper));
      }
    };
    init();
  }, []);

  // ── Handler wrappers ─────────────────────────────
  const onAuthSuccess = async (user) => {
    await handleAuthSuccess(user);
    if (isSupabaseActive) {
      await Promise.all([
        loadProfiles(),
        loadSuggestions(),
        loadPackingData(user.id),
        loadDailyPhotos(),
        loadMemes()
      ]);
    } else {
      await loadPackingData(user.id);
      await loadSuggestions();
      await loadMemes();
    }
  };

  const onLogout = async () => {
    await logoutUser();
    resetPacking();
    resetSuggestions();
    resetProfiles();
    resetMemes();
  };

  const onSaveProfile = async (profileData) => {
    const updatedUser = await handleSaveProfile(profileData);
    if (updatedUser) {
      updateProfileInState(updatedUser.id, {
        full_name: updatedUser.name,
        role: updatedUser.role,
        birthday: updatedUser.birthday || null,
        avatar: updatedUser.avatar
      });
      setShowProfileEdit(false);
    }
  };

  const onToggleItem = (itemId) => handleToggleItem(itemId, currentUser?.id);
  const onAddItem = (text) => handleAddItem(text, currentUser?.id);
  const onDeletePackingItem = (itemId) => handleDeletePackingItem(itemId, currentUser?.id);
  const onSubmitSuggestion = (text) => handleSubmitSuggestion(text, currentUser);

  const handleUpdateNewspaper = (data) => {
    setNewspaperData(data);
    localStorage.setItem("ramah_newspaper", JSON.stringify(data));
  };

  // ── Render ───────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--forest-green)' }}>
        <h2>טוען פורטל קמפ רמה... 🏕️</h2>
      </div>
    );
  }

  return (
    <div id="home" className="app-container">
      {/* Supabase Status Banner */}
      {!isSupabaseActive && (
        <div id="db-status-banner" style={{ backgroundColor: 'var(--campfire-light)', border: '2px solid var(--campfire-amber)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--campfire-amber)', fontWeight: 600 }}>
          ⚠️ האתר עובד במצב מקומי בלבד. כדי לסנכרן בין השליחים, יש להזין את פרטי Supabase בקובץ config.js.
        </div>
      )}

      {!currentUser ? (
        <AuthScreen onAuthSuccess={onAuthSuccess} />
      ) : (
        <main>
          {/* Header */}
          <header className="dashboard-header">
            <div
              className="user-profile-widget"
              onClick={() => setShowProfileEdit(true)}
              style={{ cursor: 'pointer' }}
              title="לחצו לעריכת פרטי הפרופיל ⚙️"
            >
              <div
                id="user-avatar-container"
                style={{
                  position: 'relative',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8fafc'
                }}
              >
                <AvatarSVG avatarType={currentUser.avatar} size={60} />
              </div>
              <div className="user-info-text">
                <div className="user-name" id="display-name">{currentUser.name}</div>
                <div className="user-role" id="display-role">{currentUser.role}</div>
              </div>
            </div>

            <div className="header-buttons">
              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="admin-panel-btn"
                >
                  🛠️ פאנל ניהול
                </button>
              )}
              <button className="logout-btn" onClick={onLogout}>התנתק 🚪</button>
            </div>
          </header>

          <NavigationBar />

          <div className="hero-grid">
            <Countdown />
            <div id="gallery" style={{ height: '100%', scrollMarginTop: '15px' }}>
              <DailyPhoto
                isAdmin={isAdmin}
                dailyPhotos={dailyPhotos}
                onUploadPhoto={handleUploadPhoto}
                onDeletePhoto={handleDeletePhoto}
                onUpdatePhotoCaption={handleUpdatePhotoCaption}
              />
            </div>
          </div>

          <div id="community" style={{ scrollMarginTop: '15px' }}>
            <CommunityWall
              currentUser={currentUser}
              databaseProfiles={databaseProfiles}
              packingProgress={getProgressPercentage()}
            />
          </div>

          <div id="packing" style={{ scrollMarginTop: '15px' }}>
            <PackingList
              checkedStates={checkedStates}
              customItems={customItems}
              onToggleItem={onToggleItem}
              onDeleteItem={onDeletePackingItem}
              onAddItem={onAddItem}
              progressPercentage={getProgressPercentage()}
            />
          </div>

          {/* <div id="memes" style={{ scrollMarginTop: '15px' }}>
            <MemesCorner
              currentUser={currentUser}
              isAdmin={isAdmin}
              memes={memes}
              databaseProfiles={databaseProfiles}
              onCreateMeme={handleCreateMeme}
              onDeleteMeme={handleDeleteMeme}
              onToggleLike={handleToggleMemeLike}
            />
          </div> */}

          {/* <div id="newspaper" style={{ scrollMarginTop: '60px' }}>
            <CampNewspaper
              isAdmin={isAdmin}
              newspaperData={newspaperData}
              onUpdateNewspaper={handleUpdateNewspaper}
            />
          </div> */}

          <div id="laya-tip" style={{ scrollMarginTop: '15px' }}>
            <LayaTip />
          </div>

          {/* <ConfessionsCorner currentUser={currentUser} /> */}

          <section className="suggestions-section" style={{ scrollMarginTop: '15px' }}>
            <div id="birthdays" style={{ height: '100%' }}>
              <BirthdaysCorner databaseProfiles={databaseProfiles} currentUser={currentUser} />
            </div>

            <div id="suggestions" style={{ height: '100%', scrollMarginTop: '15px' }}>
              <Suggestions
                onSubmitSuggestion={onSubmitSuggestion}
              />
            </div>
          </section>
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

      {showProfileEdit && (
        <ProfileEditModal
          currentUser={currentUser}
          onClose={() => setShowProfileEdit(false)}
          onSave={onSaveProfile}
        />
      )}
    </div>
  );
}
