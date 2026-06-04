import { useState, useCallback } from 'react';
import { dataService, isSupabaseActive } from '../lib/dataService';

/**
 * Hook לניהול תמונות יומיות – טעינה, העלאה, מחיקה, עדכון כיתוב.
 */
export function useDailyPhotos() {
  const [dailyPhotos, setDailyPhotos] = useState([]);

  /**
   * טעינת תמונות מהשרת/localStorage
   */
  const loadDailyPhotos = useCallback(async () => {
    try {
      const data = await dataService.loadDailyPhotos();
      setDailyPhotos(data);
    } catch (err) {
      console.error("Error loading daily photos:", err);
    }
  }, []);

  /**
   * העלאת תמונה יומית חדשה
   */
  const handleUploadPhoto = useCallback(async (fileObj, previewUrl, caption) => {
    try {
      let imageUrl = previewUrl;

      // Upload file to cloud storage if Supabase is active
      if (isSupabaseActive && fileObj) {
        const fileExt = fileObj.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        try {
          const publicUrl = await dataService.uploadFile('daily-photos', fileName, fileObj);
          if (publicUrl) imageUrl = publicUrl;
        } catch (err) {
          console.error("Daily photo upload error:", err);
          // Fall back to preview URL
        }
      }

      const photo = await dataService.insertDailyPhoto(imageUrl, caption);
      setDailyPhotos(prev => [photo, ...prev]);
    } catch (err) {
      console.error("Error uploading daily photo:", err);
    }
  }, []);

  /**
   * מחיקת תמונה יומית
   */
  const handleDeletePhoto = useCallback(async (photoId) => {
    const photoToDelete = dailyPhotos.find(p => p.id === photoId);
    if (!photoToDelete) return;

    try {
      await dataService.deleteDailyPhoto(photoId);
      // Delete file from storage
      if (isSupabaseActive) {
        await dataService.deleteFile('daily-photos', photoToDelete.image_data);
      }
      setDailyPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err) {
      console.error("Error deleting daily photo:", err);
    }
  }, [dailyPhotos]);

  /**
   * עדכון כיתוב של תמונה
   */
  const handleUpdatePhotoCaption = useCallback(async (photoId, newCaption) => {
    try {
      await dataService.updateDailyPhotoCaption(photoId, newCaption);
      setDailyPhotos(prev =>
        prev.map(p => p.id === photoId ? { ...p, caption: newCaption } : p)
      );
    } catch (err) {
      console.error("Error updating daily photo caption:", err);
    }
  }, []);

  return {
    dailyPhotos,
    loadDailyPhotos,
    handleUploadPhoto,
    handleDeletePhoto,
    handleUpdatePhotoCaption
  };
}
