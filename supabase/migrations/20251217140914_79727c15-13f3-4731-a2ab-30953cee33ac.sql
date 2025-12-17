-- Drop the FK to auth.users and add FK to profiles for Supabase joins to work
ALTER TABLE public.applications
DROP CONSTRAINT IF EXISTS fk_applications_user_id;

ALTER TABLE public.applications
ADD CONSTRAINT fk_applications_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;