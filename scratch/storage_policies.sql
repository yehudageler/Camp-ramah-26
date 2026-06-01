-- ==============================================================================
-- סקריפט מדיניות אבטחה (RLS Policies) עבור Supabase Storage Buckets
-- יש להריץ סקריפט זה בתוך ה-SQL Editor של Supabase לאחר יצירת ה-Buckets:
-- 1. avatars (ציבורי - Public)
-- 2. daily-photos (ציבורי - Public)
-- ==============================================================================

-- 1. הרשאות קריאה (SELECT) - חופשיות לכולם
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
CREATE POLICY "Allow public read access to avatars" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow public read access to daily-photos" ON storage.objects;
CREATE POLICY "Allow public read access to daily-photos" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'daily-photos');

-- 2. הרשאות העלאה (INSERT)
-- שליחים רשאים להעלות תמונה לתיקיית האווטארים
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- מנהל המערכת רשאי להעלות תמונות יומיות
DROP POLICY IF EXISTS "Allow admin to upload daily-photos" ON storage.objects;
CREATE POLICY "Allow admin to upload daily-photos" ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'daily-photos' AND auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');

-- 3. הרשאות מחיקה (DELETE)
-- מנהל המערכת רשאי למחוק קבצים משני הדליים
DROP POLICY IF EXISTS "Allow admin to delete storage objects" ON storage.objects;
CREATE POLICY "Allow admin to delete storage objects" ON storage.objects 
FOR DELETE 
TO authenticated
USING (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');
