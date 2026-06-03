-- ==============================================================================
-- סקריפט מדיניות אבטחה מקיף (RLS & Storage Policies) עבור פורטל קמפ רמה 2026
-- יש להריץ סקריפט זה בתוך ה-SQL Editor של Supabase כדי להחיל את האבטחה
-- ==============================================================================

-- ==========================================
-- 1. הפעלת RLS (Row Level Security) על כל הטבלאות
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_photos ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. מדיניות אבטחה עבור טבלת הפרופילים (profiles)
-- ==========================================

-- ניקוי מדיניות קודמת במידה וקיימת
DROP POLICY IF EXISTS "Allow authenticated to view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow user to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to delete profiles" ON public.profiles;

-- א) צפייה: כל משתמש מחובר רשאי לראות את כל הפרופילים (בשביל קיר השליחים וימי הולדת)
CREATE POLICY "Allow authenticated to view all profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

-- ב) יצירה: משתמש מחובר רשאי להכניס את הפרופיל של עצמו בלבד בזמן ההרשמה
CREATE POLICY "Allow user to insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ג) עדכון: משתמש מחובר רשאי לעדכן את הפרופיל של עצמו בלבד
CREATE POLICY "Allow user to update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ד) מחיקה: מנהל המערכת בלבד רשאי למחוק פרופילים
CREATE POLICY "Allow admin to delete profiles" ON public.profiles
    FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');


-- ==========================================
-- 3. מדיניות אבטחה עבור טבלת מצב האריזה (packing_states)
-- ==========================================

DROP POLICY IF EXISTS "Allow users to view own packing state" ON public.packing_states;
DROP POLICY IF EXISTS "Allow admin to select all packing states" ON public.packing_states;
DROP POLICY IF EXISTS "Allow users to upsert own packing state" ON public.packing_states;
DROP POLICY IF EXISTS "Allow users to delete own packing state" ON public.packing_states;
DROP POLICY IF EXISTS "Allow admin to delete packing states" ON public.packing_states;

-- א) צפייה: משתמש רשאי לראות את רשימת הציוד של עצמו, ומנהל המערכת רשאי לראות את כולם
CREATE POLICY "Allow users and admin to view packing states" ON public.packing_states
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');

-- ב) יצירה ועדכון (Upsert): משתמש רשאי לשמור/לעדכן את רשימת הציוד שלו בלבד
CREATE POLICY "Allow users to upsert own packing state" ON public.packing_states
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own packing state" ON public.packing_states
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ג) מחיקה: משתמש רשאי למחוק את רשימת הציוד שלו, ומנהל המערכת רשאי למחוק כל רשימה
CREATE POLICY "Allow users and admin to delete packing states" ON public.packing_states
    FOR DELETE TO authenticated 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');


-- ==========================================
-- 4. מדיניות אבטחה עבור טבלת ההצעות והווידויים (suggestions)
-- ==========================================

DROP POLICY IF EXISTS "Allow authenticated to view suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Allow authenticated to insert suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Allow admin to delete suggestions" ON public.suggestions;

-- א) צפייה: כל משתמש מחובר רשאי לקרוא את הווידויים/הצעות
CREATE POLICY "Allow authenticated to view suggestions" ON public.suggestions
    FOR SELECT TO authenticated USING (true);

-- ב) יצירה: כל משתמש מחובר רשאי להוסיף הצעה/ווידוי חדש
CREATE POLICY "Allow authenticated to insert suggestions" ON public.suggestions
    FOR INSERT TO authenticated WITH CHECK (true);

-- ג) מחיקה: מנהל המערכת בלבד רשאי למחוק הצעות/ווידויים
CREATE POLICY "Allow admin to delete suggestions" ON public.suggestions
    FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');


-- ==========================================
-- 5. מדיניות אבטחה עבור טבלת התמונה היומית (daily_photos)
-- ==========================================

DROP POLICY IF EXISTS "Allow authenticated to view daily photos" ON public.daily_photos;
DROP POLICY IF EXISTS "Allow admin to insert daily photos" ON public.daily_photos;
DROP POLICY IF EXISTS "Allow admin to update daily photos" ON public.daily_photos;
DROP POLICY IF EXISTS "Allow admin to delete daily_photos" ON public.daily_photos;

-- א) צפייה: כל משתמש מחובר רשאי לראות את התמונות היומיות
CREATE POLICY "Allow authenticated to view daily photos" ON public.daily_photos
    FOR SELECT TO authenticated USING (true);

-- ב) יצירה/עדכון/מחיקה: מנהל המערכת בלבד רשאי לבצע שינויים
CREATE POLICY "Allow admin to insert daily photos" ON public.daily_photos
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');

CREATE POLICY "Allow admin to update daily photos" ON public.daily_photos
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');

CREATE POLICY "Allow admin to delete daily photos" ON public.daily_photos
    FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');


-- ==========================================
-- 6. מדיניות אבטחה עבור Storage (storage.objects)
-- ==========================================

DROP POLICY IF EXISTS "Allow authenticated to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users and admin to delete avatars" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated to view daily photos storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to upload daily photos storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to delete daily photos storage" ON storage.objects;

-- ** תיקיית avatars **

-- 1. צפייה: פתוח לכל משתמש מחובר
CREATE POLICY "Allow authenticated to view avatars" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'avatars');

-- 2. יצירה/עדכון: המשתמש מורשה להעלות או לעדכן קובץ רק אם שם הקובץ מתחיל ב-UID שלו
CREATE POLICY "Allow users to upload own avatars" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (split_part(name, '-', 1)) = auth.uid()::text);

CREATE POLICY "Allow users to update own avatars" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (split_part(name, '-', 1)) = auth.uid()::text) WITH CHECK (bucket_id = 'avatars' AND (split_part(name, '-', 1)) = auth.uid()::text);

-- 3. מחיקה: המשתמש עצמו או מנהל המערכת רשאים למחוק תמונת פרופיל
CREATE POLICY "Allow users and admin to delete avatars" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND ((split_part(name, '-', 1)) = auth.uid()::text OR auth.jwt() ->> 'email' = 'geleryehuda@gmail.com'));


-- ** תיקיית daily-photos **

-- 1. צפייה: פתוח לכל משתמש מחובר
CREATE POLICY "Allow authenticated to view daily photos storage" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'daily-photos');

-- 2. יצירה/מחיקה: מנהל המערכת בלבד רשאי להעלות או למחוק תמונות יומיות
CREATE POLICY "Allow admin to upload daily photos storage" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'daily-photos' AND auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');

CREATE POLICY "Allow admin to delete daily photos storage" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'daily-photos' AND auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');
