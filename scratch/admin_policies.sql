-- ==============================================================================
-- סקריפט מדיניות אבטחה (RLS Policies) עבור מנהל המערכת (יהודה)
-- יש להריץ סקריפט זה בתוך ה-SQL Editor של Supabase כדי לאפשר מחיקה וצפייה
-- ==============================================================================

-- 1. הרשאות מחיקה וצפייה עבור טבלת הפרופילים (profiles)
DROP POLICY IF EXISTS "Allow admin to delete profiles" ON public.profiles;
CREATE POLICY "Allow admin to delete profiles" ON public.profiles 
FOR DELETE 
USING (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');

-- 2. הרשאות מחיקה וצפייה עבור טבלת מצב האריזה (packing_states)
DROP POLICY IF EXISTS "Allow admin to delete packing states" ON public.packing_states;
CREATE POLICY "Allow admin to delete packing states" ON public.packing_states 
FOR DELETE 
USING (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');

DROP POLICY IF EXISTS "Allow admin to select all packing states" ON public.packing_states;
CREATE POLICY "Allow admin to select all packing states" ON public.packing_states 
FOR SELECT
USING (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com' OR auth.uid() = user_id);

-- 3. הרשאות מחיקה עבור טבלת ההצעות (suggestions)
DROP POLICY IF EXISTS "Allow admin to delete suggestions" ON public.suggestions;
CREATE POLICY "Allow admin to delete suggestions" ON public.suggestions 
FOR DELETE 
USING (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');

-- 4. הרשאות מחיקה עבור טבלת התמונה היומית (daily_photos)
DROP POLICY IF EXISTS "Allow admin to delete daily_photos" ON public.daily_photos;
CREATE POLICY "Allow admin to delete daily_photos" ON public.daily_photos 
FOR DELETE 
USING (auth.jwt() ->> 'email' = 'geleryehuda@gmail.com');
