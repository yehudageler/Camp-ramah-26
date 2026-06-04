import { useState, useCallback } from 'react';
import { dataService, isSupabaseActive } from '../lib/dataService';

/**
 * Hook לניהול פרופילים של כל המשתמשים (לקיר הקהילה, ימי הולדת, ופאנל ניהול).
 */
export function useProfiles() {
  const [databaseProfiles, setDatabaseProfiles] = useState([]);
  const [packingStates, setPackingStates] = useState([]);

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
   * טעינת כל נתוני האריזה (admin only)
   */
  const loadPackingStatesAdmin = useCallback(async () => {
    try {
      const states = await dataService.loadAllPackingStates();
      setPackingStates(states);
    } catch (err) {
      console.error("Error loading packing states for admin:", err);
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
    if (!window.confirm("האם אתה בטוח שברצונך למחוק משתמש זה? כל נתוני האריזה והפרופיל שלו יימחקו מהקיר.")) return;

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
      setPackingStates(prev => prev.filter(state => state.user_id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  }, [databaseProfiles]);

  /**
   * איפוס state (בעת התנתקות)
   */
  const resetProfiles = useCallback(() => {
    setDatabaseProfiles([]);
    setPackingStates([]);
  }, []);

  return {
    databaseProfiles,
    packingStates,
    loadProfiles,
    loadPackingStatesAdmin,
    updateProfileInState,
    handleDeleteUser,
    resetProfiles
  };
}
