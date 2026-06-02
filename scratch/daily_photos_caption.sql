-- סקריפט להוספת עמודת כיתוב (caption) לטבלת התמונות היומיות ב-Supabase
-- יש להריץ סקריפט זה ב-SQL Editor של Supabase

ALTER TABLE public.daily_photos 
ADD COLUMN IF NOT EXISTS caption TEXT;
