-- Add foreign key constraints to applications table for proper Supabase joins
ALTER TABLE public.applications
ADD CONSTRAINT fk_applications_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.applications
ADD CONSTRAINT fk_applications_university_id 
FOREIGN KEY (university_id) REFERENCES public.universities(id) ON DELETE CASCADE;

ALTER TABLE public.applications
ADD CONSTRAINT fk_applications_program_id 
FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE CASCADE;