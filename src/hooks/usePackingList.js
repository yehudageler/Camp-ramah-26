import { useState, useCallback } from 'react';
import { dataService, isSupabaseActive } from '../lib/dataService';
import { defaultPackingList } from '../constants/packingList';

/**
 * Hook לניהול רשימת האריזה – סימון פריטים, הוספה, מחיקה, ואחוז התקדמות.
 */
export function usePackingList() {
  const [checkedStates, setCheckedStates] = useState({});
  const [customItems, setCustomItems] = useState([]);

  /**
   * טעינת נתוני אריזה מהשרת/localStorage
   */
  const loadPackingData = useCallback(async (userId) => {
    try {
      const data = await dataService.loadPackingState(userId);
      setCheckedStates(data.checkedItems);
      setCustomItems(data.customItems);
    } catch (err) {
      console.error("Error loading packing data:", err);
    }
  }, []);

  /**
   * סימון/ביטול סימון פריט
   */
  const handleToggleItem = useCallback(async (itemId, userId) => {
    setCheckedStates(prev => {
      const newStates = { ...prev, [itemId]: !prev[itemId] };
      // Save in background
      dataService.savePackingState(userId, newStates, customItems).catch(err =>
        console.error("Error saving packing item:", err)
      );
      return newStates;
    });
  }, [customItems]);

  /**
   * הוספת פריט מותאם אישית
   */
  const handleAddItem = useCallback(async (itemText, userId) => {
    const newItem = { id: "custom_" + Date.now(), text: itemText };
    setCustomItems(prev => {
      const newItems = [...prev, newItem];
      dataService.savePackingState(userId, checkedStates, newItems).catch(err =>
        console.error("Error adding packing item:", err)
      );
      return newItems;
    });
  }, [checkedStates]);

  /**
   * מחיקת פריט
   */
  const handleDeletePackingItem = useCallback(async (itemId, userId) => {
    setCheckedStates(prev => {
      const newStates = { ...prev, [itemId]: 'deleted' };
      setCustomItems(prevCustom => {
        const newCustom = prevCustom.filter(item => item.id !== itemId);
        dataService.savePackingState(userId, newStates, newCustom).catch(err =>
          console.error("Error deleting packing item:", err)
        );
        return newCustom;
      });
      return newStates;
    });
  }, []);

  /**
   * חישוב אחוז התקדמות אריזה
   */
  const getProgressPercentage = useCallback(() => {
    const activeLists = ["clothing", "wearables", "miscellaneous", "niceToHave"];
    let totalItems = 0;
    let checkedCount = 0;

    activeLists.forEach(category => {
      const list = defaultPackingList[category] || [];
      list.forEach(item => {
        if (checkedStates[item.id] !== 'deleted') {
          totalItems++;
          if (checkedStates[item.id] === true) checkedCount++;
        }
      });
    });

    customItems.forEach(item => {
      if (checkedStates[item.id] !== 'deleted') {
        totalItems++;
        if (checkedStates[item.id] === true) checkedCount++;
      }
    });

    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  }, [checkedStates, customItems]);

  /**
   * איפוס state (למשל בעת התנתקות)
   */
  const resetPacking = useCallback(() => {
    setCheckedStates({});
    setCustomItems([]);
  }, []);

  return {
    checkedStates,
    customItems,
    loadPackingData,
    handleToggleItem,
    handleAddItem,
    handleDeletePackingItem,
    getProgressPercentage,
    resetPacking
  };
}
