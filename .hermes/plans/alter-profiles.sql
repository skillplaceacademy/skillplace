ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS date_of_joining date,
ADD COLUMN IF NOT EXISTS bio text;
