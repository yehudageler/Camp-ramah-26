import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { dataService, isSupabaseActive } from '../lib/dataService';

export const ADMIN_EMAIL = 'geleryehuda@gmail.com';

/**
 * Hook לניהול אימות (Auth) ופרופיל המשתמש הנוכחי.
 * מרכז את כל הלוגיקה של login, logout, עדכון פרופיל ואווטר.
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  /**
   * אתחול – בודק session קיים, טוען פרופיל, או עושה hydration מ-localStorage
   */
  const initAuth = useCallback(async () => {
    try {
      // Hydrate immediately from localStorage for fast first paint
      const storedUser = localStorage.getItem("ramah_user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }

      if (isSupabaseActive) {
        const session = await dataService.getSession();
        if (session) {
          const profile = await dataService.getProfile(session.user.id);
          const user = {
            id: session.user.id,
            email: session.user.email,
            name: profile?.full_name || session.user.email,
            role: profile?.role || "שליח/ה",
            avatar: profile?.avatar || "campfire",
            birthday: profile?.birthday
          };
          setCurrentUser(user);
          localStorage.setItem("ramah_user", JSON.stringify(user));
          return user;
        } else {
          // No active Supabase session – clear cached user
          setCurrentUser(null);
          localStorage.removeItem("ramah_user");
          return null;
        }
      } else {
        // Local mode – storedUser already hydrated above
        return storedUser ? JSON.parse(storedUser) : null;
      }
    } catch (err) {
      console.error("Error during auth init:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * טיפול בהצלחת הרשמה/התחברות
   */
  const handleAuthSuccess = useCallback(async (user) => {
    setCurrentUser(user);
    localStorage.setItem("ramah_user", JSON.stringify(user));
    return user;
  }, []);

  /**
   * התנתקות
   */
  const logoutUser = useCallback(async () => {
    await dataService.signOut();
    localStorage.removeItem("ramah_user");
    setCurrentUser(null);
  }, []);

  /**
   * שמירת שינויים בפרופיל (שם, תפקיד, יום הולדת, אווטר)
   */
  const handleSaveProfile = useCallback(async ({ name, role, birthday, avatar, avatarFile }) => {
    if (!currentUser) return false;

    let finalAvatarUrl = avatar;

    // Handle avatar file upload
    if (avatarFile) {
      if (isSupabaseActive) {
        try {
          const fileExt = avatarFile.name.split('.').pop() || 'jpg';
          const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
          finalAvatarUrl = await dataService.uploadFile('avatars', fileName, avatarFile);
          // Delete old avatar from storage
          await dataService.deleteFile('avatars', currentUser.avatar);
        } catch (err) {
          console.error("Failed to upload avatar:", err);
          toast.error("שגיאה בהעלאת התמונה: " + err.message);
          return false;
        }
      } else {
        finalAvatarUrl = avatar; // Already a base64 dataUrl from processImage
      }
    }

    const updatedUser = { ...currentUser, name, role, birthday, avatar: finalAvatarUrl };

    if (isSupabaseActive) {
      try {
        await dataService.updateProfile(currentUser.id, {
          full_name: name,
          role: role,
          birthday: birthday || null,
          avatar: finalAvatarUrl
        });
      } catch (err) {
        console.error("Failed to update profile:", err);
        toast.error("שגיאה בעדכון הפרופיל: " + err.message);
        return false;
      }
    } else {
      localStorage.setItem("ramah_user", JSON.stringify(updatedUser));
    }

    setCurrentUser(updatedUser);
    return updatedUser;
  }, [currentUser]);

  /**
   * עדכון תמונת פרופיל (avatar) בלבד
   */
  const handleUpdateAvatar = useCallback(async (fileObj) => {
    if (!currentUser) return;

    if (isSupabaseActive) {
      try {
        const fileExt = fileObj.name.split('.').pop() || 'jpg';
        const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
        const newAvatarUrl = await dataService.uploadFile('avatars', fileName, fileObj);
        const oldAvatar = currentUser.avatar;

        await dataService.updateProfile(currentUser.id, { avatar: newAvatarUrl });
        setCurrentUser(prev => ({ ...prev, avatar: newAvatarUrl }));

        // Delete old avatar
        await dataService.deleteFile('avatars', oldAvatar);
        return newAvatarUrl;
      } catch (err) {
        console.error("Failed to update avatar:", err);
        toast.error("שגיאה בעדכון תמונת הפרופיל: " + err.message);
        return null;
      }
    } else {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result;
          const updatedUser = { ...currentUser, avatar: base64 };
          setCurrentUser(updatedUser);
          localStorage.setItem("ramah_user", JSON.stringify(updatedUser));
          resolve(base64);
        };
        reader.readAsDataURL(fileObj);
      });
    }
  }, [currentUser]);

  return {
    currentUser,
    setCurrentUser,
    loading,
    isAdmin,
    initAuth,
    handleAuthSuccess,
    logoutUser,
    handleSaveProfile,
    handleUpdateAvatar
  };
}
