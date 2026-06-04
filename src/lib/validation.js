/**
 * מודול ולידציה מרכזי – Input Validation & Sanitization
 * מרכז את כל כללי הולידציה במקום אחד למניעת abuse ו-spam.
 */

/** גבולות אורך לשדות טקסט */
export const LIMITS = {
  NAME_MAX: 50,
  ROLE_MAX: 30,
  SUGGESTION_MAX: 500,
  CAPTION_MAX: 200,
  CONFESSION_MAX: 500,
  PASSWORD_MIN: 6,
};

/**
 * ניקוי טקסט – הסרת רווחים כפולים, trim
 * @param {string} text
 * @returns {string}
 */
export function sanitizeText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * ולידציה של שדה טקסט
 * @param {string} value - הערך לבדיקה
 * @param {number} maxLength - אורך מקסימלי
 * @param {string} fieldName - שם השדה (להודעות שגיאה)
 * @returns {{ valid: boolean, error?: string, value?: string }}
 */
export function validateField(value, maxLength, fieldName) {
  const clean = sanitizeText(value);
  if (!clean) {
    return { valid: false, error: `${fieldName} לא יכול להיות ריק` };
  }
  if (clean.length > maxLength) {
    return { valid: false, error: `${fieldName} ארוך מדי (מקסימום ${maxLength} תווים)` };
  }
  return { valid: true, value: clean };
}

/**
 * ולידציה של כתובת email בסיסית
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
