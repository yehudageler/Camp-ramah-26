import { useState, useCallback } from 'react';
import { dataService } from '../lib/dataService';

/**
 * Hook לניהול הצעות – טעינה, שליחה, מחיקה.
 */
export function useSuggestions() {
  const [suggestions, setSuggestions] = useState([]);

  /**
   * טעינת הצעות מהשרת/localStorage
   */
  const loadSuggestions = useCallback(async () => {
    try {
      const data = await dataService.loadSuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error("Error loading suggestions:", err);
    }
  }, []);

  /**
   * שליחת הצעה חדשה
   */
  const handleSubmitSuggestion = useCallback(async (text, currentUser) => {
    const newSuggestion = {
      text,
      date: new Date().toLocaleDateString("he-IL")
    };
    setSuggestions(prev => [...prev, newSuggestion]);

    try {
      await dataService.insertSuggestion(
        currentUser?.id,
        currentUser?.name || "שליח/ה",
        text
      );
    } catch (err) {
      console.error("Error submitting suggestion:", err);
    }
  }, []);

  /**
   * מחיקת הצעה (admin)
   */
  const handleDeleteSuggestion = useCallback(async (suggestionId) => {
    if (!window.confirm("האם למחוק הצעה זו?")) return;

    try {
      await dataService.deleteSuggestion(suggestionId);
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (err) {
      console.error("Failed to delete suggestion:", err);
    }
  }, []);

  /**
   * איפוס state (בעת התנתקות)
   */
  const resetSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    loadSuggestions,
    handleSubmitSuggestion,
    handleDeleteSuggestion,
    resetSuggestions
  };
}
