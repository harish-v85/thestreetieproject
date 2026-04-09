-- Pending access requests: track 7-day reminder email.
ALTER TABLE public.access_requests
ADD COLUMN IF NOT EXISTS reminder_7d_sent_at timestamptz;

-- Allow profile status "invited" (invite sent, password not set yet).
-- Rename the constraint in your DB if it differs from profiles_status_check.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_status_check
CHECK (status IN ('active', 'pending', 'archived', 'invited'));
