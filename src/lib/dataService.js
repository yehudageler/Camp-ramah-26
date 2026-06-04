/**
 * שכבת הפשטה לנתונים – Data Abstraction Layer
 * ממשק אחיד לפעולות CRUD, מנתב אוטומטית בין Supabase ל-localStorage.
 * כל ה-hooks פונים לכאן במקום לבדוק isSupabaseActive בעצמם.
 */
import { supabase, isSupabaseActive } from './supabase';

// ═══════════════════════════════════════════════════════
// Supabase Implementation
// ═══════════════════════════════════════════════════════

const supabaseService = {
  // ── Auth ──────────────────────────────────────────
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  // ── Profiles ─────────────────────────────────────
  async getProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  },

  async loadProfiles() {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) throw error;
    return data || [];
  },

  async insertProfile(profile) {
    const { error } = await supabase.from("profiles").insert(profile);
    if (error) throw error;
  },

  async updateProfile(userId, updates) {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);
    if (error) throw error;
  },

  async deleteProfile(userId) {
    // 1. Delete packing state
    await supabase.from("packing_states").delete().eq("user_id", userId);
    // 2. Delete profile
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) throw error;
  },

  // ── Packing ──────────────────────────────────────
  async loadPackingState(userId) {
    const { data, error } = await supabase
      .from("packing_states")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data
      ? { checkedItems: data.checked_items || {}, customItems: data.custom_items || [] }
      : { checkedItems: {}, customItems: [] };
  },

  async savePackingState(userId, checkedItems, customItems) {
    const { error } = await supabase.from("packing_states").upsert({
      user_id: userId,
      checked_items: checkedItems,
      custom_items: customItems,
      updated_at: new Date()
    });
    if (error) throw error;
  },

  async loadAllPackingStates() {
    const { data, error } = await supabase.from("packing_states").select("*");
    if (error) throw error;
    return data || [];
  },

  // ── Suggestions ──────────────────────────────────
  async loadSuggestions() {
    const { data, error } = await supabase
      .from("suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async insertSuggestion(userId, userName, text) {
    const { error } = await supabase.from("suggestions").insert({
      user_id: userId,
      user_name: userName,
      text: text
    });
    if (error) throw error;
  },

  async deleteSuggestion(id) {
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (error) throw error;
  },

  // ── Daily Photos ─────────────────────────────────
  async loadDailyPhotos() {
    const { data, error } = await supabase
      .from("daily_photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async insertDailyPhoto(imageUrl, caption) {
    const { data, error } = await supabase
      .from("daily_photos")
      .insert({ image_data: imageUrl, caption })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDailyPhoto(photoId) {
    const { error } = await supabase.from("daily_photos").delete().eq("id", photoId);
    if (error) throw error;
  },

  async updateDailyPhotoCaption(photoId, caption) {
    const { error } = await supabase
      .from("daily_photos")
      .update({ caption })
      .eq("id", photoId);
    if (error) throw error;
  },

  // ── Memes ────────────────────────────────────────
  async loadMemes() {
    const { data, error } = await supabase
      .from("memes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async insertMeme(imageUrl, caption, userId, creatorName) {
    const { data, error } = await supabase
      .from("memes")
      .insert({ image_url: imageUrl, caption, user_id: userId, creator_name: creatorName })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteMeme(memeId) {
    const { error } = await supabase.from("memes").delete().eq("id", memeId);
    if (error) throw error;
  },

  async toggleMemeLike(memeId, userId) {
    const { data: meme, error: fetchErr } = await supabase
      .from("memes")
      .select("liked_by")
      .eq("id", memeId)
      .single();
    if (fetchErr) throw fetchErr;

    let likedBy = Array.isArray(meme.liked_by) ? meme.liked_by : [];
    if (likedBy.includes(userId)) {
      likedBy = likedBy.filter(id => id !== userId);
    } else {
      likedBy.push(userId);
    }

    const { data, error: updateErr } = await supabase
      .from("memes")
      .update({ liked_by: likedBy })
      .eq("id", memeId)
      .select()
      .single();
    if (updateErr) throw updateErr;
    return data;
  },

  // ── Storage ──────────────────────────────────────
  async uploadFile(bucket, fileName, file) {
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  },

  async deleteFile(bucket, fileUrl) {
    if (!fileUrl || !fileUrl.includes(`/public/${bucket}/`)) return;
    const parts = fileUrl.split(`/public/${bucket}/`);
    if (parts.length > 1) {
      await supabase.storage.from(bucket).remove([parts[1]]);
    }
  },
};

// ═══════════════════════════════════════════════════════
// localStorage Implementation
// ═══════════════════════════════════════════════════════
// ⚠️ Security Note: localStorage data is stored unencrypted.
// This is acceptable because:
// 1. localStorage is same-origin only (no cross-site access)
// 2. Data stored is non-sensitive (name, role, avatar – no passwords/tokens)
// 3. This is a fallback mode when Supabase is unavailable, not the primary flow
// 4. Client-side encryption provides no real security gain (key is also client-side)

const localService = {
  // ── Auth ──────────────────────────────────────────
  async getSession() {
    return null; // No Supabase session in local mode
  },

  async signUp(/* email, password */) {
    return { user: null }; // Handled by AuthScreen directly
  },

  async signIn(/* email, password */) {
    return { user: null }; // Handled by AuthScreen directly
  },

  async signOut() {
    // Nothing to do – App clears localStorage separately
  },

  // ── Profiles ─────────────────────────────────────
  async getProfile(/* userId */) {
    const stored = localStorage.getItem("ramah_user");
    return stored ? JSON.parse(stored) : null;
  },

  async loadProfiles() {
    // In local mode there's no multi-user community
    return [];
  },

  async insertProfile(/* profile */) {
    // Handled via localStorage in AuthScreen
  },

  async updateProfile(/* userId, updates */) {
    // Handled directly by the hook via localStorage
  },

  async deleteProfile(/* userId */) {
    // Minimal in local mode
  },

  // ── Packing ──────────────────────────────────────
  async loadPackingState(/* userId */) {
    const checked = localStorage.getItem("ramah_checked_states");
    const custom = localStorage.getItem("ramah_custom_items");
    return {
      checkedItems: checked ? JSON.parse(checked) : {},
      customItems: custom ? JSON.parse(custom) : []
    };
  },

  async savePackingState(_userId, checkedItems, customItems) {
    localStorage.setItem("ramah_checked_states", JSON.stringify(checkedItems));
    localStorage.setItem("ramah_custom_items", JSON.stringify(customItems));
  },

  async loadAllPackingStates() {
    return [];
  },

  // ── Suggestions ──────────────────────────────────
  async loadSuggestions() {
    const stored = localStorage.getItem("ramah_suggestions");
    return stored ? JSON.parse(stored) : [];
  },

  async insertSuggestion(_userId, _userName, text) {
    const stored = localStorage.getItem("ramah_suggestions");
    const suggestions = stored ? JSON.parse(stored) : [];
    suggestions.push({ text, date: new Date().toLocaleDateString("he-IL") });
    localStorage.setItem("ramah_suggestions", JSON.stringify(suggestions));
  },

  async deleteSuggestion(/* id */) {
    // In local mode, deletion is handled via state only
  },

  // ── Daily Photos ─────────────────────────────────
  async loadDailyPhotos() {
    const stored = localStorage.getItem("ramah_daily_photos");
    return stored ? JSON.parse(stored) : [];
  },

  async insertDailyPhoto(imageUrl, caption) {
    const photo = {
      id: Date.now(),
      image_data: imageUrl,
      caption,
      created_at: new Date().toISOString()
    };
    const stored = localStorage.getItem("ramah_daily_photos");
    const photos = stored ? JSON.parse(stored) : [];
    photos.unshift(photo);
    localStorage.setItem("ramah_daily_photos", JSON.stringify(photos));
    return photo;
  },

  async deleteDailyPhoto(photoId) {
    const stored = localStorage.getItem("ramah_daily_photos");
    const photos = stored ? JSON.parse(stored) : [];
    const updated = photos.filter(p => p.id !== photoId);
    localStorage.setItem("ramah_daily_photos", JSON.stringify(updated));
  },

  async updateDailyPhotoCaption(photoId, caption) {
    const stored = localStorage.getItem("ramah_daily_photos");
    const photos = stored ? JSON.parse(stored) : [];
    const updated = photos.map(p => p.id === photoId ? { ...p, caption } : p);
    localStorage.setItem("ramah_daily_photos", JSON.stringify(updated));
  },

  // ── Memes ────────────────────────────────────────
  async loadMemes() {
    const stored = localStorage.getItem("ramah_memes");
    return stored ? JSON.parse(stored) : [];
  },

  async insertMeme(imageUrl, caption, userId, creatorName) {
    const meme = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      image_url: imageUrl,
      caption,
      user_id: userId,
      creator_name: creatorName,
      liked_by: []
    };
    const stored = localStorage.getItem("ramah_memes");
    const memes = stored ? JSON.parse(stored) : [];
    memes.unshift(meme);
    localStorage.setItem("ramah_memes", JSON.stringify(memes));
    return meme;
  },

  async deleteMeme(memeId) {
    const stored = localStorage.getItem("ramah_memes");
    const memes = stored ? JSON.parse(stored) : [];
    const updated = memes.filter(m => m.id !== memeId);
    localStorage.setItem("ramah_memes", JSON.stringify(updated));
  },

  async toggleMemeLike(memeId, userId) {
    const stored = localStorage.getItem("ramah_memes");
    const memes = stored ? JSON.parse(stored) : [];
    let updatedMeme = null;
    const updated = memes.map(m => {
      if (m.id === memeId) {
        let likedBy = Array.isArray(m.liked_by) ? m.liked_by : [];
        if (likedBy.includes(userId)) {
          likedBy = likedBy.filter(id => id !== userId);
        } else {
          likedBy.push(userId);
        }
        updatedMeme = { ...m, liked_by: likedBy };
        return updatedMeme;
      }
      return m;
    });
    localStorage.setItem("ramah_memes", JSON.stringify(updated));
    return updatedMeme;
  },

  // ── Storage ──────────────────────────────────────
  async uploadFile(/* bucket, fileName, file */) {
    return null; // No cloud storage in local mode
  },

  async deleteFile(/* bucket, fileUrl */) {
    // No-op in local mode
  },
};

// ═══════════════════════════════════════════════════════
// Export the active implementation
// ═══════════════════════════════════════════════════════

export const dataService = isSupabaseActive ? supabaseService : localService;
export { isSupabaseActive };
