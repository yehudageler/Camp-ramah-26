import { useState, useCallback } from 'react';
import { dataService, isSupabaseActive } from '../lib/dataService';

/**
 * Helper: Converts a dataURL (Base64) to a File object for upload
 */
async function dataUrlToFile(dataUrl, fileName) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: 'image/png' });
}

export function useMemes() {
  const [memes, setMemes] = useState([]);
  const [loadingMemes, setLoadingMemes] = useState(false);

  /**
   * Load all memes
   */
  const loadMemes = useCallback(async () => {
    setLoadingMemes(true);
    try {
      const data = await dataService.loadMemes();
      setMemes(data);
    } catch (err) {
      console.error("Error loading memes:", err);
    } finally {
      setLoadingMemes(false);
    }
  }, []);

  /**
   * Create/Upload a new meme
   */
  const handleCreateMeme = useCallback(async (base64DataUrl, caption, currentUser) => {
    if (!currentUser) return;
    try {
      let imageUrl = base64DataUrl;

      // If Supabase is active, upload the generated meme image to storage
      if (isSupabaseActive) {
        const fileName = `meme_${Date.now()}.png`;
        try {
          const fileObj = await dataUrlToFile(base64DataUrl, fileName);
          const publicUrl = await dataService.uploadFile('daily-photos', fileName, fileObj);
          if (publicUrl) {
            imageUrl = publicUrl;
          }
        } catch (err) {
          console.error("Failed to upload meme image to storage:", err);
          // Fall back to saving the Base64 in DB (might be large but serves as backup)
        }
      }

      const newMeme = await dataService.insertMeme(
        imageUrl,
        caption || "",
        currentUser.id,
        currentUser.name || "מדריך אנונימי"
      );

      setMemes(prev => [newMeme, ...prev]);
      return newMeme;
    } catch (err) {
      console.error("Error creating meme:", err);
      throw err;
    }
  }, []);

  /**
   * Delete a meme
   */
  const handleDeleteMeme = useCallback(async (memeId, memeImageUrl) => {
    try {
      await dataService.deleteMeme(memeId);
      
      // Delete file from storage if active
      if (isSupabaseActive && memeImageUrl) {
        await dataService.deleteFile('daily-photos', memeImageUrl);
      }
      
      setMemes(prev => prev.filter(m => m.id !== memeId));
    } catch (err) {
      console.error("Error deleting meme:", err);
      throw err;
    }
  }, []);

  /**
   * Toggle like/heart on a meme
   */
  const handleToggleMemeLike = useCallback(async (memeId, userId) => {
    try {
      const updatedMeme = await dataService.toggleMemeLike(memeId, userId);
      if (updatedMeme) {
        setMemes(prev => prev.map(m => m.id === memeId ? updatedMeme : m));
      }
    } catch (err) {
      console.error("Error toggling meme like:", err);
    }
  }, []);

  const resetMemes = useCallback(() => {
    setMemes([]);
  }, []);

  return {
    memes,
    loadingMemes,
    loadMemes,
    handleCreateMeme,
    handleDeleteMeme,
    handleToggleMemeLike,
    resetMemes
  };
}
