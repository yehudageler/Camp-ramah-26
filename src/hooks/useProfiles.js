import { useState, useCallback } from 'react';
import { dataService, isSupabaseActive } from '../lib/dataService';

/**
 * Hook לניהול פרופילים של כל המשתמשים (לקיר הקהילה, ימי הולדת, ופאנל ניהול).
 */
export function useProfiles() {
  const [databaseProfiles, setDatabaseProfiles] = useState([]);

  /**
   * טעינת כל הפרופילים
   */
  const loadProfiles = useCallback(async () => {
    try {
      const profiles = await dataService.loadProfiles();
      setDatabaseProfiles(profiles);
    } catch (err) {
      console.error("Error loading profiles:", err);
    }
  }, []);

  /**
   * עדכון פרופיל מקומי בסטייט (ללא קריאת שרת)
   */
  const updateProfileInState = useCallback((userId, updates) => {
    setDatabaseProfiles(prev =>
      prev.map(p => p.id === userId ? { ...p, ...updates } : p)
    );
  }, []);

  /**
   * מחיקת משתמש (admin)
   */
  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק משתמש זה? כל נתוני הפרופיל שלו יימחקו מהקיר.")) return;

    try {
      if (isSupabaseActive) {
        // Find profile before deletion (for avatar cleanup)
        const profileToDelete = databaseProfiles.find(p => p.id === userId);

        await dataService.deleteProfile(userId);

        // Delete avatar from storage
        if (profileToDelete?.avatar) {
          await dataService.deleteFile('avatars', profileToDelete.avatar);
        }
      }

      setDatabaseProfiles(prev => prev.filter(p => p.id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  }, [databaseProfiles]);

  /**
   * איפוס state (בעת התנתקות)
   */
  const resetProfiles = useCallback(() => {
    setDatabaseProfiles([]);
  }, []);

  return {
    databaseProfiles,
    loadProfiles,
    updateProfileInState,
    handleDeleteUser,
    resetProfiles
  };
}
