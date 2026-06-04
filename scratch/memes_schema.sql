-- סקריפט ליצירת טבלת המימים (memes) ב-Supabase.
-- יש להריץ סקריפט זה ב-SQL Editor של Supabase.

CREATE TABLE IF NOT EXISTS public.memes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    image_url TEXT NOT NULL,
    caption TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL,
    liked_by JSONB DEFAULT '[]'::jsonb
);

-- אפשר להפעיל RLS (Row Level Security) במידת הצורך:
ALTER TABLE public.memes ENABLE ROW LEVEL SECURITY;

-- פוליסי לגישה חופשית לקריאה (כל אחד יכול לראות מימים)
CREATE POLICY "Allow public read access to memes" 
ON public.memes FOR SELECT USING (true);

-- פוליסי ליצירה (רק משתמשים מחוברים יכולים להעלות מימים)
CREATE POLICY "Allow authenticated insert to memes" 
ON public.memes FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- פוליסי לעדכון (רק יוצר המים יכול לעדכן את הלייקים או הכיתוב שלו)
CREATE POLICY "Allow update to owner or authenticated user for likes" 
ON public.memes FOR UPDATE 
USING (true);

-- פוליסי למחיקה (רק יוצר המים או מנהל יכולים למחוק)
CREATE POLICY "Allow delete to owner or admins" 
ON public.memes FOR DELETE 
USING (
  auth.uid() = user_id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'מנהל'
);
